import { atom, selector } from 'recoil'

const displayState = atom<'none' | 'loading' | 'loaded' | 'running'>({
  key: 'loadState',
  default: 'none',
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
  default: './assets/models/RWKV-5-World-0.4B-v2-20231113-ctx4096.st',
})

export const P = {
  displayState,
  modelLoaded,
  modelLoading,
  loaded,
  modelSize,
  loadedSize,
  loadedProgress,
  modelUrl,
}
