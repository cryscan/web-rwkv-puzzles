import { atom } from 'recoil'

const worker = atom({
  key: 'music_worker',
  default: null as Worker | null,
  effects: [
    ({ setSelf }) => {
      setSelf(new Worker('llm/worker.js'))
      return () => {
        setSelf(null)
      }
    },
  ],
})

const modelLoaded = atom({
  key: 'music_modelLoaded',
  default: false,
})

const modelLoading = atom({
  key: 'music_modelLoading',
  default: false,
})

const loaded = atom({
  key: 'music_loaded',
  default: false,
})

const modelSize = atom({
  key: 'music_modelSize',
  default: 0,
})

const loadedSize = atom({
  key: 'music_loadedSize',
  default: 0,
})

const loadedProgress = atom({
  key: 'music_loadedProgress',
  default: 0,
})

const modelUrl = atom({
  key: 'music_modelUrl',
  default: './assets/models/RWKV-6-ABC-85M-v1-20240217-ctx1024-webrwkv.st',
})

const remoteUrl = atom({
  key: 'music_remoteUrl',
  default:
    'https://api-model.rwkvos.com/download/RWKV-6-ABC-85M-v1-20240217-ctx1024-webrwkv.st',
  // 'https://huggingface.co/cryscan/rwkv-puzzles/resolve/main/RWKV-6-ABC-85M-v1-20240217-ctx1024-webrwkv.st',
})

const remoteKey = atom({
  key: 'music_remoteKey',
  default:
    '4s5aWqs2f4PzKfgLjuRZgXKvvmal5Z5iq0OzkTPwaA2axgNgSbayfQEX5FgOpTxyyeUM4gsFHHDZroaFDIE3NtSJD6evdz3lAVctyN026keeXMoJ7tmUy5zriMJHJ9aM',
  // undefined,
})

export const M = {
  worker,
  modelLoaded,
  modelLoading,
  loaded,
  modelSize,
  loadedSize,
  loadedProgress,
  modelUrl,
  remoteUrl,
  remoteKey,
}
