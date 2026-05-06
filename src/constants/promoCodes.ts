import type { ServiceType } from '../types/game'

export interface PromoCodeData {
  code: string
  offerText: string
  serviceIcon: string
  serviceName: string
}

// Three flagship promos — one per major pain point: Bank (cashflow),
// Market (operations), Elba (taxes). Other services activate normally
// without a promo popup. Three keeps the reward feeling distinct without
// a wall of code-redemption modals.
export const PROMO_CODE_DATA: Partial<Record<ServiceType, PromoCodeData>> = {
  bank: {
    code: 'GAME-BANK-2026',
    offerText: 'Бесплатное открытие расчётного счёта',
    serviceIcon: '🏦',
    serviceName: 'Контур.Банк',
  },
  market: {
    code: 'GAME-MARKET-2026',
    offerText: '1 месяц бесплатного использования',
    serviceIcon: '🛒',
    serviceName: 'Контур.Маркет',
  },
  elba: {
    code: 'GAME-ELBA-2026',
    offerText: '3 месяца бесплатной бухгалтерии',
    serviceIcon: '📊',
    serviceName: 'Контур.Эльба',
  },
}

export const PROMO_SERVICES: ServiceType[] = ['bank', 'market', 'elba']
