import { useEffect, useRef } from 'react'
import './App.css'
import { useRecoilState, useRecoilValue } from 'recoil'
import { P } from './state'

const width = 750
const gridSize = width / 2
const cellGap = 8
const girdPadding = 16
const cellSize = (gridSize - girdPadding * 2 - cellGap * 3) / 4

declare global {
  interface Window {
    load: () => Promise<void>
    rwkv_worker: Worker
    workerMessageReceived: (data: any) => void
  }
}

function App() {
  const [board, setBoard] = useRecoilState(P.board)
  const [, setMoves] = useRecoilState(P.moves)
  const finished = useRecoilValue(P.finished)
  const [, setLogs] = useRecoilState(P.logs)
  const [displayState, setDisplayState] = useRecoilState(P.displayState)

  const onWorkerMessageReceived = (event: any) => {
    if (!event) return

    const { word, token } = event

    // <board>
    const isBoardStart = token == 54
    if (isBoardStart) {
      P.recording = true
      return
    }

    // </board>
    const isBoardEnd = token == 55
    if (isBoardEnd) {
      P.recording = false
      const boardContent = P.boardContentRef
      setBoard(boardContent)
      P.boardContentRef = []
      setMoves((prevMoves) => prevMoves + 1)
      return
    }

    const stop = token == 59
    if (stop) {
      setDisplayState('none')
      return
    }

    const tokenIsNotEnter = token != 82
    if (P.recording && tokenIsNotEnter) P.boardContentRef.push(word)

    if (word == '\n') {
      setLogs((prev) => [...prev, P.logTemp])
      P.logTemp = ''
    } else {
      P.logTemp += word
    }
  }

  const initializeApp = () => {
    window.workerMessageReceived = onWorkerMessageReceived

    setBoard(generateSolvablePuzzle())
  }

  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <div className='app'>
      <Info />
      <div className='separator'></div>
      <Puzzle />
    </div>
  )
}

const Info = () => {
  return (
    <div className='info'>
      <div className='info-title'>Web-RWKV In-Browser</div>
      <div>Welcome to the Web-RWKV puzzle solver in browser!</div>
      <div>
        Check
        <a href='https://github.com/cryscan/web-rwkv-puzzles' target='_blank'>
          the Github repo
        </a>
        for more details about this demo.
      </div>
      <div>
        Note that this demo runs on WebGPU so make sure that your browser
        support it before running (See{' '}
        <a href='https://webgpureport.org/' target='_blank'>
          WebGPU Report
        </a>
        ).
      </div>
      <div>
        Thanks to{' '}
        <a href='https://github.com/josephrocca/rwkv-v4-web' target='_blank'>
          josephrocca
        </a>{' '}
        and{' '}
        <a href='https://github.com/HaloWang' target='_blank'>
          HaloWang
        </a>{' '}
        for the awesome in-browser implementation and the website (I am
        totally unfamiliar with web dev LoL).
      </div>
      <Logs />
    </div>
  )
}

const Logs = () => {
  const [logs] = useRecoilState(P.logs)
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className='logs' ref={logsRef}>
      {logs.map((log, index) => (
        <div key={index} className='log-item'>
          {log}
        </div>
      ))}
    </div>
  )
}

function generateSolvablePuzzle(): number[] {
  const kDebugMode = process.env.NODE_ENV == 'development'

  const board = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ]
  const steps = kDebugMode ? 5 : 1000
  let zero_index = [3, 3]

  for (let i = 0; i < steps; i++) {
    const random_direction = Math.floor(Math.random() * 4)
    let canMove = false
    const current_zero_index = [...zero_index]
    switch (random_direction) {
      case 0: // left
        if (zero_index[0] > 0) {
          canMove = true
          zero_index[0] = zero_index[0] - 1
        } else {
        }
        break
      case 1: // right
        if (zero_index[0] < 3) {
          canMove = true
          zero_index[0] = zero_index[0] + 1
        } else {
        }
        break
      case 2: // up
        if (zero_index[1] > 0) {
          canMove = true
          zero_index[1] = zero_index[1] - 1
        } else {
        }
        break
      case 3: // down
        if (zero_index[1] < 3) {
          canMove = true
          zero_index[1] = zero_index[1] + 1
        } else {
        }
        break
      default:
        break
    }

    // Swap the zero with the number in the direction that can move
    if (canMove) {
      const temp = board[zero_index[1]][zero_index[0]]
      board[current_zero_index[1]][current_zero_index[0]] = temp
      board[zero_index[1]][zero_index[0]] = 0
    }
  }

  return board.flat()
}

function buildPrompt(board: number[]): string {
  let map = [
    "0  ", "1  ", "2  ", "3  ",
    "4  ", "5  ", "6  ", "7  ",
    "8  ", "9  ", "10 ", "11 ",
    "12 ", "13 ", "14 ", "15 ",
  ];

  let prompt = ''
  for (let i = 0; i < board.length; i++) {
    prompt += map[board[i]]
    if (i % 4 == 3) prompt += '\n'
  }
  return prompt;
}

const Puzzle = () => {
  const [, setTime] = useRecoilState(P.time)
  const [displayState] = useRecoilState(P.displayState)
  const finished = useRecoilValue(P.finished)

  useEffect(() => {
    if (displayState != 'running') return

    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [displayState, finished])

  return (
    <div className='puzzle'>
      <div className='puzzle_title'>15 Puzzle</div>
      <RunInfo />
      <Grid />
      <Controls />
    </div>
  )
}

const RunInfo = () => {
  const [moves] = useRecoilState(P.moves)
  const [time] = useRecoilState(P.time)
  return (
    <div className='run_info'>
      <div>Moves: {moves}</div>
      <div>Time: {time} s</div>
    </div>
  )
}

const Grid = () => {
  const [board] = useRecoilState(P.board)
  if (board.length == 0) return null
  return (
    <div className='grid'>
      <Row rowIndex={0} data={board.slice(0, 4)} />
      <Row rowIndex={1} data={board.slice(4, 8)} />
      <Row rowIndex={2} data={board.slice(8, 12)} />
      <Row rowIndex={3} data={board.slice(12, 16)} />
    </div>
  )
}

const Row = (options: { rowIndex: number; data: number[] }) => {
  const { rowIndex, data } = options
  return (
    <div className='row'>
      {Array.from({ length: 4 }).map(function (_, index) {
        return (
          <Cell
            key={index}
            label={data[index]}
            rowIndex={rowIndex}
            columnIndex={index}
          />
        )
      })}
    </div>
  )
}

const Controls = () => {
  const [displayState, setDisplayState] = useRecoilState(P.displayState)
  const [board, setBoard] = useRecoilState(P.board)
  const [moves, setMoves] = useRecoilState(P.moves)
  const [time, setTime] = useRecoilState(P.time)
  const [logs, setLogs] = useRecoilState(P.logs)
  const finished = useRecoilValue(P.finished)

  const onClickNewGame = () => {
    setMoves(0)
    setTime(0)
    setLogs([])
    setDisplayState('none')
    setBoard(generateSolvablePuzzle())
  }

  const onClickStart = async () => {
    if (displayState == 'running') {
      alert('Already running\n Please wait for the current run to finish.')
      return
    }

    if (finished) {
      alert('Puzzle already finished. Please start a new game.')
      return
    }

    await window.load()

    if (!window.rwkv_worker) {
      alert('Please load the model first.')
      return
    }

    setMoves(0)
    setDisplayState('running')
    setTime(0)
    setLogs([])
    window.rwkv_worker.postMessage(buildPrompt(board))
  }

  return (
    <div className='controls'>
      <button
        className='button'
        onClick={onClickNewGame}
        disabled={displayState == 'running'}
      >
        New Game
      </button>
      <button
        className='button'
        onClick={onClickStart}
        disabled={displayState == 'running'}
      >
        {displayState == 'running'
          ? '🤔 Running...'
          : finished
            ? '🎉 Finished'
            : '🚀 Start'}
      </button>
    </div>
  )
}

const Cell = (options: {
  label: number
  rowIndex: number
  columnIndex: number
}) => {
  const { label, rowIndex, columnIndex } = options

  const expectedLabel = rowIndex * 4 + columnIndex + 1

  var color = 'rgba(197, 211, 232, 1)'
  if (label == expectedLabel) color = 'rgba(208, 232, 197, 1)'
  if (label == 0) color = 'rgba(224, 195, 195, 0)'

  return (
    <div
      key={label}
      className='cell'
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: color,
      }}
    >
      {label == 0 ? '' : label}
    </div>
  )
}

export default App
