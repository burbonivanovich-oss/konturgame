import { useEffect, useState } from 'react'
import MainScreen from '@components/MainScreen'
import BusinessSelector from '@components/BusinessSelector'
import BackstoryScreen from '@components/BackstoryScreen'
import { useGameStore, syncOnboardingState } from './stores/gameStore'
import type { PlayerBackstory } from './types/game'

type AppScreen = 'backstory' | 'business-select' | 'game'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('backstory')
  const [pendingBackstory, setPendingBackstory] = useState<PlayerBackstory | null>(null)
  const loadGame = useGameStore((s) => s.loadGame)
  const setPlayerBackstory = useGameStore((s) => s.setPlayerBackstory)

  // Load game from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('konturgame_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        loadGame(state)
        syncOnboardingState()
        setScreen('game')
      } catch (error) {
        console.error('Failed to load game', error)
        setScreen('backstory')
      }
    } else {
      setScreen('backstory')
    }
  }, [loadGame])

  const handleBackstoryComplete = (backstory: PlayerBackstory) => {
    setPendingBackstory(backstory)
    setScreen('business-select')
  }

  const handleGameStart = () => {
    if (pendingBackstory) {
      setPlayerBackstory(pendingBackstory)

      // Apply backstory effects
      const store = useGameStore.getState()
      if (pendingBackstory.motivation === 'corp') {
        // Уволился из корпорации: +10 репутации (люди уважают смелость)
        useGameStore.setState({ reputation: Math.min(100, store.reputation + 10) })
      } else if (pendingBackstory.motivation === 'accident') {
        // Так получилось: +15 энергии (энтузиазм новичка)
        useGameStore.setState({ entrepreneurEnergy: Math.min(100, store.entrepreneurEnergy + 15) })
      }
      // 'contest': без изменений (полный капитал, хорошее настроение)

      if (pendingBackstory.personal === 'hometown') {
        // Родной район: +5 репутации (знают тебя здесь)
        useGameStore.setState({ reputation: Math.min(100, useGameStore.getState().reputation + 5) })
      } else if (pendingBackstory.personal === 'friend') {
        // Лучший друг рядом: +5 лояльности (первые клиенты приходят по рекомендации)
        useGameStore.setState({ loyalty: Math.min(100, store.loyalty + 5) })
      }
    }
    setScreen('game')
  }

  const handleRestartGame = () => {
    localStorage.removeItem('konturgame_state')
    setPendingBackstory(null)
    setScreen('backstory')
  }

  if (screen === 'game') {
    return <MainScreen onRestart={handleRestartGame} />
  }

  if (screen === 'business-select') {
    return <BusinessSelector onGameStart={handleGameStart} />
  }

  return <BackstoryScreen onComplete={handleBackstoryComplete} />
}
