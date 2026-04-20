import { create } from 'zustand'
import type {
  GameState, BusinessType, ServiceType, Service, DayResult, Event,
  AdCampaign, StockBatch, CashRegisterType, CashRegister, OnboardingStage,
} from '../types/game'
import { SERVICES_CONFIG, BUSINESS_CONFIGS, ECONOMY_CONSTANTS } from '../constants/business'
import { SERVICE_UNLOCK_MAP } from '../constants/onboarding'
import { CASH_REGISTER_CONFIGS, REGISTER_COMBO_DISCOUNTS } from '../constants/cashRegisters'
import { getDefaultCategories } from '../services/assortmentEngine'
import { checkWeekBlocked, processWeek } from '../services/weekCalculator'

const STORAGE_KEY = 'konturgame_state'
const ROLLBACK_STORAGE_KEY = 'konturgame_rollback'

const createInitialServices = (): Record<ServiceType, Service> => {
  const services: Record<ServiceType, Service> = {} as Record<ServiceType, Service>
  Object.entries(SERVICES_CONFIG).forEach(([key, config]) => {
    services[key as ServiceType] = {
      id: config.id,
      name: config.name,
      description: config.description,
      monthlyPrice: config.monthlyPrice,
      isActive: false,
      effects: config.effects,
    }
  })
  return services
}

const createInitialState = (businessType: BusinessType): GameState => {
  const config = BUSINESS_CONFIGS[businessType]
  return {
    businessType,
    currentWeek: 1,
    dayOfWeek: 0,  // 0 = Monday
    balance: config.startBalance,
    savedBalance: 0,
    reputation: 50,
    loyalty: 50,
    entrepreneurEnergy: ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY,

    stock: [],
    stockBatches: [],
    capacity: config.capacity,

    services: createInitialServices(),
    achievements: [],
    level: 1,
    experience: 0,

    hadLowReputation: false,
    consecutiveNoExpiry: 0,

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

    createdAt: Date.now(),
    lastUpdated: Date.now(),

    // Onboarding
    onboardingStage: 0,
    onboardingCompleted: false,
    onboardingStepIndex: 0,

    // Service unlocking (start with Bank only)
    unlockedServices: SERVICE_UNLOCK_MAP[0],

    // Cash registers
    cashRegisters: [],

    // Assortment
    enabledCategories: getDefaultCategories(businessType),

    // Promo codes
    promoCodesRevealed: [],
    pendingPromoCode: null,

    // Balance game-over tracking
    daysBalanceNegative: 0,

    // Competitor
    competitorEventTriggered: false,

    // Pain losses
    lastDayPainLosses: null,

    // Bundle promo
    bundlePromoShown: false,

    // Week energy restore
    weeklyEnergyRestored: false,

    // Daily micro events
    seenMicroEventIds: [],
    pendingMicroEvent: null,
  }
}

interface GameStoreActions {
  // Core game actions
  startNewGame: (businessType: BusinessType) => void
  nextDay: () => void
  advanceDay: () => { blocked: boolean; reason?: string }
  advanceWeek: () => { blocked: boolean; reason?: string }

  // Balance and metrics
  setBalance: (amount: number) => void
  addBalance: (delta: number) => void
  setReputation: (value: number) => void
  addReputation: (delta: number) => void
  setLoyalty: (value: number) => void
  addLoyalty: (delta: number) => void

  // Entrepreneur energy
  setEntrepreneurEnergy: (amount: number) => void
  spendEnergy: (baseCost: number) => boolean  // Returns true if energy was sufficient
  restoreEnergyAtWeekStart: () => void

  // Capacity
  setCapacity: (amount: number) => void

  // Services
  toggleService: (serviceId: ServiceType) => void
  activateService: (serviceId: ServiceType) => void
  deactivateService: (serviceId: ServiceType) => void

  // Stock management
  addStockBatch: (batch: StockBatch) => void
  removeStockBatch: (batchId: string) => void
  updateStockBatch: (batchId: string, quantity: number) => void

  // Campaigns
  addAdCampaign: (campaign: AdCampaign) => void
  removeAdCampaign: (campaignId: string) => void
  updateAdCampaignDays: (campaignId: string, daysRemaining: number) => void

  // Upgrades
  purchaseUpgrade: (upgradeId: string) => void

  // Events
  setPendingEvent: (event: Event | null) => void
  markEventAsResolved: (eventId: string) => void
  setPendingEventsQueue: (events: Event[]) => void

  // Saved balance
  addSavedBalance: (amount: number) => void

  // Day results
  setLastDayResult: (result: DayResult) => void

  // Game state
  setGameOver: (isGameOver: boolean, reason?: string) => void
  setVictory: (isVictory: boolean) => void

  // Achievements and progression
  addAchievement: (achievementId: string) => void
  addExperience: (amount: number) => void
  setLevel: (level: number) => void

  // Temporary modifiers
  setTemporaryModifiers: (clientMod: number, checkMod: number, daysLeft: number) => void
  decrementModifierDays: () => void

  // Counters
  setConsecutiveOverloadDays: (count: number) => void
  setDaysReputationZero: (count: number) => void
  setDaysSinceLastMonthly: (count: number) => void
  setPurchaseOfferedThisDay: (offered: boolean) => void

  // State management
  loadGame: (state: GameState) => void

  // Helper methods (getters)
  getActivatedServices: () => Service[]
  getActiveServiceIds: () => ServiceType[]
  getTotalSubscriptionCost: () => number
  hasService: (serviceId: ServiceType) => boolean
  hasPurchasedUpgrade: (upgradeId: string) => boolean
  hasAchievement: (achievementId: string) => boolean
  getActiveAdCampaign: (campaignId: string) => AdCampaign | undefined
  getTotalAdCampaignsCost: () => number
  getTotalStockValue: () => number
  getTotalStockQuantity: () => number

  // Rollback system
  saveSnapshot: () => void
  rollback: () => void
  clearRollback: () => void

  // Onboarding
  advanceOnboardingStage: () => void
  nextOnboardingStep: () => void
  completeOnboarding: () => void

  // Cash registers
  buyCashRegister: (type: CashRegisterType) => boolean

  // Assortment
  toggleCategory: (categoryId: string) => void

  // Promo codes
  revealPromoCode: (serviceId: ServiceType) => void
  clearPendingPromoCode: () => void
  markBundlePromoShown: () => void

  // Daily micro events
  setPendingMicroEvent: (event: any) => void
  resolveMicroEvent: (optionId: string) => void
  clearSeenMicroEvents: () => void  // Reset when week changes
}

interface GameStore extends GameState, GameStoreActions {}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial state
    ...createInitialState('shop'),

    // Core game actions
    startNewGame: (businessType) => {
      const newState = createInitialState(businessType)
      set(newState)
      saveToStorage(newState)
    },

    nextDay: () =>
      set((state) => {
        const newDayOfWeek = (state.dayOfWeek + 1) % 7
        const advancedWeek = newDayOfWeek === 0 ? state.currentWeek + 1 : state.currentWeek
        return {
          dayOfWeek: newDayOfWeek,
          currentWeek: advancedWeek,
          lastUpdated: Date.now(),
          weeklyEnergyRestored: false,
        }
      }),

    advanceDay: () => {
      const store = get()
      const stateCopy = JSON.parse(JSON.stringify(extractState(store))) as GameState
      const { blocked, reason } = checkWeekBlocked(stateCopy)
      if (blocked) {
        return { blocked: true, reason }
      }
      processWeek(stateCopy)
      set({ ...stateCopy })
      return { blocked: false }
    },

    advanceWeek: () => {
      const store = get()
      const stateCopy = JSON.parse(JSON.stringify(extractState(store))) as GameState
      const { blocked, reason } = checkWeekBlocked(stateCopy)
      if (blocked) {
        return { blocked: true, reason }
      }
      processWeek(stateCopy)
      set({ ...stateCopy })
      return { blocked: false }
    },

    // Balance and metrics
    setBalance: (amount) => {
      set((state) => ({
        balance: Math.max(0, amount),
        lastUpdated: Date.now(),
      }))
    },

    addBalance: (delta) => {
      set((state) => ({
        balance: Math.max(0, state.balance + delta),
        lastUpdated: Date.now(),
      }))
    },

    setReputation: (value) => {
      set((state) => ({
        reputation: Math.max(0, Math.min(ECONOMY_CONSTANTS.MAX_REPUTATION, value)),
        lastUpdated: Date.now(),
      }))
    },

    addReputation: (delta) => {
      set((state) => ({
        reputation: Math.max(0, Math.min(ECONOMY_CONSTANTS.MAX_REPUTATION, state.reputation + delta)),
        lastUpdated: Date.now(),
      }))
    },

    setLoyalty: (value) => {
      set((state) => ({
        loyalty: Math.max(0, Math.min(ECONOMY_CONSTANTS.MAX_LOYALTY, value)),
        lastUpdated: Date.now(),
      }))
    },

    addLoyalty: (delta) => {
      set((state) => ({
        loyalty: Math.max(0, Math.min(ECONOMY_CONSTANTS.MAX_LOYALTY, state.loyalty + delta)),
        lastUpdated: Date.now(),
      }))
    },

    // Entrepreneur energy
    setEntrepreneurEnergy: (amount) => {
      set({
        entrepreneurEnergy: Math.max(0, Math.min(ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY, amount)),
        lastUpdated: Date.now(),
      })
    },

    spendEnergy: (baseCost) => {
      const state = get()
      const activeServices = get().getActiveServiceIds()

      // Calculate total energy reduction from services
      let costModifier = 1
      if (activeServices.includes('bank')) costModifier *= (1 - ECONOMY_CONSTANTS.ENERGY_REDUCTION_BANK)
      if (activeServices.includes('ofd')) costModifier *= (1 - ECONOMY_CONSTANTS.ENERGY_REDUCTION_OFD)
      if (activeServices.includes('diadoc')) costModifier *= (1 - ECONOMY_CONSTANTS.ENERGY_REDUCTION_DIADOC)
      if (activeServices.includes('elba')) costModifier *= (1 - ECONOMY_CONSTANTS.ENERGY_REDUCTION_ELBA)

      const actualCost = Math.max(
        ECONOMY_CONSTANTS.ENERGY_COST_ZERO_THRESHOLD,
        Math.ceil(baseCost * costModifier)
      )

      if (state.entrepreneurEnergy >= actualCost) {
        set((s) => ({
          entrepreneurEnergy: s.entrepreneurEnergy - actualCost,
          lastUpdated: Date.now(),
        }))
        return true
      }
      return false
    },

    restoreEnergyAtWeekStart: () => {
      set({
        entrepreneurEnergy: ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY,
        weeklyEnergyRestored: true,
        lastUpdated: Date.now(),
      })
    },

    // Capacity
    setCapacity: (amount) => {
      set({
        capacity: amount,
        lastUpdated: Date.now(),
      })
    },

    // Services
    toggleService: (serviceId) => {
      const state = get()
      const isCurrentlyActive = state.services[serviceId]?.isActive ?? false
      // Activate with promo code reveal
      if (!isCurrentlyActive) {
        get().revealPromoCode(serviceId)
      }
      set((s) => ({
        services: {
          ...s.services,
          [serviceId]: {
            ...s.services[serviceId],
            isActive: !s.services[serviceId]?.isActive,
          },
        },
        lastUpdated: Date.now(),
      }))
    },

    activateService: (serviceId) => {
      const state = get()
      if (!state.services[serviceId]?.isActive) {
        get().revealPromoCode(serviceId)
      }
      set((s) => ({
        services: {
          ...s.services,
          [serviceId]: {
            ...s.services[serviceId],
            isActive: true,
          },
        },
        lastUpdated: Date.now(),
      }))
    },

    deactivateService: (serviceId) => {
      set((state) => ({
        services: {
          ...state.services,
          [serviceId]: {
            ...state.services[serviceId],
            isActive: false,
          },
        },
        lastUpdated: Date.now(),
      }))
    },

    // Stock management
    addStockBatch: (batch) => {
      set((state) => ({
        stockBatches: [...state.stockBatches, batch],
        lastUpdated: Date.now(),
      }))
    },

    removeStockBatch: (batchId) => {
      set((state) => ({
        stockBatches: state.stockBatches.filter((b) => b.id !== batchId),
        lastUpdated: Date.now(),
      }))
    },

    updateStockBatch: (batchId, quantity) => {
      set((state) => ({
        stockBatches: state.stockBatches.map((b) =>
          b.id === batchId ? { ...b, quantity } : b
        ),
        lastUpdated: Date.now(),
      }))
    },

    // Campaigns
    addAdCampaign: (campaign) => {
      set((state) => ({
        activeAdCampaigns: [...state.activeAdCampaigns, campaign],
        lastUpdated: Date.now(),
      }))
    },

    removeAdCampaign: (campaignId) => {
      set((state) => ({
        activeAdCampaigns: state.activeAdCampaigns.filter((c) => c.id !== campaignId),
        lastUpdated: Date.now(),
      }))
    },

    updateAdCampaignDays: (campaignId, daysRemaining) => {
      set((state) => ({
        activeAdCampaigns: state.activeAdCampaigns.map((c) =>
          c.id === campaignId ? { ...c, daysRemaining } : c
        ),
        lastUpdated: Date.now(),
      }))
    },

    // Upgrades
    purchaseUpgrade: (upgradeId) => {
      set((state) => {
        if (state.purchasedUpgrades.includes(upgradeId)) {
          return { lastUpdated: Date.now() }
        }
        return {
          purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
          lastUpdated: Date.now(),
        }
      })
    },

    // Events
    setPendingEvent: (event) => {
      set({
        pendingEvent: event,
        lastUpdated: Date.now(),
      })
    },

    markEventAsResolved: (eventId) => {
      set((state) => {
        const queue = state.pendingEventsQueue ?? []
        const nextEvent = queue.length > 0 ? queue[0] : null
        return {
          triggeredEventIds: state.triggeredEventIds.includes(eventId)
            ? state.triggeredEventIds
            : [...state.triggeredEventIds, eventId],
          pendingEvent: nextEvent,
          pendingEventsQueue: queue.slice(1),
          lastUpdated: Date.now(),
        }
      })
    },

    setPendingEventsQueue: (events) => {
      set({ pendingEventsQueue: events, lastUpdated: Date.now() })
    },

    addSavedBalance: (amount) => {
      set((state) => ({
        savedBalance: state.savedBalance + amount,
        lastUpdated: Date.now(),
      }))
    },

    // Day results
    setLastDayResult: (result: DayResult | null) => {
      set({
        lastDayResult: result,
        lastUpdated: Date.now(),
      })
    },

    // Game state
    setGameOver: (isGameOver: boolean, reason?: string) => {
      set({
        isGameOver,
        gameOverReason: reason,
        lastUpdated: Date.now(),
      })
    },

    setVictory: (isVictory: boolean) => {
      set({
        isVictory,
        lastUpdated: Date.now(),
      })
    },

    // Achievements and progression
    addAchievement: (achievementId: string) => {
      set((state: GameState) => ({
        achievements: [...new Set([...state.achievements, achievementId])],
        lastUpdated: Date.now(),
      }))
    },

    addExperience: (amount: number) => {
      set((state: GameState) => ({
        experience: state.experience + amount,
        lastUpdated: Date.now(),
      }))
    },

    setLevel: (level: number) => {
      set({
        level,
        lastUpdated: Date.now(),
      })
    },

    // Temporary modifiers
    setTemporaryModifiers: (clientMod: number, checkMod: number, daysLeft: number) => {
      set({
        temporaryClientMod: clientMod,
        temporaryCheckMod: checkMod,
        temporaryModDaysLeft: daysLeft,
        lastUpdated: Date.now(),
      })
    },

    decrementModifierDays: () => {
      set((state: GameState) => {
        const newDaysLeft = Math.max(0, state.temporaryModDaysLeft - 1)
        return {
          temporaryModDaysLeft: newDaysLeft,
          temporaryClientMod: newDaysLeft > 0 ? state.temporaryClientMod : 0,
          temporaryCheckMod: newDaysLeft > 0 ? state.temporaryCheckMod : 0,
          lastUpdated: Date.now(),
        }
      })
    },

    // Counters
    setConsecutiveOverloadDays: (count: number) => {
      set({
        consecutiveOverloadDays: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setDaysReputationZero: (count: number) => {
      set({
        daysReputationZero: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setDaysSinceLastMonthly: (count: number) => {
      set({
        daysSinceLastMonthly: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setPurchaseOfferedThisDay: (offered: boolean) => {
      set({
        purchaseOfferedThisDay: offered,
        lastUpdated: Date.now(),
      })
    },

    // State management
    loadGame: (state: GameState) => {
      const migrated: GameState = {
        ...createInitialState(state.businessType),
        ...state,
        // Migration defaults for new fields
        unlockedServices: state.unlockedServices ?? SERVICE_UNLOCK_MAP[0],
        cashRegisters: state.cashRegisters ?? [],
        enabledCategories: state.enabledCategories ?? getDefaultCategories(state.businessType),
        promoCodesRevealed: state.promoCodesRevealed ?? [],
        pendingPromoCode: null, // Never persist pending promo
        onboardingStage: state.onboardingStage ?? 0,
        onboardingCompleted: state.onboardingCompleted ?? false,
        onboardingStepIndex: state.onboardingStepIndex ?? 0,
        daysBalanceNegative: state.daysBalanceNegative ?? 0,
        competitorEventTriggered: state.competitorEventTriggered ?? false,
        lastDayPainLosses: state.lastDayPainLosses ?? null,
        bundlePromoShown: state.bundlePromoShown ?? false,
      }
      set(migrated)
      saveToStorage(migrated)
    },

    // Helper methods (getters)
    getActivatedServices: () => {
      const state = get()
      return (Object.values(state.services) as Service[]).filter((s: Service) => s.isActive)
    },

    getActiveServiceIds: () => {
      const state = get()
      return Object.keys(state.services).filter(
        (key) => state.services[key as ServiceType].isActive
      ) as ServiceType[]
    },

    getTotalSubscriptionCost: () => {
      const state = get()
      return state
        .getActivatedServices()
        .reduce((sum: number, service: Service) => sum + service.monthlyPrice, 0)
    },

    hasService: (serviceId: ServiceType) => {
      const state = get()
      return state.services[serviceId]?.isActive ?? false
    },

    hasPurchasedUpgrade: (upgradeId: string) => {
      const state = get()
      return state.purchasedUpgrades.includes(upgradeId)
    },

    hasAchievement: (achievementId: string) => {
      const state = get()
      return state.achievements.includes(achievementId)
    },

    getActiveAdCampaign: (campaignId: string) => {
      const state = get()
      return state.activeAdCampaigns.find((c: AdCampaign) => c.id === campaignId)
    },

    getTotalAdCampaignsCost: () => {
      const state = get()
      return state.activeAdCampaigns.reduce((sum: number, campaign: AdCampaign) => sum + campaign.cost, 0)
    },

    getTotalStockValue: () => {
      const state = get()
      return state.stockBatches.reduce((sum: number, batch: StockBatch) => sum + batch.quantity * batch.costPerUnit, 0)
    },

    getTotalStockQuantity: () => {
      const state = get()
      return state.stockBatches.reduce((sum: number, batch: StockBatch) => sum + batch.quantity, 0)
    },

    // Rollback system
    saveSnapshot: () => {
      const currentState = get()
      const stateWithoutMethods = extractState(currentState)
      localStorage.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(stateWithoutMethods))
    },

    rollback: () => {
      const snapshot = localStorage.getItem(ROLLBACK_STORAGE_KEY)
      if (snapshot) {
        const state = JSON.parse(snapshot) as GameState
        set(state)
        saveToStorage(state)
      }
    },

    clearRollback: () => {
      localStorage.removeItem(ROLLBACK_STORAGE_KEY)
    },

    // Onboarding
    advanceOnboardingStage: () => {
      set((state) => {
        const newStage = Math.min(4, state.onboardingStage + 1) as OnboardingStage
        return {
          onboardingStage: newStage,
          onboardingStepIndex: 0,
          unlockedServices: SERVICE_UNLOCK_MAP[newStage],
          lastUpdated: Date.now(),
        }
      })
    },

    nextOnboardingStep: () => {
      set((state) => ({
        onboardingStepIndex: state.onboardingStepIndex + 1,
        lastUpdated: Date.now(),
      }))
    },

    completeOnboarding: () => {
      set({
        onboardingCompleted: true,
        unlockedServices: SERVICE_UNLOCK_MAP[4],
        lastUpdated: Date.now(),
      })
    },

    // Cash registers
    buyCashRegister: (type: CashRegisterType): boolean => {
      const state = get()
      const config = CASH_REGISTER_CONFIGS[type]
      if (!config) return false

      const totalExisting = state.cashRegisters.reduce((s, r) => s + r.count, 0)
      let cost = config.cost
      if (totalExisting >= 2) cost = Math.round(cost * (1 - (REGISTER_COMBO_DISCOUNTS[3] ?? 0)))
      else if (totalExisting >= 1) cost = Math.round(cost * (1 - (REGISTER_COMBO_DISCOUNTS[2] ?? 0)))

      if (state.balance < cost) return false

      set((s) => {
        const existing = s.cashRegisters.find((r) => r.type === type)
        let newRegisters: CashRegister[]
        if (existing) {
          newRegisters = s.cashRegisters.map((r) =>
            r.type === type ? { ...r, count: r.count + 1 } : r
          )
        } else {
          newRegisters = [
            ...s.cashRegisters,
            { type, count: 1, purchaseDay: s.currentWeek * 7 + s.dayOfWeek },
          ]
        }
        return {
          cashRegisters: newRegisters,
          balance: s.balance - cost,
          lastUpdated: Date.now(),
        }
      })
      return true
    },

    // Assortment
    toggleCategory: (categoryId: string) => {
      set((state) => {
        const enabled = state.enabledCategories ?? []
        const newEnabled = enabled.includes(categoryId)
          ? enabled.filter((id) => id !== categoryId)
          : [...enabled, categoryId]
        return { enabledCategories: newEnabled, lastUpdated: Date.now() }
      })
    },

    // Promo codes
    revealPromoCode: (serviceId: ServiceType) => {
      set((state) => {
        if (state.promoCodesRevealed.includes(serviceId)) {
          return { lastUpdated: Date.now() }
        }
        const newRevealed = [...state.promoCodesRevealed, serviceId]
        return {
          promoCodesRevealed: newRevealed,
          pendingPromoCode: serviceId,
          lastUpdated: Date.now(),
        }
      })
    },

    clearPendingPromoCode: () => {
      set({ pendingPromoCode: null, lastUpdated: Date.now() })
    },

    markBundlePromoShown: () => {
      set({ bundlePromoShown: true, lastUpdated: Date.now() })
    },

    // Daily micro events
    setPendingMicroEvent: (event) => {
      set({
        pendingMicroEvent: event,
        seenMicroEventIds: [...get().seenMicroEventIds, event.id],
        lastUpdated: Date.now(),
      })
    },

    resolveMicroEvent: (optionId) => {
      const state = get()
      const event = state.pendingMicroEvent
      if (!event) return

      const option = event.options.find(o => o.id === optionId)
      if (!option) return

      const effects = option.effects
      let updates: any = { pendingMicroEvent: null, lastUpdated: Date.now() }

      if (effects.balanceDelta) {
        updates.balance = Math.max(0, state.balance + effects.balanceDelta)
      }

      if (effects.energyDelta) {
        updates.entrepreneurEnergy = Math.max(0, Math.min(100, state.entrepreneurEnergy + effects.energyDelta))
      }

      if (effects.reputationDelta) {
        updates.reputation = Math.max(0, Math.min(100, state.reputation + effects.reputationDelta))
      }

      if (effects.clientModifierPercent && effects.clientModifierDays) {
        updates.temporaryClientMod = effects.clientModifierPercent
        updates.temporaryModDaysLeft = effects.clientModifierDays
      }

      set(updates)
    },

    clearSeenMicroEvents: () => {
      set({ seenMicroEventIds: [], lastUpdated: Date.now() })
    },
  }))

// LocalStorage persistence
function saveToStorage(state: GameState) {
  try {
    const stateToSave = extractState(state)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error)
  }
}

function extractState(state: any): GameState {
  const {
    businessType, currentWeek, dayOfWeek, balance, savedBalance, reputation, loyalty,
    entrepreneurEnergy, stock, stockBatches, capacity, services, achievements, level, experience,
    lastDayResult, pendingEvent, pendingEventsQueue, triggeredEventIds,
    isGameOver, isVictory, gameOverReason, consecutiveOverloadDays, daysReputationZero,
    daysSinceLastMonthly, purchaseOfferedThisDay, activeAdCampaigns, purchasedUpgrades,
    temporaryClientMod, temporaryCheckMod, temporaryModDaysLeft, createdAt, lastUpdated,
    hadLowReputation, consecutiveNoExpiry, weeklyEnergyRestored,
    // Legacy fields for migration
    currentDay,
    // New fields
    onboardingStage, onboardingCompleted, onboardingStepIndex, unlockedServices,
    seenMicroEventIds, pendingMicroEvent,
    cashRegisters, enabledCategories, promoCodesRevealed,
    daysBalanceNegative, competitorEventTriggered, lastDayPainLosses, bundlePromoShown,
  } = state

  // Migration: convert old currentDay to currentWeek
  const week = currentWeek ?? Math.ceil((currentDay ?? 1) / 7)
  const dow = dayOfWeek ?? ((currentDay ?? 1) % 7)

  return {
    businessType,
    currentWeek: week,
    dayOfWeek: dow,
    balance, savedBalance, reputation, loyalty,
    entrepreneurEnergy: entrepreneurEnergy ?? ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY,
    stock, stockBatches, capacity, services, achievements, level, experience,
    lastDayResult, pendingEvent, pendingEventsQueue: pendingEventsQueue ?? [],
    triggeredEventIds, isGameOver, isVictory, gameOverReason,
    consecutiveOverloadDays, daysReputationZero, daysSinceLastMonthly,
    purchaseOfferedThisDay, activeAdCampaigns, purchasedUpgrades,
    temporaryClientMod, temporaryCheckMod, temporaryModDaysLeft,
    createdAt, lastUpdated,
    hadLowReputation: hadLowReputation ?? false,
    consecutiveNoExpiry: consecutiveNoExpiry ?? 0,
    weeklyEnergyRestored: weeklyEnergyRestored ?? false,
    // New fields with migration defaults
    onboardingStage: onboardingStage ?? 0,
    onboardingCompleted: onboardingCompleted ?? false,
    onboardingStepIndex: onboardingStepIndex ?? 0,
    unlockedServices: unlockedServices ?? SERVICE_UNLOCK_MAP[0],
    cashRegisters: cashRegisters ?? [],
    enabledCategories: enabledCategories ?? [],
    promoCodesRevealed: promoCodesRevealed ?? [],
    pendingPromoCode: null, // Never persist pending promo
    daysBalanceNegative: daysBalanceNegative ?? 0,
    competitorEventTriggered: competitorEventTriggered ?? false,
    lastDayPainLosses: lastDayPainLosses ?? null,
    bundlePromoShown: bundlePromoShown ?? false,
    seenMicroEventIds: seenMicroEventIds ?? [],
    pendingMicroEvent: pendingMicroEvent ?? null,
  }
}

// Load game from storage on startup
export function loadGameFromStorage(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error)
    return null
  }
}

// Auto-save on state changes
useGameStore.subscribe(
  (state: GameStore) => {
    saveToStorage(state as GameState)
  }
)

// Sync unlockedServices with onboardingStage if they're out of sync
export function syncOnboardingState(): void {
  const state = useGameStore.getState()
  const expectedServices = SERVICE_UNLOCK_MAP[state.onboardingStage]
  const actualServices = state.unlockedServices ?? []

  if (JSON.stringify(expectedServices) !== JSON.stringify(actualServices)) {
    useGameStore.setState({
      unlockedServices: expectedServices,
      lastUpdated: Date.now(),
    })
  }
}
