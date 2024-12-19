export async function setupWorker(
  chunks: Uint8Array[],
  task: 'puzzle' | 'chat'
) {
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

  const options = {
    task: 'set_sampler_is_puzzle',
    is_puzzle_model: task === 'puzzle',
  }

  worker.postMessage(JSON.stringify(options))

  worker.postMessage(
    chunks,
    chunks.map((x) => x.buffer)
  )
}
