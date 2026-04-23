import { useEffect, useState } from 'react'
import MainScreen from '@components/MainScreen'
import BusinessSelector from '@components/BusinessSelector'
import BackstoryScreen from '@components/BackstoryScreen'
import PerkSelectionScreen from '@components/PerkSelectionScreen'
import { useGameStore, syncOnboardingState } from './stores/gameStore'
import { useMetaStore } from './stores/metaStore'
import type { PlayerBackstory } from './types/game'

type AppScreen = 'backstory' | 'business-select' | 'game' | 'perk-select'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('backstory')
  const [pendingBackstory, setPendingBackstory] = useState<PlayerBackstory | null>(null)
  const loadGame = useGameStore((s) => s.loadGame)
  const setPlayerBackstory = useGameStore((s) => s.setPlayerBackstory)
  const { incrementRuns, consumeSelectedPerk } = useMetaStore()

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
        useGameStore.setState({ reputation: Math.min(100, store.reputation + 10) })
      } else if (pendingBackstory.motivation === 'accident') {
        useGameStore.setState({ entrepreneurEnergy: Math.min(100, store.entrepreneurEnergy + 15) })
      }
      if (pendingBackstory.personal === 'hometown') {
        useGameStore.setState({ reputation: Math.min(100, useGameStore.getState().reputation + 5) })
      } else if (pendingBackstory.personal === 'friend') {
        useGameStore.setState({ loyalty: Math.min(100, store.loyalty + 5) })
      }
    }

    // Apply meta perk if one was selected
    const perkId = consumeSelectedPerk()
    if (perkId) applyMetaPerk(perkId)

    setScreen('game')
  }

  const handleRestartGame = () => {
    localStorage.removeItem('konturgame_state')
    setPendingBackstory(null)
    // Count the run and go to perk selection
    incrementRuns()
    setScreen('perk-select')
  }

  const handlePerkSelectionDone = () => {
    setScreen('backstory')
  }

  if (screen === 'game') {
    return <MainScreen onRestart={handleRestartGame} />
  }

  if (screen === 'perk-select') {
    return <PerkSelectionScreen onContinue={handlePerkSelectionDone} />
  }

  if (screen === 'business-select') {
    return <BusinessSelector onGameStart={handleGameStart} />
  }

  return <BackstoryScreen onComplete={handleBackstoryComplete} />
}

function applyMetaPerk(perkId: string) {
  const store = useGameStore.getState()
  switch (perkId) {
    case 'extra_capital':
      useGameStore.setState({ balance: store.balance + 10000 })
      break
    case 'rent_grace_week1':
      // Handled in weekCalculator by checking currentWeek === 1 + this flag
      // For simplicity, we give equivalent balance bonus
      useGameStore.setState({ balance: store.balance + 15000 })
      break
    case 'bank_headstart':
      useGameStore.setState(s => ({
        services: {
          ...s.services,
          bank: { ...s.services.bank, isActive: true },
        },
        unlockedServices: s.unlockedServices.includes('bank')
          ? s.unlockedServices
          : [...s.unlockedServices, 'bank'],
      }))
      break
    case 'reputation_boost':
      useGameStore.setState({ reputation: Math.min(100, store.reputation + 20) })
      break
    case 'energy_reserve':
      useGameStore.setState({ entrepreneurEnergy: Math.min(115, store.entrepreneurEnergy + 15) })
      break
  }
}
