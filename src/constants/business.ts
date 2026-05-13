import type { BusinessType, ServiceType, BusinessConfig, SynergyBonus } from '../types/game'

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  shop: {
    type: 'shop',
    startBalance: 80000,
    baseClients: 17,
    avgCheck: 112,
    capacity: 35,
    hasStock: true,
    stockExpiry: 10,
    seasonality: {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0.05, '8': 0.05, '9': 0, '10': 0, '11': 0, '12': 0.10,  // декабрь = праздничный поток
    },
    mainService: 'market',
    monthlyRent: 50000,
    monthlyBaseSalary: 40000,
    usesAssortment: true,
  },
  cafe: {
    type: 'cafe',
    startBalance: 80000,
    baseClients: 18,
    avgCheck: 90,
    capacity: 40,
    hasStock: true,
    stockExpiry: 7,
    // Декабрь стал +0.20 (корпоративы) — было ошибочно −0.15.
    seasonality: {
      '1': -0.10, '2': -0.10, '3': 0, '4': 0, '5': 0,
      '6': 0.22, '7': 0.22, '8': 0.22, '9': 0, '10': 0, '11': 0.05, '12': 0.20,
    },
    mainService: 'market',
    monthlyRent: 60000,
    monthlyBaseSalary: 50000,
    usesAssortment: true,
  },
  'beauty-salon': {
    type: 'beauty-salon',
    startBalance: 80000,
    // 9 clients × 400₽ × 7 = 25.2k weekly base. Was 11 — but with margin fix
    // and smoothed monthly bill, salon was running at +30K/wk on bank-only
    // (richest of the three businesses by far). Pulled back so salon and cafe
    // are roughly equally profitable on tier 1.
    baseClients: 9,
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
    acquiringRate?: number
  }
}

export const SERVICES_CONFIG: Record<ServiceType, ServiceConfig> = {
  market: {
    id: 'market',
    name: 'Контур.Маркет',
    // В жизни Маркет = автоматизация учёта, ЕГАИС/маркировка, быстрая касса.
    // Прямые эффекты: пропускная (быстрая касса) и защита от списаний (точный учёт,
    // ЕГАИС/маркировка). Чек убран — он зависит от ассортимента, а не учётной системы.
    description: 'Автоматизация торговли: учёт товаров, ЕГАИС, маркировка. +20% к пропускной способности кассы и -50% потерь на просрочке (точный учёт + контроль сроков).',
    annualPrice: 24000,
    effects: {
      capacityBonus: 0.2,
      writeOffReduction: 0.2,
    },
  },
  bank: {
    id: 'bank',
    name: 'Контур.Банк',
    // В жизни Банк = эквайринг (40% клиентов хотят платить картой) + быстрые
    // расчёты + кредиты МСБ. creditRate удалён — займы используют свои ставки,
    // эффект был декларативным.
    description: 'Эквайринг: терминал бесплатно, комиссия 1.5% с безнала. Без банка 40% клиентов уходят — нечем платить. Кредитная линия для оборотных средств.',
    annualPrice: 0,
    effects: {
      acquiringRate: 0.015,
      energyReduction: 0.3,
    },
  },
  ofd: {
    id: 'ofd',
    name: 'Контур.ОФД',
    // В жизни ОФД = передача чеков в ФНС по 54-ФЗ (без него работать с кассой
    // запрещено). Главная ценность — соответствие закону + аналитика чеков.
    // Прямой бонус: точная фискализация → меньше ошибок в декларации (-0.5%).
    description: 'Оператор фискальных данных по 54-ФЗ: онлайн-передача чеков в ФНС. Точная фискализация снижает налоговую нагрузку на 0.5%. Защищает от штрафов налоговой за нарушения кассовой дисциплины.',
    annualPrice: 12000,
    effects: {
      taxSaving: 0.005,
    },
  },
  diadoc: {
    id: 'diadoc',
    name: 'Контур.Диадок',
    // В жизни Диадок = ЭДО, обмен документами с поставщиками за минуты вместо
    // дней. Клиентов это не привлекает — но ускоряет признание расходов
    // (закрывающие документы приходят сразу) и экономит на бумаге/курьерах.
    description: 'Электронный документооборот: подписание документов с поставщиками за минуты вместо дней. Ускорение оборота расходов снижает налоговую нагрузку на 0.5%. Защищает от штрафов за бумажный документооборот.',
    annualPrice: 24000,
    effects: {
      taxSaving: 0.005,
    },
  },
  fokus: {
    id: 'fokus',
    name: 'Контур.Фокус',
    // В жизни Фокус = проверка контрагентов до сделки. Не привлекает клиентов
    // и не повышает чек — снижает риск работы с мошенниками/банкротами.
    // Репутация надёжного партнёра — единственный «прямой» бонус.
    description: 'Проверка контрагентов: данные о компаниях, риск банкротства, налоговые задолженности. Репутация надёжного партнёра: +1 репутации/день. Защищает от плохих поставщиков (потери до 10% баланса).',
    annualPrice: 24000,
    effects: {
      reputationBonus: 1,
    },
  },
  elba: {
    id: 'elba',
    name: 'Контур.Эльба',
    // В жизни Эльба = онлайн-бухгалтерия для ИП на УСН. Считает налоги, готовит
    // отчётность. Лояльность сотрудников она не повышает (нелогично).
    // Реальная ценность: точный расчёт УСН + экономия на бухгалтере (-35% энергии).
    description: 'Онлайн-бухгалтерия: расчёт УСН, отчётность ФНС/ПФР, кадровый учёт. Точный расчёт налогов снижает нагрузку на 0.5%. Экономит время предпринимателя (-35% энергии на операции). Защищает от штрафов за ошибки в декларации.',
    annualPrice: 36000,
    effects: {
      taxSaving: 0.005,
      energyReduction: 0.35,
    },
  },
  extern: {
    id: 'extern',
    name: 'Контур.Экстерн',
    description: 'Сдача отчётности онлайн в ФНС/ПФР/ФСС/Росстат. Своевременная отчётность позволяет применять налоговые льготы и снижает нагрузку на 2%. Защищает от блокировки счёта за непoданный отчёт.',
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
    // Эльба считает, Экстерн отправляет — точно и вовремя.
    // -0.5% налогов поверх индивидуальных эффектов сервисов.
    description: 'Эльба + Экстерн: точный расчёт + своевременная отчётность = -0.5% налогов',
    requiredServices: ['elba', 'extern'],
    effects: { taxSaving: 0.005 },
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
  // VICTORY_LEVEL: 10 — удалено вместе с player level в Спринте 4.
  // Combined-победа теперь требует tier 3, не level 10.
  VICTORY_ACHIEVEMENTS: 7,

  // EXPERIENCE_PER_WEEK / EXPERIENCE_PER_10K_PROFIT удалены вместе с
  // системой player level в Спринте 4. Прогрессия теперь через
  // currentWeek + businessTier.

  // Reverted to pre-tier values: were bumped during the 90% margin era.
  // With realistic 15-40% margins, these were eating tier-1 income.
  DAILY_UTILITIES: 500,
  DAILY_REGISTER_MAINTENANCE: 300,
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

// LEVEL_TABLE удалена вместе с системой player level в Спринте 4.

// Tier-1 baseline. Tier upgrades multiply these via getEffectiveRent/Salary.
// Reduced from earlier values: at original 50K/40K shop the player was just
// breaking even with 3 services + all categories — felt like treading water.
// Now there's headroom for early-game without forcing all 7 services.
export const MONTHLY_EXPENSES: Record<BusinessType, { rent: number; baseSalary: number }> = {
  // Спринт 5 ребаланс: цель — 50-60% win rate любым бизнесом, лёгкое
  // начало (W1-10), плавный ramp (W11-20).
  shop:           { rent: 22000, baseSalary: 16000 },
  cafe:           { rent: 38000, baseSalary: 28000 },
  // Спринт 5b: салон зарабатывает заметно больше на чек×клиента (400×9
  // против 112×17 / 90×18), поэтому при равных расходах он доминировал
  // в симуляции (8/10 побед против 4-6 у других). Поднимаем rent на 4k.
  'beauty-salon': { rent: 40000, baseSalary: 34000 },
}

/**
 * Множитель фиксированных расходов по неделе. Реализует «лёгкое начало —
 * плавный ramp — полная стоимость»:
 *   W1-10:   ×0.65 — sandbox-mode, новичок учится
 *   W11-20:  линейный rampup от 0.65 → 1.02
 *   W21+:    ×1.02 — полная стоимость (аренда/рынок чуть давит сильнее)
 */
export function getExpenseMultiplier(currentWeek: number): number {
  if (currentWeek <= 10) return 0.65
  if (currentWeek >= 21) return 1.02
  // 11..20: линейная интерполяция 0.65 → 1.02
  const t = (currentWeek - 10) / 10
  return 0.65 + 0.37 * t
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
  // Зависимости — UI рисует бэдж «требует X» с галочкой/крестом.
  // Если апгрейд купить раньше зависимости, его эффект всё равно начисляется
  // (механика не блокируется), но категория/связанная фича не откроется,
  // пока требование не выполнено. Бэдж предупреждает игрока заранее.
  requiresUpgrade?: string
  requiresServices?: ServiceType[]
}>> = {
  shop: [
    // Equipment that gates categories
    { id: 'cold-case', name: '❄️ Холодильная витрина', cost: 40000, effect: 'Открывает молочку, +10% вместимость', capacityBonus: 0.1 },
    { id: 'freezer', name: '🧊 Морозильник', cost: 60000, effect: 'Открывает мясо/рыбу при наличии холодильной витрины', capacityBonus: 0.05, requiresUpgrade: 'cold-case' },
    { id: 'liquor-cabinet', name: '🍷 Алкошкаф с замком', cost: 50000, effect: 'Открывает алкогольную лицензию (нужен ОФД+Экстерн)', requiresServices: ['ofd', 'extern'] },
    { id: 'tobacco-display', name: '🚬 Витрина для табака', cost: 35000, effect: 'Открывает табачку (закрытый шкаф по закону)' },
    // General upgrades
    { id: 'cctv', name: '📹 Видеонаблюдение', cost: 65000, effect: '+2% выручка, защита от краж', checkBonus: 0.02, energyBonus: 5 },
    { id: 'pos-terminal', name: '💳 POS-терминал', cost: 75000, effect: '+25% клиентов, удобнее работа', clientBonus: 0.25, checkBonus: 0.05, energyBonus: 4 },
    { id: 'hire-cashier', name: '👥 Наём кассира', cost: 60000, effect: '+50% пропускная способность', capacityBonus: 0.5, monthlySalaryIncrease: 12000, energyBonus: 12 },
    { id: 'hall-expansion', name: '📏 Расширение зала', cost: 120000, effect: '+60% вместимость', capacityBonus: 0.6, monthlyRentIncrease: 15000, energyBonus: 8 },
    { id: 'premium-categories', name: '⭐ Премиум-полка', cost: 70000, effect: '+20% маржа на премиум товарах', checkBonus: 0.15 },
  ],
  cafe: [
    // Equipment that gates categories
    { id: 'espresso-machine', name: '☕ Кофемашина эспрессо', cost: 60000, effect: 'База кафе. +5% выручка, +6 энергии', checkBonus: 0.05, energyBonus: 6 },
    { id: 'oven', name: '🥐 Печь / духовка', cost: 50000, effect: 'Открывает десерты и выпечку', capacityBonus: 0.05 },
    { id: 'kitchen', name: '🍳 Полноценная кухня', cost: 90000, effect: 'Открывает готовую еду (нужен Маркет)', capacityBonus: 0.1, energyBonus: 4, requiresServices: ['market'] },
    { id: 'bar-counter', name: '🍹 Барная стойка', cost: 75000, effect: 'Открывает барную карту (нужны ОФД+Экстерн)', requiresServices: ['ofd', 'extern'] },
    // General upgrades
    { id: 'cooler', name: '❄️ Холодильник', cost: 40000, effect: '+5% вместимость', capacityBonus: 0.05 },
    { id: 'seasonal-menu', name: '🍽️ Сезонное меню', cost: 50000, effect: '+25% выручка летом/весной', checkBonus: 0.1 },
    { id: 'hire-barista', name: '👨‍💼 Наём баристы', cost: 70000, effect: '+40% пропускная способность', capacityBonus: 0.4, monthlySalaryIncrease: 15000, energyBonus: 14 },
    { id: 'summer-terrace', name: '🏕️ Летняя веранда', cost: 110000, effect: '+40% мест летом', capacityBonus: 0.4, monthlyRentIncrease: 12000, energyBonus: 10 },
    // 9-й апгрейд для симметрии с shop/salon (тоже по 9). Аудио-система
    // умеренно повышает средний чек (атмосфера задерживает гостей подольше)
    // и снимает фоновую тишину, что добавляет немного владельческой энергии.
    { id: 'sound-system', name: '🎵 Аудио-система', cost: 45000, effect: '+5% средний чек: атмосфера задерживает гостей', checkBonus: 0.05, energyBonus: 3 },
  ],
  'beauty-salon': [
    // Equipment that gates categories
    { id: 'manicure-station', name: '💅 Станция маникюра', cost: 50000, effect: 'База — открывает базовые услуги полностью. +20% клиентов, +15% маржа', clientBonus: 0.2, checkBonus: 0.15 },
    { id: 'coloring-station', name: '💇 Окрасочная станция', cost: 80000, effect: 'Открывает премиум-услуги (нужен Маркет)', checkBonus: 0.05, requiresServices: ['market'] },
    { id: 'cosmetics-shelf', name: '🛍️ Витрина косметики', cost: 45000, effect: 'Открывает продажу косметики (нужны Маркет+ОФД)', requiresServices: ['market', 'ofd'] },
    { id: 'spa-room', name: '🧖 SPA-комната', cost: 110000, effect: 'Открывает SPA-процедуры', capacityBonus: 0.1, monthlyRentIncrease: 8000 },
    // General upgrades
    { id: 'massage-chair', name: '💆 Массажное кресло', cost: 70000, effect: '+25% клиентов, релаксация', clientBonus: 0.25, energyBonus: 16 },
    { id: 'uv-lamps', name: '💡 УФ-лампы', cost: 55000, effect: '+10% клиентов, безопасность', clientBonus: 0.1, energyBonus: 4 },
    { id: 'crm-system', name: '📊 CRM-система', cost: 60000, effect: '+3% чек, аналитика', checkBonus: 0.03, energyBonus: 8 },
    { id: 'hire-master', name: '👨‍🎓 Наём мастера', cost: 100000, effect: '+50% пропускная способность', capacityBonus: 0.5, monthlySalaryIncrease: 25000, energyBonus: 15 },
    { id: 'vip-room', name: '👑 VIP-кабинет', cost: 140000, effect: '+30% среднего чека', checkBonus: 0.3, monthlyRentIncrease: 15000, energyBonus: 12 },
  ],
}

export function getUpgradesForBusiness(businessType: BusinessType) {
  return UPGRADES_CONFIG[businessType] ?? []
}
