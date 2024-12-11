'use strict'

// Move functions outside the if block and make them global
let initTokenizer, initSession, initReader, pipeline, getUint64

if ('function' === typeof importScripts) {
  importScripts('web_rwkv_puzzles.js')
  const {
    Session,
    NucleusSampler,
    SimpleSampler,
    StateId,
    Tensor,
    TensorReader,
  } = wasm_bindgen

  getUint64 = function (dataview, byteOffset, littleEndian) {
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

  initReader = async function (blob) {
    console.log('model data size: ', blob.size)
    if (blob.size < 8) {
      throw 'header too small'
    }
    let n = getUint64(
      new DataView(await blob.slice(0, 8).arrayBuffer()),
      0,
      true
    )
    if (n > 100000000) {
      throw 'header too large'
    }
    if (n > blob.size) {
      throw 'invalid header len'
    }
    let str = new TextDecoder().decode(
      new Uint8Array(await blob.slice(8, n + 8).arrayBuffer())
    )
    let metadata = JSON.parse(str)
    let tensors = new Array()
    for (let name in metadata) {
      if (name !== '__metadata__') {
        let info = metadata[name]
        let start = 8 + n + info.data_offsets[0]
        let end = 8 + n + info.data_offsets[1]
        let tensor = new Tensor(
          name,
          info.shape,
          await blob.slice(start, end).arrayBuffer()
        )
        tensors.push(tensor)
      }
    }
    return new TensorReader(tensors)
  }

  initTokenizer = async function (url) {
    console.log('🔄 Loading wasm')
    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')
    console.log('🔄 wasm loaded')
    var req = await fetch(url)
    var vocab = await req.text()
    console.log('tokenizer: ' + vocab.length)
    return new wasm_bindgen.Tokenizer(vocab)
  }

  initSession = async function (blob) {
    await wasm_bindgen('web_rwkv_puzzles_bg.wasm')
    // var req = await fetch("assets/models/RWKV-5-World-0.4B-v2-20231113-ctx4096.st");
    // var bin = await req.arrayBuffer();
    // console.log("model: ", bin.byteLength);
    let reader = await initReader(blob)
    let session = await new Session(reader)
    console.log('runtime loaded')
    return session
  }

  pipeline = async function* (
    session,
    tokens,
    state,
    sampler,
    stop_tokens,
    max_len
  ) {
    var info = session.info()
    var probs = new Float32Array(info.num_vocab)
    for (var i = 0; i < max_len; ++i) {
      await session.run(tokens, probs, state)
      let token = sampler.sample(probs)
      tokens = new Uint16Array([token])
      yield token
      if (token in stop_tokens) {
        return
      }
    }
  }
}

// Make functions available globally
self.initTokenizer = initTokenizer
self.initSession = initSession
self.initReader = initReader
self.pipeline = pipeline
self.getUint64 = getUint64
