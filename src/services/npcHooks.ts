import type { GameState, NpcId } from '../types/game'
import { getNpcOpinion } from '../constants/npcs'

// Mechanical hooks driven by NPC arcs. Centralised here so consumers can
// query "does Денис give 0% loans now?" without poking into NPC state.

function getNpc(state: GameState, id: NpcId) {
  return (state.npcs ?? []).find(n => n.id === id)
}

function hasCompletedEpisode(state: GameState, npcId: NpcId, episodeId: string): boolean {
  const npc = getNpc(state, npcId)
  if (!npc) return false
  return (npc.completedEpisodes ?? []).includes(episodeId)
}

// ── ДЕНИС: беспроцентный займ ──────────────────────────────────────────
// After completing the loan offer episode (denis_offer), the player can
// take loans at 0% interest. Limited to keep the game balanced.

export function isFreeLoanAvailable(state: GameState): boolean {
  return hasCompletedEpisode(state, 'denis', 'denis_offer')
}

export function getLoanWeeklyRateForType(
  state: GameState,
  type: 'micro' | 'standard' | 'long-term',
): number {
  const baseline = {
    micro: 0.15 / 2,        // 15% total / 2 weeks
    standard: 0.10 / 4,     // 10% total / 4 weeks
    'long-term': 0.08 / 12, // 8% total / 12 weeks
  }
  // If Денис is in your network, you can take ONE loan at 0% interest.
  if (isFreeLoanAvailable(state)) {
    const usedDenisLoan = (state.loans ?? []).some(l => l.weeklyInterest === 0)
    if (!usedDenisLoan) return 0
  }
  return baseline[type]
}

// ── МИХАИЛ: −10% category cost ─────────────────────────────────────────
// Active discount while opinion ≥ 10 AND any episode completed.

export function getMikhailDiscountPct(state: GameState): number {
  const m = getNpc(state, 'mikhail')
  if (!m) return 0
  const completedAny = (m.completedEpisodes ?? []).length > 0
  if (!completedAny) return 0
  if (getNpcOpinion(m) < 0) return 0
  // Pension episode upgrade: −20% if "contacts" choice was made
  if (hasCompletedEpisode(state, 'mikhail', 'mikhail_pension')) {
    return 0.20
  }
  return 0.10
}

// ── ИРИНА: периодический buff ──────────────────────────────────────────
// After meeting Ирина (irina_intro), her advice gives +rep/loyalty events
// at fixed cadence. Already reflected in episode rewards; no continuous
// hook needed here.

// ── КАТЯ: ускорение Эльбы + tax protection ─────────────────────────────
// After meeting Катя (katya_meet), if positive opinion AND Эльба is
// active, Эльба's effects work without the usual ramp-up. Used by
// future tax-crisis events to apply a "Катя предупредила" option.

export function isKatyaProtectionActive(state: GameState): boolean {
  const k = getNpc(state, 'katya')
  if (!k) return false
  const met = (k.completedEpisodes ?? []).includes('katya_meet')
  return met && getNpcOpinion(k) >= 5
}

// ── ВИКТОР: gate competitor content ────────────────────────────────────
// Without meeting Виктор, competitor-themed events (price wars etc.) are
// suppressed. After arrival episode, they unlock.

export function isCompetitorContentUnlocked(state: GameState): boolean {
  return hasCompletedEpisode(state, 'viktor', 'viktor_arrival')
}

// ── АРТЁМ: VIP-сотрудник ───────────────────────────────────────────────
// After hiring Артём via artyom_seek_job's "hire_full" choice, his
// presence multiplies team capacity bonus. Stored as a flag we'll check
// in employee capacity calc later. For now just a query.

export function hasVipEmployee(state: GameState): boolean {
  return hasCompletedEpisode(state, 'artyom', 'artyom_seek_job')
}
