import { describe, it, expect } from 'vitest'
import {
  computeTransitionEvents,
  snapshotFromState,
  type AnalyticsSnapshot,
} from '../analyticsBridge'

const base: AnalyticsSnapshot = {
  week: 1,
  isVictory: false,
  isGameOver: false,
  victoryType: null,
  balance: 80000,
  activeServices: [],
}

describe('snapshotFromState', () => {
  it('derives active services from the services map', () => {
    const snap = snapshotFromState({
      currentWeek: 3,
      balance: 50000,
      services: {
        market: { isActive: true },
        bank: { isActive: false },
        ofd: { isActive: true },
      },
    })
    expect(snap.week).toBe(3)
    expect(snap.activeServices.sort()).toEqual(['market', 'ofd'])
  })
})

describe('computeTransitionEvents', () => {
  it('emits nothing when nothing changed', () => {
    expect(computeTransitionEvents(base, base)).toEqual([])
  })

  it('emits week.completed when the week advances', () => {
    const next = { ...base, week: 2, balance: 90000 }
    const events = computeTransitionEvents(base, next)
    expect(events).toContainEqual({
      name: 'game.week.completed',
      data: { week: 2, balance: 90000 },
    })
  })

  it('emits victory with type and balance', () => {
    const next = { ...base, isVictory: true, victoryType: 'combined', week: 52, balance: 1200000 }
    const events = computeTransitionEvents(base, next)
    expect(events).toContainEqual({
      name: 'game.victory',
      data: { week: 52, type: 'combined', balance: 1200000 },
    })
  })

  it('emits defeat with reason, but not when the run was a victory', () => {
    const defeat = computeTransitionEvents(base, {
      ...base, isGameOver: true, gameOverReason: 'bankruptcy', week: 13,
    })
    expect(defeat.map(e => e.name)).toContain('game.defeat')

    const victoryRun = computeTransitionEvents(base, {
      ...base, isGameOver: true, isVictory: true, week: 52,
    })
    expect(victoryRun.map(e => e.name)).not.toContain('game.defeat')
  })

  it('emits service.activated / deactivated on membership changes', () => {
    const activated = computeTransitionEvents(base, { ...base, activeServices: ['market'] })
    expect(activated).toContainEqual({ name: 'service.activated', data: { service: 'market' } })

    const deactivated = computeTransitionEvents(
      { ...base, activeServices: ['market'] },
      { ...base, activeServices: [] },
    )
    expect(deactivated).toContainEqual({ name: 'service.deactivated', data: { service: 'market' } })
  })
})
