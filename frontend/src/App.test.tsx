import React from 'react'
import { render, screen } from '@testing-library/react'
import Puzzle from './pages/Puzzle'

test('renders learn react link', () => {
  render(<Puzzle />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
