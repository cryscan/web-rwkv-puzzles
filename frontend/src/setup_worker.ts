export async function setupWorker(
  chunks: Uint8Array[],
  type: 'puzzle' | 'chat'
) {
  console.log('🔄 Loading worker')
  var worker = new Worker('llm/worker.js')

  console.log('✅ Worker loaded')

  switch (type) {
    case 'chat':
      window.chat_worker = worker
      worker.onmessage = (e) => {
        const { data } = e
        try { window.onChatMessageReceived(data) }
        catch (e) { console.error(e) }
      }
      break
    case 'puzzle':
      window.puzzle_worker = worker
      worker.onmessage = (e) => {
        const { data } = e
        try { window.onPuzzleMessageReceived(data) }
        catch (e) { console.error(e) }
      }
      break
  }

  const options = {
    task: 'set_session_type',
    type
  }

  worker.postMessage(JSON.stringify(options))

  worker.postMessage(
    chunks,
    chunks.map((x) => x.buffer)
  )
}
