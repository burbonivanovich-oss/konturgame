import type { GameState, NPC, NpcMemoryEntry } from '../types/game'
import { createInitialNPCs, getNPCDefinition, NPC_DEFINITIONS } from '../constants/npcs'

export function initializeNPCs(): NPC[] {
  return createInitialNPCs()
}

export function getNPC(state: GameState, npcId: string): NPC | undefined {
  return (state.npcs ?? []).find(n => n.id === npcId)
}

// Keep last maxSize entries, but anchor entries are never evicted.
function trimMemory(memory: NpcMemoryEntry[], maxSize = 10): NpcMemoryEntry[] {
  if (memory.length <= maxSize) return memory
  const anchors = memory.filter(e => e.isAnchor)
  const nonAnchors = memory.filter(e => !e.isAnchor)
  const recentSlots = Math.max(0, maxSize - anchors.length)
  return [...anchors, ...nonAnchors.slice(-recentSlots)]
}

export function updateNPCRelationship(npcs: NPC[], npcId: string, delta: number): NPC[] {
  return npcs.map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      relationshipLevel: Math.max(0, Math.min(100, npc.relationshipLevel + delta)),
      isRevealed: true,
    }
  })
}

// Applies a relationship delta with memory recording and overflow-to-XP conversion.
// Replaces the inline map in eventGenerator so all callers share the same logic.
export function applyRelationshipDeltaToState(
  state: GameState,
  npcId: string,
  delta: number,
  memoryEntry: Omit<NpcMemoryEntry, 'isAnchor'>,
): void {
  // Events with large deltas (≥15) are anchored so they survive memory trimming
  const isAnchor = Math.abs(delta) >= 15

  state.npcs = (state.npcs ?? []).map(npc => {
    if (npc.id !== npcId) return npc

    const current = npc.relationshipLevel

    // Overflow: positive delta when already at 100 → small XP reward
    if (delta > 0 && current >= 100) {
      state.experience = (state.experience ?? 0) + Math.max(1, Math.floor(delta / 5))
    }

    const newRel = Math.max(0, Math.min(100, current + delta))
    const newMemory = trimMemory([...npc.memory, { ...memoryEntry, isAnchor }])

    return { ...npc, relationshipLevel: newRel, isRevealed: true, memory: newMemory }
  })
}

export function recordNPCMemory(
  npcs: NPC[],
  npcId: string,
  entry: NpcMemoryEntry,
): NPC[] {
  return npcs.map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      isRevealed: true,
      memory: trimMemory([...npc.memory, entry]),
    }
  })
}

export function revealNPC(npcs: NPC[], npcId: string): NPC[] {
  return npcs.map(npc =>
    npc.id === npcId ? { ...npc, isRevealed: true } : npc
  )
}

// ─── Passive NPC effects applied each week ─────────────────────────────────
//
// Design rules:
//  • Positive bonuses: high threshold → full bonus; mid threshold → bonus every
//    other week (altWeek) → smooth ramp-up feel
//  • Negative penalties: hostile (≤25) → active weekly drain; tense (26-40)
//    → lighter drain every other week
//  • Decay: revealed NPCs with no interaction for 4+ weeks drift 1 pt toward 50
//
export function applyNPCPassiveEffects(state: GameState): void {
  const npcs = state.npcs ?? []
  const altWeek = (state.currentWeek ?? 0) % 2 === 0

  // ── MIKHAIL (supplier) ─────────────────────────────────────────────────
  const mikhail = npcs.find(n => n.id === 'mikhail')
  if (mikhail?.isRevealed) {
    if (mikhail.relationshipLevel >= 75) {
      if (state.temporaryCheckMod === 0) state.temporaryCheckMod = 0.06
    } else if (mikhail.relationshipLevel >= 55 && altWeek) {
      if (state.temporaryCheckMod === 0) state.temporaryCheckMod = 0.03
    } else if (mikhail.relationshipLevel <= 25) {
      // Bad relations → higher supply costs, returns, quality disputes
      state.balance = Math.max(0, state.balance - 800)
    } else if (mikhail.relationshipLevel <= 40 && altWeek) {
      state.balance = Math.max(0, state.balance - 300)
    }
  }

  // ── SVETLANA (employee) ────────────────────────────────────────────────
  const svetlana = npcs.find(n => n.id === 'svetlana')
  if (svetlana?.isRevealed) {
    if (svetlana.relationshipLevel >= 70) {
      if (state.loyalty < 100) state.loyalty = Math.min(100, state.loyalty + 1)
    } else if (svetlana.relationshipLevel >= 52 && altWeek) {
      if (state.loyalty < 100) state.loyalty = Math.min(100, state.loyalty + 1)
    }
    // No active penalty — unmotivated employee's harm is modelled via energy cost
  }

  // ── PETROV (inspector) ────────────────────────────────────────────────
  const petrov = npcs.find(n => n.id === 'petrov')
  if (petrov?.isRevealed) {
    if (petrov.relationshipLevel <= 25) {
      // Inspector actively files complaints → direct reputation damage
      state.reputation = Math.max(0, state.reputation - 1)
    } else if (petrov.relationshipLevel <= 40 && altWeek) {
      state.reputation = Math.max(0, state.reputation - 1)
    }
  }

  // ── ANNA (competitor) ─────────────────────────────────────────────────
  const anna = npcs.find(n => n.id === 'anna')
  if (anna?.isRevealed) {
    if (anna.relationshipLevel <= 25) {
      // Active sabotage: negative word-of-mouth, luring customers
      state.reputation = Math.max(0, state.reputation - 1)
    }
    // Declared truce: rivals occasionally send overflow customers
    if (anna.relationshipLevel >= 60 && altWeek) {
      if (state.reputation < 100) state.reputation = Math.min(100, state.reputation + 1)
    }
  }

  // ── DECAY: drift toward neutral (50) when relationship goes stale ─────
  const currentWeek = state.currentWeek ?? 0
  state.npcs = (state.npcs ?? []).map(npc => {
    if (!npc.isRevealed || npc.relationshipLevel === 50) return npc
    const lastInteraction = npc.memory.length > 0
      ? npc.memory[npc.memory.length - 1].week
      : 0
    if (currentWeek - lastInteraction < 4) return npc
    return {
      ...npc,
      relationshipLevel: npc.relationshipLevel > 50
        ? npc.relationshipLevel - 1
        : npc.relationshipLevel + 1,
    }
  })
}

export function getRelationshipLabel(level: number): { text: string; color: string } {
  if (level >= 80) return { text: 'Союзник', color: '#00b478' }
  if (level >= 60) return { text: 'Доверяет', color: '#2d8aff' }
  if (level >= 40) return { text: 'Нейтрально', color: '#888' }
  if (level >= 20) return { text: 'Напряжённо', color: '#ff8c00' }
  return { text: 'Враждебно', color: '#dc3545' }
}

export function getInspectorChain2EventId(state: GameState): string {
  const petrov = getNPC(state, 'petrov')
  const relationship = petrov?.relationshipLevel ?? 40
  return relationship >= 50 ? 'inspector_chain_2_good' : 'inspector_chain_2_bad'
}

// Picks the final Gena episode based on player history. The mid-arc events
// were always money-down with no immediate payout — this is the moment the
// gamble resolves. 10% jackpot if the player ever invested, otherwise the
// burned-but-undeterred variant. Players who never invested get the
// "I told you so" variant — same lack of payout, different vibe.
export function getGenaFinalEventId(state: GameState): string {
  const choices = state.chosenEventOptions ?? {}
  const investmentEvents = ['gena_arc_1', 'gena_arc_2', 'gena_arc_4']
  const everInvested = investmentEvents.some(id => choices[id] === 'invest')
  if (!everInvested) return 'gena_arc_5_told_you_so'
  return Math.random() < 0.1 ? 'gena_arc_5_jackpot' : 'gena_arc_5_burned'
}

export function ensureNPCsInitialized(state: GameState): void {
  if (!state.npcs || state.npcs.length === 0) {
    state.npcs = initializeNPCs()
  } else {
    // Top up NPCs added in newer versions so old saves don't miss them.
    const existingIds = new Set(state.npcs.map(n => n.id))
    const additions = NPC_DEFINITIONS
      .filter(def => !existingIds.has(def.id))
      .map(def => ({
        id: def.id,
        name: def.name,
        role: def.role,
        portrait: def.portrait,
        relationshipLevel: def.startRelationship,
        isRevealed: false,
        memory: [],
      }))
    if (additions.length > 0) {
      state.npcs = [...state.npcs, ...additions]
    }
  }
  if (state.activeChainIds === undefined) {
    state.activeChainIds = []
  }
  if (state.completedChainIds === undefined) {
    state.completedChainIds = []
  }
  if (state.pendingChainFollowUps === undefined) {
    state.pendingChainFollowUps = []
  }
}
