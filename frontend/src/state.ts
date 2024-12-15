import { atom, selector } from 'recoil'

const displayState = atom<'none' | 'loading' | 'loaded' | 'running'>({
  key: 'loadState',
  default: 'none',
})

const finished = selector({
  key: 'finished',
  get: ({ get }) => {
    const _board = get(board).map(x => Number(x))
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
    return _board.every((value, index) => value === expected[index])
  },
})

const board = atom<number[]>({
  key: 'puzzle',
  default: [],
})

const logs = atom<string[]>({
  key: 'logs',
  default: [],
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

var boardContentRef: number[] = []
var recording: boolean = false
var logTemp: string = ''

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
  logTemp,
}
