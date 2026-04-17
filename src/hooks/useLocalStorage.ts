import { useEffect, useCallback } from 'react'
import { loadGameFromStorage, useGameStore } from '../stores/gameStore'

/**
 * Custom hook to synchronize game store with localStorage
 * Loads saved game on mount and auto-saves on changes
 */
export const useLocalStorageSync = () => {
  const store = useGameStore()

  useEffect(() => {
    // Load game from storage on component mount
    const savedGame = loadGameFromStorage()
    if (savedGame) {
      store.loadGame(savedGame)
    }
  }, [store])

  const resetGameData = useCallback(() => {
    localStorage.removeItem('konturgame_state')
    localStorage.removeItem('konturgame_rollback')
  }, [])

  const exportGameData = useCallback(() => {
    const gameData = localStorage.getItem('konturgame_state')
    if (!gameData) return null

    try {
      return JSON.parse(gameData)
    } catch (error) {
      console.error('Failed to export game data:', error)
      return null
    }
  }, [])

  return {
    resetGameData,
    exportGameData,
  }
}

/**
 * Hook to manage game snapshots for testing/debugging
 */
export const useGameSnapshot = () => {
  const store = useGameStore()

  const createSnapshot = useCallback(() => {
    const state = useGameStore.getState()
    const snapshotKey = `snapshot_${Date.now()}`
    localStorage.setItem(snapshotKey, JSON.stringify({
      timestamp: Date.now(),
      day: state.currentDay,
      balance: state.balance,
      reputation: state.reputation,
      loyalty: state.loyalty,
      achievements: state.achievements.length,
      level: state.level,
    }))
    return snapshotKey
  }, [])

  const getSnapshots = useCallback(() => {
    const snapshots = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('snapshot_')) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            snapshots.push({
              key,
              ...JSON.parse(data),
            })
          } catch {
            // skip malformed snapshot entries
          }
        }
      }
    }
    return snapshots.sort((a, b) => b.timestamp - a.timestamp)
  }, [])

  const deleteSnapshot = useCallback((key: string) => {
    localStorage.removeItem(key)
  }, [])

  const clearAllSnapshots = useCallback(() => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('snapshot_')) {
        keys.push(key)
      }
    }
    keys.forEach((key) => localStorage.removeItem(key))
  }, [])

  return {
    createSnapshot,
    getSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
  }
}
