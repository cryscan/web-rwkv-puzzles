if ('function' === typeof importScripts) {
    importScripts("common.js")
    importScripts("web_rwkv_puzzles.js")

    const { Session, NucleusSampler, SimpleSampler, StateId, Tensor, TensorReader } = wasm_bindgen;

    interface TensorInfo {
        shape: Uint32Array;
        data_offsets: [number, number];
    }

    async function initReader(blob: Blob) {
        console.log("model data size: ", blob.size);

        if (blob.size < 8) {
            throw "header too small";
        }

        let n = getUint64(new DataView(await blob.slice(0, 8).arrayBuffer()), 0, true);
        if (n > 100000000) {
            throw "header too large";
        }
        if (n > blob.size) {
            throw "invalid header len";
        }

        let str = new TextDecoder().decode(new Uint8Array(await blob.slice(8, n + 8).arrayBuffer()));
        let metadata = JSON.parse(str);

        let tensors = new Array();
        for (let name in metadata) {
            if (name !== "__metadata__") {
                let info: TensorInfo = metadata[name];
                let start = 8 + n + info.data_offsets[0];
                let end = 8 + n + info.data_offsets[1];
                let tensor = new Tensor(name, info.shape, await blob.slice(start, end).arrayBuffer());
                tensors.push(tensor);
            }
        }

        return new TensorReader(tensors);
    }

    async function initTokenizer(url: string) {
        await wasm_bindgen("web_rwkv_puzzles_bg.wasm");

        var req = await fetch(url);
        var vocab = await req.text();
        console.log("tokenizer: " + vocab.length);
        return new wasm_bindgen.Tokenizer(vocab);
    }

    async function initSession(blob: Blob) {
        await wasm_bindgen("web_rwkv_puzzles_bg.wasm");

        // var req = await fetch("assets/models/RWKV-5-World-0.4B-v2-20231113-ctx4096.st");
        // var bin = await req.arrayBuffer();
        // console.log("model: ", bin.byteLength);

        let reader = await initReader(blob);
        let session = await new Session(reader);
        console.log("runtime loaded")
        return session;
    }

    async function* pipeline(
        session: wasm_bindgen.Session,
        tokens: Uint16Array,
        state: wasm_bindgen.StateId,
        sampler: wasm_bindgen.SimpleSampler | wasm_bindgen.NucleusSampler,
        stop_tokens: number[],
        max_len: number
    ) {
        var info = session.info();
        var probs = new Float32Array(info.num_vocab);

        for (var i = 0; i < max_len; ++i) {
            await session.run(tokens, probs, state);
            let token = sampler.sample(probs);
            tokens = new Uint16Array([token]);

            yield token;

            if (token in stop_tokens) {
                return;
            }
        }
    }

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
        var sampler = new SimpleSampler(info);

        var input = e.data;
        console.log(input);

        var prompt = `<input>\n<board>\n${input}</board>\n</input>\n`;
        var state = new StateId;

        var encoder = new TextEncoder;
        var decoder = new TextDecoder;

        var tokens = tokenizer.encode(encoder.encode(prompt));
        var out = []
        console.log(`prompt length: ${tokens.length}`);
        console.log(prompt);
        console.log(tokens);

        await this.navigator.locks.request("model", async (lock) => {
            let p = pipeline(session, tokens, state, sampler, [59], 1000000);

            this.postMessage(null);

            for await (let token of p) {
                let word = decoder.decode(tokenizer.decode(new Uint16Array([token])));
                out.push(token);
                this.postMessage({ word, token })
            }
        });
    }, false);
}
