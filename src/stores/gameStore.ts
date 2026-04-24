import { create } from 'zustand'
import type {
  GameState, BusinessType, ServiceType, Service, DayResult, Event,
  AdCampaign, CashRegisterType, CashRegister, OnboardingStage,
  CampaignROI, MilestoneStatus, WeekPhase, NPC, PlayerBackstory, NpcMemoryEntry,
  DecisionLogEntry,
} from '../types/game'
import { SERVICES_CONFIG, BUSINESS_CONFIGS, ECONOMY_CONSTANTS, MAX_ACTIVE_CAMPAIGNS } from '../constants/business'
import { SERVICE_UNLOCK_MAP } from '../constants/onboarding'
import { CASH_REGISTER_CONFIGS, REGISTER_COMBO_DISCOUNTS } from '../constants/cashRegisters'
import { getDefaultCategories } from '../services/assortmentEngine'
import { checkWeekBlocked, processWeek } from '../services/weekCalculator'
import { getBusinessStage, STAGE_CONFIG } from '../constants/businessStages'
import { OWNER_INVESTMENTS_MAP } from '../constants/ownerInvestments'
import type { OwnerInvestmentId } from '../constants/ownerInvestments'
import { createInitialNPCs } from '../constants/npcs'
import { updateNPCRelationship, recordNPCMemory } from '../services/npcManager'

const STORAGE_KEY = 'konturgame_state'
const ROLLBACK_STORAGE_KEY = 'konturgame_rollback'

const createInitialServices = (): Record<ServiceType, Service> => {
  const services: Record<ServiceType, Service> = {} as Record<ServiceType, Service>
  Object.entries(SERVICES_CONFIG).forEach(([key, config]) => {
    services[key as ServiceType] = {
      id: config.id,
      name: config.name,
      description: config.description,
      annualPrice: config.annualPrice,
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

    // 4-phase weekly cycle (week 1 starts in actions — no prior summary to show)
    weekPhase: 'actions' as const,

    // Week energy restore
    weeklyEnergyRestored: false,

    // Daily micro events
    seenMicroEventIds: [],
    pendingMicroEvent: null,

    // Suppliers system (NEW v2.0)
    suppliers: [],
    activeSupplierId: null,

    // Employees system (NEW v2.0)
    employees: [],

    // Quality of service/product (NEW v2.0)
    qualityLevel: 50,

    // Competitor events tracking (UPDATED v2.0)
    weeksSinceCompetitorEvent: 0,

    // Loans system (NEW v2.1)
    loans: [],

    // Campaign ROI tracking (NEW v2.2)
    campaignROI: [],

    // Milestone status (NEW v2.2)
    milestoneStatus: {
      week10: false,
      week20: false,
      week30: false,
    },

    // Owner investments (v2.3)
    purchasedOwnerItems: [],
    ownerSubscriptions: [],

    // NPC system (v3.0)
    npcs: createInitialNPCs(),
    playerBackstory: null,
    activeChainIds: [],
    completedChainIds: [],
    pendingChainFollowUps: [],

    // Narrative systems (v3.1)
    decisionLog: [],
    seenNewspaperWeeks: [],

    // Cliffhanger teaser (v4.0)
    upcomingEventTeaser: null,
    pendingMilestoneCelebration: null,
    // Pain tracking (v4.1)
    lastWeekPainLosses: null,
    totalPainLosses: null,
    seenUnlockTabs: [],
  }
}

interface GameStoreActions {
  // Core game actions
  startNewGame: (businessType: BusinessType) => void
  nextDay: () => void
  advanceDay: () => { blocked: boolean; reason?: string }
  advanceWeek: () => { blocked: boolean; reason?: string }

  // 4-phase weekly cycle
  completeActionsPhase: () => { blocked: boolean; reason?: string }
  completeResultsPhase: () => void
  completeSummaryPhase: () => void

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

  // Employees
  hireEmployee: (position: any, name: string, salary: number) => void
  fireEmployee: (employeeId: string) => void

  // Quality level
  adjustQualityLevel: (delta: number) => void

  // Loans
  takeLoan: (amount: number, type: 'micro' | 'standard' | 'long-term') => boolean
  repayLoan: (loanId: string, amount: number) => boolean

  // Campaign ROI tracking
  addCampaignROI: (roi: CampaignROI) => void
  updateMilestoneStatus: (milestones: MilestoneStatus) => void

  // Owner investments (v2.3)
  purchaseOwnerInvestment: (id: OwnerInvestmentId) => boolean

  // Business stage helper
  getBusinessStage: () => import('../types/game').BusinessStage

  // NPC system (v3.0)
  updateNPCRelationship: (npcId: string, delta: number) => void
  recordNPCMemory: (npcId: string, entry: NpcMemoryEntry) => void
  setPlayerBackstory: (backstory: PlayerBackstory) => void
  addChainFollowUp: (chainEventId: string, triggerWeek: number) => void
  markChainCompleted: (chainId: string) => void
  addActiveChain: (chainId: string) => void
  consumePendingChainFollowUp: (chainEventId: string) => void

  // Narrative systems (v3.1)
  addDecisionLogEntry: (entry: DecisionLogEntry) => void
  addSeenNewspaper: (week: number) => void
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
          daysSinceLastMonthly: state.daysSinceLastMonthly + 1,
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

    // 4-phase weekly cycle actions
    completeActionsPhase: () => {
      const store = get()
      const stateCopy = JSON.parse(JSON.stringify(extractState(store))) as GameState
      const { blocked, reason } = checkWeekBlocked(stateCopy)
      if (blocked) return { blocked: true, reason }
      processWeek(stateCopy)
      const hasPendingEvents = (stateCopy.pendingEventsQueue?.length ?? 0) > 0 || stateCopy.pendingEvent !== null
      stateCopy.weekPhase = (hasPendingEvents ? 'events' : 'results') as WeekPhase
      set({ ...stateCopy })
      return { blocked: false }
    },

    completeResultsPhase: () => {
      const state = get()
      const purchasedOwnerItems = state.purchasedOwnerItems ?? []
      const ownerSubscriptions = state.ownerSubscriptions ?? []

      // Compute energy bonus from permanent items
      let weeklyBonus = 0
      if (purchasedOwnerItems.includes('chair')) weeklyBonus += 10
      // laptop reduces costs, not adds energy

      // Process subscriptions: add energy and decrement
      const nextSubscriptions = ownerSubscriptions
        .map(sub => ({ ...sub, weeksLeft: sub.weeksLeft - 1 }))
        .filter(sub => sub.weeksLeft > 0)

      for (const sub of ownerSubscriptions) {
        weeklyBonus += sub.energyPerWeek
      }

      // Partial restoration: +40 per week (not full reset).
      // Sustained overwork with many employees will gradually drain energy to 0.
      const currentEnergy = get().entrepreneurEnergy
      const restoredEnergy = Math.min(
        currentEnergy + 40 + weeklyBonus,
        ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY
      )

      set({
        weekPhase: 'summary' as WeekPhase,
        entrepreneurEnergy: restoredEnergy,
        weeklyEnergyRestored: true,
        ownerSubscriptions: nextSubscriptions,
        lastUpdated: Date.now(),
      })
    },

    completeSummaryPhase: () => {
      set({
        weekPhase: 'actions' as WeekPhase,
        lastUpdated: Date.now(),
      })
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

      const laptopReduction = (state.purchasedOwnerItems ?? []).includes('laptop') ? 3 : 0
      const actualCost = Math.max(
        ECONOMY_CONSTANTS.ENERGY_COST_ZERO_THRESHOLD,
        Math.ceil(baseCost * costModifier) - laptopReduction
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
      // Check if service is unlocked before allowing toggle
      if (!(state.unlockedServices ?? []).includes(serviceId)) {
        return
      }
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
      // Check if service is unlocked before allowing activation
      if (!(state.unlockedServices ?? []).includes(serviceId)) {
        return
      }
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

    // Campaigns
    addAdCampaign: (campaign) => {
      const state = get()
      if (state.activeAdCampaigns.length >= MAX_ACTIVE_CAMPAIGNS) return
      if (state.balance < campaign.cost) return
      set((s) => ({
        activeAdCampaigns: [
          ...s.activeAdCampaigns,
          { ...campaign, launchedWeek: s.currentWeek, revenueAttributed: 0 },
        ],
        balance: s.balance - campaign.cost,
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
      const state = get()
      if (state.purchasedUpgrades.includes(upgradeId)) return
      get().spendEnergy(ECONOMY_CONSTANTS.ENERGY_COST_PURCHASE)
      set((s) => ({
        purchasedUpgrades: [...s.purchasedUpgrades, upgradeId],
        lastUpdated: Date.now(),
      }))
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
        const allCleared = nextEvent === null
        return {
          triggeredEventIds: state.triggeredEventIds.includes(eventId)
            ? state.triggeredEventIds
            : [...state.triggeredEventIds, eventId],
          pendingEvent: nextEvent,
          pendingEventsQueue: queue.slice(1),
          weekPhase: (allCleared && state.weekPhase === 'events' ? 'results' : state.weekPhase) as WeekPhase,
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
        // v3.0 NPC system
        npcs: state.npcs ?? createInitialNPCs(),
        playerBackstory: state.playerBackstory ?? null,
        activeChainIds: state.activeChainIds ?? [],
        completedChainIds: state.completedChainIds ?? [],
        pendingChainFollowUps: state.pendingChainFollowUps ?? [],
        // v3.1 narrative systems
        decisionLog: state.decisionLog ?? [],
        seenNewspaperWeeks: state.seenNewspaperWeeks ?? [],
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
        .reduce((sum: number, service: Service) => sum + service.annualPrice, 0)
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
        seenMicroEventIds: event ? [...get().seenMicroEventIds, event.id] : get().seenMicroEventIds,
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
        updates.temporaryClientMod = (state.temporaryClientMod ?? 0) + effects.clientModifierPercent
        updates.temporaryModDaysLeft = Math.max(
          state.temporaryModDaysLeft ?? 0,
          effects.clientModifierDays
        )
      }

      set(updates)
    },

    clearSeenMicroEvents: () => {
      set({ seenMicroEventIds: [], lastUpdated: Date.now() })
    },

    // Employees
    hireEmployee: (position: any, name: string, salary: number) => {
      const state = get()
      const stage = getBusinessStage(state.currentWeek, state.level)
      const maxEmployees = STAGE_CONFIG[stage].maxEmployees
      if ((state.employees ?? []).length >= maxEmployees) return
      get().spendEnergy(ECONOMY_CONSTANTS.ENERGY_COST_BASE_OPERATION)
      set((s) => ({
        employees: [...s.employees, {
          id: `emp_${Date.now()}`,
          position,
          name,
          salary,
          efficiency: 1.0,
          hireDay: s.currentWeek,
          energyCost: Math.round(salary / 2000),
        }],
        lastUpdated: Date.now(),
      }))
    },

    fireEmployee: (employeeId: string) => {
      set((state) => ({
        employees: state.employees.filter(e => e.id !== employeeId),
        lastUpdated: Date.now(),
      }))
    },

    // Quality level
    adjustQualityLevel: (delta: number) => {
      set((state) => ({
        qualityLevel: Math.max(0, Math.min(100, state.qualityLevel + delta)),
        lastUpdated: Date.now(),
      }))
    },

    // Loans
    takeLoan: (amount: number, type: 'micro' | 'standard' | 'long-term') => {
      const state = get()

      // Max 1 active loan at a time
      const activeLoans = (state.loans ?? []).filter(l => !l.isRepaid)
      if (activeLoans.length >= 1) return false

      // Loan parameters
      const params = {
        micro: { weeks: 2, weeklyRate: 0.15 / 2 },      // 15% total over 2 weeks
        standard: { weeks: 4, weeklyRate: 0.10 / 4 },   // 10% total over 4 weeks
        'long-term': { weeks: 12, weeklyRate: 0.08 / 12 }, // 8% total over 12 weeks
      }
      const param = params[type]

      const newLoan = {
        id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        borrowedWeek: state.currentWeek,
        dueWeek: state.currentWeek + param.weeks,
        weeklyInterest: param.weeklyRate,
        totalInterestPaid: 0,
        isRepaid: false,
        type,
      }

      set((s) => ({
        loans: [...(s.loans || []), newLoan],
        balance: s.balance + amount,
        lastUpdated: Date.now(),
      }))
      return true
    },

    repayLoan: (loanId: string, amount: number) => {
      const state = get()
      const loan = state.loans?.find(l => l.id === loanId)
      if (!loan || loan.isRepaid) return false
      if (state.balance < amount) return false

      set((s) => {
        const loans = (s.loans || []).map(l =>
          l.id === loanId ? { ...l, isRepaid: true } : l
        )
        return { loans, balance: s.balance - amount, lastUpdated: Date.now() }
      })
      return true
    },

    // Campaign ROI tracking
    addCampaignROI: (roi: CampaignROI) => {
      set((state) => ({
        campaignROI: [...(state.campaignROI || []), roi],
        lastUpdated: Date.now(),
      }))
    },

    // Milestone status
    updateMilestoneStatus: (milestones: MilestoneStatus) => {
      set({
        milestoneStatus: milestones,
        lastUpdated: Date.now(),
      })
    },

    // Owner investments (v2.3)
    purchaseOwnerInvestment: (id: OwnerInvestmentId) => {
      const config = OWNER_INVESTMENTS_MAP[id]
      if (!config) return false
      const state = get()
      if (state.balance < config.cost) return false

      // Permanent items can only be bought once
      if (config.type === 'permanent' && (state.purchasedOwnerItems ?? []).includes(id)) return false

      const maxEnergy = ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY

      if (config.type === 'one-time') {
        const addEnergy = config.effect.energyImmediate ?? 0
        set((s) => ({
          balance: s.balance - config.cost,
          entrepreneurEnergy: Math.min(maxEnergy, s.entrepreneurEnergy + addEnergy),
          lastUpdated: Date.now(),
        }))
      } else if (config.type === 'permanent') {
        const addEnergy = config.effect.energyImmediate ?? 0
        set((s) => ({
          balance: s.balance - config.cost,
          purchasedOwnerItems: [...(s.purchasedOwnerItems ?? []), id],
          entrepreneurEnergy: addEnergy > 0 ? Math.min(maxEnergy, s.entrepreneurEnergy + addEnergy) : s.entrepreneurEnergy,
          lastUpdated: Date.now(),
        }))
      } else {
        // subscription
        const weeks = config.subscriptionWeeks ?? 4
        const energyPerWeek = config.effect.energyPerWeek ?? 0
        set((s) => ({
          balance: s.balance - config.cost,
          ownerSubscriptions: [
            ...(s.ownerSubscriptions ?? []),
            { id, weeksLeft: weeks, energyPerWeek },
          ],
          lastUpdated: Date.now(),
        }))
      }
      return true
    },

    // Business stage helper
    getBusinessStage: () => {
      const state = get()
      return getBusinessStage(state.currentWeek, state.level)
    },

    // NPC system (v3.0)
    updateNPCRelationship: (npcId: string, delta: number) => {
      set((state) => ({
        npcs: updateNPCRelationship(state.npcs ?? [], npcId, delta),
        lastUpdated: Date.now(),
      }))
    },

    recordNPCMemory: (npcId: string, entry: NpcMemoryEntry) => {
      set((state) => ({
        npcs: recordNPCMemory(state.npcs ?? [], npcId, entry),
        lastUpdated: Date.now(),
      }))
    },

    setPlayerBackstory: (backstory: PlayerBackstory) => {
      set({ playerBackstory: backstory, lastUpdated: Date.now() })
    },

    addChainFollowUp: (chainEventId: string, triggerWeek: number) => {
      set((state) => ({
        pendingChainFollowUps: [
          ...(state.pendingChainFollowUps ?? []),
          { chainEventId, triggerWeek },
        ],
        lastUpdated: Date.now(),
      }))
    },

    markChainCompleted: (chainId: string) => {
      set((state) => ({
        activeChainIds: (state.activeChainIds ?? []).filter(id => id !== chainId),
        completedChainIds: [...(state.completedChainIds ?? []), chainId],
        lastUpdated: Date.now(),
      }))
    },

    addActiveChain: (chainId: string) => {
      set((state) => {
        if ((state.activeChainIds ?? []).includes(chainId)) return {}
        return {
          activeChainIds: [...(state.activeChainIds ?? []), chainId],
          lastUpdated: Date.now(),
        }
      })
    },

    consumePendingChainFollowUp: (chainEventId: string) => {
      set((state) => ({
        pendingChainFollowUps: (state.pendingChainFollowUps ?? []).filter(
          f => f.chainEventId !== chainEventId
        ),
        lastUpdated: Date.now(),
      }))
    },

    // Narrative systems (v3.1)
    addDecisionLogEntry: (entry: DecisionLogEntry) => {
      set((state) => ({
        decisionLog: [...(state.decisionLog ?? []), entry],
        lastUpdated: Date.now(),
      }))
    },

    addSeenNewspaper: (week: number) => {
      set((state) => ({
        seenNewspaperWeeks: [...(state.seenNewspaperWeeks ?? []), week],
        lastUpdated: Date.now(),
      }))
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
    hadLowReputation, consecutiveNoExpiry, weeklyEnergyRestored, weekPhase,
    // Legacy fields for migration
    currentDay,
    // New fields
    onboardingStage, onboardingCompleted, onboardingStepIndex, unlockedServices,
    seenMicroEventIds, pendingMicroEvent,
    cashRegisters, enabledCategories, promoCodesRevealed,
    daysBalanceNegative, competitorEventTriggered, lastDayPainLosses, bundlePromoShown,
    // v2.0 new fields
    suppliers, activeSupplierId, employees, qualityLevel, weeksSinceCompetitorEvent,
    // v2.1 new fields
    loans,
    // v2.2 new fields
    campaignROI, milestoneStatus,
    // v2.3 owner investments
    purchasedOwnerItems, ownerSubscriptions,
    // v3.0 NPC system
    npcs, playerBackstory, activeChainIds, completedChainIds, pendingChainFollowUps,
    // v3.1 narrative
    decisionLog, seenNewspaperWeeks,
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
    weekPhase: (weekPhase ?? 'actions') as WeekPhase,
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
    // v2.0 fields with defaults for save compatibility
    suppliers: suppliers ?? [],
    activeSupplierId: activeSupplierId ?? null,
    employees: employees ?? [],
    qualityLevel: qualityLevel ?? 50,
    weeksSinceCompetitorEvent: weeksSinceCompetitorEvent ?? 0,
    // v2.1 fields with defaults
    loans: loans ?? [],
    // v2.2 fields with defaults
    campaignROI: campaignROI ?? [],
    milestoneStatus: milestoneStatus ?? {
      week10: false,
      week20: false,
      week30: false,
    },
    // v2.3 owner investments
    purchasedOwnerItems: purchasedOwnerItems ?? [],
    ownerSubscriptions: ownerSubscriptions ?? [],
    // v3.0 NPC system
    npcs: npcs ?? createInitialNPCs(),
    playerBackstory: playerBackstory ?? null,
    activeChainIds: activeChainIds ?? [],
    completedChainIds: completedChainIds ?? [],
    pendingChainFollowUps: pendingChainFollowUps ?? [],
    // v3.1 narrative systems
    decisionLog: decisionLog ?? [],
    seenNewspaperWeeks: seenNewspaperWeeks ?? [],
    // v4.0 teaser
    upcomingEventTeaser: (state as any).upcomingEventTeaser ?? null,
    pendingMilestoneCelebration: (state as any).pendingMilestoneCelebration ?? null,
    lastWeekPainLosses: (state as any).lastWeekPainLosses ?? null,
    totalPainLosses: (state as any).totalPainLosses ?? null,
    seenUnlockTabs: (state as any).seenUnlockTabs ?? [],
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
