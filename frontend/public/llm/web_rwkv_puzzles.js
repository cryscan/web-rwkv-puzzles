let wasm_bindgen;
(function() {
    const __exports = {};
    let script_src;
    if (typeof document !== 'undefined' && document.currentScript !== null) {
        script_src = new URL(document.currentScript.src, location.href).toString();
    }
    let wasm = undefined;

    function addToExternrefTable0(obj) {
        const idx = wasm.__externref_table_alloc();
        wasm.__wbindgen_export_2.set(idx, obj);
        return idx;
    }

    function handleError(f, args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            const idx = addToExternrefTable0(e);
            wasm.__wbindgen_exn_store(idx);
        }
    }

    function isLikeNone(x) {
        return x === undefined || x === null;
    }

    const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

    if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

    let cachedUint8ArrayMemory0 = null;

    function getUint8ArrayMemory0() {
        if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
            cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachedUint8ArrayMemory0;
    }

    function getStringFromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
    }

    let WASM_VECTOR_LEN = 0;

    const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

    const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
        ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
        : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    });

    function passStringToWasm0(arg, malloc, realloc) {

        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length, 1) >>> 0;
            getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }

        let len = arg.length;
        let ptr = malloc(len, 1) >>> 0;

        const mem = getUint8ArrayMemory0();

        let offset = 0;

        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F) break;
            mem[ptr + offset] = code;
        }

        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
            const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);

            offset += ret.written;
            ptr = realloc(ptr, len, offset, 1) >>> 0;
        }

        WASM_VECTOR_LEN = offset;
        return ptr;
    }

    let cachedDataViewMemory0 = null;

    function getDataViewMemory0() {
        if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
            cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
        }
        return cachedDataViewMemory0;
    }

    let cachedUint32ArrayMemory0 = null;

    function getUint32ArrayMemory0() {
        if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
            cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
        }
        return cachedUint32ArrayMemory0;
    }

    function getArrayU32FromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
    }

    const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(state => {
        wasm.__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

    function makeMutClosure(arg0, arg1, dtor, f) {
        const state = { a: arg0, b: arg1, cnt: 1, dtor };
        const real = (...args) => {
            // First up with a closure we increment the internal reference
            // count. This ensures that the Rust closure environment won't
            // be deallocated while we're invoking it.
            state.cnt++;
            const a = state.a;
            state.a = 0;
            try {
                return f(a, state.b, ...args);
            } finally {
                if (--state.cnt === 0) {
                    wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
                    CLOSURE_DTORS.unregister(state);
                } else {
                    state.a = a;
                }
            }
        };
        real.original = state;
        CLOSURE_DTORS.register(real, state, state);
        return real;
    }

    function getArrayU8FromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
    }

    function debugString(val) {
        // primitive types
        const type = typeof val;
        if (type == 'number' || type == 'boolean' || val == null) {
            return  `${val}`;
        }
        if (type == 'string') {
            return `"${val}"`;
        }
        if (type == 'symbol') {
            const description = val.description;
            if (description == null) {
                return 'Symbol';
            } else {
                return `Symbol(${description})`;
            }
        }
        if (type == 'function') {
            const name = val.name;
            if (typeof name == 'string' && name.length > 0) {
                return `Function(${name})`;
            } else {
                return 'Function';
            }
        }
        // objects
        if (Array.isArray(val)) {
            const length = val.length;
            let debug = '[';
            if (length > 0) {
                debug += debugString(val[0]);
            }
            for(let i = 1; i < length; i++) {
                debug += ', ' + debugString(val[i]);
            }
            debug += ']';
            return debug;
        }
        // Test for built-in
        const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
        let className;
        if (builtInMatches && builtInMatches.length > 1) {
            className = builtInMatches[1];
        } else {
            // Failed to match the standard '[object ClassName]'
            return toString.call(val);
        }
        if (className == 'Object') {
            // we're a user defined class or Object
            // JSON.stringify avoids problems with cycles, and is generally much
            // easier than looping through ownProperties of `val`.
            try {
                return 'Object(' + JSON.stringify(val) + ')';
            } catch (_) {
                return 'Object';
            }
        }
        // errors
        if (val instanceof Error) {
            return `${val.name}: ${val.message}\n${val.stack}`;
        }
        // TODO we could test for more things here, like `Set`s and `Map`s.
        return className;
    }

    function passArray32ToWasm0(arg, malloc) {
        const ptr = malloc(arg.length * 4, 4) >>> 0;
        getUint32ArrayMemory0().set(arg, ptr / 4);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    function passArrayJsValueToWasm0(array, malloc) {
        const ptr = malloc(array.length * 4, 4) >>> 0;
        const mem = getDataViewMemory0();
        for (let i = 0; i < array.length; i++) {
            mem.setUint32(ptr + 4 * i, addToExternrefTable0(array[i]), true);
        }
        WASM_VECTOR_LEN = array.length;
        return ptr;
    }

    function _assertClass(instance, klass) {
        if (!(instance instanceof klass)) {
            throw new Error(`expected instance of ${klass.name}`);
        }
    }

    let cachedUint16ArrayMemory0 = null;

    function getUint16ArrayMemory0() {
        if (cachedUint16ArrayMemory0 === null || cachedUint16ArrayMemory0.byteLength === 0) {
            cachedUint16ArrayMemory0 = new Uint16Array(wasm.memory.buffer);
        }
        return cachedUint16ArrayMemory0;
    }

    function passArray16ToWasm0(arg, malloc) {
        const ptr = malloc(arg.length * 2, 2) >>> 0;
        getUint16ArrayMemory0().set(arg, ptr / 2);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    let cachedFloat32ArrayMemory0 = null;

    function getFloat32ArrayMemory0() {
        if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
            cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
        }
        return cachedFloat32ArrayMemory0;
    }

    function passArrayF32ToWasm0(arg, malloc) {
        const ptr = malloc(arg.length * 4, 4) >>> 0;
        getFloat32ArrayMemory0().set(arg, ptr / 4);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    function takeFromExternrefTable0(idx) {
        const value = wasm.__wbindgen_export_2.get(idx);
        wasm.__externref_table_dealloc(idx);
        return value;
    }

    function passArray8ToWasm0(arg, malloc) {
        const ptr = malloc(arg.length * 1, 1) >>> 0;
        getUint8ArrayMemory0().set(arg, ptr / 1);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    function getArrayU16FromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return getUint16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
    }
    function __wbg_adapter_36(arg0, arg1, arg2) {
        wasm.closure531_externref_shim(arg0, arg1, arg2);
    }

    function __wbg_adapter_41(arg0, arg1, arg2) {
        wasm.closure544_externref_shim(arg0, arg1, arg2);
    }

    function __wbg_adapter_422(arg0, arg1, arg2, arg3) {
        wasm.closure599_externref_shim(arg0, arg1, arg2, arg3);
    }

    /**
     * @enum {0 | 1}
     */
    __exports.CreateEnvironmentError = Object.freeze({
        RequestAdapterFailed: 0, "0": "RequestAdapterFailed",
        RequestDeviceFailed: 1, "1": "RequestDeviceFailed",
    });
    /**
     * Device to put the model's embed tensor.
     * @enum {0 | 1}
     */
    __exports.EmbedDevice = Object.freeze({
        Cpu: 0, "0": "Cpu",
        Gpu: 1, "1": "Gpu",
    });
    /**
     * @enum {0}
     */
    __exports.ModelError = Object.freeze({
        InvalidVersion: 0, "0": "InvalidVersion",
    });
    /**
     * @enum {0 | 1 | 2 | 3}
     */
    __exports.ModelVersion = Object.freeze({
        V4: 0, "0": "V4",
        V5: 1, "1": "V5",
        V6: 2, "2": "V6",
        V7: 3, "3": "V7",
    });
    /**
     * Quantization of a layer.
     * @enum {0 | 1 | 2}
     */
    __exports.Quant = Object.freeze({
        /**
         * No quantization.
         */
        None: 0, "0": "None",
        /**
         * Use `Int8` quantization.
         */
        Int8: 1, "1": "Int8",
        /**
         * Use `NF4` quantization.
         */
        NF4: 2, "2": "NF4",
    });

    const __wbindgen_enum_GpuCompilationMessageType = ["error", "warning", "info"];

    const __wbindgen_enum_GpuDeviceLostReason = ["unknown", "destroyed"];

    const __wbindgen_enum_GpuErrorFilter = ["validation", "out-of-memory", "internal"];

    const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];

    const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];

    const ModelInfoFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_modelinfo_free(ptr >>> 0, 1));

    class ModelInfo {

        static __wrap(ptr) {
            ptr = ptr >>> 0;
            const obj = Object.create(ModelInfo.prototype);
            obj.__wbg_ptr = ptr;
            ModelInfoFinalization.register(obj, obj.__wbg_ptr, obj);
            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            ModelInfoFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_modelinfo_free(ptr, 0);
        }
        /**
         * @returns {ModelVersion}
         */
        get version() {
            const ret = wasm.__wbg_get_modelinfo_version(this.__wbg_ptr);
            return ret;
        }
        /**
         * @param {ModelVersion} arg0
         */
        set version(arg0) {
            wasm.__wbg_set_modelinfo_version(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get num_layer() {
            const ret = wasm.__wbg_get_modelinfo_num_layer(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set num_layer(arg0) {
            wasm.__wbg_set_modelinfo_num_layer(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get num_emb() {
            const ret = wasm.__wbg_get_modelinfo_num_emb(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set num_emb(arg0) {
            wasm.__wbg_set_modelinfo_num_emb(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get num_hidden() {
            const ret = wasm.__wbg_get_modelinfo_num_hidden(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set num_hidden(arg0) {
            wasm.__wbg_set_modelinfo_num_hidden(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get num_vocab() {
            const ret = wasm.__wbg_get_modelinfo_num_vocab(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set num_vocab(arg0) {
            wasm.__wbg_set_modelinfo_num_vocab(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get num_head() {
            const ret = wasm.__wbg_get_modelinfo_num_head(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set num_head(arg0) {
            wasm.__wbg_set_modelinfo_num_head(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get time_mix_adapter_size() {
            const ret = wasm.__wbg_get_modelinfo_time_mix_adapter_size(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set time_mix_adapter_size(arg0) {
            wasm.__wbg_set_modelinfo_time_mix_adapter_size(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get time_decay_adapter_size() {
            const ret = wasm.__wbg_get_modelinfo_time_decay_adapter_size(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @param {number} arg0
         */
        set time_decay_adapter_size(arg0) {
            wasm.__wbg_set_modelinfo_time_decay_adapter_size(this.__wbg_ptr, arg0);
        }
        /**
         * The required storage buffer size, not including head.
         * @returns {number}
         */
        max_non_head_buffer_size() {
            const ret = wasm.modelinfo_max_non_head_buffer_size(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * The head and embed's size.
         * @returns {number}
         */
        head_buffer_size() {
            const ret = wasm.modelinfo_head_buffer_size(this.__wbg_ptr);
            return ret >>> 0;
        }
        /**
         * @returns {number}
         */
        num_vocab_padded() {
            const ret = wasm.modelinfo_num_vocab_padded(this.__wbg_ptr);
            return ret >>> 0;
        }
    }
    __exports.ModelInfo = ModelInfo;

    const NucleusSamplerFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_nucleussampler_free(ptr >>> 0, 1));

    class NucleusSampler {

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            NucleusSamplerFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_nucleussampler_free(ptr, 0);
        }
        /**
         * @returns {number}
         */
        get temp() {
            const ret = wasm.__wbg_get_nucleussampler_temp(this.__wbg_ptr);
            return ret;
        }
        /**
         * @param {number} arg0
         */
        set temp(arg0) {
            wasm.__wbg_set_nucleussampler_temp(this.__wbg_ptr, arg0);
        }
        /**
         * @returns {number}
         */
        get top_p() {
            const ret = wasm.__wbg_get_nucleussampler_top_p(this.__wbg_ptr);
            return ret;
        }
        /**
         * @param {number} arg0
         */
        set top_p(arg0) {
            wasm.__wbg_set_nucleussampler_top_p(this.__wbg_ptr, arg0);
        }
        /**
         * @param {ModelInfo} info
         * @param {number} temp
         * @param {number} top_p
         */
        constructor(info, temp, top_p) {
            _assertClass(info, ModelInfo);
            var ptr0 = info.__destroy_into_raw();
            const ret = wasm.nucleussampler_new(ptr0, temp, top_p);
            this.__wbg_ptr = ret >>> 0;
            NucleusSamplerFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
        /**
         * @param {Float32Array} probs
         * @returns {number}
         */
        sample(probs) {
            const ptr0 = passArrayF32ToWasm0(probs, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.nucleussampler_sample(this.__wbg_ptr, ptr0, len0);
            return ret;
        }
    }
    __exports.NucleusSampler = NucleusSampler;

    const SessionFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_session_free(ptr >>> 0, 1));

    class Session {

        static __wrap(ptr) {
            ptr = ptr >>> 0;
            const obj = Object.create(Session.prototype);
            obj.__wbg_ptr = ptr;
            SessionFinalization.register(obj, obj.__wbg_ptr, obj);
            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            SessionFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_session_free(ptr, 0);
        }
        /**
         * @param {TensorReader} model
         */
        constructor(model) {
            _assertClass(model, TensorReader);
            var ptr0 = model.__destroy_into_raw();
            const ret = wasm.session_new(ptr0);
            return ret;
        }
        /**
         * @param {Uint16Array} tokens
         * @param {Float32Array} output
         * @param {StateId} state
         * @returns {Promise<void>}
         */
        run(tokens, output, state) {
            const ptr0 = passArray16ToWasm0(tokens, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = passArrayF32ToWasm0(output, wasm.__wbindgen_malloc);
            var len1 = WASM_VECTOR_LEN;
            _assertClass(state, StateId);
            const ret = wasm.session_run(this.__wbg_ptr, ptr0, len0, ptr1, len1, output, state.__wbg_ptr);
            return ret;
        }
        /**
         * @returns {ModelInfo}
         */
        info() {
            const ret = wasm.session_info(this.__wbg_ptr);
            return ModelInfo.__wrap(ret);
        }
    }
    __exports.Session = Session;

    const SimpleSamplerFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_simplesampler_free(ptr >>> 0, 1));

    class SimpleSampler {

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            SimpleSamplerFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_simplesampler_free(ptr, 0);
        }
        /**
         * @param {ModelInfo} info
         */
        constructor(info) {
            _assertClass(info, ModelInfo);
            var ptr0 = info.__destroy_into_raw();
            const ret = wasm.simplesampler_new(ptr0);
            this.__wbg_ptr = ret >>> 0;
            SimpleSamplerFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
        /**
         * @param {Float32Array} probs
         * @returns {number}
         */
        sample(probs) {
            const ptr0 = passArrayF32ToWasm0(probs, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.simplesampler_sample(this.__wbg_ptr, ptr0, len0);
            return ret;
        }
    }
    __exports.SimpleSampler = SimpleSampler;

    const StateIdFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_stateid_free(ptr >>> 0, 1));

    class StateId {

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            StateIdFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_stateid_free(ptr, 0);
        }
        constructor() {
            const ret = wasm.stateid_new();
            this.__wbg_ptr = ret >>> 0;
            StateIdFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
    }
    __exports.StateId = StateId;

    const TensorFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_tensor_free(ptr >>> 0, 1));

    class Tensor {

        static __unwrap(jsValue) {
            if (!(jsValue instanceof Tensor)) {
                return 0;
            }
            return jsValue.__destroy_into_raw();
        }

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            TensorFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_tensor_free(ptr, 0);
        }
        /**
         * @param {string} name
         * @param {Uint32Array} shape
         * @param {ArrayBuffer} buffer
         */
        constructor(name, shape, buffer) {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(shape, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.tensor_new(ptr0, len0, ptr1, len1, buffer);
            this.__wbg_ptr = ret >>> 0;
            TensorFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
    }
    __exports.Tensor = Tensor;

    const TensorReaderFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_tensorreader_free(ptr >>> 0, 1));

    class TensorReader {

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            TensorReaderFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_tensorreader_free(ptr, 0);
        }
        /**
         * @param {(Tensor)[]} tensors
         */
        constructor(tensors) {
            const ptr0 = passArrayJsValueToWasm0(tensors, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.tensorreader_new(ptr0, len0);
            this.__wbg_ptr = ret >>> 0;
            TensorReaderFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
    }
    __exports.TensorReader = TensorReader;

    const TokenizerFinalization = (typeof FinalizationRegistry === 'undefined')
        ? { register: () => {}, unregister: () => {} }
        : new FinalizationRegistry(ptr => wasm.__wbg_tokenizer_free(ptr >>> 0, 1));

    class Tokenizer {

        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            TokenizerFinalization.unregister(this);
            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_tokenizer_free(ptr, 0);
        }
        /**
         * @param {string} vocab
         */
        constructor(vocab) {
            const ptr0 = passStringToWasm0(vocab, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.tokenizer_new(ptr0, len0);
            if (ret[2]) {
                throw takeFromExternrefTable0(ret[1]);
            }
            this.__wbg_ptr = ret[0] >>> 0;
            TokenizerFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
        /**
         * @param {Uint8Array} input
         * @returns {Uint16Array}
         */
        encode(input) {
            const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.tokenizer_encode(this.__wbg_ptr, ptr0, len0);
            if (ret[3]) {
                throw takeFromExternrefTable0(ret[2]);
            }
            var v2 = getArrayU16FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 2, 2);
            return v2;
        }
        /**
         * @param {Uint16Array} tokens
         * @returns {Uint8Array}
         */
        decode(tokens) {
            const ptr0 = passArray16ToWasm0(tokens, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.tokenizer_decode(this.__wbg_ptr, ptr0, len0);
            if (ret[3]) {
                throw takeFromExternrefTable0(ret[2]);
            }
            var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
            return v2;
        }
    }
    __exports.Tokenizer = Tokenizer;

    async function __wbg_load(module, imports) {
        if (typeof Response === 'function' && module instanceof Response) {
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                try {
                    return await WebAssembly.instantiateStreaming(module, imports);

                } catch (e) {
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                    } else {
                        throw e;
                    }
                }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);

        } else {
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
                return { instance, module };

            } else {
                return instance;
            }
        }
    }

    function __wbg_get_imports() {
        const imports = {};
        imports.wbg = {};
        imports.wbg.__wbg_Window_cf5b693340a7c469 = function(arg0) {
            const ret = arg0.Window;
            return ret;
        };
        imports.wbg.__wbg_WorkerGlobalScope_354364d1b0bd06e5 = function(arg0) {
            const ret = arg0.WorkerGlobalScope;
            return ret;
        };
        imports.wbg.__wbg_beginComputePass_90d5303e604970cb = function(arg0, arg1) {
            const ret = arg0.beginComputePass(arg1);
            return ret;
        };
        imports.wbg.__wbg_beginRenderPass_9739520c601001c3 = function(arg0, arg1) {
            const ret = arg0.beginRenderPass(arg1);
            return ret;
        };
        imports.wbg.__wbg_buffer_6e1d53ff183194fc = function(arg0) {
            const ret = arg0.buffer;
            return ret;
        };
        imports.wbg.__wbg_buffer_ffdeb2ee67420f9e = function(arg0) {
            const ret = arg0.buffer;
            return ret;
        };
        imports.wbg.__wbg_call_0411c0c3c424db9a = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments) };
        imports.wbg.__wbg_call_3114932863209ca6 = function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments) };
        imports.wbg.__wbg_clearBuffer_6164fc25d22b25cc = function(arg0, arg1, arg2, arg3) {
            arg0.clearBuffer(arg1, arg2, arg3);
        };
        imports.wbg.__wbg_clearBuffer_cfcaaf1fb2baa885 = function(arg0, arg1, arg2) {
            arg0.clearBuffer(arg1, arg2);
        };
        imports.wbg.__wbg_configure_2414aed971d368cd = function(arg0, arg1) {
            arg0.configure(arg1);
        };
        imports.wbg.__wbg_copyBufferToBuffer_1ba67191114656a1 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.copyBufferToBuffer(arg1, arg2, arg3, arg4, arg5);
        };
        imports.wbg.__wbg_copyBufferToTexture_878d31d479e48f28 = function(arg0, arg1, arg2, arg3) {
            arg0.copyBufferToTexture(arg1, arg2, arg3);
        };
        imports.wbg.__wbg_copyExternalImageToTexture_7878d196c0b60d39 = function(arg0, arg1, arg2, arg3) {
            arg0.copyExternalImageToTexture(arg1, arg2, arg3);
        };
        imports.wbg.__wbg_copyTextureToBuffer_6a8fe0e90f0a663d = function(arg0, arg1, arg2, arg3) {
            arg0.copyTextureToBuffer(arg1, arg2, arg3);
        };
        imports.wbg.__wbg_copyTextureToTexture_0a06a393d6726b4a = function(arg0, arg1, arg2, arg3) {
            arg0.copyTextureToTexture(arg1, arg2, arg3);
        };
        imports.wbg.__wbg_createBindGroupLayout_1d93b6d41c87ba9d = function(arg0, arg1) {
            const ret = arg0.createBindGroupLayout(arg1);
            return ret;
        };
        imports.wbg.__wbg_createBindGroup_61cd07ec9d423432 = function(arg0, arg1) {
            const ret = arg0.createBindGroup(arg1);
            return ret;
        };
        imports.wbg.__wbg_createBuffer_963aa00d5fe859e4 = function(arg0, arg1) {
            const ret = arg0.createBuffer(arg1);
            return ret;
        };
        imports.wbg.__wbg_createCommandEncoder_f0e1613e9a2dc1eb = function(arg0, arg1) {
            const ret = arg0.createCommandEncoder(arg1);
            return ret;
        };
        imports.wbg.__wbg_createComputePipeline_b9616b9fe2f4eb2f = function(arg0, arg1) {
            const ret = arg0.createComputePipeline(arg1);
            return ret;
        };
        imports.wbg.__wbg_createPipelineLayout_56c6cf983f892d2b = function(arg0, arg1) {
            const ret = arg0.createPipelineLayout(arg1);
            return ret;
        };
        imports.wbg.__wbg_createQuerySet_c14be802adf7c207 = function(arg0, arg1) {
            const ret = arg0.createQuerySet(arg1);
            return ret;
        };
        imports.wbg.__wbg_createRenderBundleEncoder_8e4bdffea72f8c1f = function(arg0, arg1) {
            const ret = arg0.createRenderBundleEncoder(arg1);
            return ret;
        };
        imports.wbg.__wbg_createRenderPipeline_079a88a0601fcce1 = function(arg0, arg1) {
            const ret = arg0.createRenderPipeline(arg1);
            return ret;
        };
        imports.wbg.__wbg_createSampler_ef5578990df3baf7 = function(arg0, arg1) {
            const ret = arg0.createSampler(arg1);
            return ret;
        };
        imports.wbg.__wbg_createShaderModule_17f451ea25cae47c = function(arg0, arg1) {
            const ret = arg0.createShaderModule(arg1);
            return ret;
        };
        imports.wbg.__wbg_createTexture_01cc1cd2fea732d9 = function(arg0, arg1) {
            const ret = arg0.createTexture(arg1);
            return ret;
        };
        imports.wbg.__wbg_createView_04701884291e1ccc = function(arg0, arg1) {
            const ret = arg0.createView(arg1);
            return ret;
        };
        imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
            const ret = arg0.crypto;
            return ret;
        };
        imports.wbg.__wbg_destroy_35f94012e5bb9c17 = function(arg0) {
            arg0.destroy();
        };
        imports.wbg.__wbg_destroy_767d9dde1008e293 = function(arg0) {
            arg0.destroy();
        };
        imports.wbg.__wbg_destroy_c6af4226dda95dbd = function(arg0) {
            arg0.destroy();
        };
        imports.wbg.__wbg_dispatchWorkgroupsIndirect_8b25efab93a7a433 = function(arg0, arg1, arg2) {
            arg0.dispatchWorkgroupsIndirect(arg1, arg2);
        };
        imports.wbg.__wbg_dispatchWorkgroups_c102fa81b955935d = function(arg0, arg1, arg2, arg3) {
            arg0.dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
        };
        imports.wbg.__wbg_document_c488ca7509cc6938 = function(arg0) {
            const ret = arg0.document;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        };
        imports.wbg.__wbg_drawIndexedIndirect_34484fc6227c7bc8 = function(arg0, arg1, arg2) {
            arg0.drawIndexedIndirect(arg1, arg2);
        };
        imports.wbg.__wbg_drawIndexedIndirect_5a7c30bb5f1d5b67 = function(arg0, arg1, arg2) {
            arg0.drawIndexedIndirect(arg1, arg2);
        };
        imports.wbg.__wbg_drawIndexed_115af1449b52a948 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        };
        imports.wbg.__wbg_drawIndexed_a587cce4c317791f = function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        };
        imports.wbg.__wbg_drawIndirect_036d71498a21f1a3 = function(arg0, arg1, arg2) {
            arg0.drawIndirect(arg1, arg2);
        };
        imports.wbg.__wbg_drawIndirect_a1d7c5e893aa5756 = function(arg0, arg1, arg2) {
            arg0.drawIndirect(arg1, arg2);
        };
        imports.wbg.__wbg_draw_5351b12033166aca = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        };
        imports.wbg.__wbg_draw_e2a7c5d66fb2d244 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        };
        imports.wbg.__wbg_end_0ac71677a5c1717a = function(arg0) {
            arg0.end();
        };
        imports.wbg.__wbg_end_6f776519f1faa582 = function(arg0) {
            arg0.end();
        };
        imports.wbg.__wbg_error_e98e6aadd08e0b94 = function(arg0) {
            const ret = arg0.error;
            return ret;
        };
        imports.wbg.__wbg_executeBundles_8e6c0614da2805d4 = function(arg0, arg1) {
            arg0.executeBundles(arg1);
        };
        imports.wbg.__wbg_features_1b464383ea8a7691 = function(arg0) {
            const ret = arg0.features;
            return ret;
        };
        imports.wbg.__wbg_features_e5fbbc2760867852 = function(arg0) {
            const ret = arg0.features;
            return ret;
        };
        imports.wbg.__wbg_finish_20711371c58df61c = function(arg0) {
            const ret = arg0.finish();
            return ret;
        };
        imports.wbg.__wbg_finish_34b2c54329c8719f = function(arg0, arg1) {
            const ret = arg0.finish(arg1);
            return ret;
        };
        imports.wbg.__wbg_finish_a9ab917e756ea00c = function(arg0, arg1) {
            const ret = arg0.finish(arg1);
            return ret;
        };
        imports.wbg.__wbg_finish_e0a6c97c0622f843 = function(arg0) {
            const ret = arg0.finish();
            return ret;
        };
        imports.wbg.__wbg_getBindGroupLayout_4a94df6108ac6667 = function(arg0, arg1) {
            const ret = arg0.getBindGroupLayout(arg1 >>> 0);
            return ret;
        };
        imports.wbg.__wbg_getBindGroupLayout_80e803d942962f6a = function(arg0, arg1) {
            const ret = arg0.getBindGroupLayout(arg1 >>> 0);
            return ret;
        };
        imports.wbg.__wbg_getCompilationInfo_2af3ecdfeda551a3 = function(arg0) {
            const ret = arg0.getCompilationInfo();
            return ret;
        };
        imports.wbg.__wbg_getContext_02d86c7d9cfa709e = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments) };
        imports.wbg.__wbg_getContext_24d4414b979c1bbd = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments) };
        imports.wbg.__wbg_getCurrentTexture_5a79cda2ff36e1ee = function(arg0) {
            const ret = arg0.getCurrentTexture();
            return ret;
        };
        imports.wbg.__wbg_getMappedRange_932dd043ae22ee0a = function(arg0, arg1, arg2) {
            const ret = arg0.getMappedRange(arg1, arg2);
            return ret;
        };
        imports.wbg.__wbg_getPreferredCanvasFormat_de73c02773a5209e = function(arg0) {
            const ret = arg0.getPreferredCanvasFormat();
            return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
        };
        imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() { return handleError(function (arg0, arg1) {
            arg0.getRandomValues(arg1);
        }, arguments) };
        imports.wbg.__wbg_get_68aa371864aa301a = function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        };
        imports.wbg.__wbg_get_6b316bfdb1b95076 = function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        };
        imports.wbg.__wbg_globalThis_1e2ac1d6eee845b3 = function() { return handleError(function () {
            const ret = globalThis.globalThis;
            return ret;
        }, arguments) };
        imports.wbg.__wbg_global_f25a574ae080367c = function() { return handleError(function () {
            const ret = global.global;
            return ret;
        }, arguments) };
        imports.wbg.__wbg_gpu_87871e8f7ace8fee = function(arg0) {
            const ret = arg0.gpu;
            return ret;
        };
        imports.wbg.__wbg_has_624cbf0451d880e8 = function(arg0, arg1, arg2) {
            const ret = arg0.has(getStringFromWasm0(arg1, arg2));
            return ret;
        };
        imports.wbg.__wbg_instanceof_GpuAdapter_0731153d2b08720b = function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUAdapter;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_GpuCanvasContext_d14121c7bd72fcef = function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUCanvasContext;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_GpuDeviceLostInfo_a3677ebb8241d800 = function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUDeviceLostInfo;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_GpuOutOfMemoryError_391d9a08edbfa04b = function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUOutOfMemoryError;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_GpuValidationError_f4d803c383da3c92 = function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUValidationError;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_Object_f0f57d6eeca1b81d = function(arg0) {
            let result;
            try {
                result = arg0 instanceof Object;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_instanceof_Window_a959820eb267fe22 = function(arg0) {
            let result;
            try {
                result = arg0 instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        };
        imports.wbg.__wbg_label_2082ab37d2ad170d = function(arg0, arg1) {
            const ret = arg1.label;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbg_length_2e63ba34c4121df5 = function(arg0) {
            const ret = arg0.length;
            return ret;
        };
        imports.wbg.__wbg_length_9df32f7add647235 = function(arg0) {
            const ret = arg0.length;
            return ret;
        };
        imports.wbg.__wbg_length_e74df4881604f1d9 = function(arg0) {
            const ret = arg0.length;
            return ret;
        };
        imports.wbg.__wbg_limits_2dd632c891786ddf = function(arg0) {
            const ret = arg0.limits;
            return ret;
        };
        imports.wbg.__wbg_limits_f6411f884b0b2d62 = function(arg0) {
            const ret = arg0.limits;
            return ret;
        };
        imports.wbg.__wbg_lineNum_0246de1e072ffe19 = function(arg0) {
            const ret = arg0.lineNum;
            return ret;
        };
        imports.wbg.__wbg_lost_6e4d29847ce2a34a = function(arg0) {
            const ret = arg0.lost;
            return ret;
        };
        imports.wbg.__wbg_mapAsync_37f5e03edf2e1352 = function(arg0, arg1, arg2, arg3) {
            const ret = arg0.mapAsync(arg1 >>> 0, arg2, arg3);
            return ret;
        };
        imports.wbg.__wbg_maxBindGroups_768ca5e8623bf450 = function(arg0) {
            const ret = arg0.maxBindGroups;
            return ret;
        };
        imports.wbg.__wbg_maxBindingsPerBindGroup_057972d600d69719 = function(arg0) {
            const ret = arg0.maxBindingsPerBindGroup;
            return ret;
        };
        imports.wbg.__wbg_maxBufferSize_e237b44f19a5a62b = function(arg0) {
            const ret = arg0.maxBufferSize;
            return ret;
        };
        imports.wbg.__wbg_maxColorAttachmentBytesPerSample_d6c7b4051d22c6d6 = function(arg0) {
            const ret = arg0.maxColorAttachmentBytesPerSample;
            return ret;
        };
        imports.wbg.__wbg_maxColorAttachments_7a18ba24c05edcfd = function(arg0) {
            const ret = arg0.maxColorAttachments;
            return ret;
        };
        imports.wbg.__wbg_maxComputeInvocationsPerWorkgroup_b99c2f3611633992 = function(arg0) {
            const ret = arg0.maxComputeInvocationsPerWorkgroup;
            return ret;
        };
        imports.wbg.__wbg_maxComputeWorkgroupSizeX_adb26da9ed7f77f7 = function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeX;
            return ret;
        };
        imports.wbg.__wbg_maxComputeWorkgroupSizeY_cc217559c98be33b = function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeY;
            return ret;
        };
        imports.wbg.__wbg_maxComputeWorkgroupSizeZ_66606a80e2cf2309 = function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeZ;
            return ret;
        };
        imports.wbg.__wbg_maxComputeWorkgroupStorageSize_cb6235497b8c4997 = function(arg0) {
            const ret = arg0.maxComputeWorkgroupStorageSize;
            return ret;
        };
        imports.wbg.__wbg_maxComputeWorkgroupsPerDimension_6bf550b5f21d57cf = function(arg0) {
            const ret = arg0.maxComputeWorkgroupsPerDimension;
            return ret;
        };
        imports.wbg.__wbg_maxDynamicStorageBuffersPerPipelineLayout_c6ac20334e328b47 = function(arg0) {
            const ret = arg0.maxDynamicStorageBuffersPerPipelineLayout;
            return ret;
        };
        imports.wbg.__wbg_maxDynamicUniformBuffersPerPipelineLayout_aa8f14a74b440f01 = function(arg0) {
            const ret = arg0.maxDynamicUniformBuffersPerPipelineLayout;
            return ret;
        };
        imports.wbg.__wbg_maxSampledTexturesPerShaderStage_db7c4922cc60144a = function(arg0) {
            const ret = arg0.maxSampledTexturesPerShaderStage;
            return ret;
        };
        imports.wbg.__wbg_maxSamplersPerShaderStage_538705fe2263e710 = function(arg0) {
            const ret = arg0.maxSamplersPerShaderStage;
            return ret;
        };
        imports.wbg.__wbg_maxStorageBufferBindingSize_32178c0f5f7f85cb = function(arg0) {
            const ret = arg0.maxStorageBufferBindingSize;
            return ret;
        };
        imports.wbg.__wbg_maxStorageBuffersPerShaderStage_9f67e9eae0089f77 = function(arg0) {
            const ret = arg0.maxStorageBuffersPerShaderStage;
            return ret;
        };
        imports.wbg.__wbg_maxStorageTexturesPerShaderStage_57239664936031cf = function(arg0) {
            const ret = arg0.maxStorageTexturesPerShaderStage;
            return ret;
        };
        imports.wbg.__wbg_maxTextureArrayLayers_db5d4e486c78ae04 = function(arg0) {
            const ret = arg0.maxTextureArrayLayers;
            return ret;
        };
        imports.wbg.__wbg_maxTextureDimension1D_3475085ffacabbdc = function(arg0) {
            const ret = arg0.maxTextureDimension1D;
            return ret;
        };
        imports.wbg.__wbg_maxTextureDimension2D_7c8d5ecf09eb8519 = function(arg0) {
            const ret = arg0.maxTextureDimension2D;
            return ret;
        };
        imports.wbg.__wbg_maxTextureDimension3D_8bd976677a0f91d4 = function(arg0) {
            const ret = arg0.maxTextureDimension3D;
            return ret;
        };
        imports.wbg.__wbg_maxUniformBufferBindingSize_95b1a54e7e4a0f0f = function(arg0) {
            const ret = arg0.maxUniformBufferBindingSize;
            return ret;
        };
        imports.wbg.__wbg_maxUniformBuffersPerShaderStage_5f475d9a453af14d = function(arg0) {
            const ret = arg0.maxUniformBuffersPerShaderStage;
            return ret;
        };
        imports.wbg.__wbg_maxVertexAttributes_4c48ca2f5d32f860 = function(arg0) {
            const ret = arg0.maxVertexAttributes;
            return ret;
        };
        imports.wbg.__wbg_maxVertexBufferArrayStride_2233f6933ecc5a16 = function(arg0) {
            const ret = arg0.maxVertexBufferArrayStride;
            return ret;
        };
        imports.wbg.__wbg_maxVertexBuffers_c47e508cd7348554 = function(arg0) {
            const ret = arg0.maxVertexBuffers;
            return ret;
        };
        imports.wbg.__wbg_message_0762358e59db7ed6 = function(arg0, arg1) {
            const ret = arg1.message;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbg_message_7957ab09f64c6822 = function(arg0, arg1) {
            const ret = arg1.message;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbg_message_b163994503433c9e = function(arg0, arg1) {
            const ret = arg1.message;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbg_messages_da071582f72bc978 = function(arg0) {
            const ret = arg0.messages;
            return ret;
        };
        imports.wbg.__wbg_minStorageBufferOffsetAlignment_51b4801fac3a58de = function(arg0) {
            const ret = arg0.minStorageBufferOffsetAlignment;
            return ret;
        };
        imports.wbg.__wbg_minUniformBufferOffsetAlignment_5d62a77924b2335f = function(arg0) {
            const ret = arg0.minUniformBufferOffsetAlignment;
            return ret;
        };
        imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
            const ret = arg0.msCrypto;
            return ret;
        };
        imports.wbg.__wbg_navigator_2936a93ec3c6f4c5 = function(arg0) {
            const ret = arg0.navigator;
            return ret;
        };
        imports.wbg.__wbg_navigator_da495c9e52e160b1 = function(arg0) {
            const ret = arg0.navigator;
            return ret;
        };
        imports.wbg.__wbg_new_076cac58bb698dd4 = function() {
            const ret = new Object();
            return ret;
        };
        imports.wbg.__wbg_new_0c28e72025e00594 = function() {
            const ret = new Array();
            return ret;
        };
        imports.wbg.__wbg_new_1e8ca58d170d6ad0 = function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wbg_adapter_422(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = state0.b = 0;
            }
        };
        imports.wbg.__wbg_new_23362fa370a0a372 = function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        };
        imports.wbg.__wbg_newnoargs_19a249f4eceaaac3 = function(arg0, arg1) {
            const ret = new Function(getStringFromWasm0(arg0, arg1));
            return ret;
        };
        imports.wbg.__wbg_newwithbyteoffsetandlength_ee8def7000b7b2be = function(arg0, arg1, arg2) {
            const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
            return ret;
        };
        imports.wbg.__wbg_newwithlength_91de49dea5643c87 = function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        };
        imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
            const ret = arg0.node;
            return ret;
        };
        imports.wbg.__wbg_offset_336f14c993863b76 = function(arg0) {
            const ret = arg0.offset;
            return ret;
        };
        imports.wbg.__wbg_popErrorScope_af0b22f136a861d6 = function(arg0) {
            const ret = arg0.popErrorScope();
            return ret;
        };
        imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
            const ret = arg0.process;
            return ret;
        };
        imports.wbg.__wbg_pushErrorScope_b52914ff10ba6ce3 = function(arg0, arg1) {
            arg0.pushErrorScope(__wbindgen_enum_GpuErrorFilter[arg1]);
        };
        imports.wbg.__wbg_push_3e9ce81246ef1d1b = function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        };
        imports.wbg.__wbg_querySelectorAll_775f04e6f26ad643 = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.querySelectorAll(getStringFromWasm0(arg1, arg2));
            return ret;
        }, arguments) };
        imports.wbg.__wbg_queueMicrotask_3d422e1ba49c2500 = function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        };
        imports.wbg.__wbg_queueMicrotask_f301663ccadbb7d0 = function(arg0) {
            queueMicrotask(arg0);
        };
        imports.wbg.__wbg_queue_bea4017efaaf9904 = function(arg0) {
            const ret = arg0.queue;
            return ret;
        };
        imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() { return handleError(function (arg0, arg1) {
            arg0.randomFillSync(arg1);
        }, arguments) };
        imports.wbg.__wbg_reason_43acd39cce242b50 = function(arg0) {
            const ret = arg0.reason;
            return (__wbindgen_enum_GpuDeviceLostReason.indexOf(ret) + 1 || 3) - 1;
        };
        imports.wbg.__wbg_requestAdapter_e6dcfac497cafa7a = function(arg0, arg1) {
            const ret = arg0.requestAdapter(arg1);
            return ret;
        };
        imports.wbg.__wbg_requestDevice_03b802707d5a382c = function(arg0, arg1) {
            const ret = arg0.requestDevice(arg1);
            return ret;
        };
        imports.wbg.__wbg_require_79b1e9274cde3c87 = function() { return handleError(function () {
            const ret = module.require;
            return ret;
        }, arguments) };
        imports.wbg.__wbg_resolveQuerySet_811661fb23f3b699 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.resolveQuerySet(arg1, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        };
        imports.wbg.__wbg_resolve_6a311e8bb26423ab = function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        };
        imports.wbg.__wbg_self_ac4343e4047b83cc = function() { return handleError(function () {
            const ret = self.self;
            return ret;
        }, arguments) };
        imports.wbg.__wbg_session_new = function(arg0) {
            const ret = Session.__wrap(arg0);
            return ret;
        };
        imports.wbg.__wbg_setBindGroup_62a3045b0921e429 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        };
        imports.wbg.__wbg_setBindGroup_6c0fd18e9a53a945 = function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        };
        imports.wbg.__wbg_setBindGroup_7f3b61f1f482133b = function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        };
        imports.wbg.__wbg_setBindGroup_bf767a5aa46a33ce = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        };
        imports.wbg.__wbg_setBindGroup_c4aaff14063226b4 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        };
        imports.wbg.__wbg_setBindGroup_f82e771dc1b69093 = function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        };
        imports.wbg.__wbg_setBlendConstant_016723821cfb3aa4 = function(arg0, arg1) {
            arg0.setBlendConstant(arg1);
        };
        imports.wbg.__wbg_setIndexBuffer_286a40afdff411b7 = function(arg0, arg1, arg2, arg3) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
        };
        imports.wbg.__wbg_setIndexBuffer_7efd0b7a40c65fb9 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
        };
        imports.wbg.__wbg_setIndexBuffer_e091a9673bb575e2 = function(arg0, arg1, arg2, arg3) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
        };
        imports.wbg.__wbg_setIndexBuffer_f0759f00036f615f = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
        };
        imports.wbg.__wbg_setPipeline_ba92070b8ee81cf9 = function(arg0, arg1) {
            arg0.setPipeline(arg1);
        };
        imports.wbg.__wbg_setPipeline_c344f76bae58c4d6 = function(arg0, arg1) {
            arg0.setPipeline(arg1);
        };
        imports.wbg.__wbg_setPipeline_d76451c50a121598 = function(arg0, arg1) {
            arg0.setPipeline(arg1);
        };
        imports.wbg.__wbg_setScissorRect_0b6ee0852ef0b6b9 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        };
        imports.wbg.__wbg_setStencilReference_34fd3d59673a5a9d = function(arg0, arg1) {
            arg0.setStencilReference(arg1 >>> 0);
        };
        imports.wbg.__wbg_setVertexBuffer_06a90dc78e1ad9c4 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
        };
        imports.wbg.__wbg_setVertexBuffer_1540e9118b6c451d = function(arg0, arg1, arg2, arg3) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
        };
        imports.wbg.__wbg_setVertexBuffer_5166eedc06450701 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
        };
        imports.wbg.__wbg_setVertexBuffer_8621784e5014065b = function(arg0, arg1, arg2, arg3) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
        };
        imports.wbg.__wbg_setViewport_731ad30abb13f744 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
        };
        imports.wbg.__wbg_set_421385e996a16e02 = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments) };
        imports.wbg.__wbg_set_7b70226104a82921 = function(arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        };
        imports.wbg.__wbg_setheight_4286b13b9186d39f = function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        };
        imports.wbg.__wbg_setheight_7632621fed149fd9 = function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        };
        imports.wbg.__wbg_setonuncapturederror_19541466822d790b = function(arg0, arg1) {
            arg0.onuncapturederror = arg1;
        };
        imports.wbg.__wbg_setwidth_5e43e6e177d3e2ec = function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        };
        imports.wbg.__wbg_setwidth_db46810857c0f6bd = function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        };
        imports.wbg.__wbg_size_661bddb3f9898121 = function(arg0) {
            const ret = arg0.size;
            return ret;
        };
        imports.wbg.__wbg_subarray_b4e9772c34a7f5ba = function(arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        };
        imports.wbg.__wbg_submit_f635072bb3d05faa = function(arg0, arg1) {
            arg0.submit(arg1);
        };
        imports.wbg.__wbg_tensor_unwrap = function(arg0) {
            const ret = Tensor.__unwrap(arg0);
            return ret;
        };
        imports.wbg.__wbg_then_5c6469c1e1da9e59 = function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        };
        imports.wbg.__wbg_then_faeb8aed8c1629b7 = function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        };
        imports.wbg.__wbg_type_c0d5d83032e9858a = function(arg0) {
            const ret = arg0.type;
            return (__wbindgen_enum_GpuCompilationMessageType.indexOf(ret) + 1 || 4) - 1;
        };
        imports.wbg.__wbg_unmap_8c2e8131b2aaa844 = function(arg0) {
            arg0.unmap();
        };
        imports.wbg.__wbg_usage_13caa02888040e9f = function(arg0) {
            const ret = arg0.usage;
            return ret;
        };
        imports.wbg.__wbg_valueOf_a2728b52687d72b4 = function(arg0) {
            const ret = arg0.valueOf();
            return ret;
        };
        imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
            const ret = arg0.versions;
            return ret;
        };
        imports.wbg.__wbg_window_1a23defd102c72f4 = function() { return handleError(function () {
            const ret = window.window;
            return ret;
        }, arguments) };
        imports.wbg.__wbg_writeBuffer_5ca4981365eb5ac0 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.writeBuffer(arg1, arg2, arg3, arg4, arg5);
        };
        imports.wbg.__wbg_writeTexture_246118eb2f5a1592 = function(arg0, arg1, arg2, arg3, arg4) {
            arg0.writeTexture(arg1, arg2, arg3, arg4);
        };
        imports.wbg.__wbindgen_cb_drop = function(arg0) {
            const obj = arg0.original;
            if (obj.cnt-- == 1) {
                obj.a = 0;
                return true;
            }
            const ret = false;
            return ret;
        };
        imports.wbg.__wbindgen_closure_wrapper1647 = function(arg0, arg1, arg2) {
            const ret = makeMutClosure(arg0, arg1, 532, __wbg_adapter_36);
            return ret;
        };
        imports.wbg.__wbindgen_closure_wrapper1649 = function(arg0, arg1, arg2) {
            const ret = makeMutClosure(arg0, arg1, 532, __wbg_adapter_36);
            return ret;
        };
        imports.wbg.__wbindgen_closure_wrapper1929 = function(arg0, arg1, arg2) {
            const ret = makeMutClosure(arg0, arg1, 545, __wbg_adapter_41);
            return ret;
        };
        imports.wbg.__wbindgen_copy_to_typed_array = function(arg0, arg1, arg2) {
            new Uint8Array(arg2.buffer, arg2.byteOffset, arg2.byteLength).set(getArrayU8FromWasm0(arg0, arg1));
        };
        imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return ret;
        };
        imports.wbg.__wbindgen_init_externref_table = function() {
            const table = wasm.__wbindgen_export_2;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
            ;
        };
        imports.wbg.__wbindgen_is_function = function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        };
        imports.wbg.__wbindgen_is_null = function(arg0) {
            const ret = arg0 === null;
            return ret;
        };
        imports.wbg.__wbindgen_is_object = function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        };
        imports.wbg.__wbindgen_is_string = function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        };
        imports.wbg.__wbindgen_is_undefined = function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        };
        imports.wbg.__wbindgen_memory = function() {
            const ret = wasm.memory;
            return ret;
        };
        imports.wbg.__wbindgen_number_new = function(arg0) {
            const ret = arg0;
            return ret;
        };
        imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        };
        imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        };
        imports.wbg.__wbindgen_throw = function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        };

        return imports;
    }

    function __wbg_init_memory(imports, memory) {

    }

    function __wbg_finalize_init(instance, module) {
        wasm = instance.exports;
        __wbg_init.__wbindgen_wasm_module = module;
        cachedDataViewMemory0 = null;
        cachedFloat32ArrayMemory0 = null;
        cachedUint16ArrayMemory0 = null;
        cachedUint32ArrayMemory0 = null;
        cachedUint8ArrayMemory0 = null;


        wasm.__wbindgen_start();
        return wasm;
    }

    function initSync(module) {
        if (wasm !== undefined) return wasm;


        if (typeof module !== 'undefined') {
            if (Object.getPrototypeOf(module) === Object.prototype) {
                ({module} = module)
            } else {
                console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
            }
        }

        const imports = __wbg_get_imports();

        __wbg_init_memory(imports);

        if (!(module instanceof WebAssembly.Module)) {
            module = new WebAssembly.Module(module);
        }

        const instance = new WebAssembly.Instance(module, imports);

        return __wbg_finalize_init(instance, module);
    }

    async function __wbg_init(module_or_path) {
        if (wasm !== undefined) return wasm;


        if (typeof module_or_path !== 'undefined') {
            if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
                ({module_or_path} = module_or_path)
            } else {
                console.warn('using deprecated parameters for the initialization function; pass a single object instead')
            }
        }

        if (typeof module_or_path === 'undefined' && typeof script_src !== 'undefined') {
            module_or_path = script_src.replace(/\.js$/, '_bg.wasm');
        }
        const imports = __wbg_get_imports();

        if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
            module_or_path = fetch(module_or_path);
        }

        __wbg_init_memory(imports);

        const { instance, module } = await __wbg_load(await module_or_path, imports);

        return __wbg_finalize_init(instance, module);
    }

    wasm_bindgen = Object.assign(__wbg_init, { initSync }, __exports);

})();
