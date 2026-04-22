import { describe, it, expect } from 'vitest'
import type { BusinessType, ServiceType, GameState, Event } from '../game'

describe('Game Types', () => {
  it('should allow valid BusinessType values', () => {
    const validTypes: BusinessType[] = ['shop', 'cafe', 'beauty-salon']
    validTypes.forEach((type) => {
      expect(typeof type).toBe('string')
    })
  })

  it('should allow valid ServiceType values', () => {
    const validServices: ServiceType[] = [
      'market',
      'bank',
      'ofd',
      'diadoc',
      'fokus',
      'elba',
      'extern',
    ]
    expect(validServices).toHaveLength(7)
  })

  it('should create a valid GameState object', () => {
    const gameState: GameState = {
      businessType: 'shop',
      currentWeek: 1,
      dayOfWeek: 0,
      balance: 50000,
      savedBalance: 0,
      reputation: 50,
      loyalty: 50,
      entrepreneurEnergy: 100,
      stock: [],
      stockBatches: [],
      capacity: 60,
      services: {} as any,
      achievements: [],
      level: 1,
      experience: 0,
      lastDayResult: null,
      pendingEvent: null,
      pendingEventsQueue: [],
      triggeredEventIds: [],
      isGameOver: false,
      isVictory: false,
      consecutiveOverloadDays: 0,
      daysReputationZero: 0,
      daysSinceLastMonthly: 0,
      purchaseOfferedThisDay: false,
      activeAdCampaigns: [],
      purchasedUpgrades: [],
      temporaryClientMod: 0,
      temporaryCheckMod: 0,
      temporaryModDaysLeft: 0,
      onboardingStage: 0,
      onboardingCompleted: false,
      onboardingStepIndex: 0,
      unlockedServices: [],
      cashRegisters: [],
      enabledCategories: [],
      promoCodesRevealed: [],
      pendingPromoCode: null,
      daysBalanceNegative: 0,
      competitorEventTriggered: false,
      lastDayPainLosses: null,
      bundlePromoShown: false,
      weeklyEnergyRestored: false,
      weekPhase: 'actions' as const,
      seenMicroEventIds: [],
      pendingMicroEvent: null,
      suppliers: [],
      activeSupplierId: null,
      employees: [],
      qualityLevel: 50,
      weeksSinceCompetitorEvent: 0,
      loans: [],
      campaignROI: [],
      milestoneStatus: { week10: false, week20: false, week30: false },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    }

    expect(gameState.businessType).toBe('shop')
    expect(gameState.balance).toBe(50000)
    expect(gameState.stock).toEqual([])
    expect(gameState.isGameOver).toBe(false)
  })

  it('should create a valid Event object', () => {
    const event: Event = {
      id: 'tax-audit',
      day: 5,
      title: 'Налоговая проверка',
      description: 'К вам приходит налоговая...',
      options: [
        {
          id: 'opt1',
          text: 'Разбираться самому',
          consequences: {
            balanceDelta: -30000,
            reputationDelta: -5,
          },
        },
      ],
      isResolved: false,
    }

    expect(event.id).toBe('tax-audit')
    expect(event.options).toHaveLength(1)
    expect(event.isResolved).toBe(false)
  })
})
