if ('function' === typeof importScripts) {
  importScripts('web_rwkv_puzzles.js')

  const {
    Session,
    SessionType,
    StateVisual,
    NucleusSampler,
    SimpleSampler,
    Tensor,
    TensorReader,
  } = wasm_bindgen

  interface TensorInfo {
    shape: Uint32Array
    data_offsets: [number, number]
  }

  interface Options {
    max_len: number
    prompt: string
    stop_tokens: number[]
    temperature: number
    top_p: number
    presence_penalty: number
    count_penalty: number
    penalty_decay: number
    vocab: string
  }

  const config = {
    session_type: SessionType.Chat,
  }

  function getUint64(
    dataview: DataView,
    byteOffset: number,
    littleEndian?: boolean,
  ) {
    // split 64-bit number into two 32-bit (4-byte) parts
    const left = dataview.getUint32(byteOffset, littleEndian)
    const right = dataview.getUint32(byteOffset + 4, littleEndian)

    // combine the two 32-bit values
    const combined = littleEndian
      ? left + 2 ** 32 * right
      : 2 ** 32 * left + right

    if (!Number.isSafeInteger(combined))
      console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost')

    return combined
  }

  async function initReader(blob: Blob) {
    console.log(`📌 Model data size: ${blob.size}`)

    if (blob.size < 8) {
      throw 'header too small'
    }

    const n = getUint64(
      new DataView(await blob.slice(0, 8).arrayBuffer()),
      0,
      true,
    )
    if (n > 100000000) {
      throw 'header too large'
    }
    if (n > blob.size) {
      throw 'invalid header len'
    }

    const str = new TextDecoder().decode(
      new Uint8Array(await blob.slice(8, n + 8).arrayBuffer()),
    )
    const metadata = JSON.parse(str)

    let tensors = new Array()
    for (const name in metadata) {
      if (name !== '__metadata__') {
        const info: TensorInfo = metadata[name]
        const start = 8 + n + info.data_offsets[0]
        const end = 8 + n + info.data_offsets[1]
        const tensor = new Tensor(
          name,
          info.shape,
          await blob.slice(start, end).arrayBuffer(),
        )
        tensors.push(tensor)
      }
    }

    return new TensorReader(tensors)
  }

  async function initTokenizer(url: string) {
    if (_tokenizers.has(url)) return _tokenizers.get(url)!

    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')

    console.log('Attempting to load tokenizer from:', url)
    const req = await fetch(url)
    if (!req.ok) {
      console.error(`Failed to load tokenizer: ${req.status} ${req.statusText}`)
      throw new Error(`Failed to load tokenizer from ${url}`)
    }
    const vocab = await req.text()
    console.log(`📌 Tokenizer length:`, vocab.length)

    const tokenizer = new wasm_bindgen.Tokenizer(vocab)
    _tokenizers.set(url, tokenizer)
    return tokenizer
  }

  async function initSession(blob: Blob) {
    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')

    // var req = await fetch("assets/models/RWKV-5-World-0.4B-v2-20231113-ctx4096.st");
    // var bin = await req.arrayBuffer();
    // console.log("model: ", bin.byteLength);

    const reader = await initReader(blob)
    // @HaloWang: 修改这里的参数
    const session = await new Session(reader, 0, 0, config.session_type)
    console.log('✅ Runtime loaded')
    return session
  }

  async function* pipeline(
    session: wasm_bindgen.Session,
    tokens: Uint16Array,
    sampler: wasm_bindgen.SimpleSampler | wasm_bindgen.NucleusSampler,
    stop_tokens: number[],
    max_len: number,
  ) {
    const info = session.info()
    let output = new Float32Array(info.num_vocab)
    let probs = new Float32Array(info.num_vocab)

    const state = new Float32Array(session.state_len())
    const cutoff = session.checkout(tokens, state, output)
    session.load(state)

    console.log(`📌 State cache checkout: ${cutoff}/${tokens.length}`)
    let history = Array.from(tokens.slice(0, cutoff))
    tokens = tokens.slice(cutoff)

    for (var i = 0; i < max_len; ++i) {
      if (tokens.length > 0) {
        await session.run(tokens, output)
      }

      history = history.concat(Array.from(tokens))

      switch (session.session_type()) {
        case SessionType.Puzzle:
          probs = output
          break
        case SessionType.Chat:
        case SessionType.Music:
          sampler.transform(output)
          await session.softmax(output, probs)
          break
      }

      const token = sampler.sample(probs)
      tokens = new Uint16Array([token])
      sampler.update(tokens)

      yield token, output

      if (stop_tokens.includes(token)) {
        break
      }
    }

    if (history.length > 0) {
      await session.back(state)
      session.cache(new Uint16Array(history), state, output)
      console.log(`📌 State cache check-in: ${history.length}`)
    }
  }

  var _session: undefined | Promise<wasm_bindgen.Session> = undefined
  var _tokenizers: Map<string, wasm_bindgen.Tokenizer> = new Map()

  async function run(message: string, window: Window) {
    if ((await _session) === undefined) {
      window.postMessage(null)
      console.warn('⚠️ Model not loaded.')
      return
    }

    const options: Options = JSON.parse(message)
    console.log(options)

    const {
      max_len,
      prompt,
      stop_tokens,
      temperature,
      top_p,
      presence_penalty,
      count_penalty,
      penalty_decay,
      vocab,
    } = options

    const tokenizer = await initTokenizer(vocab)
    const session = await _session!
    const info = session.info()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let sampler: wasm_bindgen.SimpleSampler | wasm_bindgen.NucleusSampler
    switch (session.session_type()) {
      case SessionType.Chat:
      case SessionType.Music:
        sampler = new NucleusSampler(
          info,
          temperature,
          top_p,
          presence_penalty,
          count_penalty,
          penalty_decay,
        )
        break
      case SessionType.Puzzle:
        sampler = new SimpleSampler(info)
        break
    }

    console.log(prompt)
    let tokens = tokenizer.encode(encoder.encode(prompt))
    if (session.session_type() == SessionType.Music) {
      // append bos_token to the beginning of the tokens for music generation
      tokens = new Uint16Array([2, ...tokens])
    }

    await window.navigator.locks.request('model', async (lock) => {
      const p = pipeline(session, tokens, sampler, stop_tokens, max_len)

      for await (const token of p) {
        const word = decoder.decode(tokenizer.decode(new Uint16Array([token])))
        window.postMessage({ type: 'token', word, token })
      }
    })

    const state = new Float32Array(session.state_len())
    await session.back(state)

    const visual = JSON.parse(new StateVisual(info, state).json())
    window.postMessage({
      type: 'state',
      state: new Float32Array(state),
      visual,
    })
    
    window.postMessage({ type: 'generation_complete' })
  }

  async function replay(message: string, window: Window) {
    if ((await _session) === undefined) {
      window.postMessage(null)
      console.warn('⚠️ Model not loaded.')
      return
    }

    const options: Options = JSON.parse(message)
    console.log(options)

    const { prompt, vocab } = options

    const tokenizer = await initTokenizer(vocab)
    const session = await _session!
    const info = session.info()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const state = new Float32Array(session.state_len())
    session.load(state)

    console.log(prompt)
    const tokens = tokenizer.encode(encoder.encode(prompt))
    const total = tokens.length

    await window.navigator.locks.request('model', async (lock) => {
      const logits = new Float32Array(info.num_vocab)
      for (const [index, token] of tokens.entries()) {
        const word = decoder.decode(tokenizer.decode(new Uint16Array([token])))
        await session.run(new Uint16Array([token]), logits)
        await session.back(state)
        const visual = JSON.parse(new StateVisual(info, state).json())
        window.postMessage({
          type: 'replay',
          index,
          total,
          token,
          word,
          state: new Float32Array(state),
          visual,
        })
      }
    })

    window.postMessage({ type: 'replay_end' })
  }

  async function info(window: Window) {
    if ((await _session) === undefined) {
      window.postMessage(null)
      return
    }

    const session = await _session!
    window.postMessage({
      type: 'info',
      info: session.info(),
    })
  }

  async function abort() {
    if ((await _session) === undefined) {
      window.postMessage(null)
      console.warn('⚠️ Model not loaded.')
      return
    }

    const session = await _session!
    session.clear_cache()
  }

  async function load(data: Uint8Array[], window: Window) {
    console.log('🔄 Loading model')
    console.log(`📌 Session type: ${config.session_type}`)
    let blob = new Blob(data)
    _session = initSession(blob)
    try {
      await _session
    } catch (error) {
      _session = undefined
      window.postMessage({
        type: 'error',
        error,
      })
    }
    return
  }

  this.addEventListener(
    'message',
    async function (e: MessageEvent<Uint8Array[] | String>) {
      // Load model
      if (e.data instanceof Array) {
        load(e.data, this)
        return
      }

      if (typeof e.data === 'string') {
        const options = JSON.parse(e.data)
        const task = options.task
        switch (task) {
          case 'puzzle':
          case 'chat':
          case 'music':
            run(e.data, this)
            break
          
          case 'set_session_type':
            switch (options.type) {
              case 'puzzle':
                config.session_type = SessionType.Puzzle
                break
              case 'chat':
                config.session_type = SessionType.Chat
                break
              case 'music':
                config.session_type = SessionType.Music
                break
            }
            break
          case 'replay':
            replay(e.data, this)
            break
          case 'abort':
            console.log('🔴 Abort received')
            abort()
            break
          case 'info':
            console.log('✅ Info received')
            info(this)
            break
          default:
            console.warn(`🤔 Invalid task: ${task}`)
        }
      }
    },
    false,
  )
}
