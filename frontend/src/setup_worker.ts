interface Window {
  rwkv_worker: Worker
  workerMessageReceived: (data: any) => void
}

export async function setupWorker(chunks: Uint8Array[]) {
  console.log('🔄 Loading worker')
  var worker = new Worker('llm/worker.js')

  console.log('✅ Worker loaded')
  window.rwkv_worker = worker

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
