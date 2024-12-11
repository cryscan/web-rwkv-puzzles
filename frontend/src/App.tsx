import React from 'react'
import logo from './logo.svg'
import './App.css'

declare global {
  interface Window {
    load: () => void
    rwkv_worker: Worker
  }
}

function App() {
  const onClickStart = () => {
    console.log('start')
    const puzzle = generate_solvable_puzzle()
    console.log({ puzzle })
    const prompt = puzzle.join('')
    console.log({ prompt })
    window.rwkv_worker.postMessage(prompt)
  }

  return <div className='App'></div>
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

export default App
