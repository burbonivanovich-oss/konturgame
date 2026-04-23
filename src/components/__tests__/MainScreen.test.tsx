import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../../stores/gameStore'

describe('MainScreen Integration', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('shop')
  })

  it('should initialize game state', () => {
    const state = useGameStore.getState()
    expect(state.businessType).toBe('shop')
    expect(state.currentWeek).toBe(1)
    expect(state.balance).toBeGreaterThan(0)
    expect(state.reputation).toBeGreaterThan(0)
    expect(state.loyalty).toBeGreaterThan(0)
  })

  it('should have KPI values from store', () => {
    const state = useGameStore.getState()
    expect(state.currentWeek).toBe(1)
    expect(state.balance).toBe(80000)
  })

  it('should update services', () => {
    const state = useGameStore.getState()
    state.advanceOnboardingStage() // Stage 1 unlocks bank
    const unlockedState = useGameStore.getState()
    const initialBankActive = unlockedState.services.bank.isActive

    unlockedState.toggleService('bank')
    const newState = useGameStore.getState()
    expect(newState.services.bank.isActive).not.toBe(initialBankActive)
  })

  it('should track next day button state', () => {
    const state = useGameStore.getState()
    expect(state.isGameOver).toBe(false)
    expect(state.isVictory).toBe(false)
  })

  it('should calculate stock level from batches', () => {
    const state = useGameStore.getState()

    state.addStockBatch({
      id: 'test-batch',
      quantity: 30,
      costPerUnit: 100,
      dayReceived: 1,
      expirationDays: 10,
    })

    const newState = useGameStore.getState()
    expect(newState.stockBatches.length).toBe(1)
    expect(newState.stockBatches[0].quantity).toBe(30)
  })

  it('should have active ad campaigns', () => {
    const state = useGameStore.getState()

    state.addAdCampaign({
      id: 'test-campaign',
      name: 'Test Campaign',
      duration: 5,
      cost: 5000,
      clientEffect: 0.15,
      checkEffect: 0,
      daysRemaining: 5,
    })

    const newState = useGameStore.getState()
    expect(newState.activeAdCampaigns.length).toBe(1)
  })

  it('should handle pending events', () => {
    const state = useGameStore.getState()

    const event = {
      id: 'test-event',
      day: 1,
      title: 'Test Event',
      description: 'This is a test event',
      options: [
        {
          id: 'option-1',
          text: 'Option 1',
          consequences: { balanceDelta: 1000 },
        },
      ],
      isResolved: false,
    }

    state.setPendingEvent(event)
    const newState = useGameStore.getState()
    expect(newState.pendingEvent).toEqual(event)
  })

  it('should handle victory condition', () => {
    const state = useGameStore.getState()
    expect(state.isVictory).toBe(false)

    state.setVictory(true)
    const newState = useGameStore.getState()
    expect(newState.isVictory).toBe(true)
  })

  it('should handle game over condition', () => {
    const state = useGameStore.getState()
    expect(state.isGameOver).toBe(false)

    state.setGameOver(true, 'Bankrupt')
    const newState = useGameStore.getState()
    expect(newState.isGameOver).toBe(true)
  })
})
