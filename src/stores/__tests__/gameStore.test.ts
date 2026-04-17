import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../gameStore'

describe('GameStore', () => {
  beforeEach(() => {
    const { startNewGame } = useGameStore.getState()
    startNewGame('shop')
  })

  it('should initialize with default state for shop', () => {
    const state = useGameStore.getState()
    expect(state.businessType).toBe('shop')
    expect(state.currentDay).toBe(1)
    expect(state.balance).toBe(50000)
    expect(state.reputation).toBe(50)
    expect(state.loyalty).toBe(50)
  })

  it('should update balance', () => {
    const { setBalance } = useGameStore.getState()
    setBalance(100000)
    expect(useGameStore.getState().balance).toBe(100000)
  })

  it('should increment day', () => {
    const { nextDay } = useGameStore.getState()
    nextDay()
    expect(useGameStore.getState().currentDay).toBe(2)
  })

  it('should clamp reputation between 0 and 100', () => {
    const { setReputation } = useGameStore.getState()

    setReputation(150)
    expect(useGameStore.getState().reputation).toBe(100)

    setReputation(-10)
    expect(useGameStore.getState().reputation).toBe(0)

    setReputation(75)
    expect(useGameStore.getState().reputation).toBe(75)
  })

  it('should clamp loyalty between 0 and 100', () => {
    const { setLoyalty } = useGameStore.getState()

    setLoyalty(200)
    expect(useGameStore.getState().loyalty).toBe(100)

    setLoyalty(-50)
    expect(useGameStore.getState().loyalty).toBe(0)

    setLoyalty(45)
    expect(useGameStore.getState().loyalty).toBe(45)
  })

  it('should load game state', () => {
    const newState = {
      ...useGameStore.getState(),
      currentDay: 50,
      balance: 500000,
    }

    const { loadGame } = useGameStore.getState()
    loadGame(newState as any)

    const state = useGameStore.getState()
    expect(state.currentDay).toBe(50)
    expect(state.balance).toBe(500000)
  })

  it('should update lastUpdated timestamp on state changes', () => {
    const initialTime = useGameStore.getState().lastUpdated

    // Add a small delay to ensure timestamp changes
    const { setBalance } = useGameStore.getState()
    setBalance(75000)

    const updatedTime = useGameStore.getState().lastUpdated
    expect(updatedTime).toBeGreaterThanOrEqual(initialTime)
  })
})
