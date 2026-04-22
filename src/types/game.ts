export type BusinessType = 'shop' | 'cafe' | 'beauty-salon'

export type NpcRole = 'supplier' | 'employee' | 'inspector' | 'competitor'

export type BackstoryMotivation = 'corp' | 'contest' | 'accident'
export type BackstoryPersonal = 'free' | 'friend' | 'hometown'

export type DecisionImpact = 'positive' | 'negative' | 'neutral'

export interface DecisionLogEntry {
  week: number
  text: string
  type: 'choice' | 'chain' | 'milestone' | 'npc' | 'newspaper' | 'customer'
  impact: DecisionImpact
  npcId?: string
}

export interface NpcMemoryEntry {
  week: number
  eventId: string
  choiceId: string
  note: string
}

export interface NPC {
  id: string
  name: string
  role: NpcRole
  portrait: string
  relationshipLevel: number  // 0-100
  isRevealed: boolean
  memory: NpcMemoryEntry[]
}

export interface PlayerBackstory {
  motivation: BackstoryMotivation
  personal: BackstoryPersonal
}

export type ServiceType = 'market' | 'bank' | 'ofd' | 'diadoc' | 'fokus' | 'elba' | 'extern'

export type OnboardingStage = 0 | 1 | 2 | 3 | 4

export type CashRegisterType = 'mobile' | 'reliable' | 'fast'

export type SupplierTier = 'economy' | 'standard' | 'premium'

export type EmployeePosition = 'cashier' | 'assistant' | 'manager' | 'specialist' | 'supervisor' | 'trainer'

export type WeekPhase = 'summary' | 'actions' | 'events' | 'results'

export type BusinessStage = 'startup' | 'small' | 'growing' | 'medium' | 'large'

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

export interface Loan {
  id: string
  amount: number
  borrowedWeek: number
  dueWeek: number
  weeklyInterest: number
  totalInterestPaid: number
  isRepaid: boolean
  type: 'micro' | 'standard' | 'long-term'
}

export interface CampaignROI {
  id: string
  campaignId: string
  launchedWeek: number
  costSpent: number
  revenueGenerated: number
  clientsAcquired: number
  roi: number  // percentage
}

export interface MilestoneStatus {
  week10: boolean  // achieved 100k balance or 1k weekly profit
  week20: boolean  // achieved 250k balance or 5k weekly profit
  week30: boolean  // achieved 500k balance or 10k weekly profit
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
  annualPrice: number  // Годовая стоимость сервиса
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
    energyReduction?: number
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
    energyDelta?: number
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
  npcRelationshipDelta?: number
  chainFollowUpId?: string
}

export interface Event {
  id: string
  day: number
  title: string
  description: string
  options: EventOption[]
  isResolved: boolean
  npcId?: string
  isMoralDilemma?: boolean
  decisionDeadlineWeek?: number
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
    noService?: ServiceType
    businessTypes?: BusinessType[]
    oneTime?: boolean
    chainId?: string
    chainStep?: number
  }
  options: EventOption[]
  npcId?: string
  isMoralDilemma?: boolean
  decisionDeadlineWeeks?: number
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
  startWeek?: number  // Week when campaign started (for delayed effects)
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

  // 4-phase weekly cycle
  weekPhase: WeekPhase

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

  // Loans system (NEW v2.1)
  loans: Loan[]

  // Campaign ROI tracking (NEW v2.2)
  campaignROI: CampaignROI[]

  // Milestone status (NEW v2.2)
  milestoneStatus: MilestoneStatus

  // Owner investments (v2.3)
  purchasedOwnerItems: string[]  // permanent investment ids (laptop, chair)
  ownerSubscriptions: Array<{ id: string; weeksLeft: number; energyPerWeek: number }>

  // NPC system (v3.0)
  npcs: NPC[]
  playerBackstory: PlayerBackstory | null
  activeChainIds: string[]
  completedChainIds: string[]
  pendingChainFollowUps: Array<{ chainEventId: string; triggerWeek: number }>

  // Narrative systems (v3.1)
  decisionLog: DecisionLogEntry[]
  seenNewspaperWeeks: number[]
}
