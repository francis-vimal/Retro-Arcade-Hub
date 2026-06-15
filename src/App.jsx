import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SimonSays from './games/SimonSays'
import TicTacToe from './games/TicTacToe'
import Wordle from './games/Wordle'
import MemoryMatch from './games/MemoryMatch'
import MindGame from './games/MindGame'
import AnimalStop from './games/AnimalStop'
import Hangman from './games/Hangman'
import Snake from './games/Snake'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simon" element={<SimonSays />} />
      <Route path="/tictactoe" element={<TicTacToe />} />
      <Route path="/wordle" element={<Wordle />} />
      <Route path="/memory" element={<MemoryMatch />} />
      <Route path="/mindgame" element={<MindGame />} />
      <Route path="/animalstop" element={<AnimalStop />} />
      <Route path="/hangman" element={<Hangman />} />
      <Route path="/snake" element={<Snake />} />
    </Routes>
  )
}
