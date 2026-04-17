import { useCallback } from 'react'
import { useGameStore, loadGameFromStorage } from '../stores/gameStore'

export const useGameState = () => {
  const state = useGameStore()

  return {
    // State
    ...state,

    // Utility methods (delegate to store)
    getActivatedServices: useCallback(() => state.getActivatedServices(), [state]),
    getActiveServiceIds: useCallback(() => state.getActiveServiceIds(), [state]),
    getTotalSubscriptionCost: useCallback(() => state.getTotalSubscriptionCost(), [state]),
    hasService: useCallback((serviceId) => state.hasService(serviceId), [state]),
    hasPurchasedUpgrade: useCallback((upgradeId) => state.hasPurchasedUpgrade(upgradeId), [state]),
    hasAchievement: useCallback((achievementId) => state.hasAchievement(achievementId), [state]),
    getActiveAdCampaign: useCallback((campaignId) => state.getActiveAdCampaign(campaignId), [state]),
    getTotalAdCampaignsCost: useCallback(() => state.getTotalAdCampaignsCost(), [state]),
    getTotalStockValue: useCallback(() => state.getTotalStockValue(), [state]),
    getTotalStockQuantity: useCallback(() => state.getTotalStockQuantity(), [state]),
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
