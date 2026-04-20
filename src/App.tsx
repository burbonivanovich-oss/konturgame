import { useEffect, useState } from 'react'
import MainScreen from '@components/MainScreen'
import BusinessSelector from '@components/BusinessSelector'
import { useGameStore } from './stores/gameStore'

export default function App() {
  const [showGame, setShowGame] = useState(false)
  const loadGame = useGameStore((s) => s.loadGame)

  // Load game from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('konturgame_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        loadGame(state)
        setShowGame(true)
      } catch (error) {
        console.error('Failed to load game', error)
        setShowGame(false)
      }
    } else {
      setShowGame(false)
    }
  }, [loadGame])

  const handleGameStart = () => {
    setShowGame(true)
  }

  const handleRestartGame = () => {
    localStorage.removeItem('konturgame_state')
    setShowGame(false)
  }

  if (showGame) {
    return <MainScreen onRestart={handleRestartGame} />
  }

  return <BusinessSelector onGameStart={handleGameStart} />
}
