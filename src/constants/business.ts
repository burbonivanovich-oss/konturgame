import type { BusinessType, ServiceType, BusinessConfig, SynergyBonus } from '../types/game'

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  shop: {
    type: 'shop',
    startBalance: 50000,
    baseClients: 80,
    avgCheck: 300,
    capacity: 60,
    hasStock: true,
    stockExpiry: 10,
    seasonality: {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0.05, '8': 0.05, '9': 0, '10': 0, '11': 0, '12': 0,
    },
    mainService: 'market',
    monthlyRent: 15000,
    monthlyBaseSalary: 20000,
    usesAssortment: true,
  },
  cafe: {
    type: 'cafe',
    startBalance: 40000,
    baseClients: 100,
    avgCheck: 180,
    capacity: 70,
    hasStock: true,
    stockExpiry: 7,
    seasonality: {
      '1': -0.15, '2': -0.15, '3': 0, '4': 0, '5': 0,
      '6': 0.22, '7': 0.22, '8': 0.22, '9': 0, '10': 0, '11': 0, '12': -0.15,
    },
    mainService: 'market',
    monthlyRent: 15000,
    monthlyBaseSalary: 20000,
    usesAssortment: true,
  },
  'beauty-salon': {
    type: 'beauty-salon',
    startBalance: 60000,
    baseClients: 40,
    avgCheck: 800,
    capacity: 30,
    hasStock: false,
    stockExpiry: 0,
    seasonality: {
      '1': 0, '2': 0, '3': 0.12, '4': 0.12, '5': 0.12,
      '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
    },
    mainService: 'elba',
    monthlyRent: 15000,
    monthlyBaseSalary: 20000,
    usesAssortment: true,
  },
}

export interface ServiceConfig {
  id: ServiceType
  name: string
  description: string
  monthlyPrice: number
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

export const SERVICES_CONFIG: Record<ServiceType, ServiceConfig> = {
  market: {
    id: 'market',
    name: 'Контур.Маркет',
    description: 'Автоматизация торговли: +20% пропускной, +15% к чеку, снижение убытков от просрочки.',
    monthlyPrice: 2000,
    effects: {
      capacityBonus: 0.2,
      checkBonus: 0.15,
      writeOffReduction: 0.2,
    },
  },
  bank: {
    id: 'bank',
    name: 'Контур.Банк',
    description: 'Льготное кредитование бизнеса по ставке 5%.',
    monthlyPrice: 1500,
    effects: {
      creditRate: 0.05,
    },
  },
  ofd: {
    id: 'ofd',
    name: 'Контур.ОФД',
    description: 'Онлайн-касса. Синергия с Маркетом: +2 репутации в день.',
    monthlyPrice: 500,
    effects: {
      reputationBonus: 0,
    },
  },
  diadoc: {
    id: 'diadoc',
    name: 'Контур.Диадок',
    description: 'Электронный документооборот. Ускоряет поставки: +5% клиентов.',
    monthlyPrice: 1000,
    effects: {
      clientBonus: 0.05,
    },
  },
  fokus: {
    id: 'fokus',
    name: 'Контур.Фокус',
    description: 'Проверка контрагентов. Защита от недобросовестных поставщиков: +1 репутации/день.',
    monthlyPrice: 1000,
    effects: {
      reputationBonus: 1,
    },
  },
  elba: {
    id: 'elba',
    name: 'Контур.Эльба',
    description: 'Онлайн-бухгалтерия. Оптимизирует управление персоналом: +2 лояльности/день, снижает штрафы перегрузки.',
    monthlyPrice: 1500,
    effects: {
      loyaltyBonus: 2,
    },
  },
  extern: {
    id: 'extern',
    name: 'Контур.Экстерн',
    description: 'Сдача отчётности онлайн. Снижает налоговую нагрузку на 2%.',
    monthlyPrice: 2000,
    effects: {
      taxSaving: 0.02,
    },
  },
}

export const SYNERGIES_CONFIG: SynergyBonus[] = [
  {
    id: 'market_ofd',
    name: 'Кассовый порядок',
    description: 'Маркет + ОФД: +2 репутации в день',
    requiredServices: ['market', 'ofd'],
    effects: { reputationBonus: 2 },
  },
  {
    id: 'market_diadoc',
    name: 'Цепочка поставок',
    description: 'Маркет + Диадок: +10% к пропускной способности',
    requiredServices: ['market', 'diadoc'],
    effects: { capacityBonus: 0.1 },
  },
  {
    id: 'bank_elba',
    name: 'Финансовый контроль',
    description: 'Банк + Эльба: +5% к выручке',
    requiredServices: ['bank', 'elba'],
    effects: { revenueBonus: 0.05 },
  },
  {
    id: 'fokus_diadoc',
    name: 'Надёжный контрагент',
    description: 'Фокус + Диадок: +5% клиентов от репутации надёжности',
    requiredServices: ['fokus', 'diadoc'],
    effects: { clientBonus: 0.05 },
  },
  {
    id: 'extern_bank',
    name: 'Налоговая оптимизация',
    description: 'Экстерн + Банк: дополнительные -1% налогов',
    requiredServices: ['extern', 'bank'],
    effects: { taxSaving: 0.01 },
  },
  {
    id: 'elba_extern',
    name: 'Полная бухгалтерия',
    description: 'Эльба + Экстерн: +2 лояльности в день',
    requiredServices: ['elba', 'extern'],
    effects: { loyaltyBonus: 2 },
  },
  {
    id: 'full_kontour',
    name: 'Полный Контур',
    description: 'Все 7 сервисов активны: +15% к выручке и +1 репутации/день',
    requiredServices: ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'],
    effects: { revenueBonus: 0.15, reputationBonus: 1 },
  },
]

export const ECONOMY_CONSTANTS = {
  // Rates (same)
  TAX_RATE: 0.06,
  EXPIRY_LOSS_RATE: 0.8,
  EXPIRY_LOSS_RATE_WITH_MARKET: 0.64,
  PURCHASE_TRIGGER_DAYS: 3,
  DEFAULT_BATCH_SIZE: 48,
  DEFAULT_UNIT_COST: 5,

  // Week-based cycles
  MONTHLY_CYCLE_WEEKS: 4,  // ~30 days = 4 weeks

  // Constants (max values)
  MAX_REPUTATION: 100,
  MIN_REPUTATION: 0,
  MAX_LOYALTY: 100,
  MIN_LOYALTY: 0,
  MAX_ENTREPRENEURIAL_ENERGY: 100,

  // Thresholds
  REPUTATION_ZERO_WEEKS_FOR_LOSS: 6,  // ~1.5 months
  OVERLOAD_THRESHOLD: 0.9,
  OVERLOAD_DAYS_FOR_LOYALTY_PENALTY: 3,
  LOYALTY_PENALTY_PER_DAY: 10,
  LOYALTY_BONUS_PREMIUM: 15,
  PREMIUM_COST_RATE: 0.05,

  // Victory conditions (annual)
  VICTORY_WEEKLY_PROFIT: 15000,  // ~2100/day
  VICTORY_BALANCE: 200000,  // Realistic for year 1
  VICTORY_LEVEL: 10,
  VICTORY_ACHIEVEMENTS: 7,

  // Experience
  EXPERIENCE_PER_WEEK: 7,
  EXPERIENCE_PER_10K_PROFIT: 2,

  // Weekly utilities and maintenance
  DAILY_UTILITIES: 500,
  DAILY_REGISTER_MAINTENANCE: 300,
  WEEKS_BALANCE_NEGATIVE_FOR_GAMEOVER: 3,  // If balance negative for 3+ weeks

  // Entrepreneur energy mechanics
  ENERGY_COST_BASE_OPERATION: 15,  // Per operation (buy stock, change category, etc)
  ENERGY_COST_PURCHASE: 25,
  ENERGY_COST_PROMO: 20,
  ENERGY_WEEKLY_RESTORE: 100,  // Full restore at week start

  // Service energy reduction
  ENERGY_REDUCTION_BANK: 0.3,      // 30% cost reduction
  ENERGY_REDUCTION_OFD: 0.2,       // 20% cost reduction
  ENERGY_REDUCTION_DIADOC: 0.25,   // 25% cost reduction
  ENERGY_REDUCTION_ELBA: 0.35,     // 35% cost reduction
  ENERGY_COST_ZERO_THRESHOLD: 5,   // Minimum cost

  // Competitor event (week-based)
  COMPETITOR_EVENT_WEEK: 3,
  COMPETITOR_TRAFFIC_STEAL_PCT: 0.15,
  COMPETITOR_EFFECT_WEEKS: 2,

  // Year-based achievements
  TOTAL_WEEKS_PER_YEAR: 52,
  SURVIVAL_YEAR_ACHIEVEMENT: 'survival_year_one',
} as const

export const LEVEL_TABLE: Array<{ level: number; expRequired: number }> = [
  { level: 1, expRequired: 0 },
  { level: 2, expRequired: 100 },
  { level: 3, expRequired: 200 },
  { level: 4, expRequired: 350 },
  { level: 5, expRequired: 500 },
  { level: 6, expRequired: 650 },
  { level: 7, expRequired: 750 },
  { level: 8, expRequired: 850 },
  { level: 9, expRequired: 930 },
  { level: 10, expRequired: 1000 },
]

export const MONTHLY_EXPENSES: Record<BusinessType, { rent: number; baseSalary: number }> = {
  shop: { rent: 15000, baseSalary: 20000 },
  cafe: { rent: 15000, baseSalary: 20000 },
  'beauty-salon': { rent: 15000, baseSalary: 20000 },
}

export const AD_CAMPAIGNS_CONFIG = [
  { id: 'promo', name: 'Промо-акция', duration: 10, cost: 3000, clientEffect: 0.25, checkEffect: -0.2 },
  { id: 'happy-hours', name: 'Счастливые часы', duration: 10, cost: 2500, clientEffect: 0.2, checkEffect: -0.15, businessTypes: ['cafe'] as const },
  { id: 'yandex-direct', name: 'Яндекс.Директ', duration: 30, cost: 8000, clientEffect: 0.15, checkEffect: 0 },
  { id: 'leaflets', name: 'Флаеры', duration: 7, cost: 1500, clientEffect: 0.1, checkEffect: 0 },
  { id: 'social-media', name: 'Соцсети', duration: 14, cost: 4000, clientEffect: 0.12, checkEffect: 0 },
  { id: 'loyalty-card', name: 'Карта лояльности', duration: 30, cost: 5000, clientEffect: 0.08, checkEffect: 0.05 },
  { id: 'instagram', name: 'Instagram', duration: 14, cost: 4000, clientEffect: 0.1, checkEffect: 0, businessTypes: ['cafe', 'beauty-salon'] as const },
  { id: 'vk-ads', name: 'VK Реклама', duration: 30, cost: 5000, clientEffect: 0.1, checkEffect: 0 },
  { id: 'smm-salon', name: 'SMM для салона', duration: 20, cost: 4500, clientEffect: 0.13, checkEffect: 0.05, businessTypes: ['beauty-salon'] as const },
  { id: 'coworking', name: 'Кооперация с коворкингом', duration: 20, cost: 5000, clientEffect: 0.08, checkEffect: 0, businessTypes: ['cafe'] as const },
] as const

export const UPGRADES_CONFIG = [
  { id: 'hall-expansion', name: 'Расширение зала', cost: 50000, capacityBonus: 0.4, monthlyRentIncrease: 15000, clientPenaltyDays: 5, clientPenaltyAmount: 0.3 },
  { id: 'hire-admin', name: 'Наём администратора', cost: 10000, capacityBonus: 0.2, monthlySalaryIncrease: 5000 },
  { id: 'premium-categories', name: 'Премиум-категории', cost: 30000, checkBonus: 0.15, requiredService: 'market' },
] as const
