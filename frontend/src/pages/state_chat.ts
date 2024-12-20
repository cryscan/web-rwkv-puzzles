import { atom, selector } from 'recoil'

const modelLoaded = atom({
  key: 'modelLoaded',
  default: false,
})

const modelLoading = atom({
  key: 'modelLoading',
  default: false,
})

const loaded = atom({
  key: 'loaded',
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
  key: 'loadedProgress',
  default: 0,
})

const modelUrl = atom({
  key: 'modelUrl',
  default: './assets/models/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
})

const remoteUrl = atom({
  key: 'remoteUrl',
  default: 'https://api-image.rwkvos.com/download/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
})

const remoteKey = atom({
  key: 'remoteKey',
  default: '4s5aWqs2f4PzKfgLjuRZgXKvvmal5Z5iq0OzkTPwaA2axgNgSbayfQEX5FgOpTxyyeUM4gsFHHDZroaFDIE3NtSJD6evdz3lAVctyN026keeXMoJ7tmUy5zriMJHJ9aM'
})

export const P = {
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
