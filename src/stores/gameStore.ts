import { create } from 'zustand'
import type { GameState, BusinessType, ServiceType } from '../types/game'

const INITIAL_STATE: GameState = {
  businessType: 'shop',
  currentDay: 1,
  balance: 50000,
  savedBalance: 0,
  reputation: 50,
  loyalty: 50,

  stock: [],
  stockBatches: [],
  capacity: 60,

  services: {} as Record<ServiceType, any>,
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

interface GameStore extends GameState {
  startNewGame: (businessType: BusinessType) => void
  nextDay: () => void
  setBalance: (amount: number) => void
  setReputation: (value: number) => void
  setLoyalty: (value: number) => void
  toggleService: (serviceId: ServiceType) => void
  loadGame: (state: GameState) => void
}

export const useGameStore = create<GameStore>((set) => ({
  ...INITIAL_STATE,

  startNewGame: (businessType) =>
    set({
      ...INITIAL_STATE,
      businessType,
      createdAt: Date.now(),
    }),

  nextDay: () =>
    set((state) => ({
      currentDay: state.currentDay + 1,
      lastUpdated: Date.now(),
    })),

  setBalance: (amount) =>
    set({
      balance: amount,
      lastUpdated: Date.now(),
    }),

  setReputation: (value) =>
    set({
      reputation: Math.max(0, Math.min(100, value)),
      lastUpdated: Date.now(),
    }),

  setLoyalty: (value) =>
    set({
      loyalty: Math.max(0, Math.min(100, value)),
      lastUpdated: Date.now(),
    }),

  toggleService: (serviceId) =>
    set((state) => ({
      services: {
        ...state.services,
        [serviceId]: {
          ...state.services[serviceId],
          isActive: !state.services[serviceId]?.isActive,
        },
      },
      lastUpdated: Date.now(),
    })),

  loadGame: (state) => set(state),
}))
