interface Window {
    load: () => Promise<void>
    rwkv_worker: Worker
    workerMessageReceived: (data: any) => void
}

async function load() {
    const url = './assets/models/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st'
    // let response = await fetch(url)

    var cache = await caches.open("rwkv");

    let response = await cache.match(url).then(async (value) => {
        if (value !== undefined) {
            console.log("✅ Loaded cached model");
            return value;
        }
        console.log("🔄 Loading uncached model");
        let response = await fetch(url);
        cache.put(url, response.clone());
        return response;
    });

    if (
        (response.status >= 200 && response.status < 300) ||
        response.status === 0 /* Loaded from local file */
    ) {
        console.log('✅ .st loaded')
    } else if (response.status === 404 && url.startsWith('http://localhost')) {
        console.error('Model not found')
        return
    } else {
        console.error('Incorrect URL')
        return
    }
    const reader = response.body!.getReader()
    const contentLength = +response.headers.get('Content-Length')!
    console.log({ contentLength })
    let receivedLength = 0
    let chunks = []

    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            break
        }
        chunks.push(value)
        receivedLength += value.length
        // progressElem.value = receivedLength / contentLength
        // statusElem.innerHTML = `<p>${url}</p><p>${receivedLength * 1.0e-6} / ${
        //   contentLength * 1.0e-6
        // } MB</p>`
    }

    //   downloadElem.style.display = 'none'
    console.log('🔄 Loading worker')
    var worker = new Worker('llm/worker.js')
    console.log('✅ Worker loaded')
    window.rwkv_worker = worker
    console.log('✅ worker loaded')
    worker.onmessage = (e) => {
        const { data } = e
        try {
            window.workerMessageReceived(data)
        } catch (e) {
            console.error(e)
        }
    }
    worker.postMessage(
        chunks,
        chunks.map((x) => x.buffer)
    )
}
