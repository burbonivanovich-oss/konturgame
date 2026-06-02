export type BusinessType = 'shop' | 'cafe' | 'beauty-salon'

export type NpcRole = 'supplier' | 'employee' | 'inspector' | 'competitor' | 'consultant' | 'banker' | 'blogger' | 'customer' | 'investor'

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
  id: 'close_debt' | 'brother_tuition' | 'own_apartment'
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

export type EmployeePosition = 'cashier' | 'assistant' | 'manager' | 'specialist' | 'supervisor' | 'trainer'

// Фазы недельного цикла:
//   summary    — Обзор: 3 цифры + обязательный выбор тактики (поне­дельник)
//   actions    — Свободное окно: дашборд, можно открывать модалки, в конце —
//                «Прожить неделю» (вторник-пятница ощущение)
//   events     — Решения: полноэкранный блокирующий event/dilemma/crisis (среда)
//   simulation — Симуляция: 15-секундный анимированный показ 7 дней (пт-вс)
//   results    — Итоги: 3 цифры + причинность (воскресенье)
export type WeekPhase = 'summary' | 'actions' | 'events' | 'simulation' | 'results'

export type BusinessStage = 'startup' | 'small' | 'growing' | 'medium' | 'large'

export interface CashRegister {
  type: CashRegisterType
  count: number
  purchaseDay: number
}

export interface Employee {
  id: string
  position: EmployeePosition
  name: string
  salary: number           // monthly salary
  efficiency: number       // 0.5 to 1.5 (affects capacity)
  hireDay: number
  energyCost: number       // energy cost per week to manage
  // Спринт 5e: динамика эффективности через неделю.
  //  • Положительный growthRate (студент) — учится, растёт до growthLimit
  //  • Отрицательный (Олег) — выгорает/халтурит, падает до growthLimit
  //  • Если не задано — сотрудник стабилен, эффективность не меняется
  growthRate?: number
  growthLimit?: number     // потолок если growthRate>0, пол если <0
  // Сотрудник плохо переносит менеджера в команде — при его наличии:
  //   • не получает team boost, а имеет −10% penalty к эффективности
  //   • growthRate (если отрицательный) удваивается — быстрее «скисает»
  //   • growthLimit заменяется на growthLimitUnderManager (глубже)
  // Используется для Олега и подобных «без энтузиазма» работников.
  dislikesManager?: boolean
  growthLimitUnderManager?: number  // более низкий пол при наличии менеджера
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
    // loyaltyBonus удалён в Спринт 6 — лояльность как скаляр выпилена,
    // никакой сервис это поле не использовал.
    taxSaving?: number
    energyReduction?: number
    acquiringRate?: number
    // Скидка на ежедневные закупки (COGS). Прямой эффект Диадока: ЭДО
    // ускоряет оборот документов → дешевле закупки. Применяется в
    // weekCalculator к purchaseCost.
    procurementDiscount?: number
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
    // loyaltyBonus удалён в Спринт 6 (none of current synergies used it).
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
    // Найм первого сотрудника через событие (Спринт 5e). Каждый кандидат
    // в чейне «Первый сотрудник» — это option с этим полем; consequences
    // обрабатывает создание Employee и (опционально) reveal связанного NPC.
    hireEmployee?: {
      position: EmployeePosition
      salary: number          // Месячная ЗП (для отображения и расчётов)
      efficiency: number       // Множитель пропускной способности
      energyCost: number       // Энергозатраты на управление (нед.)
      name?: string            // Конкретное имя кандидата (иначе случайное)
      linkNpcId?: string       // Если найм привязан к существующему NPC — раскрыть
      growthRate?: number      // Изменение эффективности за неделю (+ растёт, − падает)
      growthLimit?: number     // Потолок/пол для роста/деградации
      dislikesManager?: boolean  // Под управленцем скисает быстрее
      growthLimitUnderManager?: number  // более низкий пол при наличии менеджера
    }
    // Увольнение через событие (Спринт 5e): убирает сотрудника из state.employees
    // по имени. Используется в чейне Олег-троублс (oleg_trouble_1/2).
    fireEmployee?: { name?: string }
  }
  hasServiceAlternative?: boolean
  requiredService?: ServiceType
  isContourOption?: boolean
  npcRelationshipDelta?: number
  chainFollowUpId?: string
  // Бизнес-специфичные опции (Спринт 5e): отфильтровываются в UI, если
  // текущий businessType не входит в список. Используется в first_hire,
  // где «бывший повар» показывается только для cafe, «парикмахер» для
  // salon и т.д.
  requiredBusinessTypes?: BusinessType[]
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
  // Set to true when the player chose "Подумаю позже" — the event resurfaces
  // on the next week and the defer button is hidden (один раз можно отложить).
  wasDeferred?: boolean
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
    // Спринт 6: гейт по уже сработавшему событию. Используется PAIN_*
    // событиями чтобы они не фирились ДО соответствующего FIRST_* (раньше
    // PAIN_DIADOC W14 предлагал «подключить Диадок» до FIRST_DIADOC W17 —
    // игрок получал штраф до нарративного знакомства с сервисом).
    requiresTriggeredEvent?: string
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
  // level и experience удалены — это была дублирующая прогрессия:
  // онбординг + tier 1→2→3 + неделя 1-52 уже покрывают «куда я двигаюсь».
  // 15-уровневая игроковая шкала ничего не давала, кроме ачивок-вех,
  // которые конвертированы в неделя-based.

  lastDayResult: DayResult | null
  pendingEvent: Event | null
  pendingEventsQueue: Event[]
  // Events the player deferred via "Подумаю позже" — restored at the start
  // of the next week's event phase and shown without the defer option.
  deferredEvents?: Event[]
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

  // Касса + фискальный накопитель — одноразовая 54-ФЗ покупка (24 000₽).
  // Раньше было 3 типа касс с throughput-механикой и поломками; теперь это
  // compliance-флаг (купил → закон выполнен, ФНС не штрафует). Поле
  // cashRegisters оставлено для совместимости со старыми сэйвами, всегда [].
  cashRegisters: CashRegister[]
  fiscalDriveOwned?: boolean

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
  // Микрособытия которые игрок уже видел в этом цикле. Когда все показаны —
  // массив сбрасывается. Используется picker'ом чтобы не повторять подряд.
  seenMicroEvents?: string[]

  // Last diary entry (passive, first-person reflection — v5.0)
  // Picked every 5 weeks based on backstory/state, shown in WeekResults.
  lastDiaryEntry?: { header: string; body: string } | null
  // Weeks at which a diary entry has been picked (prevents double-firing)
  diaryEntryWeeks?: number[]

  // Employees system (NEW v2.0)
  employees: Employee[]

  // qualityLevel оставлен как optional для совместимости со старыми
  // сэйвами. Скаляр выпилен: его эффекты дублировали репутацию и
  // мерджнуты обратно в неё. Не читается нигде в продакшене.
  qualityLevel?: number

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

  // Pending tier upgrade celebration (Спринт 6): tier auto-progression
  // больше не пишет в lastWeekMicroEvent (конфликт с микрособытиями и
  // milestone'ами по приоритету). Заводим отдельный slot — WeekResultsOverlay
  // показывает его как dedicated badge «Бизнес вырос: <Tier name>».
  pendingTierUpgrade?: { level: number; name: string; icon: string } | null
  // Спринт 6 (QA #1+#2 audit): cooldown 3 нед между tier-апгрейдами,
  // чтобы T1→T2→T3 не происходил back-to-back если игрок резко нагнал rep.
  lastTierUpgradeWeek?: number

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
