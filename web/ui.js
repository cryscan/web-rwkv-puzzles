const { useState, useRef, useEffect } = React

const width = 750
const height = 485
const gridSize = width / 2
const cellGap = 8
const girdPadding = 16
const cellSize = (gridSize - girdPadding * 2 - cellGap * 3) / 4

const App = () => {
  return (
    <div
      style={{
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: '0',
        justifyContent: 'center',
        alignItems: 'center',
        justifyItems: 'stretch',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <Logs />
      <Puzzle />
    </div>
  )
}

const Logs = () => {
  /**
   * @type {string}
   */
  const [logs, setLogs] = useState('')

  window.rwkv_setLogs = setLogs

  window.rwkv_addLogs = (event) => {
    if (!event) return
    const word = event?.word ?? ''
    setLogs((prev) => prev + word)
    // scroll to bottom
    const logsElem = document.getElementById('logs')
    if (logsElem) {
      logsElem.scrollTop = logsElem.scrollHeight
    }
  }

  return (
    <div
      style={{
        padding: '4px 0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgb(128, 200, 255)',
        borderRadius: '4px',
        height: `${height}px`,
        alignItems: 'stretch'
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>Reasoning Process</div>
      <div id="logs" style={{ whiteSpace: 'pre-wrap', padding: '8px', fontFamily: 'monospace', fontSize: '10px', overflow: 'auto' }}>
        {logs}
      </div>
    </div>
  )
}

const Puzzle = () => {
  /**
   * @type {string[]}
   */
  const [board, setBoard] = useState(randomize_puzzle_15())
  const recording = useRef(false)
  /**
   * @type {string[]}
   */
  const boardContentRef = useRef([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [running])

  useEffect(() => {
    const list = board.map((item) => item.trim()).join(' ')
    const finished = list == '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 0'
    if (finished) setRunning(false)
    setFinished(finished)
  }, [board])

  const onClickNewGame = () => {
    setBoard(randomize_puzzle_15())
  }

  const onClickStart = () => {
    if (running) {
      alert('Already running\n Please wait for the current run to finish.')
      return
    }

    if (finished) {
      alert('Puzzle already finished. Please start a new game.')
      return
    }

    if (!window.rwkv_worker) {
      alert('Please load the model first.')
      return
    }

    const promptSource = randomize_puzzle_15_output(board)
    setMoves(0)
    setRunning(true)
    setTime(0)
    window.rwkv_setLogs('')
    window.rwkv_worker.postMessage(promptSource)
  }

  window.rwkv_boardChanged = (event) => {
    if (!event) return
    const { word, token } = event

    // <board>
    const isBoardStart = token == 54
    if (isBoardStart) {
      recording.current = true
      return
    }

    // </board>
    const isBoardEnd = token == 55
    if (isBoardEnd) {
      recording.current = false
      const boardContent = boardContentRef.current
      setBoard(boardContent)
      boardContentRef.current = []
      setMoves(moves + 1)
      return
    }

    const stop = token == 59
    if (stop) {
      setRunning(false)
      return
    }

    const tokenIsNotEnter = token != 82
    if (recording.current && tokenIsNotEnter) boardContentRef.current.push(word)
  }

  return (
    <div
      style={{
        padding: '4px 0',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgb(128, 200, 255)',
        borderRadius: '4px',
        height: `${height}px`,
        alignItems: 'stretch',
        marginLeft: '12px',
        gap: '8px'
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>15 Puzzle</div>
      <Info moves={moves} time={time} />
      <Grid board={board} />
      <Controls onClickNewGame={onClickNewGame} onClickStart={onClickStart} running={running} finished={finished} />
    </div>
  )
}

const Info = ({ moves, time }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', justifyContent: 'center' }}>
      <div>Moves: {moves}</div>
      <div>Time: {time}s</div>
    </div>
  )
}

const Controls = ({ onClickNewGame, onClickStart, running, finished }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 8px'
      }}
    >
      <button
        style={{
          flex: 1,
          padding: '8px'
        }}
        onClick={onClickNewGame}
        disabled={running}
      >
        New Game
      </button>
      <button
        style={{
          flex: 1,
          padding: '8px'
        }}
        onClick={onClickStart}
        disabled={finished}
      >
        {running ? '🤔 Running...' : finished ? '🎉 Finished' : '🚀 Start'}
      </button>
    </div>
  )
}

/**
 * @param {{board: string[]}} param0
 * @returns
 */
const Grid = ({ board }) => {
  return (
    <div
      style={{
        height: `${width / 2}px`,
        width: `${width / 2}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${cellGap}px`,
        maxWidth: `${width / 2}px`,
        padding: `0 ${girdPadding}px`
      }}
    >
      <Row rowIndex={0} data={board.slice(0, 4)} />
      <Row rowIndex={1} data={board.slice(4, 8)} />
      <Row rowIndex={2} data={board.slice(8, 12)} />
      <Row rowIndex={3} data={board.slice(12, 16)} />
    </div>
  )
}

/**
 * @param {{rowIndex: number, data: string[]}} param0
 * @returns
 */
const Row = ({ rowIndex, data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: `${cellGap}px` }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Cell key={index} label={data[index].trim()} rowIndex={rowIndex} columnIndex={index} />
      ))}
    </div>
  )
}

/**
 * @param {{label: string, rowIndex: number, columnIndex: number}} param0
 * @returns
 */
const Cell = ({ label, rowIndex, columnIndex }) => {

  const expectedLabel = rowIndex * 4 + columnIndex + 1
  console.log({ label, rowIndex, columnIndex, expectedLabel })

  // const backgroundColor = label == expectedLabel ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 255, 0.33)'

  var backgroundColor = 'rgba(128, 200, 255, 1)'
  if (label == expectedLabel) backgroundColor = 'rgba(128, 255, 100, 1)'
  if (label == 0) backgroundColor = 'rgba(0, 0, 0, 0)'

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
        userSelect: 'none'
      }}
    >
      {label == 0 ? '' : label}
    </div>
  )
}

function randomize_puzzle_15() {
  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  function shuffleArray(array) {
    for (var i = array.length - 1; i >= 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
  }
  // prettier-ignore
  var board = [
        "0  ", "1  ", "2  ", "3  ",
        "4  ", "5  ", "6  ", "7  ",
        "8  ", "9  ", "10 ", "11 ",
        "12 ", "13 ", "14 ", "15 ",
    ];
  shuffleArray(board)
  return board
}

/**
 * @param {string[]} board
 * @returns {string}
 */
function randomize_puzzle_15_output(board) {
  return board.join('')
}

ReactDOM.render(<App />, document.getElementById('root'))
