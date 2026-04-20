import { useGameStore } from '../stores/gameStore'
import type { BusinessType, ServiceType, DayResult, Event, AdCampaign, StockBatch, Upgrade } from '../types/game'
import { SERVICES_CONFIG, UPGRADES_CONFIG, AD_CAMPAIGNS_CONFIG, BUSINESS_CONFIGS, ECONOMY_CONSTANTS } from '../constants/business'

export class GameStateService {
  /**
   * Complete day transition with all necessary updates
   */
  static processNextDay(dayResult: DayResult, pendingEvent: Event | null) {
    const store = useGameStore.getState()

    // Update core metrics
    store.setBalance(dayResult.balance)
    store.setReputation(Math.max(0, Math.min(100, store.reputation + dayResult.reputationChange)))
    store.setLoyalty(store.loyalty + dayResult.loyaltyChange)

    // Update experience
    const expGain = ECONOMY_CONSTANTS.EXPERIENCE_PER_WEEK + Math.floor(dayResult.netProfit / 10000)
    store.addExperience(expGain)

    // Store day result
    store.setLastDayResult(dayResult)

    // Process event if present
    if (pendingEvent) {
      store.setPendingEvent(pendingEvent)
    }

    // Advance day
    store.nextDay()

    // Update temporary modifiers
    store.decrementModifierDays()

    // Decrease ad campaign durations
    store.activeAdCampaigns.forEach((campaign) => {
      const newDaysRemaining = campaign.daysRemaining - 1
      if (newDaysRemaining <= 0) {
        store.removeAdCampaign(campaign.id)
      } else {
        store.updateAdCampaignDays(campaign.id, newDaysRemaining)
      }
    })

    // Check victory/game over conditions
    GameStateService.checkGameConditions()
  }

  /**
   * Check victory and game over conditions
   */
  static checkGameConditions() {
    const store = useGameStore.getState()

    if (store.isGameOver || store.isVictory) return

    // Victory conditions
    const dailyProfit = store.lastDayResult?.netProfit ?? 0
    const meetsDaily = dailyProfit >= ECONOMY_CONSTANTS.VICTORY_WEEKLY_PROFIT
    const meetsBalance = store.balance >= ECONOMY_CONSTANTS.VICTORY_BALANCE
    const meetsLevel = store.level >= ECONOMY_CONSTANTS.VICTORY_LEVEL
    const meetsAchievements = store.achievements.length >= ECONOMY_CONSTANTS.VICTORY_ACHIEVEMENTS

    if (meetsDaily && meetsBalance && meetsLevel && meetsAchievements) {
      store.setVictory(true)
    }

    // Game over conditions
    if (store.balance < 0) {
      store.setGameOver(true, 'Банкротство')
    }

    if (store.reputation <= 0 && store.daysReputationZero >= ECONOMY_CONSTANTS.REPUTATION_ZERO_WEEKS_FOR_LOSS) {
      store.setGameOver(true, 'Репутация полностью уничтожена')
    }

    if (store.consecutiveOverloadDays >= 7) {
      store.setGameOver(true, 'Слишком много дней перегруза')
    }
  }

  /**
   * Activate a Kontour service
   */
  static async activateService(serviceId: ServiceType): Promise<boolean> {
    const store = useGameStore.getState()
    const service = store.services[serviceId]
    const currentBalance = store.balance

    if (!service) return false
    if (service.isActive) return false

    // Check balance for first month
    if (currentBalance < service.monthlyPrice) {
      return false
    }

    store.activateService(serviceId)
    return true
  }

  /**
   * Deactivate a Kontour service
   */
  static deactivateService(serviceId: ServiceType) {
    const store = useGameStore.getState()
    store.deactivateService(serviceId)
  }

  /**
   * Purchase an upgrade
   */
  static async purchaseUpgrade(upgradeId: string): Promise<boolean> {
    const store = useGameStore.getState()

    const allUpgrades = Object.values(UPGRADES_CONFIG).flat()
    const upgrade = allUpgrades.find((u) => u.id === upgradeId) as Upgrade | undefined
    if (!upgrade) return false
    if (store.hasPurchasedUpgrade(upgradeId)) return false

    // Check required service
    if (upgrade.requiredService && !store.hasService(upgrade.requiredService as ServiceType)) {
      return false
    }

    // Check balance
    if (store.balance < upgrade.cost) {
      return false
    }

    store.setBalance(store.balance - upgrade.cost)
    store.purchaseUpgrade(upgradeId)

    // Apply upgrade effects to capacity
    if (upgrade.capacityBonus) {
      store.setCapacity(store.capacity * (1 + upgrade.capacityBonus))
    }

    return true
  }

  /**
   * Launch an ad campaign
   */
  static async launchAdCampaign(campaignId: string): Promise<boolean> {
    const store = useGameStore.getState()

    const campaignConfig = AD_CAMPAIGNS_CONFIG.find((c) => c.id === campaignId)
    if (!campaignConfig) return false

    // Check balance
    if (store.balance < campaignConfig.cost) {
      return false
    }

    // Check business type compatibility
    if ('businessTypes' in campaignConfig && campaignConfig.businessTypes) {
      if (!(campaignConfig.businessTypes as readonly string[]).includes(store.businessType)) {
        return false
      }
    }

    // Prevent duplicate active campaigns
    if (store.activeAdCampaigns.some((c) => c.id === campaignId)) {
      return false
    }

    store.setBalance(store.balance - campaignConfig.cost)

    const campaign: AdCampaign = {
      id: campaignConfig.id,
      name: campaignConfig.name,
      duration: campaignConfig.duration,
      cost: campaignConfig.cost,
      clientEffect: campaignConfig.clientEffect,
      checkEffect: campaignConfig.checkEffect,
      businessTypes: 'businessTypes' in campaignConfig ? Array.from(campaignConfig.businessTypes as readonly string[]) as any : undefined,
      daysRemaining: campaignConfig.duration,
    }

    store.addAdCampaign(campaign)
    return true
  }

  /**
   * Add stock/inventory
   */
  static addStock(quantity: number, costPerUnit: number, expirationDays: number): string {
    const store = useGameStore.getState()
    const batchId = `batch_${Date.now()}_${Math.random()}`

    const batch: StockBatch = {
      id: batchId,
      quantity,
      costPerUnit,
      dayReceived: store.currentWeek * 7 + store.dayOfWeek,
      expirationDays,
    }

    store.addStockBatch(batch)
    return batchId
  }

  /**
   * Resolve a pending event with a chosen option
   */
  static resolveEvent(optionId: string) {
    const store = useGameStore.getState()
    const event = store.pendingEvent

    if (!event) return

    const option = event.options.find((o) => o.id === optionId)
    if (!option) return

    // Apply consequences
    if (option.consequences.balanceDelta !== undefined) {
      store.addBalance(option.consequences.balanceDelta)
    }
    if (option.consequences.reputationDelta !== undefined) {
      store.addReputation(option.consequences.reputationDelta)
    }
    if (option.consequences.loyaltyDelta !== undefined) {
      store.addLoyalty(option.consequences.loyaltyDelta)
    }

    // Handle service offers
    if (option.consequences.serviceId) {
      const service = option.consequences.serviceId
      if (!store.hasService(service)) {
        store.activateService(service)
      }
    }

    // Apply temporary modifiers — accumulate on top of existing values
    if (option.consequences.clientModifier !== undefined) {
      store.setTemporaryModifiers(
        (store.temporaryClientMod ?? 0) + option.consequences.clientModifier,
        store.temporaryCheckMod ?? 0,
        Math.max(store.temporaryModDaysLeft ?? 0, option.consequences.clientModifierDays ?? 1),
      )
    }

    if (option.consequences.checkModifier !== undefined) {
      store.setTemporaryModifiers(
        store.temporaryClientMod ?? 0,
        (store.temporaryCheckMod ?? 0) + option.consequences.checkModifier,
        Math.max(store.temporaryModDaysLeft ?? 0, option.consequences.checkModifierDays ?? 1),
      )
    }

    // Mark as resolved
    store.markEventAsResolved(event.id)
  }

  /**
   * Start a new game
   */
  static startNewGame(businessType: BusinessType) {
    const store = useGameStore.getState()
    store.startNewGame(businessType)
  }

  /**
   * Get game statistics for debugging/testing
   */
  static getGameStats() {
    const store = useGameStore.getState()

    return {
      week: store.currentWeek,
      balance: store.balance,
      reputation: store.reputation,
      loyalty: store.loyalty,
      level: store.level,
      experience: store.experience,
      achievements: store.achievements.length,
      activeServices: store.getActiveServiceIds().length,
      totalSubscriptionCost: store.getTotalSubscriptionCost(),
      isGameOver: store.isGameOver,
      isVictory: store.isVictory,
      gameOverReason: store.gameOverReason,
    }
  }
}
