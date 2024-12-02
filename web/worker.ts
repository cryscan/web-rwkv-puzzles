importScripts("common.js")

var _tokenizer = initTokenizer("../assets/puzzle15_vocab.json");
var _session: undefined | Promise<wasm_bindgen.Session> = undefined;

this.addEventListener("message", async function (e: MessageEvent<Uint8Array[] | String>) {
    if (e.data instanceof Array) {
        let blob = new Blob(e.data);
        _session = initSession(blob);
        return;
    }

    if (await _session === undefined) {
        this.postMessage(null);
        this.postMessage("Error: Model is not loaded.");
        return;
    }

    var tokenizer = await _tokenizer;
    var session = await _session!;
    var info = session.info();
    var sampler = new NucleusSampler(info, 1.0, 0.5);

    var input = e.data;
    console.log(input);

    var prompt = `<input>\n<board>\n${input}</board>\n</input>\n`;
    var state = new StateId;

    var encoder = new TextEncoder;
    var decoder = new TextDecoder;

    var tokens = tokenizer.encode(encoder.encode(prompt));
    var response = "";
    var out = []
    console.log(`prompt length: ${tokens.length}`);

    await this.navigator.locks.request("model", async (lock) => {
        let p = pipeline(session, tokens, state, sampler, [59], 1000000);

        this.postMessage(null);

        for await (let token of p) {
            let word = decoder.decode(tokenizer.decode(new Uint16Array([token])));
            out.push(token);
            response += word;

            this.postMessage(word);
        }
    });
}, false);