if ('function' === typeof importScripts) {
  importScripts('common.js')
  importScripts('web_rwkv_puzzles.js')

  const { Session, SessionType, NucleusSampler, SimpleSampler, Tensor, TensorReader } = wasm_bindgen

  interface TensorInfo {
    shape: Uint32Array
    data_offsets: [number, number]
  }

  interface Option {
    max_len: number
    prompt: string
    state_key: string
    stop_tokens: number[]
    temperature: number
    top_p: number
    presence_penalty: number
    count_penalty: number
    penalty_decay: number
    vocab: string
  }

  const config = {
    session_type: SessionType.Chat
  }

  async function initReader(blob: Blob) {
    console.log(`📌 Model data size: ${blob.size}`)

    if (blob.size < 8) {
      throw 'header too small'
    }

    let n = getUint64(new DataView(await blob.slice(0, 8).arrayBuffer()), 0, true)
    if (n > 100000000) {
      throw 'header too large'
    }
    if (n > blob.size) {
      throw 'invalid header len'
    }

    let str = new TextDecoder().decode(new Uint8Array(await blob.slice(8, n + 8).arrayBuffer()))
    let metadata = JSON.parse(str)

    let tensors = new Array()
    for (let name in metadata) {
      if (name !== '__metadata__') {
        let info: TensorInfo = metadata[name]
        let start = 8 + n + info.data_offsets[0]
        let end = 8 + n + info.data_offsets[1]
        let tensor = new Tensor(name, info.shape, await blob.slice(start, end).arrayBuffer())
        tensors.push(tensor)
      }
    }

    return new TensorReader(tensors)
  }

  async function initTokenizer(url: string) {
    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')

    var req = await fetch(url)
    var vocab = await req.text()
    console.log(`📌 Tokenizer: ${vocab.length}`)
    return new wasm_bindgen.Tokenizer(vocab)
  }

  async function initSession(blob: Blob) {
    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')

    // var req = await fetch("assets/models/RWKV-5-World-0.4B-v2-20231113-ctx4096.st");
    // var bin = await req.arrayBuffer();
    // console.log("model: ", bin.byteLength);

    let reader = await initReader(blob)
    // @HaloWang: 修改这里的参数
    let session = await new Session(reader, 0, 0, config.session_type)
    console.log('✅ Runtime loaded')
    return session
  }

  async function* pipeline(session: wasm_bindgen.Session, tokens: Uint16Array, sampler: wasm_bindgen.SimpleSampler | wasm_bindgen.NucleusSampler, stop_tokens: number[], max_len: number) {
    let info = session.info()
    let logits = new Float32Array(info.num_vocab)
    let probs = new Float32Array(info.num_vocab)

    for (var i = 0; i < max_len; ++i) {
      await session.run(tokens, logits)

      switch (session.session_type()) {
        case SessionType.Puzzle:
          probs = logits
          break
        case SessionType.Chat:
          sampler.transform(logits)
          await session.softmax(logits, probs)
          break
      }

      let token = sampler.sample(probs)
      tokens = new Uint16Array([token])
      sampler.update(tokens)

      yield token

      if (stop_tokens.includes(token)) {
        break
      }
    }
  }

  var _session: undefined | Promise<wasm_bindgen.Session> = undefined
  var _init_state: undefined | Float32Array = undefined
  var _states: Map<string, Float32Array> = new Map()

  async function run(message: string, window: Window) {
    if ((await _session) === undefined) {
      window.postMessage(null)
      window.postMessage('Error: Model is not loaded.')
      console.warn('Model is not loaded.')
      return
    }

    const options: Option = JSON.parse(message)

    const max_len = options.max_len
    const prompt = options.prompt
    const state_key = options.state_key
    const stop_tokens = options.stop_tokens
    const temperature = options.temperature
    const top_p = options.top_p
    const presence_penalty = options.presence_penalty
    const count_penalty = options.count_penalty
    const penalty_decay = options.penalty_decay
    const vocab = options.vocab

    const tokenizer = await initTokenizer(vocab)
    const session = await _session!
    const info = session.info()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    if (_init_state === undefined) {
      _init_state = new Float32Array(session.state_len())
      await session.back(_init_state)
    }

    console.log(`📌 State key: ${state_key}`)
    const state = _states.has(state_key) ? _states.get(state_key)! : new Float32Array(_init_state!)
    session.load(state)

    let sampler: wasm_bindgen.SimpleSampler | wasm_bindgen.NucleusSampler
    switch (session.session_type()) {
      case SessionType.Chat:
        sampler = new NucleusSampler(info, temperature, top_p, presence_penalty, count_penalty, penalty_decay)
        break
      case SessionType.Puzzle:
        sampler = new SimpleSampler(info)
        break
    }

    console.log(prompt)
    const tokens = tokenizer.encode(encoder.encode(prompt))

    await window.navigator.locks.request('model', async (lock) => {
      let p = pipeline(session, tokens, sampler, stop_tokens, max_len)

      for await (let token of p) {
        let word = decoder.decode(tokenizer.decode(new Uint16Array([token])))
        window.postMessage({ type: 'token', word, token })
      }
    })

    await session.back(state)
    _states.set(state_key, state)
    window.postMessage({ type: 'state', state })
  }

  this.addEventListener(
    'message',
    async function (e: MessageEvent<Uint8Array[] | String>) {
      // Load model
      if (e.data instanceof Array) {
        console.log('🔄 Loading model')
        console.log(`📌 Session type: ${config.session_type}`)
        let blob = new Blob(e.data)
        _session = initSession(blob)
        return
      }

      if (typeof e.data === 'string') {
        const options = JSON.parse(e.data)
        const task = options.task
        switch (task) {
          case 'puzzle':
          case 'chat':
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
            }
            break
          default:
            console.warn(`🤔 Invalid task: ${task}`)
        }
      }
    },
    false
  )
}
