import { useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Button } from 'antd'
import { P } from './state_puzzle'
import { loadData } from '../func/load'
import { setupWorker } from '../setup_worker'
// import './Puzzle.css'

// const width = 750
// const gridSize = width / 2
// const cellGap = 8
// const girdPadding = 16
// const cellSize = (gridSize - girdPadding * 2 - cellGap * 3) / 4

function Puzzle() {
  const [board, setBoard] = useRecoilState(P.board)
  const [, setMoves] = useRecoilState(P.moves)
  const finished = useRecoilValue(P.finished)
  const [, setLogs] = useRecoilState(P.logs)
  const [displayState, setDisplayState] = useRecoilState(P.displayState)

  const initializeRef = useRef(false)

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

  const worker = useRecoilValue(P.worker)
  const initializeApp = () => {
    if (initializeRef.current) return
    initializeRef.current = true

    worker.postMessage(JSON.stringify({ task: 'abort' }))
    window.puzzle = onWorkerMessageReceived
    setBoard(generateSolvablePuzzle())

    if (!navigator.gpu) {
      setTimeout(() => {
        alert('WebGPU is not supported by this browser.')
      }, 1000)
    }
  }

  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <div className="h-screen overflow-y-auto bg-zinc-50 flex flex-col lg:flex-row">
      <Info />
      <div className="h-px lg:h-auto lg:w-px bg-zinc-200" />
      <Blocks />
    </div>
  )
}

const Info = () => {
  return (
    <div className="p-6 lg:w-1/3 ">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Web-RWKV In-Browser</h1>
      <div className="space-y-3 text-sm text-slate-600 mb-6">
        <p>Welcome to the Web-RWKV puzzle solver in browser!</p>
        <p>
          Check{' '}
          <a href="https://github.com/cryscan/web-rwkv-puzzles"
            className="text-blue-600 hover:text-blue-800 font-medium"
            target="_blank">
            the Github repo
          </a>{' '}
          for more details about this demo.
        </p>
        <p>
          Note that this demo runs on WebGPU so make sure that your browser
          support it before running (See{' '}
          <a href='https://webgpureport.org/' target='_blank'>
            WebGPU Report
          </a>
          ).
        </p>
        <p>
          Thanks to{' '}
          <a href='https://github.com/josephrocca/rwkv-v4-web' target='_blank'>
            josephrocca
          </a>{' '}
          and{' '}
          <a href='https://github.com/HaloWang' target='_blank'>
            HaloWang
          </a>{' '}
          for the awesome in-browser implementation and the website (I am totally
          unfamiliar with web dev LoL).
        </p>
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
    <div
      ref={logsRef}
      className="bg-white border border-slate-200 rounded-lg p-4 h-[200px] lg:h-[400px] overflow-y-auto font-mono text-xs"
    >
      {logs.map((log, index) => (
        <div key={index} className="text-left text-slate-700">
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
  // prettier-ignore
  let map = [
    "0  ", "1  ", "2  ", "3  ",
    "4  ", "5  ", "6  ", "7  ",
    "8  ", "9  ", "10 ", "11 ",
    "12 ", "13 ", "14 ", "15 ",
  ];

  var prompt = ''
  for (let i = 0; i < board.length; i++) {
    prompt += map[board[i]]
    if (i % 4 == 3) prompt += '\n'
  }
  prompt = `<input>\n<board>\n${prompt}</board>\n</input>\n`
  return prompt
}

const Blocks = () => {
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
    <div className="flex-1 p-6 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-slate-800 mb-4">15 Puzzle</h2>
      <RunInfo />
      <Controls />
      <Grid />
    </div>
  )
}

const RunInfo = () => {
  const [moves] = useRecoilState(P.moves)
  const [time] = useRecoilState(P.time)
  return (
    <div className="flex gap-4 text-sm text-slate-600 mb-4">
      <div>Moves: {moves}</div>
      <div>Time: {time} s</div>
    </div>
  )
}

const Grid = () => {
  const [board] = useRecoilState(P.board)
  if (board.length == 0) return null
  return (
    <div className='grid grid-cols-4 gap-2'>
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
    <div className='flex flex-col gap-2'>
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
  const worker = useRecoilValue(P.worker)
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

    const chunks = await loadData('puzzle', P.modelUrl, '')
    await setupWorker(worker, chunks, 'puzzle')

    setMoves(0)
    setDisplayState('running')
    setTime(0)
    setLogs([])
    invoke(worker, board)
  }

  return (
    <div className="flex gap-3 mb-6 w-full max-w-sm">
      <Button
        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
        onClick={onClickNewGame}
        disabled={displayState == 'running'}
      >
        New Game
      </Button>
      <Button
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none"
        onClick={onClickStart}
        disabled={displayState == 'running'}
      >
        {displayState == 'running'
          ? '🤔 Running...'
          : finished
            ? '🎉 Finished'
            : '🚀 Start'}
      </Button>
    </div>
  )
}

const invoke = (worker: Worker, board: number[]) => {
  const options = {
    task: 'puzzle',
    max_len: 1000000,
    prompt: buildPrompt(board),
    state_key: new Date().toUTCString(),
    stop_tokens: [59],
    temperature: 1.0,
    top_p: 0.5,
    presence_penalty: 0.5,
    count_penalty: 0.5,
    penalty_decay: 0.996,
    history_tokens: [],
    vocab: '../assets/puzzle15_vocab.json',
    sampler: 'simple',
  }
  worker.postMessage(JSON.stringify(options))
}

const Cell = (options: {
  label: number
  rowIndex: number
  columnIndex: number
}) => {
  const { label, rowIndex, columnIndex } = options
  const expectedLabel = rowIndex * 4 + columnIndex + 1

  return (
    <div
      className={`
        ${label == 0 ? 'opacity-0' : 'opacity-100'}
        ${label == expectedLabel ? 'bg-green-100' : 'bg-blue-100'}
        w-16 h-16 md:w-24 md:h-24
        rounded-xl flex items-center justify-center
        text-lg font-bold
        transition-colors duration-200 ease-in-out
      `}
    >
      {label}
    </div>
  )
}

export default Puzzle