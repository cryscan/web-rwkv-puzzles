export async function setupWorker(
  worker: Worker,
  chunks: Uint8Array[],
  type: 'puzzle' | 'chat',
) {
  // console.log('🔄 Loading worker')
  // var worker = new Worker('llm/worker.js')
  // console.log('✅ Worker loaded')

  switch (type) {
    case 'chat':
      worker.onmessage = (e) => {
        const { data } = e
        try {
          window.chat(data)
        } catch (e) {
          console.error(e)
        }
      }
      break
    case 'puzzle':
      worker.onmessage = (e) => {
        const { data } = e
        try {
          window.puzzle(data)
        } catch (e) {
          console.error(e)
        }
      }
      break
  }

  const options = {
    task: 'set_session_type',
    type,
  }

  worker.postMessage(JSON.stringify(options))

  worker.postMessage(
    chunks,
    chunks.map((x) => x.buffer),
  )
}
