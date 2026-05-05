import type { GameState, Event } from '../types/game'
import { NPC_EPISODES, type NpcEpisode } from '../constants/npcEpisodes'
import { templateToEvent } from './eventGenerator'

// Returns the next episode that should fire this week, or null if none.
// Priority order: lowest episodeIndex, earliest triggerWeek. So Катя's
// first meeting fires before Виктор's second confrontation if both are
// eligible on the same week.
export function getDueEpisode(state: GameState): NpcEpisode | null {
  const currentWeek = state.currentWeek
  const npcs = state.npcs ?? []

  const eligible = NPC_EPISODES.filter(ep => {
    if (currentWeek < ep.triggerWeek) return false

    const npc = npcs.find(n => n.id === ep.npcId)
    if (!npc) return false

    // Already done?
    if ((npc.completedEpisodes ?? []).includes(ep.id)) return false

    // Prerequisite met?
    if (ep.prerequisiteEpisodeId &&
        !(npc.completedEpisodes ?? []).includes(ep.prerequisiteEpisodeId)) {
      return false
    }

    // State guards
    if (ep.requireMinReputation !== undefined && state.reputation < ep.requireMinReputation) return false
    if (ep.requireMinBalance !== undefined && state.balance < ep.requireMinBalance) return false

    // Template-level oneTime check (if already triggered as a regular event,
    // skip — though episodes shouldn't end up there)
    if ((state.triggeredEventIds ?? []).includes(ep.template.id)) return false

    return true
  })

  if (eligible.length === 0) return null

  // Pick by NPC's episodeIndex first (don't fire ep 3 of one NPC if ep 1 of
  // another is also eligible — episode 1s are more important narratively)
  eligible.sort((a, b) => a.episodeIndex - b.episodeIndex || a.triggerWeek - b.triggerWeek)
  return eligible[0]
}

// Convert an episode to a runnable Event for pendingEvent slot.
export function episodeToEvent(episode: NpcEpisode, currentWeek: number): Event {
  return templateToEvent(episode.template, currentWeek * 7, currentWeek)
}
