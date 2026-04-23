import type { GameState, NPC, NpcMemoryEntry } from '../types/game'
import { createInitialNPCs, getNPCDefinition } from '../constants/npcs'

export function initializeNPCs(): NPC[] {
  return createInitialNPCs()
}

export function getNPC(state: GameState, npcId: string): NPC | undefined {
  return (state.npcs ?? []).find(n => n.id === npcId)
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

export function recordNPCMemory(
  npcs: NPC[],
  npcId: string,
  entry: Omit<NpcMemoryEntry, never>
): NPC[] {
  return npcs.map(npc => {
    if (npc.id !== npcId) return npc
    return {
      ...npc,
      isRevealed: true,
      memory: [...npc.memory.slice(-9), entry],  // keep last 10 entries
    }
  })
}

export function revealNPC(npcs: NPC[], npcId: string): NPC[] {
  return npcs.map(npc =>
    npc.id === npcId ? { ...npc, isRevealed: true } : npc
  )
}

// Passive NPC effects applied each week
export function applyNPCPassiveEffects(state: GameState): void {
  const npcs = state.npcs ?? []

  const mikhail = npcs.find(n => n.id === 'mikhail')
  if (mikhail && mikhail.isRevealed) {
    // High relationship with supplier: slight price reduction (represented as checkModifier)
    if (mikhail.relationshipLevel >= 75 && state.temporaryCheckMod === 0) {
      state.temporaryCheckMod = 0.04
      state.temporaryCheckMod = Math.min(state.temporaryCheckMod + 0.04, 0.1)
    }
  }

  const svetlana = npcs.find(n => n.id === 'svetlana')
  if (svetlana && svetlana.isRevealed && svetlana.relationshipLevel >= 70) {
    // Loyal high-performing employee boosts loyalty
    if (state.loyalty < 100) {
      state.loyalty = Math.min(100, state.loyalty + 1)
    }
  }

  const marina = npcs.find(n => n.id === 'marina')
  if (marina && marina.isRevealed && marina.relationshipLevel >= 65) {
    // Good relationship with marketer: small ongoing reputation boost
    if (state.reputation < 100) {
      state.reputation = Math.min(100, state.reputation + 1)
    }
  }

  const viktor = npcs.find(n => n.id === 'viktor')
  if (viktor && viktor.isRevealed && viktor.relationshipLevel >= 70) {
    // Banker ally: slightly better cash flow awareness (minor check boost)
    if (state.temporaryCheckMod === 0) {
      state.temporaryCheckMod = 0.02
    }
  }
}

// Returns relationship label for UI
export function getRelationshipLabel(level: number): { text: string; color: string } {
  if (level >= 80) return { text: 'Союзник', color: '#00b478' }
  if (level >= 60) return { text: 'Доверяет', color: '#2d8aff' }
  if (level >= 40) return { text: 'Нейтрально', color: '#888' }
  if (level >= 20) return { text: 'Напряжённо', color: '#ff8c00' }
  return { text: 'Враждебно', color: '#dc3545' }
}

// Determine which chain follow-up to use for inspector_chain step 2
// based on relationship with Petrov after step 1
export function getInspectorChain2EventId(state: GameState): string {
  const petrov = getNPC(state, 'petrov')
  const relationship = petrov?.relationshipLevel ?? 40
  return relationship >= 50 ? 'inspector_chain_2_good' : 'inspector_chain_2_bad'
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
