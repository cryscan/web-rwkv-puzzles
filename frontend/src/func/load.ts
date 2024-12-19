/**
 * Load model from URL and cache it
 * @param url - The URL of the model
 * @param onProgress - Callback function to report progress
 * @returns The chunks of the model, will be used to load the model into the worker
 */
export const loadData = async (
  url: string,
  onProgress?: (progress: number) => void,
  onContentLength?: (contentLength: number) => void,
  onLoadedLength?: (loadedLength: number) => void
): Promise<Uint8Array[]> => {
  const cacheKey = `rwkv.models.${url}`
  const cache = await caches.open(cacheKey)

  const cacheResponse = await cache.match(cacheKey)
  if (cacheResponse) console.log('✅ model loaded from cache:\n', url)
  if (cacheResponse) {
    onProgress?.(100)
    const blob = await cacheResponse.blob()
    const buffer = await blob.arrayBuffer()
    // Split the buffer into chunks of 1MB
    const chunkSize = 1024 * 1024
    const chunks: Uint8Array[] = []
    for (let i = 0; i < buffer.byteLength; i += chunkSize) {
      chunks.push(new Uint8Array(buffer.slice(i, i + chunkSize)))
    }
    return chunks
  }

  console.log('🔄 Performing network request to load model:\n', url)
  const response = await fetch(url)
  const reader = response.body!.getReader()
  const contentLength = +response.headers.get('Content-Length')!

  if (contentLength <= 1000) {
    console.error('😡 Model file is too small, please check the model file')
    alert('Model file is too small, please check the model file')
    throw new Error('Model file is too small, please check the model file')
  }

  onContentLength?.(contentLength)

  let receivedLength = 0
  let chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    receivedLength += value.length
    chunks.push(value)

    onProgress?.((receivedLength / contentLength) * 100)
    onLoadedLength?.(receivedLength)
  }

  console.log('✅ model loaded from network:\n', url)
  const blob = new Blob(chunks)
  const completeResponse = new Response(blob, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  })
  await cache.put(cacheKey, completeResponse)

  return chunks
}
