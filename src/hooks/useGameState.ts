import { useCallback } from 'react'
import { useGameStore, loadGameFromStorage } from '../stores/gameStore'
import type { ServiceType } from '../types/game'

export const useGameState = () => {
  const state = useGameStore()

  return {
    // State
    ...state,

    // Utility methods — delegate directly (Zustand method refs are stable)
    getActivatedServices: state.getActivatedServices,
    getActiveServiceIds: state.getActiveServiceIds,
    getTotalSubscriptionCost: state.getTotalSubscriptionCost,
    hasService: state.hasService,
    hasPurchasedUpgrade: state.hasPurchasedUpgrade,
    hasAchievement: state.hasAchievement,
    getActiveAdCampaign: state.getActiveAdCampaign,
    getTotalAdCampaignsCost: state.getTotalAdCampaignsCost,
    getTotalStockValue: state.getTotalStockValue,
    getTotalStockQuantity: state.getTotalStockQuantity,
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
