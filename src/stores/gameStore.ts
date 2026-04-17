import { create, type StateCreator } from 'zustand'
import type { GameState, BusinessType, ServiceType, Service, DayResult, Event, AdCampaign, StockBatch } from '../types/game'
import { SERVICES_CONFIG, BUSINESS_CONFIGS, ECONOMY_CONSTANTS } from '../constants/business'

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
    currentDay: 1,
    balance: config.startBalance,
    savedBalance: config.startBalance,
    reputation: 50,
    loyalty: 50,

    stock: [],
    stockBatches: [],
    capacity: config.capacity,

    services: createInitialServices(),
    achievements: [],
    level: 1,
    experience: 0,

    lastDayResult: null,
    pendingEvent: null,
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
  }
}

interface GameStoreActions {
  // Core game actions
  startNewGame: (businessType: BusinessType) => void
  nextDay: () => void

  // Balance and metrics
  setBalance: (amount: number) => void
  addBalance: (delta: number) => void
  setReputation: (value: number) => void
  addReputation: (delta: number) => void
  setLoyalty: (value: number) => void
  addLoyalty: (delta: number) => void

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
      set((state) => ({
        currentDay: state.currentDay + 1,
        lastUpdated: Date.now(),
        daysSinceLastMonthly: state.daysSinceLastMonthly + 1,
      })),

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

    // Capacity
    setCapacity: (amount) => {
      set({
        capacity: amount,
        lastUpdated: Date.now(),
      })
    },

    // Services
    toggleService: (serviceId) => {
      set((state) => ({
        services: {
          ...state.services,
          [serviceId]: {
            ...state.services[serviceId],
            isActive: !state.services[serviceId]?.isActive,
          },
        },
        lastUpdated: Date.now(),
      }))
    },

    activateService: (serviceId) => {
      set((state) => ({
        services: {
          ...state.services,
          [serviceId]: {
            ...state.services[serviceId],
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
      set((state) => ({
        triggeredEventIds: [...state.triggeredEventIds, eventId],
        pendingEvent: null,
        lastUpdated: Date.now(),
      }))
    },

    // Day results
    setLastDayResult: (result) => {
      set({
        lastDayResult: result,
        lastUpdated: Date.now(),
      })
    },

    // Game state
    setGameOver: (isGameOver, reason) => {
      set({
        isGameOver,
        gameOverReason: reason,
        lastUpdated: Date.now(),
      })
    },

    setVictory: (isVictory) => {
      set({
        isVictory,
        lastUpdated: Date.now(),
      })
    },

    // Achievements and progression
    addAchievement: (achievementId) => {
      set((state) => ({
        achievements: [...new Set([...state.achievements, achievementId])],
        lastUpdated: Date.now(),
      }))
    },

    addExperience: (amount) => {
      set((state) => ({
        experience: state.experience + amount,
        lastUpdated: Date.now(),
      }))
    },

    setLevel: (level) => {
      set({
        level,
        lastUpdated: Date.now(),
      })
    },

    // Temporary modifiers
    setTemporaryModifiers: (clientMod, checkMod, daysLeft) => {
      set({
        temporaryClientMod: clientMod,
        temporaryCheckMod: checkMod,
        temporaryModDaysLeft: daysLeft,
        lastUpdated: Date.now(),
      })
    },

    decrementModifierDays: () => {
      set((state) => {
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
    setConsecutiveOverloadDays: (count) => {
      set({
        consecutiveOverloadDays: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setDaysReputationZero: (count) => {
      set({
        daysReputationZero: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setDaysSinceLastMonthly: (count) => {
      set({
        daysSinceLastMonthly: Math.max(0, count),
        lastUpdated: Date.now(),
      })
    },

    setPurchaseOfferedThisDay: (offered) => {
      set({
        purchaseOfferedThisDay: offered,
        lastUpdated: Date.now(),
      })
    },

    // State management
    loadGame: (state) => {
      set(state)
      saveToStorage(state)
    },

    // Helper methods (getters)
    getActivatedServices: () => {
      const state = get()
      return Object.values(state.services).filter((s) => s.isActive)
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
        .reduce((sum, service) => sum + service.monthlyPrice, 0)
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
      return state.activeAdCampaigns.find((c) => c.id === campaignId)
    },

    getTotalAdCampaignsCost: () => {
      const state = get()
      return state.activeAdCampaigns.reduce((sum, campaign) => sum + campaign.cost, 0)
    },

    getTotalStockValue: () => {
      const state = get()
      return state.stockBatches.reduce((sum, batch) => sum + batch.quantity * batch.costPerUnit, 0)
    },

    getTotalStockQuantity: () => {
      const state = get()
      return state.stockBatches.reduce((sum, batch) => sum + batch.quantity, 0)
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
    businessType,
    currentDay,
    balance,
    savedBalance,
    reputation,
    loyalty,
    stock,
    stockBatches,
    capacity,
    services,
    achievements,
    level,
    experience,
    lastDayResult,
    pendingEvent,
    triggeredEventIds,
    isGameOver,
    isVictory,
    gameOverReason,
    consecutiveOverloadDays,
    daysReputationZero,
    daysSinceLastMonthly,
    purchaseOfferedThisDay,
    activeAdCampaigns,
    purchasedUpgrades,
    temporaryClientMod,
    temporaryCheckMod,
    temporaryModDaysLeft,
    createdAt,
    lastUpdated,
  } = state

  return {
    businessType,
    currentDay,
    balance,
    savedBalance,
    reputation,
    loyalty,
    stock,
    stockBatches,
    capacity,
    services,
    achievements,
    level,
    experience,
    lastDayResult,
    pendingEvent,
    triggeredEventIds,
    isGameOver,
    isVictory,
    gameOverReason,
    consecutiveOverloadDays,
    daysReputationZero,
    daysSinceLastMonthly,
    purchaseOfferedThisDay,
    activeAdCampaigns,
    purchasedUpgrades,
    temporaryClientMod,
    temporaryCheckMod,
    temporaryModDaysLeft,
    createdAt,
    lastUpdated,
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
  (state) => state,
  (state) => {
    saveToStorage(state as GameState)
  }
)
