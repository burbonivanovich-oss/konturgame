import type { ServiceType } from '../types/game'

export interface PromoCodeData {
  code: string
  offerText: string
  serviceIcon: string
  serviceName: string
}

export const PROMO_CODE_DATA: Record<ServiceType, PromoCodeData> = {
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
  ofd: {
    code: 'GAME-OFD-2026',
    offerText: '3 месяца бесплатной передачи данных',
    serviceIcon: '📄',
    serviceName: 'Контур.ОФД',
  },
  diadoc: {
    code: 'GAME-DIADOC-2026',
    offerText: '50 исходящих документов бесплатно',
    serviceIcon: '📁',
    serviceName: 'Контур.Диадок',
  },
  fokus: {
    code: 'GAME-FOKUS-2026',
    offerText: '14 дней бесплатного доступа к базе контрагентов',
    serviceIcon: '🔍',
    serviceName: 'Контур.Фокус',
  },
  elba: {
    code: 'GAME-ELBA-2026',
    offerText: '3 месяца бесплатной бухгалтерии',
    serviceIcon: '📊',
    serviceName: 'Контур.Эльба',
  },
  extern: {
    code: 'GAME-EXTERN-2026',
    offerText: 'Первая сдача отчётности бесплатно',
    serviceIcon: '⚖️',
    serviceName: 'Контур.Экстерн',
  },
}

export const BUNDLE_PROMO_CODE = 'GAME-BUNDLE-2026'
export const BUNDLE_PROMO_OFFER = 'Скидка 20% на годовую подписку любых 3 сервисов Контура'
