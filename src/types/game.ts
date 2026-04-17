export type BusinessType = 'shop' | 'cafe' | 'beauty-salon'

export type ServiceType = 'market' | 'bank' | 'ofd' | 'diadoc' | 'fokus' | 'elba' | 'extern'

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
}

export interface GameState {
  businessType: BusinessType
  currentDay: number
  balance: number
  savedBalance: number
  reputation: number
  loyalty: number

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
  triggeredEventIds: string[]

  isGameOver: boolean
  isVictory: boolean
  gameOverReason?: string

  // Game logic counters
  consecutiveOverloadDays: number
  daysReputationZero: number
  daysSinceLastMonthly: number
  purchaseOfferedThisDay: boolean

  // Active campaigns and upgrades
  activeAdCampaigns: AdCampaign[]
  purchasedUpgrades: string[]

  // Temporary modifiers from events
  temporaryClientMod: number
  temporaryCheckMod: number
  temporaryModDaysLeft: number

  createdAt: number
  lastUpdated: number
}
