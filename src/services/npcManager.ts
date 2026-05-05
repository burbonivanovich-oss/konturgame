import type { GameState, NPC, NpcId, NpcMemoryEntry, NpcModifier } from '../types/game'
import { createInitialNPCs, getNpcDefinition, getNpcOpinion } from '../constants/npcs'

// New NPC model: each NPC has a list of visible opinion modifiers + a list
// of completed episode IDs. No daily/weekly upkeep, no relationship decay,
// no friendship grinding. Modifiers added only when story choices fire.

export function initializeNPCs(): NPC[] {
  return createInitialNPCs()
}

export function getNPC(state: GameState, npcId: string): NPC | undefined {
  return (state.npcs ?? []).find(n => n.id === npcId)
}

// Add an opinion modifier with a clear reason. UI displays the list so the
// player can hover and see WHY an NPC feels the way they do.
export function addNpcModifier(
  state: GameState,
  npcId: NpcId,
  reason: string,
  value: number,
): void {
  state.npcs = (state.npcs ?? []).map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      isRevealed: true,
      modifiers: [...(npc.modifiers ?? []), { reason, value, week: state.currentWeek }],
    }
  })
}

// Mark an episode as completed so it doesn't fire again.
export function completeEpisode(state: GameState, npcId: NpcId, episodeId: string): void {
  state.npcs = (state.npcs ?? []).map(npc => {
    if (npc.id !== npcId) return npc
    if ((npc.completedEpisodes ?? []).includes(episodeId)) return npc
    return {
      ...npc,
      completedEpisodes: [...(npc.completedEpisodes ?? []), episodeId],
    }
  })
}

export function revealNPC(npcs: NPC[], npcId: string): NPC[] {
  return npcs.map(npc =>
    npc.id === npcId ? { ...npc, isRevealed: true } : npc
  )
}

// Convert an opinion sum to a human label. Sum of all modifiers (positive
// and negative) determines mood. Range typically -50..+50.
export function getRelationshipLabel(opinionSum: number): { text: string; color: string } {
  if (opinionSum >= 30) return { text: 'Союзник', color: '#00b478' }
  if (opinionSum >= 10) return { text: 'Доверяет', color: '#2d8aff' }
  if (opinionSum >= -10) return { text: 'Нейтрально', color: '#888' }
  if (opinionSum >= -30) return { text: 'Напряжённо', color: '#ff8c00' }
  return { text: 'Враждебно', color: '#dc3545' }
}

// State init / migration. Old saves had `relationshipLevel` (0-100) +
// `memory[]`. Migrate to one synthetic modifier capturing the prior level.
export function ensureNPCsInitialized(state: GameState): void {
  if (!state.npcs || state.npcs.length === 0) {
    state.npcs = initializeNPCs()
    return
  }

  // Migration: convert old shape (relationshipLevel + memory) → new shape
  // (modifiers + completedEpisodes). Only runs once per old save.
  state.npcs = state.npcs.map(npc => {
    if (npc.modifiers !== undefined) return npc  // already new shape
    const legacy = npc as any
    const oldLevel: number = legacy.relationshipLevel ?? 50
    const synthetic: NpcModifier = {
      reason: 'Прошлое знакомство',
      value: oldLevel - 50,  // shift so 50→0 baseline
      week: state.currentWeek ?? 1,
    }
    return {
      id: npc.id,
      name: npc.name,
      role: npc.role,
      portrait: npc.portrait,
      isRevealed: npc.isRevealed,
      modifiers: oldLevel === 50 ? [] : [synthetic],
      completedEpisodes: [],
      // Keep legacy fields so type system is satisfied for any stragglers
      relationshipLevel: oldLevel,
      memory: legacy.memory,
    }
  })
}

// No-op now. Kept for save compat — the old daily/weekly decay & passive
// effects are gone in the new model. NPCs are episode-driven only.
export function applyNPCPassiveEffects(_state: GameState): void {
  // intentionally empty
}

// ── Legacy-compatibility shims so existing callers compile ──────────────
// The codebase still has eventGenerator / weekCalculator references to the
// old API. They're treated as additive modifier writes in the new model.

export function updateNPCRelationship(npcs: NPC[], npcId: string, delta: number): NPC[] {
  return npcs.map(npc => {
    if (npc.id !== npcId) return npc
    const reason = delta > 0 ? 'Положительный выбор' : 'Негативный выбор'
    return {
      ...npc,
      isRevealed: true,
      modifiers: [...(npc.modifiers ?? []), { reason, value: delta, week: 0 }],
    }
  })
}

export function recordNPCMemory(
  npcs: NPC[],
  npcId: string,
  entry: NpcMemoryEntry,
): NPC[] {
  // In the new model, memory is just modifier reasons. Convert recorded
  // memory note into a 0-value modifier so it appears in the list.
  return npcs.map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      isRevealed: true,
      modifiers: [...(npc.modifiers ?? []), { reason: entry.note, value: 0, week: entry.week }],
    }
  })
}

export function applyRelationshipDeltaToState(
  state: GameState,
  npcId: string,
  delta: number,
  memoryEntry: Omit<NpcMemoryEntry, 'isAnchor'>,
): void {
  state.npcs = (state.npcs ?? []).map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      isRevealed: true,
      modifiers: [
        ...(npc.modifiers ?? []),
        { reason: memoryEntry.note, value: delta, week: memoryEntry.week },
      ],
    }
  })
}

// Inspector chain (legacy chain system) tries to pick a "good" or "bad"
// follow-up. New NPCs don't include inspector — return the bad branch if
// called so existing chain content keeps working until it's deleted.
export function getInspectorChain2EventId(state: GameState): string {
  const inspector = (state.npcs ?? []).find(n => n.id === ('petrov' as NpcId))
  if (!inspector) return 'inspector_chain_2_bad'
  return getNpcOpinion(inspector) >= 0 ? 'inspector_chain_2_good' : 'inspector_chain_2_bad'
}

export { getNpcOpinion }
