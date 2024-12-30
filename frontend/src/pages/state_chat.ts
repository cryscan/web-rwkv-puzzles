import { atom } from 'recoil'

const worker = atom({
  key: 'chat_worker',
  default: new Worker('llm/worker.js'),
})

const modelLoaded = atom({
  key: 'modelLoaded',
  default: false,
})

const modelLoading = atom({
  key: 'modelLoading',
  default: false,
})

const modelSize = atom({
  key: 'modelSize',
  default: 0,
})

const loadedSize = atom({
  key: 'loadedSize',
  default: 0,
})

const loadedProgress = atom({
  key: 'loadProgress',
  default: 0,
})

const modelUrl = atom({
  key: 'modelUrl',
  default: './assets/models/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
})

const remoteUrl = atom({
  key: 'remoteUrl',
  default:
    // 'https://api-image.rwkvos.com/download/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
    'https://huggingface.co/cgisky/RWKV-x070-Ai00/resolve/main/world_v2.8/0.1B/0.1B-20241210-ctx4096.st',
})

const remoteKey = atom({
  key: 'remoteKey',
  default:
    // '4s5aWqs2f4PzKfgLjuRZgXKvvmal5Z5iq0OzkTPwaA2axgNgSbayfQEX5FgOpTxyyeUM4gsFHHDZroaFDIE3NtSJD6evdz3lAVctyN026keeXMoJ7tmUy5zriMJHJ9aM',
    undefined,
})

const heartBeatSet = atom({
  key: 'heartBeatSet',
  default: false,
})

export const P = {
  worker,
  modelLoaded,
  modelLoading,
  modelSize,
  loadedSize,
  loadedProgress,
  modelUrl,
  remoteUrl,
  remoteKey,
  heartBeatSet,
}
