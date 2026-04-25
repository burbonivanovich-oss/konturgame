import type { BusinessType, ServiceType, BusinessConfig, SynergyBonus } from '../types/game'

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  shop: {
    type: 'shop',
    startBalance: 80000,
    baseClients: 15,  // ↓ Было 25
    avgCheck: 100,  // ↓ Было 180
    capacity: 35,
    hasStock: true,
    stockExpiry: 10,
    seasonality: {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0.05, '8': 0.05, '9': 0, '10': 0, '11': 0, '12': 0,
    },
    mainService: 'market',
    monthlyRent: 50000,  // ↑ Было 25000
    monthlyBaseSalary: 40000,  // ↑ Было 15000
    usesAssortment: true,
  },
  cafe: {
    type: 'cafe',
    startBalance: 80000,
    baseClients: 18,  // ↓ Было 30
    avgCheck: 70,  // ↓ Было 150
    capacity: 40,
    hasStock: true,
    stockExpiry: 7,
    seasonality: {
      '1': -0.15, '2': -0.15, '3': 0, '4': 0, '5': 0,
      '6': 0.22, '7': 0.22, '8': 0.22, '9': 0, '10': 0, '11': 0, '12': -0.15,
    },
    mainService: 'market',
    monthlyRent: 60000,  // ↑ Было 30000
    monthlyBaseSalary: 50000,  // ↑ Было 20000
    usesAssortment: true,
  },
  'beauty-salon': {
    type: 'beauty-salon',
    startBalance: 80000,
    // Salon was unwinnable: 6 clients × 400₽ × 7 days = 16.8k weekly revenue vs
    // ~35k weekly expenses → −18.5k/week, bankrupt in 4-5 weeks. Bumping clients
    // to 11 brings weekly revenue to ~30.8k, leaving room to break even.
    baseClients: 11,
    avgCheck: 400,
    capacity: 20,
    hasStock: false,
    stockExpiry: 0,
    seasonality: {
      '1': 0, '2': 0, '3': 0.12, '4': 0.12, '5': 0.12,
      '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
    },
    mainService: 'elba',
    monthlyRent: 45000,
    monthlyBaseSalary: 50000,
    usesAssortment: true,
  },
}

export interface ServiceConfig {
  id: ServiceType
  name: string
  description: string
  annualPrice: number
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

export const SERVICES_CONFIG: Record<ServiceType, ServiceConfig> = {
  market: {
    id: 'market',
    name: 'Контур.Маркет',
    description: 'Автоматизация торговли: +20% пропускной, +15% к чеку, -20% убытков от просрочки. Главное — защита от катастрофических срывов поставок. (В игре цены масштабированы под игровую экономику)',
    // Lowered from 48k → 24k. At 48k the ROI was ~9 weeks vs the 8% revenue
    // protection it provides — too slow to be a meaningful early decision.
    annualPrice: 24000,
    effects: {
      capacityBonus: 0.2,
      checkBonus: 0.15,
      writeOffReduction: 0.2,
    },
  },
  bank: {
    id: 'bank',
    name: 'Контур.Банк',
    description: 'Терминал бесплатно, комиссия 1.5% с оборота. Без банка 40% клиентов уходят — нечем платить. Льготный кредит по ставке 5%.',
    annualPrice: 0,
    effects: {
      creditRate: 0.05,
      energyReduction: 0.3,
      acquiringRate: 0.015,
    },
  },
  ofd: {
    id: 'ofd',
    name: 'Контур.ОФД',
    // OFD now has its own +1 reputation/day, on top of the +1 synergy with
    // Market. Without an own effect it was useless without Market.
    description: 'Онлайн-касса: +1 репутации/день. Синергия с Маркетом: дополнительно +1 репутации/день.',
    annualPrice: 12000,
    effects: {
      reputationBonus: 1,
    },
  },
  diadoc: {
    id: 'diadoc',
    name: 'Контур.Диадок',
    description: 'Электронный документооборот: +2% клиентов. Главное — защита от штрафов за бумажный документооборот (до −30 000 ₽).',
    annualPrice: 24000,
    effects: {
      clientBonus: 0.02,
    },
  },
  fokus: {
    id: 'fokus',
    name: 'Контур.Фокус',
    description: 'Проверка контрагентов: +1 репутации/день, +2% клиентов, +5% к чеку. Главное — защита от мошенников-поставщиков (до −55 000 ₽ потерь).',
    annualPrice: 24000,
    effects: {
      reputationBonus: 1,
      clientBonus: 0.02,
      checkBonus: 0.05,
    },
  },
  elba: {
    id: 'elba',
    name: 'Контур.Эльба',
    description: 'Онлайн-бухгалтерия: +1 лояльности/день. Главное — защита от бунта персонала (до −25 000 ₽ + потеря команды).',
    annualPrice: 36000,
    effects: {
      loyaltyBonus: 1,
    },
  },
  extern: {
    id: 'extern',
    name: 'Контур.Экстерн',
    description: 'Сдача отчётности онлайн. Снижает налоговую нагрузку на 2%. Защищает от блокировки счёта налоговой.',
    // Lowered from 48k → 24k. The −2% tax saving alone gave a ~18-year ROI;
    // the real value is account-block protection (handled in painEngine).
    annualPrice: 24000,
    effects: {
      taxSaving: 0.02,
    },
  },
}

// Market modules (add-ons to Контур.Маркет)
export interface MarketModule {
  id: string
  name: string
  description: string
  annualPrice: number
  requiredService: ServiceType
  effects: {
    categoryUnlock?: string[]
    capacityBonus?: number
    revenueBonus?: number
    taxSaving?: number
  }
}

export const MARKET_MODULES: MarketModule[] = [
  {
    id: 'egais',
    name: 'ЕГАИС',
    description: 'Система учета алкоголя. Разблокирует продажу алкогольных напитков.',
    annualPrice: 36000,  // ↑ Было 18000
    requiredService: 'market',
    effects: {
      categoryUnlock: ['alcohol'],
      revenueBonus: 0.1,
    },
  },
  {
    id: 'merkuriy',
    name: 'Меркурий',
    description: 'Система учета лекарств и БАДов. Разблокирует категорию фармацевтики.',
    annualPrice: 28800,  // ↑ Было 14400
    requiredService: 'market',
    effects: {
      categoryUnlock: ['pharmacy'],
      revenueBonus: 0.08,
    },
  },
  {
    id: 'marking',
    name: 'Маркировка товаров',
    description: 'Система отслеживания маркированных товаров (обувь, табак, парфюм).',
    annualPrice: 19200,  // ↑ Было 9600
    requiredService: 'market',
    effects: {
      categoryUnlock: ['marked_goods'],
      revenueBonus: 0.05,
    },
  },
]

export const SYNERGIES_CONFIG: SynergyBonus[] = [
  {
    id: 'market_ofd',
    name: 'Кассовый порядок',
    description: 'Маркет + ОФД: +1 репутации в день',
    requiredServices: ['market', 'ofd'],
    effects: { reputationBonus: 1 },
  },
  {
    id: 'market_diadoc',
    name: 'Цепочка поставок',
    description: 'Маркет + Диадок: +5% к пропускной способности',
    requiredServices: ['market', 'diadoc'],
    effects: { capacityBonus: 0.05 },
  },
  {
    id: 'bank_elba',
    name: 'Финансовый контроль',
    description: 'Банк + Эльба: +2% к выручке',
    requiredServices: ['bank', 'elba'],
    effects: { revenueBonus: 0.02 },
  },
  {
    id: 'fokus_diadoc',
    name: 'Надёжный контрагент',
    description: 'Фокус + Диадок: +2% клиентов от репутации надёжности',
    requiredServices: ['fokus', 'diadoc'],
    effects: { clientBonus: 0.02 },
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
    description: 'Эльба + Экстерн: +1 лояльности в день',
    requiredServices: ['elba', 'extern'],
    effects: { loyaltyBonus: 1 },
  },
  {
    id: 'full_kontour',
    name: 'Полный Контур',
    description: 'Все 7 сервисов активны: +5% к выручке и +1 репутации/день',
    requiredServices: ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'],
    effects: { revenueBonus: 0.05, reputationBonus: 1 },
  },
]

export const ECONOMY_CONSTANTS = {
  TAX_RATE: 0.06,
  EXPIRY_LOSS_RATE: 0.8,
  EXPIRY_LOSS_RATE_WITH_MARKET: 0.40,
  PURCHASE_TRIGGER_DAYS: 3,
  DEFAULT_BATCH_SIZE: 48,
  DEFAULT_UNIT_COST: 8,  // ↑ Было 5 - дороже товары

  MONTHLY_CYCLE_WEEKS: 4,

  MAX_REPUTATION: 100,
  MIN_REPUTATION: 0,
  MAX_LOYALTY: 100,
  MIN_LOYALTY: 0,
  MAX_ENTREPRENEURIAL_ENERGY: 100,

  REPUTATION_ZERO_WEEKS_FOR_LOSS: 6,
  OVERLOAD_THRESHOLD: 0.9,
  OVERLOAD_DAYS_FOR_LOYALTY_PENALTY: 3,
  LOYALTY_PENALTY_PER_DAY: 10,
  LOYALTY_BONUS_PREMIUM: 15,
  PREMIUM_COST_RATE: 0.08,  // ↑ Было 0.05

  VICTORY_WEEKLY_PROFIT: 20000,  // ↑ Было 10000 - сложнее выиграть
  VICTORY_BALANCE: 500000,  // ↑ Было 150000
  VICTORY_LEVEL: 10,
  VICTORY_ACHIEVEMENTS: 7,

  EXPERIENCE_PER_WEEK: 7,
  EXPERIENCE_PER_10K_PROFIT: 2,

  DAILY_UTILITIES: 800,  // ↑ Было 500
  DAILY_REGISTER_MAINTENANCE: 500,  // ↑ Было 300
  WEEKS_BALANCE_NEGATIVE_FOR_GAMEOVER: 3,

  ENERGY_COST_BASE_OPERATION: 15,
  ENERGY_COST_PURCHASE: 25,
  ENERGY_COST_PROMO: 20,
  ENERGY_WEEKLY_RESTORE: 100,

  ENERGY_REDUCTION_BANK: 0.3,
  ENERGY_REDUCTION_OFD: 0.2,
  ENERGY_REDUCTION_DIADOC: 0.25,
  ENERGY_REDUCTION_ELBA: 0.35,
  ENERGY_COST_ZERO_THRESHOLD: 5,

  COMPETITOR_EVENT_WEEK: 3,
  COMPETITOR_TRAFFIC_STEAL_PCT: 0.15,
  COMPETITOR_EFFECT_WEEKS: 2,

  TOTAL_WEEKS_PER_YEAR: 52,
  SURVIVAL_YEAR_ACHIEVEMENT: 'survival_year_one',

  GOAL_AMOUNT: 1_000_000,
} as const

export const LEVEL_TABLE: Array<{ level: number; expRequired: number }> = [
  { level: 1, expRequired: 0 },
  { level: 2, expRequired: 150 },  // ↑
  { level: 3, expRequired: 300 },  // ↑
  { level: 4, expRequired: 500 },  // ↑
  { level: 5, expRequired: 750 },  // ↑
  { level: 6, expRequired: 1000 },  // ↑
  { level: 7, expRequired: 1300 },  // ↑
  { level: 8, expRequired: 1600 },  // ↑
  { level: 9, expRequired: 1900 },  // ↑
  { level: 10, expRequired: 2500 },  // ↑ Было 1000
]

export const MONTHLY_EXPENSES: Record<BusinessType, { rent: number; baseSalary: number }> = {
  shop: { rent: 50000, baseSalary: 40000 },
  cafe: { rent: 60000, baseSalary: 50000 },
  // Salon: lowered to match BUSINESS_CONFIGS — was unwinnable at 55k+60k.
  'beauty-salon': { rent: 45000, baseSalary: 50000 },
}

export const AD_CAMPAIGNS_CONFIG = [
  { id: 'promo', name: 'Промо-акция', duration: 10, cost: 20000, clientEffect: 0.25, checkEffect: -0.2 },
  { id: 'happy-hours', name: 'Счастливые часы', duration: 10, cost: 15000, clientEffect: 0.2, checkEffect: -0.15, businessTypes: ['cafe'] as const },
  { id: 'yandex-direct', name: 'Яндекс.Директ', duration: 30, cost: 50000, clientEffect: 0.15, checkEffect: 0 },
  { id: 'leaflets', name: 'Флаеры', duration: 7, cost: 12000, clientEffect: 0.1, checkEffect: 0 },
  { id: 'social-media', name: 'Соцсети', duration: 14, cost: 25000, clientEffect: 0.12, checkEffect: 0 },
  { id: 'loyalty-card', name: 'Карта лояльности', duration: 30, cost: 30000, clientEffect: 0.08, checkEffect: 0.05 },
  { id: 'instagram', name: 'Instagram', duration: 14, cost: 25000, clientEffect: 0.1, checkEffect: 0, businessTypes: ['cafe', 'beauty-salon'] as const },
  { id: 'vk-ads', name: 'VK Реклама', duration: 30, cost: 30000, clientEffect: 0.1, checkEffect: 0 },
  { id: 'smm-salon', name: 'SMM для салона', duration: 20, cost: 28000, clientEffect: 0.13, checkEffect: 0.05, businessTypes: ['beauty-salon'] as const },
  { id: 'coworking', name: 'Кооперация с коворкингом', duration: 20, cost: 25000, clientEffect: 0.08, checkEffect: 0, businessTypes: ['cafe'] as const },
] as const

// Max simultaneous active campaigns. Beyond this cap, addAdCampaign is a no-op.
export const MAX_ACTIVE_CAMPAIGNS = 3

// Effectiveness multiplier for each concurrent slot (1st, 2nd, 3rd).
// Discourages stacking: running 3 campaigns is better than 1, but not 3×.
export const CAMPAIGN_DIMINISHING_FACTORS = [1.0, 0.6, 0.3] as const

export const UPGRADES_CONFIG: Record<BusinessType, Array<{
  id: string
  name: string
  cost: number
  effect: string
  capacityBonus?: number
  loyaltyBonus?: number
  clientBonus?: number
  checkBonus?: number
  monthlySalaryIncrease?: number
  monthlyRentIncrease?: number
  energyBonus?: number
}>> = {
  shop: [
    { id: 'cold-case', name: '❄️ Холодильная витрина', cost: 80000, effect: '+3 лояльности/день, расширение ассортимента', loyaltyBonus: 3, capacityBonus: 0.2 },
    { id: 'cctv', name: '📹 Система видеонаблюдения', cost: 65000, effect: '+2% выручка, защита от краж, спокойствие', checkBonus: 0.02, loyaltyBonus: 1, energyBonus: 5 },
    { id: 'pos-terminal', name: '💳 POS-терминал', cost: 75000, effect: '+25% клиентов, приём карт, упрощение работы', clientBonus: 0.25, checkBonus: 0.05, energyBonus: 4 },
    { id: 'hire-cashier', name: '👥 Наём кассира', cost: 60000, effect: '+50% пропускная способность, помощь в работе', capacityBonus: 0.5, monthlySalaryIncrease: 12000, energyBonus: 12 },
    { id: 'hall-expansion', name: '📏 Расширение зала', cost: 120000, effect: '+60% вместимость, удобнее для работы', capacityBonus: 0.6, monthlyRentIncrease: 15000, energyBonus: 8 },
    { id: 'premium-categories', name: '⭐ Премиум-категории', cost: 70000, effect: '+20% маржа на премиум товарах', checkBonus: 0.15 },
  ],
  cafe: [
    { id: 'espresso-machine', name: '☕ Кофемашина эспрессо', cost: 100000, effect: '+5% выручка, новая позиция в меню, автоматизация', checkBonus: 0.05, loyaltyBonus: 2, energyBonus: 6 },
    { id: 'cooler', name: '❄️ Холодильник торговый', cost: 80000, effect: '+2 лояльности, больше ассортимента', loyaltyBonus: 2, capacityBonus: 0.15 },
    { id: 'seasonal-menu', name: '🍽️ Сезонное меню', cost: 50000, effect: '+25% выручка летом/весной', checkBonus: 0.1 },
    { id: 'hire-barista', name: '👨‍💼 Наём баристы', cost: 70000, effect: '+40% пропускная способность, помощь в работе', capacityBonus: 0.4, monthlySalaryIncrease: 15000, energyBonus: 14 },
    { id: 'summer-terrace', name: '🏕️ Летняя веранда', cost: 110000, effect: '+40% мест летом, удобнее для работы', capacityBonus: 0.4, monthlyRentIncrease: 12000, energyBonus: 10 },
    { id: 'dessert-bar', name: '🧁 Десертная стойка', cost: 60000, effect: '+15% среднего чека, упрощение работы', checkBonus: 0.12, energyBonus: 3 },
  ],
  'beauty-salon': [
    { id: 'massage-chair', name: '💆 Массажное кресло', cost: 120000, effect: '+25% клиентов, услуга релаксации и восстановления', clientBonus: 0.25, loyaltyBonus: 3, energyBonus: 16 },
    { id: 'manicure-station', name: '💅 Станция маникюра', cost: 90000, effect: '+20% клиентов, +15% маржа', clientBonus: 0.2, checkBonus: 0.15 },
    { id: 'uv-lamps', name: '💡 УФ-лампы и стерилизация', cost: 70000, effect: '+4 лояльности, безопасность и спокойствие', loyaltyBonus: 4, clientBonus: 0.1, energyBonus: 4 },
    { id: 'crm-system', name: '📊 CRM и управление клиентами', cost: 60000, effect: '+3 лояльности, аналитика, автоматизация', loyaltyBonus: 3, checkBonus: 0.03, energyBonus: 8 },
    { id: 'hire-master', name: '👨‍🎓 Наём мастера', cost: 100000, effect: '+50% пропускная способность, помощь в работе', capacityBonus: 0.5, monthlySalaryIncrease: 25000, energyBonus: 15 },
    { id: 'vip-room', name: '👑 VIP-кабинет', cost: 140000, effect: '+30% среднего чека, место для отдыха владельца', checkBonus: 0.3, monthlyRentIncrease: 15000, energyBonus: 12 },
  ],
}

export function getUpgradesForBusiness(businessType: BusinessType) {
  return UPGRADES_CONFIG[businessType] ?? []
}
