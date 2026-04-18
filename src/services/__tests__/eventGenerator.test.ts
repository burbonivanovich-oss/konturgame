import { describe, it, expect, vi } from 'vitest'
import { generateEvent, applyEventConsequence, EVENTS_DATABASE } from '../eventGenerator'
import type { GameState } from '../../types/game'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    businessType: 'shop',
    currentDay: 1,
    balance: 50000,
    savedBalance: 0,
    reputation: 50,
    loyalty: 60,
    stock: [],
    stockBatches: [],
    capacity: 60,
    services: {} as GameState['services'],
    achievements: [],
    level: 1,
    experience: 0,
    lastDayResult: null,
    pendingEvent: null,
      pendingEventsQueue: [],
    triggeredEventIds: [],
    isGameOver: false,
    isVictory: false,
    consecutiveOverloadDays: 0,
    daysReputationZero: 0,
    daysSinceLastMonthly: 0,
    purchaseOfferedThisDay: false,
    activeAdCampaigns: [],
    purchasedUpgrades: [],
    temporaryClientMod: 0,
    temporaryCheckMod: 0,
    temporaryModDaysLeft: 0,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  }
}

describe('EVENTS_DATABASE', () => {
  it('contains at least 15 events', () => {
    expect(EVENTS_DATABASE.length).toBeGreaterThanOrEqual(15)
  })

  it('each event has at least one option', () => {
    for (const event of EVENTS_DATABASE) {
      expect(event.options.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each event has unique id', () => {
    const ids = EVENTS_DATABASE.map((e) => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('Contour options have isContourOption flag', () => {
    for (const event of EVENTS_DATABASE) {
      for (const opt of event.options) {
        if (opt.requiredService) {
          expect(opt.isContourOption).toBe(true)
        }
      }
    }
  })
})

describe('generateEvent', () => {
  it('returns null when random chance never fires', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState()
    const event = generateEvent(1, state)
    expect(event).toBeNull()
    vi.restoreAllMocks()
  })

  it('returns event when random chance fires', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = makeState({ currentDay: 20 })
    const event = generateEvent(20, state)
    expect(event).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('skips one-time events already triggered', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = makeState({
      currentDay: 20,
      triggeredEventIds: EVENTS_DATABASE.filter((e) => e.trigger.oneTime).map((e) => e.id),
    })
    // With all one-time events triggered and random returning 0, non-one-time events can still fire
    const event = generateEvent(20, state)
    if (event) {
      expect(state.triggeredEventIds).not.toContain(event.id)
    }
    vi.restoreAllMocks()
  })

  it('respects dayMin trigger', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = makeState()
    // TAX01 requires dayMin: 10, we test with day 1 - it should not trigger TAX01
    const event = generateEvent(1, state)
    if (event) {
      expect(event.id).not.toBe('TAX01')
    }
    vi.restoreAllMocks()
  })

  it('respects reputationMax trigger', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    // REVIEW01 has reputationMax: 70, state has reputation 80 → should not trigger
    const state = makeState({ reputation: 80 })
    const event = generateEvent(5, state)
    if (event) {
      expect(event.id).not.toBe('REVIEW01')
    }
    vi.restoreAllMocks()
  })

  it('event has correct structure', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = makeState({ currentDay: 20 })
    const event = generateEvent(20, state)
    if (event) {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('title')
      expect(event).toHaveProperty('description')
      expect(event).toHaveProperty('options')
      expect(event.isResolved).toBe(false)
      expect(event.day).toBe(20)
    }
    vi.restoreAllMocks()
  })
})

describe('applyEventConsequence', () => {
  it('applies balance delta', () => {
    const state = makeState({ balance: 50000 })
    const event = {
      id: 'TAX01',
      day: 10,
      title: 'Tax',
      description: '',
      isResolved: false,
      options: [
        {
          id: 'self',
          text: 'Self',
          consequences: { balanceDelta: -30000 },
        },
      ],
    }
    applyEventConsequence(state, event, 'self')
    expect(state.balance).toBe(20000)
  })

  it('applies reputation delta (clamped to 0-100)', () => {
    const state = makeState({ reputation: 5 })
    const event = {
      id: 'TEST',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [{ id: 'opt', text: '', consequences: { reputationDelta: -10 } }],
    }
    applyEventConsequence(state, event, 'opt')
    expect(state.reputation).toBe(0)
  })

  it('applies loyalty delta (clamped to 0-100)', () => {
    const state = makeState({ loyalty: 95 })
    const event = {
      id: 'TEST',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [{ id: 'opt', text: '', consequences: { loyaltyDelta: 15 } }],
    }
    applyEventConsequence(state, event, 'opt')
    expect(state.loyalty).toBe(100)
  })

  it('sets temporary client modifier', () => {
    const state = makeState()
    const event = {
      id: 'TEST',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [
        {
          id: 'opt',
          text: '',
          consequences: { clientModifier: 0.3, clientModifierDays: 7 },
        },
      ],
    }
    applyEventConsequence(state, event, 'opt')
    expect(state.temporaryClientMod).toBe(0.3)
    expect(state.temporaryModDaysLeft).toBe(7)
  })

  it('marks event as resolved and clears pendingEvent', () => {
    const state = makeState()
    const event = {
      id: 'TEST',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [{ id: 'opt', text: '', consequences: {} }],
    }
    state.pendingEvent = event
    applyEventConsequence(state, event, 'opt')
    expect(event.isResolved).toBe(true)
    expect(state.pendingEvent).toBeNull()
  })

  it('tracks triggered event id', () => {
    const state = makeState()
    const event = {
      id: 'UNIQUE_EVENT',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [{ id: 'opt', text: '', consequences: {} }],
    }
    applyEventConsequence(state, event, 'opt')
    expect(state.triggeredEventIds).toContain('UNIQUE_EVENT')
  })

  it('does nothing for invalid option id', () => {
    const state = makeState({ balance: 50000 })
    const event = {
      id: 'TEST',
      day: 1,
      title: '',
      description: '',
      isResolved: false,
      options: [{ id: 'opt', text: '', consequences: { balanceDelta: -10000 } }],
    }
    applyEventConsequence(state, event, 'nonexistent')
    expect(state.balance).toBe(50000)
  })
})
