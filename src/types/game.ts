export type BusinessType = 'shop' | 'cafe' | 'beauty-salon'

export type ServiceType = 'market' | 'bank' | 'ofd' | 'diadoc' | 'fokus' | 'elba' | 'extern'

export type OnboardingStage = 0 | 1 | 2 | 3 | 4

export type CashRegisterType = 'mobile' | 'reliable' | 'fast'

export type SupplierTier = 'economy' | 'standard' | 'premium'

export type EmployeePosition = 'cashier' | 'assistant' | 'manager' | 'specialist'

export interface CashRegister {
  type: CashRegisterType
  count: number
  purchaseDay: number
}

export interface Supplier {
  id: string
  name: string
  tier: SupplierTier
  qualityModifier: number  // -0.2 to +0.2
  priceModifier: number    // -0.15 to +0.25
  reliability: number      // 0.7 to 1.0 (chance of on-time delivery)
  isActive: boolean
  unlockedDay: number
}

export interface Employee {
  id: string
  position: EmployeePosition
  name: string
  salary: number           // monthly salary
  efficiency: number       // 0.5 to 1.5 (affects capacity)
  hireDay: number
  energyCost: number       // energy cost per week to manage
}

export interface ProductCategory {
  id: string
  name: string
  description: string
  margin: number
  dailyCost: number
  baseRevenue: number
  requiredServices: ServiceType[]
  requiresEgais?: boolean
  requiresVetCert?: boolean
  icon: string
}

export interface PainLossRecord {
  bank: number
  market: number
  ofd: number
  diadoc: number
  fokus: number
  elba: number
  extern: number
  total: number
}

export interface OnboardingStep {
  id: string
  title: string
  text: string
  highlightTarget?: string
  requiresAction?: string
}

export interface OnboardingStageConfig {
  stage: OnboardingStage
  dayRange: [number, number]
  steps: OnboardingStep[]
  unlocksServices: ServiceType[]
  requiredAction?: string
}

export interface Service {
  id: ServiceType
  name: string
  description: string
  monthlyPrice: number
  isActive: boolean
  effects: {
    capacityBonus?: number
    checkBonus?: number
    writeOffReduction?: number
    clientBonus?: number
    creditRate?: number
    reputationBonus?: number
    loyaltyBonus?: number
    taxSaving?: number
  }
}

export interface SynergyBonus {
  id: string
  name: string
  description: string
  requiredServices: ServiceType[]
  effects: {
    capacityBonus?: number
    checkBonus?: number
    reputationBonus?: number
    loyaltyBonus?: number
    taxSaving?: number
    clientBonus?: number
    revenueBonus?: number
  }
}

export interface DayResult {
  dayNumber: number
  clients: number
  served: number
  missed: number
  revenue: number
  expenses: number
  tax: number
  subscriptionCost: number
  purchaseCost: number
  monthlyExpense: number
  expiredLoss: number
  netProfit: number
  balance: number
  reputationChange: number
  loyaltyChange: number
  stockAfter: number
  // Pain losses from missing services
  painLossBankMissed: number
  painLossMarketInventory: number
  painLossOfdFine: number
  painLossDiadocDelay: number
  painLossFokusBadSupplier: number
  painLossElbaFine: number
  painLossExternBlock: number
  // Cash register
  registerOverflowPenalty: number
  // Category breakdown
  categoryFines: Record<string, number>
}

export interface EventOption {
  id: string
  text: string
  consequences: {
    balanceDelta?: number
    reputationDelta?: number
    loyaltyDelta?: number
    serviceId?: ServiceType
    serviceDiscount?: number
    clientModifier?: number
    clientModifierDays?: number
    checkModifier?: number
    checkModifierDays?: number
  }
  hasServiceAlternative?: boolean
  requiredService?: ServiceType
  isContourOption?: boolean
}

export interface Event {
  id: string
  day: number
  title: string
  description: string
  options: EventOption[]
  isResolved: boolean
}

export interface EventTemplate {
  id: string
  title: string
  description: string
  trigger: {
    dayMin?: number
    dayMax?: number
    randomChance?: number
    reputationMax?: number
    reputationMin?: number
    requiredService?: ServiceType
    businessTypes?: BusinessType[]
    oneTime?: boolean
  }
  options: EventOption[]
}

// Legacy stock type (kept for compatibility)
export interface Stock {
  id: string
  quantity: number
  expiryDate: Date
  cost: number
}

// FIFO batch for stock management
export interface StockBatch {
  id: string
  quantity: number
  costPerUnit: number
  dayReceived: number
  expirationDays: number
}

export interface Modifiers {
  seasonal: number
  advertising: number
  reputation: number
  event: number
  capacityBonus: number
  checkBonus: number
  advertisingCheckPenalty: number
}

export interface SeasonalityData {
  month: number
  modifier: number
}

export interface AdCampaign {
  id: string
  name: string
  duration: number
  cost: number
  clientEffect: number
  checkEffect: number
  businessTypes?: BusinessType[]
  daysRemaining: number
}

export interface Upgrade {
  id: string
  name: string
  cost: number
  capacityBonus?: number
  checkBonus?: number
  monthlyRentIncrease?: number
  monthlySalaryIncrease?: number
  clientPenaltyDays?: number
  clientPenaltyAmount?: number
  requiredService?: ServiceType
  isPurchased: boolean
}

export interface BusinessConfig {
  type: BusinessType
  startBalance: number
  baseClients: number
  avgCheck: number
  capacity: number
  hasStock: boolean
  stockExpiry: number
  seasonality: Record<string, number>
  mainService: ServiceType
  monthlyRent: number
  monthlyBaseSalary: number
  usesAssortment: boolean
}

export interface GameState {
  businessType: BusinessType
  currentWeek: number  // 1-52
  dayOfWeek: number    // 0-6 (0 = Monday, 6 = Sunday)
  balance: number
  savedBalance: number
  reputation: number
  loyalty: number
  entrepreneurEnergy: number  // 0-100, drained by operations, restored weekly

  // Legacy stock (kept for compatibility)
  stock: Stock[]
  // FIFO batches
  stockBatches: StockBatch[]
  capacity: number

  services: Record<ServiceType, Service>
  achievements: string[]
  level: number
  experience: number

  lastDayResult: DayResult | null
  pendingEvent: Event | null
  pendingEventsQueue: Event[]
  triggeredEventIds: string[]

  isGameOver: boolean
  isVictory: boolean
  gameOverReason?: string

  // Game logic counters
  consecutiveOverloadDays: number
  daysReputationZero: number
  daysSinceLastMonthly: number
  purchaseOfferedThisDay: boolean

  // Week-based counters
  weeklyEnergyRestored: boolean  // Track if energy was restored this week

  // Active campaigns and upgrades
  activeAdCampaigns: AdCampaign[]
  purchasedUpgrades: string[]

  // Temporary modifiers from events
  temporaryClientMod: number
  temporaryCheckMod: number
  temporaryModDaysLeft: number

  createdAt: number
  lastUpdated: number

  // Achievement tracking helpers
  hadLowReputation?: boolean
  consecutiveNoExpiry?: number

  // Onboarding
  onboardingStage: OnboardingStage
  onboardingCompleted: boolean
  onboardingStepIndex: number

  // Service visibility (unlocked by onboarding)
  unlockedServices: ServiceType[]

  // Cash registers
  cashRegisters: CashRegister[]

  // Assortment categories
  enabledCategories: string[]

  // Promo codes
  promoCodesRevealed: ServiceType[]
  pendingPromoCode: ServiceType | null

  // Balance game-over tracking
  daysBalanceNegative: number

  // Competitor event flag
  competitorEventTriggered: boolean

  // Pain losses from last day
  lastDayPainLosses: PainLossRecord | null

  // Bundle promo shown
  bundlePromoShown: boolean

  // Daily micro events
  seenMicroEventIds: string[]  // Events already shown this week
  pendingMicroEvent: null | {
    id: string
    title: string
    description: string
    icon: string
    options: Array<{
      id: string
      text: string
      effects: Record<string, number>
    }>
  }

  // Suppliers system (NEW v2.0)
  suppliers: Supplier[]
  activeSupplierId: string | null

  // Employees system (NEW v2.0)
  employees: Employee[]

  // Quality of service/product (NEW v2.0) - affects reputation and loyalty
  qualityLevel: number  // 0-100, starts at 50

  // Competitor events tracking (UPDATED v2.0)
  weeksSinceCompetitorEvent: number  // Track weeks since last competitor event
}
