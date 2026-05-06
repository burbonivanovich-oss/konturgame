import type { GameState, NPC, NpcMemoryEntry } from '../types/game'
import { createInitialNPCs, getNPCDefinition } from '../constants/npcs'

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

// Applies a relationship delta with memory recording. Stores the signed
// delta on the memory entry so the UI can render an opinion stack
// ("note +20", "note −10") rather than only the aggregate number.
export function applyRelationshipDeltaToState(
  state: GameState,
  npcId: string,
  delta: number,
  memoryEntry: Omit<NpcMemoryEntry, 'isAnchor' | 'delta'>,
): void {
  // Events with large deltas (≥15) are anchored so they survive memory trimming
  const isAnchor = Math.abs(delta) >= 15

  state.npcs = (state.npcs ?? []).map(npc => {
    if (npc.id !== npcId) return npc

    const current = npc.relationshipLevel

    const newRel = Math.max(0, Math.min(100, current + delta))
    const newMemory = trimMemory([...npc.memory, { ...memoryEntry, delta, isAnchor }])

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
// ─── Passive NPC effects applied each week ─────────────────────────────────
//
// Each NPC's passive effect maps to their archetype:
//   • Михаил (supplier) → cheaper supplies / hostile returns
//   • Катя (бухгалтер)  → small reputation drift (clean books matter)
//   • Виктор (конкурент)→ active sabotage at low rel; nothing at high
//   • Денис (инвестор) → no passive (one-shot money via arc)
//   • Ирина (мама)     → loyalty drift (calm owner = better team)
//   • Артём (коллега)  → loyalty / reputation when employed
//   • Тамара (клиентка)→ reputation drift (word-of-mouth)
//   • Гена (схемы)     → flat — always neutral noise
//
export function applyNPCPassiveEffects(state: GameState): void {
  const npcs = state.npcs ?? []
  const altWeek = (state.currentWeek ?? 0) % 2 === 0

  // ── MIKHAIL — поставщик ────────────────────────────────────────────────
  const mikhail = npcs.find(n => n.id === 'mikhail')
  if (mikhail?.isRevealed) {
    if (mikhail.relationshipLevel >= 75) {
      if (state.temporaryCheckMod === 0) state.temporaryCheckMod = 0.06
    } else if (mikhail.relationshipLevel >= 55 && altWeek) {
      if (state.temporaryCheckMod === 0) state.temporaryCheckMod = 0.03
    } else if (mikhail.relationshipLevel <= 25) {
      state.balance = Math.max(0, state.balance - 800)
    } else if (mikhail.relationshipLevel <= 40 && altWeek) {
      state.balance = Math.max(0, state.balance - 300)
    }
  }

  // ── KATYA — бухгалтер ──────────────────────────────────────────────────
  const katya = npcs.find(n => n.id === 'katya')
  if (katya?.isRevealed) {
    if (katya.relationshipLevel >= 70) {
      if (state.reputation < 100) state.reputation = Math.min(100, state.reputation + 1)
    } else if (katya.relationshipLevel >= 50 && altWeek) {
      if (state.reputation < 100) state.reputation = Math.min(100, state.reputation + 1)
    }
  }

  // ── VIKTOR — конкурент ─────────────────────────────────────────────────
  const viktor = npcs.find(n => n.id === 'viktor')
  if (viktor?.isRevealed) {
    if (viktor.relationshipLevel <= 25) {
      // Active sabotage: word-of-mouth damage
      state.reputation = Math.max(0, state.reputation - 1)
    } else if (viktor.relationshipLevel >= 65 && altWeek) {
      // Cordial rivalry: he occasionally sends overflow customers
      if (state.reputation < 100) state.reputation = Math.min(100, state.reputation + 1)
    }
  }

  // ── IRINA — мама-наставница ────────────────────────────────────────────
  const irina = npcs.find(n => n.id === 'irina')
  if (irina?.isRevealed) {
    if (irina.relationshipLevel >= 70) {
      if (state.loyalty < 100) state.loyalty = Math.min(100, state.loyalty + 1)
    } else if (irina.relationshipLevel >= 50 && altWeek) {
      if (state.loyalty < 100) state.loyalty = Math.min(100, state.loyalty + 1)
    }
  }

  // ── ARTEM — бывший коллега ─────────────────────────────────────────────
  const artem = npcs.find(n => n.id === 'artem')
  if (artem?.isRevealed) {
    if (artem.relationshipLevel >= 70) {
      if (state.loyalty < 100) state.loyalty = Math.min(100, state.loyalty + 1)
      if (state.reputation < 100 && altWeek) state.reputation = Math.min(100, state.reputation + 1)
    } else if (artem.relationshipLevel <= 25) {
      // Disgruntled ex-coworker tells the network — slight rep damage
      if (altWeek) state.reputation = Math.max(0, state.reputation - 1)
    }
  }

  // ── TAMARA — постоянная клиентка ──────────────────────────────────────
  const tamara = npcs.find(n => n.id === 'tamara')
  if (tamara?.isRevealed) {
    if (tamara.relationshipLevel >= 65) {
      // Says good things to neighbours
      if (state.reputation < 100) state.reputation = Math.min(100, state.reputation + 1)
    }
  }

  // ── DENIS / GENA — нет пассивных эффектов ─────────────────────────────
  // Денис двигает сюжет деньгами через арку; Гена — сюжетный фон.

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

export function ensureNPCsInitialized(state: GameState): void {
  if (!state.npcs || state.npcs.length === 0) {
    state.npcs = initializeNPCs()
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
