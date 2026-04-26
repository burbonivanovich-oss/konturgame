export type BusinessType = 'shop' | 'cafe' | 'beauty-salon'

export type NpcRole = 'supplier' | 'employee' | 'inspector' | 'competitor' | 'consultant' | 'banker' | 'blogger' | 'customer'

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
  isAnchor?: boolean  // anchor entries are never evicted by the 10-entry limit
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

/**
 * Personal goal — the protagonist's reason for being in business.
 * Tied to backstory.personal: each personal situation has its own goal,
 * deadline, and narrative ending. Drives time pressure and meaning beyond
 * "don't go bankrupt".
 */
export interface PersonalGoal {
  // Stable id used for ending text and analytics
  id: 'parent_reno' | 'katya_deposit' | 'courtyard_save'
  // Short label shown in the UI ("Своя квартира")
  shortLabel: string
  // Full sentence shown in dashboard ("Накопить 500 000 ₽ на квартиру в новом районе")
  description: string
  // Monetary target. Goal is met when balance >= targetAmount before deadline.
  targetAmount: number
  // Inclusive deadline week. After this week, goal is missed if not yet met.
  deadlineWeek: number
  // True once balance crossed the target before deadline
  achieved: boolean
  // True if the deadline passed without achievement (immutable failure)
  missed: boolean
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
  // Equipment/upgrade IDs that must be purchased before this category opens.
  // Player sees the category greyed out with "нужен <upgrade>" until satisfied.
  requiredUpgradeIds?: string[]
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

export type OnboardingTrigger =
  | 'first_day_completed'
  | 'first_event_shown'
  | 'first_event_resolved'
  | 'low_energy'
  | 'negative_balance'
  | 'low_stock'

export interface OnboardingStep {
  id: string
  title: string
  text: string
  highlightTarget?: string
  requiresAction?: string
  // Kind of step:
  // - 'intro'  (default): educational, just press "Понял"
  // - 'action': requires game action (same as legacy requiresAction)
  // - 'wait':   waits for in-game trigger before "Далее" becomes active
  kind?: 'intro' | 'action' | 'wait'
  waitForTrigger?: OnboardingTrigger
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
    acquiringRate?: number
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
  lostToBank: number   // clients who left without payment due to no cashless
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
    // Personal-event gating (v5.0): event only fires if the player picked
    // this backstory. Used by personalEvents.ts to make NPC arcs feel earned.
    requiredMotivation?: BackstoryMotivation
    requiredPersonal?: BackstoryPersonal
    // NPC relationship gating (v5.1): only fire if a specific NPC's
    // relationship is in [min, max]. Used to branch NPC arcs by trust level.
    npcRelationshipMin?: number
    npcRelationshipMax?: number
    // Require the NPC to have been revealed at least once (i.e. interacted with)
    requiresNpcRevealed?: boolean
    // Crisis-event gating (v5.5): trigger only when player is "doing well".
    // These let us spawn high-impact destabilization events that don't
    // overwhelm players who are already struggling.
    balanceMin?: number
    weekMin?: number
    loyaltyMin?: number
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
  startWeek?: number         // Week when effects kick in (for delayed campaigns)
  launchedWeek?: number      // Week when purchased (for ROI history display)
  revenueAttributed?: number // Accumulated incremental revenue for final ROI record
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

export interface MetaPerk {
  id: string
  name: string
  description: string
}

export interface GameState {
  businessType: BusinessType
  // 1, 2, 3 — controls multipliers on baseClients/avgCheck/rent/etc.
  // Tier 1 is starting baseline; player upgrades via upgradeBusinessTier().
  businessTier?: 1 | 2 | 3
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

  // Cooldown: week when each service was last deactivated (can't re-enable for 2 weeks)
  serviceDeactivatedWeeks?: Partial<Record<ServiceType, number>>

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

  // Weekly micro event (passive, shown in results)
  lastWeekMicroEvent?: { icon: string; title: string; effectText: string } | null

  // Last diary entry (passive, first-person reflection — v5.0)
  // Picked every 5 weeks based on backstory/state, shown in WeekResults.
  lastDiaryEntry?: { header: string; body: string } | null
  // Weeks at which a diary entry has been picked (prevents double-firing)
  diaryEntryWeeks?: number[]

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
  // Personal goal — generated from backstory.personal at game start (v5.0).
  // Optional for save migration; production runs always have it after backstory.
  personalGoal?: PersonalGoal | null
  activeChainIds: string[]
  completedChainIds: string[]
  pendingChainFollowUps: Array<{ chainEventId: string; triggerWeek: number; contextNote?: string }>

  // Narrative systems (v3.1)
  decisionLog: DecisionLogEntry[]
  seenNewspaperWeeks: number[]

  // Just-in-time tutorial moments (v6) — IDs of moments the player has dismissed.
  // Distinct from main onboarding stages; these fire contextually as the player
  // hits new features (upgrades available, marketing, tier upgrade, etc.).
  seenTutorialMoments?: string[]

  // Pain loss tracking (v4.1)
  lastWeekPainLosses?: PainLossRecord | null   // accumulated over the last 7 days
  totalPainLosses?: PainLossRecord | null      // accumulated over entire run (for postmortem)
  seenUnlockTabs?: string[]                    // nav ids shown the "just unlocked" toast

  // Cliffhanger teaser for next week (v4.0)
  upcomingEventTeaser?: string | null

  // Pending milestone celebration (shown in results overlay, v4.0)
  pendingMilestoneCelebration?: string | null  // 'week10' | 'week20' | 'week30'

  // Onboarding resilience (v4.2)
  // Step IDs where player explicitly chose to skip a required action
  skippedOnboardingActions?: string[]
  // True after emergency startup grant has been issued once
  onboardingEmergencyGrantUsed?: boolean
  // Unix ms timestamp saved on each persist — guards against real-time trigger drift
  lastSavedTimestamp?: number

  // Progression fixes (v4.3)
  // True for exactly one week when energy first hits 0; game ends only on second consecutive zero week
  burnoutWarningActive?: boolean
  // How the player won: 'combined' (all 5 conditions before year 1) or 'year_one' (survived full year)
  victoryType?: 'year_one' | 'combined' | null

  // Tracks which option the player picked for each resolved event (v5.4).
  // Used by backstory achievements + postmortem timeline. Optional for save
  // migration; new runs always populate it via markEventAsResolved.
  chosenEventOptions?: Record<string, string>

  // Weekly tactic — small player-driven choice at the start of each week.
  // Resets to null when a new week starts; player picks from 3 options.
  // - 'aggressive': +15% revenue, -3 energy/day
  // - 'calm':      -8% revenue, +2 energy/day
  // - 'service':   -5% revenue, +0.5 reputation/day, +1 loyalty/day
  weeklyTactic?: WeeklyTactic | null

  // Lessons unlocked by THIS run (i.e. just earned at game-over). Set by
  // setGameOver / setVictory; consumed by VictoryModal to celebrate them.
  // Cleared on new game start.
  newlyUnlockedLessons?: string[]
}

export type WeeklyTactic = 'aggressive' | 'calm' | 'service'

/**
 * Cross-run metaprogression (v5.5). Persists separately from the main save
 * so it survives "new game". Each finished run can unlock "lessons" — small,
 * permanent perks granted at the start of every future run, paid for by
 * what the player already accomplished.
 *
 * The point: a death stops being a hard reset and becomes investment.
 */
export interface MetaProgress {
  totalRuns: number
  unlockedLessons: string[]      // ids of MetaLesson.id
  bestWeek: number               // furthest week ever reached
  totalGoalsAchieved: number     // count of personal goals achieved across runs
}

export interface MetaLessonBonus {
  startingBalanceDelta?: number
  startingEnergyDelta?: number
  startingReputationDelta?: number
  startingLoyaltyDelta?: number
}
