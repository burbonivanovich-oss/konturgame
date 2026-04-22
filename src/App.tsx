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

      // Apply backstory effects to starting state
      const store = useGameStore.getState()
      if (pendingBackstory.motivation === 'dream') {
        // Dream: +5 starting reputation
        useGameStore.setState({ reputation: store.reputation + 5 })
      } else if (pendingBackstory.motivation === 'debt') {
        // Debt: start with a small loan to repay
        useGameStore.setState({
          balance: Math.max(0, store.balance - 20000),
          loans: [
            ...store.loans,
            {
              id: `backstory_loan_${Date.now()}`,
              amount: 20000,
              borrowedWeek: 1,
              dueWeek: 12,
              weeklyInterest: 0.01,
              totalInterestPaid: 0,
              isRepaid: false,
              type: 'long-term' as const,
            },
          ],
        })
      }
      // 'fired' motivation: no change (80k balance is already set)
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
