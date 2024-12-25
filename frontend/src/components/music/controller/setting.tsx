import { Button, Progress } from "antd";
import { useRecoilState } from "recoil";
import { useRecoilValue } from "recoil";
import { M } from "../../../pages/state_music";
import { loadData } from "../../../func/load";
import { setupWorker } from "../../../setup_worker";
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
export default function Setting() {
  const kDebugMode = process.env.NODE_ENV == 'development'
  const modelUrl = useRecoilValue(M.modelUrl)
  const remoteUrl = useRecoilValue(M.remoteUrl)
  const remoteKey = useRecoilValue(M.remoteKey)
  const [, setLoadedProgress] = useRecoilState(M.loadedProgress)
  const [loading, setLoading] = useRecoilState(M.modelLoading)
  const [loaded, setLoaded] = useRecoilState(M.loaded)
  const [progress] = useRecoilState(M.loadedProgress)
  const [contentLength, setContentLength] = useRecoilState(M.modelSize)
  const [loadedLength, setLoadedLength] = useRecoilState(M.loadedSize)
  const worker = useRecoilValue(M.worker)

  const onClickLoadModel = async () => {
    setLoading(true)
    setLoaded(false)
    const chunks = await loadData(
      'music',
      kDebugMode ? modelUrl : remoteUrl,
      remoteKey,
      (progress) => {
        setLoadedProgress(progress)
      },
      (contentLength) => {
        setContentLength(contentLength)
      },
      (loadedLength) => {
        setLoadedLength(loadedLength)
      },
    )
    await setupWorker(worker, chunks, 'music')
    setLoading(false)
    setLoaded(true)
  }
  return (
    <div className='w-full flex flex-col items-center justify-center '>

      {loaded ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex gap-2 items-center justify-center">
            <CheckCircleOutlined className="inline-flex items-center text-lg text-blue-500" />
            <span className="inline-flex items-center text-lg text-blue-500">model loaded </span>
            <span className="inline-flex items-center text-lg cursor-pointer hover:opacity-80" onClick={onClickLoadModel}>Reload</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <Button type="primary" onClick={onClickLoadModel} loading={loading}>{loading ? 'Loading...' : 'Load Model'}</Button>
          <div className="w-full flex flex-col items-center justify-center">
            {loading && (
              <Progress
                style={{ maxWidth: 300 }}
                percent={progress}
                format={() => ''}
              />
            )}
            {loading && (
              <div>
                {(loadedLength / (1000 * 1000)).toFixed(1)}MB / {(contentLength / (1000 * 1000)).toFixed(1)}MB
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
