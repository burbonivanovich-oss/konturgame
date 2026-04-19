import type { CashRegisterType } from '../types/game'

export interface CashRegisterConfig {
  type: CashRegisterType
  name: string
  description: string
  cost: number
  throughput: number
  breakdownChance: number
  icon: string
}

export const CASH_REGISTER_CONFIGS: Record<CashRegisterType, CashRegisterConfig> = {
  mobile: {
    type: 'mobile',
    name: 'Мобильная касса',
    description: 'Смартфон + картридер. Подходит для старта. Медленная при большом потоке клиентов.',
    cost: 8000,
    throughput: 20,
    breakdownChance: 0.05,
    icon: '📱',
  },
  reliable: {
    type: 'reliable',
    name: 'Надёжная касса',
    description: 'Стационарный POS. Хорошая скорость и надёжность для среднего бизнеса.',
    cost: 25000,
    throughput: 60,
    breakdownChance: 0.01,
    icon: '🖥️',
  },
  fast: {
    type: 'fast',
    name: 'Быстрая касса',
    description: 'Профессиональный POS с NFC. Максимальная скорость обслуживания и минимум поломок.',
    cost: 55000,
    throughput: 150,
    breakdownChance: 0.005,
    icon: '⚡',
  },
}

export const REGISTER_COMBO_DISCOUNTS = {
  2: 0.1,  // 10% на вторую кассу
  3: 0.15, // 15% на третью кассу
}

// With Kontur.Market active, Fast register gets throughput bonus
export const MARKET_FAST_REGISTER_BONUS = 0.25
