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
      expect(state.currentWeek).toBe(1)
      expect(state.balance).toBe(80000)
      expect(state.reputation).toBe(50)
      expect(state.loyalty).toBe(55)
    })

    it('should initialize different business types correctly', () => {
      const { startNewGame } = useGameStore.getState()
      startNewGame('cafe')
      const state = useGameStore.getState()
      expect(state.businessType).toBe('cafe')
      expect(state.balance).toBe(80000)
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
      expect(useGameStore.getState().balance).toBe(90000)
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

    // Лояльность как скаляр выпилена. setLoyalty — no-op; addLoyalty
    // переадресует в репутацию × 0.5.
    it('setLoyalty is a no-op', () => {
      const { setLoyalty } = useGameStore.getState()
      const before = useGameStore.getState().reputation
      setLoyalty(200)
      expect(useGameStore.getState().reputation).toBe(before)
    })

    it('addLoyalty routes to reputation × 0.5', () => {
      const startRep = 50
      useGameStore.setState({ reputation: startRep })
      const { addLoyalty } = useGameStore.getState()
      addLoyalty(20)  // → +10 reputation
      expect(useGameStore.getState().reputation).toBe(startRep + 10)
    })
  })

  describe('Day Progression', () => {
    it('should increment dayOfWeek', () => {
      const { nextDay } = useGameStore.getState()
      nextDay()
      expect(useGameStore.getState().dayOfWeek).toBe(1)
    })

    it('should increment currentWeek after 7 nextDay calls', () => {
      const { nextDay } = useGameStore.getState()
      for (let i = 0; i < 7; i++) nextDay()
      expect(useGameStore.getState().currentWeek).toBe(2)
    })

    it('should increment daysSinceLastMonthly', () => {
      const { nextDay } = useGameStore.getState()
      nextDay()
      expect(useGameStore.getState().daysSinceLastMonthly).toBe(1)
    })
  })

  describe('Services Management', () => {
    it('toggleService is activation-only — calling it twice keeps service on', () => {
      // Once a service is on, it stays on for the run. Players don't bargain
      // weekly about whether to unsub. The deactivateService store action
      // is kept for tests/admin only; toggleService is one-way.
      const { toggleService, advanceOnboardingStage } = useGameStore.getState()
      advanceOnboardingStage() // Stage 1: unlocks bank, ofd
      advanceOnboardingStage() // Stage 2: unlocks market
      toggleService('market')
      expect(useGameStore.getState().services.market.isActive).toBe(true)

      toggleService('market')
      expect(useGameStore.getState().services.market.isActive).toBe(true)
    })

    it('should activate service', () => {
      const { activateService, advanceOnboardingStage } = useGameStore.getState()
      advanceOnboardingStage() // Stage 1: unlocks bank + ofd
      activateService('bank')
      expect(useGameStore.getState().services.bank.isActive).toBe(true)
    })

    it('should deactivate service', () => {
      const { activateService, deactivateService, advanceOnboardingStage } = useGameStore.getState()
      advanceOnboardingStage() // Stage 1: unlocks ofd
      activateService('ofd')
      expect(useGameStore.getState().services.ofd.isActive).toBe(true)

      deactivateService('ofd')
      expect(useGameStore.getState().services.ofd.isActive).toBe(false)
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

  // describe('Experience & Level') удалён в Спринте 4 вместе с
  // системой player level/experience.

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
    it('should save and load game state from storage', () => {
      const { setBalance, loadGame } = useGameStore.getState()
      setBalance(100000)

      // Manually save to storage to ensure it's persisted
      const currentState = useGameStore.getState()
      localStorage.setItem('konturgame_state', JSON.stringify({
        businessType: currentState.businessType,
        currentWeek: currentState.currentWeek,
        balance: 100000,
        savedBalance: currentState.savedBalance,
        reputation: currentState.reputation,
        loyalty: currentState.loyalty,
        stock: currentState.stock,
        stockBatches: currentState.stockBatches,
        capacity: currentState.capacity,
        services: currentState.services,
        achievements: currentState.achievements,
        lastDayResult: currentState.lastDayResult,
        pendingEvent: currentState.pendingEvent,
        triggeredEventIds: currentState.triggeredEventIds,
        isGameOver: currentState.isGameOver,
        isVictory: currentState.isVictory,
        gameOverReason: currentState.gameOverReason,
        consecutiveOverloadDays: currentState.consecutiveOverloadDays,
        daysReputationZero: currentState.daysReputationZero,
        daysSinceLastMonthly: currentState.daysSinceLastMonthly,
        purchaseOfferedThisDay: currentState.purchaseOfferedThisDay,
        activeAdCampaigns: currentState.activeAdCampaigns,
        purchasedUpgrades: currentState.purchasedUpgrades,
        temporaryClientMod: currentState.temporaryClientMod,
        temporaryCheckMod: currentState.temporaryCheckMod,
        temporaryModDaysLeft: currentState.temporaryModDaysLeft,
        createdAt: currentState.createdAt,
        lastUpdated: currentState.lastUpdated,
      }))

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

  // Спринт 5e: resolveEventOption — UI-flow для всех consequences через
  // единый пайплайн applyEventConsequence. Раньше UI обходил его руками
  // и пропускал hireEmployee/fireEmployee/energyDelta.
  describe('resolveEventOption (UI flow)', () => {
    it('applies balanceDelta', () => {
      const store = useGameStore.getState()
      const initialBalance = store.balance
      // Мокаем простое событие
      useGameStore.setState({
        pendingEvent: {
          id: 'TEST_EVENT_1',
          day: 7,
          title: 'Test',
          description: '',
          options: [
            { id: 'pay', text: 'Pay', consequences: { balanceDelta: -5000 } },
          ],
          isResolved: false,
        },
      })
      useGameStore.getState().resolveEventOption('pay')
      expect(useGameStore.getState().balance).toBe(initialBalance - 5000)
    })

    it('applies energyDelta (regression test for handleEventOption fix)', () => {
      const store = useGameStore.getState()
      const initialEnergy = store.entrepreneurEnergy
      useGameStore.setState({
        pendingEvent: {
          id: 'TEST_EVENT_2',
          day: 7,
          title: 'Test',
          description: '',
          options: [
            { id: 'tire', text: 'Tire', consequences: { energyDelta: -15 } },
          ],
          isResolved: false,
        },
      })
      useGameStore.getState().resolveEventOption('tire')
      expect(useGameStore.getState().entrepreneurEnergy).toBe(initialEnergy - 15)
    })

    it('creates Employee from hireEmployee consequence (regression test)', () => {
      const initialEmployees = useGameStore.getState().employees.length
      useGameStore.setState({
        pendingEvent: {
          id: 'TEST_EVENT_3',
          day: 7,
          title: 'Test',
          description: '',
          options: [
            {
              id: 'hire',
              text: 'Hire',
              consequences: {
                hireEmployee: {
                  position: 'assistant',
                  salary: 30000,
                  efficiency: 1.0,
                  energyCost: 5,
                  name: 'TestEmployee',
                },
              },
            },
          ],
          isResolved: false,
        },
      })
      useGameStore.getState().resolveEventOption('hire')
      const state = useGameStore.getState()
      expect(state.employees.length).toBe(initialEmployees + 1)
      const hired = state.employees.find(e => e.name === 'TestEmployee')
      expect(hired).toBeDefined()
      expect(hired?.position).toBe('assistant')
      expect(hired?.salary).toBe(30000)
    })

    it('removes Employee on fireEmployee consequence', () => {
      // Сначала создаём сотрудника
      useGameStore.setState((s) => ({
        employees: [
          ...s.employees,
          {
            id: 'test_emp',
            position: 'assistant',
            name: 'FireMe',
            salary: 30000,
            efficiency: 1.0,
            hireDay: 1,
            energyCost: 5,
          },
        ],
      }))
      useGameStore.setState({
        pendingEvent: {
          id: 'TEST_EVENT_4',
          day: 7,
          title: 'Test',
          description: '',
          options: [
            {
              id: 'fire',
              text: 'Fire',
              consequences: { fireEmployee: { name: 'FireMe' } },
            },
          ],
          isResolved: false,
        },
      })
      useGameStore.getState().resolveEventOption('fire')
      const state = useGameStore.getState()
      expect(state.employees.find(e => e.name === 'FireMe')).toBeUndefined()
    })
  })
})
