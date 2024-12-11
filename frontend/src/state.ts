import { atom } from 'recoil'

const displayState = atom<'none' | 'loading' | 'loaded' | 'running'>({
  key: 'loadState',
  default: 'none',
})

const finished = atom<boolean>({
  key: 'finished',
  default: false,
})

const board = atom<string[]>({
  key: 'puzzle',
  default: [],
})

const logs = atom<string>({
  key: 'logs',
  default: '',
})

const time = atom<number>({
  key: 'time',
  default: 0,
})

const moves = atom<number>({
  key: 'moves',
  default: 0,
})

const tokensCount = atom<number>({
  key: 'tokensCount',
  default: 0,
})

var boardContentRef: string[] = []
var recording: boolean = false

export const P = {
  board,
  displayState,
  logs,
  time,
  moves,
  tokensCount,
  boardContentRef,
  recording,
  finished,
}
