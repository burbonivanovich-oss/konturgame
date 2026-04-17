import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useGameStore, loadGameFromStorage } from '../gameStore'

describe('GameStore', () => {
  beforeEach(() => {
    const { startNewGame } = useGameStore.getState()
    startNewGame('shop')
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with default state for shop', () => {
      const state = useGameStore.getState()
      expect(state.businessType).toBe('shop')
      expect(state.currentDay).toBe(1)
      expect(state.balance).toBe(50000)
      expect(state.reputation).toBe(50)
      expect(state.loyalty).toBe(50)
    })

    it('should initialize different business types correctly', () => {
      const { startNewGame } = useGameStore.getState()
      startNewGame('cafe')
      const state = useGameStore.getState()
      expect(state.businessType).toBe('cafe')
      expect(state.balance).toBe(40000)
    })

    it('should initialize services as inactive', () => {
      const state = useGameStore.getState()
      const allInactive = Object.values(state.services).every((s) => !s.isActive)
      expect(allInactive).toBe(true)
    })
  })

  describe('Balance Management', () => {
    it('should update balance', () => {
      const { setBalance } = useGameStore.getState()
      setBalance(100000)
      expect(useGameStore.getState().balance).toBe(100000)
    })

    it('should add balance delta', () => {
      const { addBalance } = useGameStore.getState()
      addBalance(10000)
      expect(useGameStore.getState().balance).toBe(60000)
    })

    it('should prevent negative balance', () => {
      const { setBalance } = useGameStore.getState()
      setBalance(-5000)
      expect(useGameStore.getState().balance).toBe(0)
    })
  })

  describe('Reputation & Loyalty', () => {
    it('should clamp reputation between 0 and 100', () => {
      const { setReputation } = useGameStore.getState()

      setReputation(150)
      expect(useGameStore.getState().reputation).toBe(100)

      setReputation(-10)
      expect(useGameStore.getState().reputation).toBe(0)

      setReputation(75)
      expect(useGameStore.getState().reputation).toBe(75)
    })

    it('should add reputation delta with clamping', () => {
      const { addReputation } = useGameStore.getState()
      addReputation(60)
      expect(useGameStore.getState().reputation).toBe(100)
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

    it('should add loyalty delta with clamping', () => {
      const { addLoyalty } = useGameStore.getState()
      addLoyalty(-60)
      expect(useGameStore.getState().loyalty).toBe(0)
    })
  })

  describe('Day Progression', () => {
    it('should increment day', () => {
      const { nextDay } = useGameStore.getState()
      nextDay()
      expect(useGameStore.getState().currentDay).toBe(2)
    })

    it('should increment daysSinceLastMonthly', () => {
      const { nextDay } = useGameStore.getState()
      nextDay()
      expect(useGameStore.getState().daysSinceLastMonthly).toBe(1)
    })
  })

  describe('Services Management', () => {
    it('should toggle service activation', () => {
      const { toggleService } = useGameStore.getState()
      toggleService('market')
      expect(useGameStore.getState().services.market.isActive).toBe(true)

      toggleService('market')
      expect(useGameStore.getState().services.market.isActive).toBe(false)
    })

    it('should activate service', () => {
      const { activateService } = useGameStore.getState()
      activateService('bank')
      expect(useGameStore.getState().services.bank.isActive).toBe(true)
    })

    it('should deactivate service', () => {
      const { activateService, deactivateService } = useGameStore.getState()
      activateService('ofd')
      expect(useGameStore.getState().services.ofd.isActive).toBe(true)

      deactivateService('ofd')
      expect(useGameStore.getState().services.ofd.isActive).toBe(false)
    })
  })

  describe('Stock Management', () => {
    it('should add stock batch', () => {
      const { addStockBatch } = useGameStore.getState()
      const batch = {
        id: 'batch1',
        quantity: 100,
        costPerUnit: 5,
        dayReceived: 1,
        expirationDays: 10,
      }
      addStockBatch(batch)
      expect(useGameStore.getState().stockBatches).toHaveLength(1)
      expect(useGameStore.getState().stockBatches[0]).toEqual(batch)
    })

    it('should remove stock batch', () => {
      const { addStockBatch, removeStockBatch } = useGameStore.getState()
      const batch = {
        id: 'batch1',
        quantity: 100,
        costPerUnit: 5,
        dayReceived: 1,
        expirationDays: 10,
      }
      addStockBatch(batch)
      removeStockBatch('batch1')
      expect(useGameStore.getState().stockBatches).toHaveLength(0)
    })

    it('should update stock batch quantity', () => {
      const { addStockBatch, updateStockBatch } = useGameStore.getState()
      const batch = {
        id: 'batch1',
        quantity: 100,
        costPerUnit: 5,
        dayReceived: 1,
        expirationDays: 10,
      }
      addStockBatch(batch)
      updateStockBatch('batch1', 50)
      expect(useGameStore.getState().stockBatches[0].quantity).toBe(50)
    })
  })

  describe('Ad Campaigns', () => {
    it('should add ad campaign', () => {
      const { addAdCampaign } = useGameStore.getState()
      const campaign = {
        id: 'promo',
        name: 'Промо-акция',
        duration: 10,
        cost: 3000,
        clientEffect: 0.25,
        checkEffect: -0.2,
        daysRemaining: 10,
      }
      addAdCampaign(campaign)
      expect(useGameStore.getState().activeAdCampaigns).toHaveLength(1)
    })

    it('should remove ad campaign', () => {
      const { addAdCampaign, removeAdCampaign } = useGameStore.getState()
      const campaign = {
        id: 'promo',
        name: 'Промо-акция',
        duration: 10,
        cost: 3000,
        clientEffect: 0.25,
        checkEffect: -0.2,
        daysRemaining: 10,
      }
      addAdCampaign(campaign)
      removeAdCampaign('promo')
      expect(useGameStore.getState().activeAdCampaigns).toHaveLength(0)
    })

    it('should update ad campaign days remaining', () => {
      const { addAdCampaign, updateAdCampaignDays } = useGameStore.getState()
      const campaign = {
        id: 'promo',
        name: 'Промо-акция',
        duration: 10,
        cost: 3000,
        clientEffect: 0.25,
        checkEffect: -0.2,
        daysRemaining: 10,
      }
      addAdCampaign(campaign)
      updateAdCampaignDays('promo', 5)
      expect(useGameStore.getState().activeAdCampaigns[0].daysRemaining).toBe(5)
    })
  })

  describe('Upgrades', () => {
    it('should purchase upgrade', () => {
      const { purchaseUpgrade } = useGameStore.getState()
      purchaseUpgrade('hall-expansion')
      expect(useGameStore.getState().purchasedUpgrades).toContain('hall-expansion')
    })

    it('should not duplicate upgrades', () => {
      const { purchaseUpgrade } = useGameStore.getState()
      purchaseUpgrade('hall-expansion')
      purchaseUpgrade('hall-expansion')
      const upgrades = useGameStore.getState().purchasedUpgrades
      expect(upgrades.filter((id) => id === 'hall-expansion')).toHaveLength(1)
    })
  })

  describe('Events', () => {
    it('should set pending event', () => {
      const { setPendingEvent } = useGameStore.getState()
      const event = {
        id: 'event1',
        day: 1,
        title: 'Test Event',
        description: 'Test description',
        options: [],
        isResolved: false,
      }
      setPendingEvent(event)
      expect(useGameStore.getState().pendingEvent).toEqual(event)
    })

    it('should mark event as resolved', () => {
      const { setPendingEvent, markEventAsResolved } = useGameStore.getState()
      const event = {
        id: 'event1',
        day: 1,
        title: 'Test Event',
        description: 'Test description',
        options: [],
        isResolved: false,
      }
      setPendingEvent(event)
      markEventAsResolved('event1')
      expect(useGameStore.getState().triggeredEventIds).toContain('event1')
      expect(useGameStore.getState().pendingEvent).toBeNull()
    })
  })

  describe('Achievements', () => {
    it('should add achievement', () => {
      const { addAchievement } = useGameStore.getState()
      addAchievement('first-day')
      expect(useGameStore.getState().achievements).toContain('first-day')
    })

    it('should not duplicate achievements', () => {
      const { addAchievement } = useGameStore.getState()
      addAchievement('first-day')
      addAchievement('first-day')
      const achievements = useGameStore.getState().achievements
      expect(achievements.filter((id) => id === 'first-day')).toHaveLength(1)
    })
  })

  describe('Experience & Level', () => {
    it('should add experience', () => {
      const { addExperience } = useGameStore.getState()
      addExperience(50)
      expect(useGameStore.getState().experience).toBe(50)
    })

    it('should set level', () => {
      const { setLevel } = useGameStore.getState()
      setLevel(5)
      expect(useGameStore.getState().level).toBe(5)
    })
  })

  describe('Temporary Modifiers', () => {
    it('should set temporary modifiers', () => {
      const { setTemporaryModifiers } = useGameStore.getState()
      setTemporaryModifiers(0.2, 0.15, 3)
      const state = useGameStore.getState()
      expect(state.temporaryClientMod).toBe(0.2)
      expect(state.temporaryCheckMod).toBe(0.15)
      expect(state.temporaryModDaysLeft).toBe(3)
    })

    it('should decrement modifier days', () => {
      const { setTemporaryModifiers, decrementModifierDays } = useGameStore.getState()
      setTemporaryModifiers(0.2, 0.15, 3)
      decrementModifierDays()
      expect(useGameStore.getState().temporaryModDaysLeft).toBe(2)
    })

    it('should clear modifiers when days reach 0', () => {
      const { setTemporaryModifiers, decrementModifierDays } = useGameStore.getState()
      setTemporaryModifiers(0.2, 0.15, 1)
      decrementModifierDays()
      const state = useGameStore.getState()
      expect(state.temporaryModDaysLeft).toBe(0)
      expect(state.temporaryClientMod).toBe(0)
      expect(state.temporaryCheckMod).toBe(0)
    })
  })

  describe('State Persistence', () => {
    it('should load game from storage', () => {
      const { setBalance, loadGame } = useGameStore.getState()
      setBalance(100000)

      const currentState = useGameStore.getState()
      const stored = loadGameFromStorage()

      expect(stored?.balance).toBe(100000)
    })
  })

  describe('Rollback System', () => {
    it('should save and restore snapshot', () => {
      const { setBalance, saveSnapshot, rollback } = useGameStore.getState()
      setBalance(100000)
      saveSnapshot()

      setBalance(50000)
      expect(useGameStore.getState().balance).toBe(50000)

      rollback()
      expect(useGameStore.getState().balance).toBe(100000)
    })

    it('should clear rollback snapshot', () => {
      const { setBalance, saveSnapshot, clearRollback } = useGameStore.getState()
      setBalance(100000)
      saveSnapshot()
      clearRollback()

      setBalance(50000)
      const rollbackData = localStorage.getItem('konturgame_rollback')
      expect(rollbackData).toBeNull()
    })
  })

  describe('Game Over & Victory', () => {
    it('should set game over state', () => {
      const { setGameOver } = useGameStore.getState()
      setGameOver(true, 'Банкротство')
      const state = useGameStore.getState()
      expect(state.isGameOver).toBe(true)
      expect(state.gameOverReason).toBe('Банкротство')
    })

    it('should set victory state', () => {
      const { setVictory } = useGameStore.getState()
      setVictory(true)
      expect(useGameStore.getState().isVictory).toBe(true)
    })
  })

  describe('Timestamps', () => {
    it('should update lastUpdated timestamp on state changes', () => {
      const initialTime = useGameStore.getState().lastUpdated

      const { setBalance } = useGameStore.getState()
      setBalance(75000)

      const updatedTime = useGameStore.getState().lastUpdated
      expect(updatedTime).toBeGreaterThanOrEqual(initialTime)
    })
  })
})
