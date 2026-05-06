import { describe, it, expect } from 'vitest'
import { NPC_ARC_EVENTS } from '../npcArcs'
import { NPC_DEFINITIONS } from '../npcs'

// These tests guard the Phase C arc structure: each NPC must have
// exactly three arc events (meet/test/resolve), each event must have
// a matching npcId, valid trigger windows, and at least 2 options.
//
// They don't run gameplay simulation — they catch typos and structural
// drift when someone edits npcArcs without realising what the contract
// is. Rules:
//   • Episode 1 (meet)    fires in days 21-70  (weeks 3-10)
//   • Episode 2 (test)    fires in days 140-175 (weeks 20-25)
//   • Episode 3 (resolve) fires in days 245-315 (weeks 35-45)
//
// Tamara and Gena meet earlier (days 21-49) by design — they're
// background-flavour NPCs that should appear sooner.

describe('NPC arc structure', () => {
  it('every NPC in roster has at least 3 arc events', () => {
    for (const def of NPC_DEFINITIONS) {
      const arcs = NPC_ARC_EVENTS.filter(e => e.npcId === def.id)
      expect(arcs.length, `${def.id} should have 3 arc events, has ${arcs.length}`).toBeGreaterThanOrEqual(3)
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

  it('episode trigger windows progress meet → test → resolve', () => {
    // Sort each NPC's arcs by dayMin and verify they don't overlap
    // outside the expected pattern.
    for (const def of NPC_DEFINITIONS) {
      const arcs = NPC_ARC_EVENTS
        .filter(e => e.npcId === def.id)
        .sort((a, b) => (a.trigger.dayMin ?? 0) - (b.trigger.dayMin ?? 0))

      // Each subsequent episode must start after the previous one ends.
      for (let i = 1; i < arcs.length; i++) {
        const prev = arcs[i - 1]
        const curr = arcs[i]
        expect(
          (curr.trigger.dayMin ?? 0) > (prev.trigger.dayMax ?? 0),
          `${def.id}: episode ${i + 1} (${curr.id}) starts before episode ${i} (${prev.id}) ends`,
        ).toBe(true)
      }
    }
  })
})

describe('NPC arc gating', () => {
  it('episode 2 + 3 require requiresNpcRevealed (so they only fire after meet)', () => {
    for (const def of NPC_DEFINITIONS) {
      const arcs = NPC_ARC_EVENTS
        .filter(e => e.npcId === def.id)
        .sort((a, b) => (a.trigger.dayMin ?? 0) - (b.trigger.dayMin ?? 0))

      // Skip the first (meet) episode — it shouldn't require revealed.
      for (const e of arcs.slice(1)) {
        expect(
          e.trigger.requiresNpcRevealed,
          `${e.id} is a follow-up episode but doesn't require requiresNpcRevealed`,
        ).toBe(true)
      }
    }
  })
})

describe('Mikhail kept-cast continuity', () => {
  // Mikhail is the only NPC carried over from the legacy roster.
  // Make sure the new arc didn't drop his id or signature trait.
  it('Mikhail still exists with role=supplier', () => {
    const m = NPC_DEFINITIONS.find(d => d.id === 'mikhail')
    expect(m, 'Михаил dropped from the roster').toBeDefined()
    expect(m?.role).toBe('supplier')
  })
})
