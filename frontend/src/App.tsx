import React, { useEffect, useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { P } from './state'
import { assert } from 'console'

const width = 750
const height = 485
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
  const [moves, setMoves] = useRecoilState(P.moves)
  const [finished, setFinished] = useRecoilState(P.finished)
  const [logs, setLogs] = useRecoilState(P.logs)

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
      setMoves(function (prevMoves) {
        console.log({ prevMoves })
        return prevMoves + 1
      })
      return
    }

    const stop = token == 59
    if (stop) {
      setFinished(true)
      return
    }

    const tokenIsNotEnter = token != 82
    if (P.recording && tokenIsNotEnter) P.boardContentRef.push(word)

    setLogs((prev) => prev + word)
  }

  const initializeApp = () => {
    window.workerMessageReceived = onWorkerMessageReceived

    if (board.length == 0) setBoard(generate_solvable_puzzle())
  }

  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <div className='app'>
      <Puzzle />
      <Info />
    </div>
  )
}

const Info = () => {
  return (
    <div className='info'>
      <h1>Web-RWKV In-Browser</h1>
      <div>
        <p>Welcome to the Web-RWKV demo in browser!</p>
        <p>
          Check
          <a href='https://github.com/cryscan/web-rwkv-realweb' target='_blank'>
            the Github repo
          </a>
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
          for the first awesome in-browser implementation and the website (I am
          totally unfamiliar with web dev LoL).
        </p>
      </div>
      <Logs />
    </div>
  )
}

const Logs = () => {
  const [logs] = useRecoilState(P.logs)
  return <div className='logs'>{logs}</div>
}

function generate_solvable_puzzle(): string[] {
  // prettier-ignore
  const board = [
    ['0  ', '1  ', '2  ', '3  '],
    ['4  ', '5  ', '6  ', '7  '],
    ['8  ', '9  ', '10 ', '11 '],
    ['12 ', '13 ', '14 ', '15 ']
  ]
  const steps = 1000
  let zero_index = [0, 0]

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
      board[zero_index[1]][zero_index[0]] = '0  '
    }
  }

  return board.flat()
}

const Puzzle = () => {
  const [board] = useRecoilState(P.board)

  const [moves, setMoves] = useRecoilState(P.moves)
  const [time, setTime] = useRecoilState(P.time)
  const [logs, setLogs] = useRecoilState(P.logs)
  const [displayState, setDisplayState] = useRecoilState(P.displayState)
  const [finished, setFinished] = useRecoilState(P.finished)

  useEffect(() => {
    if (displayState != 'running') return

    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [displayState])

  useEffect(() => {
    const list = board.map((item) => item.trim()).join(' ')
    const boardFinish = list == '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 0'
    if (boardFinish) setFinished(true)
  }, [board])

  return (
    <div className='puzzle'>
      <div className='puzzle_title'>15 Puzzle</div>
      <RunningInfo />
      <Grid />
      <Controls />
    </div>
  )
}

const RunningInfo = () => {
  const [moves] = useRecoilState(P.moves)
  const [time] = useRecoilState(P.time)
  return (
    <div className='running_info'>
      <div>Moves: {moves}</div>
      <div>Time: {time}s</div>
    </div>
  )
}

const Grid = () => {
  const [board] = useRecoilState(P.board)
  if (board.length == 0) return null
  return (
    <div
      className='grid'
      style={
        {
          // height: `${width / 2}px`,
          // width: `${width / 2}px`,
          // gap: `${cellGap}px`,
          // maxWidth: `${width / 2}px`,
          // padding: `0 ${girdPadding}px`,
        }
      }
    >
      <Row rowIndex={0} data={board.slice(0, 4)} />
      <Row rowIndex={1} data={board.slice(4, 8)} />
      <Row rowIndex={2} data={board.slice(8, 12)} />
      <Row rowIndex={3} data={board.slice(12, 16)} />
    </div>
  )
}

const Row = (options: { rowIndex: number; data: string[] }) => {
  const { rowIndex, data } = options
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: `${cellGap}px` }}>
      {Array.from({ length: 4 }).map(function (_, index) {
        return (
          <Cell
            key={index}
            label={data[index].trim()}
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
  const [finished, setFinished] = useRecoilState(P.finished)

  const onClickNewGame = () => {
    setMoves(0)
    setTime(0)
    setLogs('')
    setDisplayState('none')
    setBoard(generate_solvable_puzzle())
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

    const promptSource = board.join('')
    setMoves(0)
    setDisplayState('running')
    setTime(0)
    setLogs('')
    window.rwkv_worker.postMessage(promptSource)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 8px',
      }}
    >
      <button
        style={{
          flex: 1,
          padding: '8px',
        }}
        onClick={onClickNewGame}
        disabled={displayState == 'running'}
      >
        New Game
      </button>
      <button
        style={{
          flex: 1,
          padding: '8px',
        }}
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
  label: string
  rowIndex: number
  columnIndex: number
}) => {
  const { label, rowIndex, columnIndex } = options

  const expectedLabel = rowIndex * 4 + columnIndex + 1
  // const backgroundColor = label == expectedLabel ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 255, 0.33)'

  var backgroundColor = 'rgba(128, 200, 255, 1)'
  if (label == expectedLabel.toString())
    backgroundColor = 'rgba(128, 255, 100, 1)'
  if (label == '0') backgroundColor = 'rgba(0, 0, 0, 0)'

  return (
    <div
      key={label}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: backgroundColor,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {label == '0' ? '' : label}
    </div>
  )
}

export default App
