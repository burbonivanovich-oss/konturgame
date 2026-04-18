import { useEffect, useState } from 'react'
import MainScreen from '@components/MainScreen'
import BusinessSelector from '@components/BusinessSelector'
import { useGameStore } from './stores/gameStore'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const loadGame = useGameStore((s) => s.loadGame)

  // Load game from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('konturgame_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        loadGame(state)
      } catch (error) {
        console.error('Failed to load game', error)
      }
    }
    setLoaded(true)
  }, [loadGame])

  if (!loaded) {
    return null // Loading
  }

  const saved = localStorage.getItem('konturgame_state')
  const hasStartedGame = saved !== null

  // Show business selector if no saved game exists
  if (!hasStartedGame) {
    return <BusinessSelector />
  }

  return <MainScreen />
}
