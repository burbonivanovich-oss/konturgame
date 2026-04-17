import { useCallback } from 'react'
import { useGameStore, loadGameFromStorage } from '../stores/gameStore'
import type { GameState, BusinessType, ServiceType, DayResult, Event, AdCampaign, StockBatch } from '../types/game'

export const useGameState = () => {
  const state = useGameStore()

  // Convenience methods
  const getActivatedServices = useCallback(() => {
    return Object.values(state.services).filter((s) => s.isActive)
  }, [state.services])

  const getActiveServiceIds = useCallback((): ServiceType[] => {
    return Object.keys(state.services).filter((key) => state.services[key as ServiceType].isActive) as ServiceType[]
  }, [state.services])

  const getTotalSubscriptionCost = useCallback(() => {
    return getActivatedServices().reduce((sum, service) => sum + service.monthlyPrice, 0)
  }, [getActivatedServices])

  const hasService = useCallback(
    (serviceId: ServiceType) => {
      return state.services[serviceId]?.isActive ?? false
    },
    [state.services]
  )

  const hasPurchasedUpgrade = useCallback(
    (upgradeId: string) => {
      return state.purchasedUpgrades.includes(upgradeId)
    },
    [state.purchasedUpgrades]
  )

  const hasAchievement = useCallback(
    (achievementId: string) => {
      return state.achievements.includes(achievementId)
    },
    [state.achievements]
  )

  const getActiveAdCampaign = useCallback(
    (campaignId: string) => {
      return state.activeAdCampaigns.find((c) => c.id === campaignId)
    },
    [state.activeAdCampaigns]
  )

  const getTotalAdCampaignsCost = useCallback(() => {
    return state.activeAdCampaigns.reduce((sum, campaign) => sum + campaign.cost, 0)
  }, [state.activeAdCampaigns])

  const getTotalStockValue = useCallback(() => {
    return state.stockBatches.reduce((sum, batch) => sum + batch.quantity * batch.costPerUnit, 0)
  }, [state.stockBatches])

  const getTotalStockQuantity = useCallback(() => {
    return state.stockBatches.reduce((sum, batch) => sum + batch.quantity, 0)
  }, [state.stockBatches])

  return {
    // State
    ...state,

    // Utility methods
    getActivatedServices,
    getActiveServiceIds,
    getTotalSubscriptionCost,
    hasService,
    hasPurchasedUpgrade,
    hasAchievement,
    getActiveAdCampaign,
    getTotalAdCampaignsCost,
    getTotalStockValue,
    getTotalStockQuantity,
  }
}

export const useInitializeGame = () => {
  const { startNewGame, loadGame } = useGameStore()

  const initialize = useCallback(() => {
    const savedGame = loadGameFromStorage()
    if (savedGame) {
      loadGame(savedGame)
    }
  }, [loadGame])

  return { initialize, startNewGame }
}
