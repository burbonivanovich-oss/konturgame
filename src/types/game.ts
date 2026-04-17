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
  netProfit: number
  balance: number
}

export interface Event {
  id: string
  day: number
  title: string
  description: string
  options: EventOption[]
  isResolved: boolean
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
  }
  hasServiceAlternative?: boolean
}

export interface Stock {
  id: string
  quantity: number
  expiryDate: Date
  cost: number
}

export interface GameState {
  businessType: BusinessType
  currentDay: number
  balance: number
  savedBalance: number
  reputation: number
  loyalty: number

  stock: Stock[]
  capacity: number

  services: Record<ServiceType, Service>
  achievements: string[]
  level: number
  experience: number

  lastDayResult: DayResult | null
  pendingEvent: Event | null

  isGameOver: boolean
  isVictory: boolean
  gameOverReason?: string

  createdAt: number
  lastUpdated: number
}

export interface BusinessConfig {
  type: BusinessType
  baseClients: number
  avgCheck: number
  capacity: number
  hasStock: boolean
  stockExpiry: number
  seasonality: Record<string, number>
  mainService: ServiceType
}
