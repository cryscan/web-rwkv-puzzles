'use strict'
if ('function' === typeof importScripts) {
  console.log('🔄 Loading common.js')
  importScripts('common.js')
  console.log('🔄 common.js loaded')
  var _tokenizer = initTokenizer('../assets/puzzle15_vocab.json')
  var _session = undefined

  const { SimpleSampler, StateId } = wasm_bindgen

  this.addEventListener(
    'message',
    async function (e) {
      if (e.data instanceof Array) {
        let blob = new Blob(e.data)
        _session = initSession(blob)
        return
      }
      if ((await _session) === undefined) {
        this.postMessage(null)
        this.postMessage('Error: Model is not loaded.')
        return
      }
      var tokenizer = await _tokenizer
      var session = await _session
      var info = session.info()
      var sampler = new SimpleSampler(info)
      var input = e.data
      console.log(input)
      var prompt = `<input>\n<board>\n${input}</board>\n</input>\n`
      var state = new StateId()
      var encoder = new TextEncoder()
      var decoder = new TextDecoder()
      var tokens = tokenizer.encode(encoder.encode(prompt))
      var out = []
      console.log(`prompt length: ${tokens.length}`)
      console.log(prompt)
      console.log(tokens)
      await this.navigator.locks.request('model', async (lock) => {
        let p = pipeline(session, tokens, state, sampler, [59], 1000000)
        this.postMessage(null)
        for await (let token of p) {
          let word = decoder.decode(tokenizer.decode(new Uint16Array([token])))
          out.push(token)
          this.postMessage({ word, token })
        }
      })
    },
    false
  )
}
