import { atom } from 'recoil'
import { firstPrompt } from './state_chat_first_prompt'

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
  default:
    'https://api-image.rwkvos.com/download/RWKV-x070-World-0.1B-v2.8-20241210-ctx4096.st',
})

const remoteKey = atom({
  key: 'remoteKey',
  default:
    '4s5aWqs2f4PzKfgLjuRZgXKvvmal5Z5iq0OzkTPwaA2axgNgSbayfQEX5FgOpTxyyeUM4gsFHHDZroaFDIE3NtSJD6evdz3lAVctyN026keeXMoJ7tmUy5zriMJHJ9aM',
})

const editingIndex = atom<string | number | null>({
  key: 'editingIndex',
  default: null,
})

const editingText = atom<string | undefined>({
  key: 'editingText',
  default: undefined,
})

// 2024-12-25
// 2024-12-25-#1
// 2024-12-25-#2
// 2024-12-25-#3
// ...
const states: string[] = []

export const P = {
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
  firstPrompt,
  editingIndex,
  editingText,
  states,
}
