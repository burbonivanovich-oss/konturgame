import { describe, it, expect } from 'vitest'
import { NPC_ARC_EVENTS } from '../npcArcs'
import { NPC_EVENTS } from '../npcEvents'
import { NPC_DEFINITIONS } from '../npcs'

// Phase D structure tests for the NPC arcs.
//
// Most NPCs follow a 3-episode arc (meet → test → resolve) at weeks
// 5-10 / 20-25 / 35-45. Two exceptions:
//
//   • Gena is intentionally recurring — one arc-meet event, then a pool
//     of "scheme" variants in npcEvents.ts (crypto, NFT, binary options
//     etc.). He is not arc-driven by design.
//   • Tamara has business-type-filtered variants for her meet beat
//     (different hooks for shop / cafe / salon) so the same arc shape
//     produces 5+ entries in NPC_ARC_EVENTS but still 3 episodes per run.
//
// The progression test therefore groups events by (npcId, businessTypes)
// before checking that windows don't overlap.

const RECURRING_NPC_IDS = new Set(['gena'])

function groupKey(e: { npcId?: string; trigger: { businessTypes?: string[] } }): string {
  const bts = (e.trigger.businessTypes ?? []).slice().sort().join(',') || 'all'
  return `${e.npcId}:${bts}`
}

describe('NPC arc structure', () => {
  it('every arc-driven NPC has at least 3 arc events', () => {
    for (const def of NPC_DEFINITIONS) {
      if (RECURRING_NPC_IDS.has(def.id)) continue
      const arcs = NPC_ARC_EVENTS.filter(e => e.npcId === def.id)
      expect(arcs.length, `${def.id} should have 3 arc events, has ${arcs.length}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('recurring NPCs (Gena) still have at least one intro event', () => {
    for (const id of RECURRING_NPC_IDS) {
      const arcs = NPC_ARC_EVENTS.filter(e => e.npcId === id)
      expect(arcs.length, `recurring NPC ${id} needs an intro arc event`).toBeGreaterThanOrEqual(1)
    }
  })

  it('every arc event references a real NPC id', () => {
    const validIds = new Set(NPC_DEFINITIONS.map(d => d.id))
    for (const e of NPC_ARC_EVENTS) {
      expect(e.npcId, `${e.id} missing npcId`).toBeDefined()
      expect(validIds.has(e.npcId!), `${e.id} → unknown npcId "${e.npcId}"`).toBe(true)
    }
  })

  it('every arc event has at least 2 player options', () => {
    for (const e of NPC_ARC_EVENTS) {
      expect(e.options.length, `${e.id} has only ${e.options.length} options`).toBeGreaterThanOrEqual(2)
    }
  })

  it('every option has a non-empty text label', () => {
    for (const e of NPC_ARC_EVENTS) {
      for (const opt of e.options) {
        expect(opt.text.length, `${e.id}/${opt.id} has empty text`).toBeGreaterThan(0)
      }
    }
  })

  it('all arc events are oneTime (no repeats)', () => {
    for (const e of NPC_ARC_EVENTS) {
      expect(e.trigger.oneTime, `${e.id} should be oneTime`).toBe(true)
    }
  })

  it('arc event ids are unique', () => {
    const ids = NPC_ARC_EVENTS.map(e => e.id)
    expect(new Set(ids).size, 'duplicate arc event ids').toBe(ids.length)
  })

  it('episode trigger windows progress meet → test → resolve per (NPC, businessType) group', () => {
    // Group by (npcId, businessTypes) so business-filtered variants
    // (e.g. Tamara's shop/cafe/salon meets) don't trip the overlap check.
    const groups = new Map<string, typeof NPC_ARC_EVENTS>()
    for (const e of NPC_ARC_EVENTS) {
      const key = groupKey(e)
      const list = groups.get(key) ?? []
      list.push(e)
      groups.set(key, list)
    }

    for (const [key, list] of groups) {
      const sorted = list.slice().sort(
        (a, b) => (a.trigger.dayMin ?? 0) - (b.trigger.dayMin ?? 0),
      )
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        expect(
          (curr.trigger.dayMin ?? 0) > (prev.trigger.dayMax ?? 0),
          `${key}: ${curr.id} starts before ${prev.id} ends`,
        ).toBe(true)
      }
    }
  })
})

describe('NPC arc gating', () => {
  it('non-meet episodes require requiresNpcRevealed', () => {
    // For each (NPC, businessType) group, the earliest event is the
    // meet beat — it shouldn't require revealed. Everything after must.
    const groups = new Map<string, typeof NPC_ARC_EVENTS>()
    for (const e of NPC_ARC_EVENTS) {
      const key = groupKey(e)
      const list = groups.get(key) ?? []
      list.push(e)
      groups.set(key, list)
    }

    for (const list of groups.values()) {
      const sorted = list.slice().sort(
        (a, b) => (a.trigger.dayMin ?? 0) - (b.trigger.dayMin ?? 0),
      )
      for (const e of sorted.slice(1)) {
        expect(
          e.trigger.requiresNpcRevealed,
          `${e.id} is a follow-up episode but doesn't require requiresNpcRevealed`,
        ).toBe(true)
      }
    }
  })
})

describe('Mikhail kept-cast continuity', () => {
  it('Mikhail still exists with role=supplier', () => {
    const m = NPC_DEFINITIONS.find(d => d.id === 'mikhail')
    expect(m, 'Михаил dropped from the roster').toBeDefined()
    expect(m?.role).toBe('supplier')
  })
})

describe('Gena recurring schemes', () => {
  // Gena's design: small chance of jackpot, otherwise lose your stake.
  // Make sure each "scheme" event actually models that — both an invest
  // option with randomJackpot AND a refuse option.
  it('every Gena scheme event has an invest option with randomJackpot', () => {
    const schemes = NPC_EVENTS.filter(e => e.npcId === 'gena')
    expect(schemes.length, 'Gena should have at least 5 scheme events').toBeGreaterThanOrEqual(5)
    for (const s of schemes) {
      const investOpt = s.options.find(o => o.consequences.randomJackpot !== undefined)
      expect(investOpt, `${s.id} has no option with randomJackpot`).toBeDefined()
      const jackpot = investOpt!.consequences.randomJackpot!
      expect(jackpot.chance, `${s.id} jackpot chance should be small`).toBeLessThan(0.20)
      expect(jackpot.bonus, `${s.id} jackpot bonus should be 500-700K`).toBeGreaterThanOrEqual(500000)
      expect(jackpot.bonus, `${s.id} jackpot bonus should be 500-700K`).toBeLessThanOrEqual(700000)
    }
  })

  it('every Gena scheme has a refuse option', () => {
    const schemes = NPC_EVENTS.filter(e => e.npcId === 'gena')
    for (const s of schemes) {
      const refuse = s.options.find(o => o.consequences.randomJackpot === undefined)
      expect(refuse, `${s.id} has no refuse option`).toBeDefined()
    }
  })
})
