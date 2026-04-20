import type { GameState } from '../types/game'
import { DAILY_MICRO_EVENTS } from '../constants/dailyMicroEvents'

export function generateMicroEventForDay(state: GameState): any | null {
  // Get current day of week (0 = Monday, 6 = Sunday)
  const dayOfWeek = state.dayOfWeek

  // Get all events for this day
  const dayEvents = DAILY_MICRO_EVENTS.filter(event => event.dayOfWeek === dayOfWeek)

  if (dayEvents.length === 0) return null

  // Filter out events already shown this week
  const availableEvents = dayEvents.filter(
    event => !state.seenMicroEventIds.includes(event.id)
  )

  // If all events for this day shown, pick randomly from all day events
  const eventsToPick = availableEvents.length > 0 ? availableEvents : dayEvents

  // Random choice
  const randomEvent = eventsToPick[Math.floor(Math.random() * eventsToPick.length)]

  if (!randomEvent) return null

  return {
    id: randomEvent.id,
    title: randomEvent.title,
    description: randomEvent.description,
    icon: randomEvent.icon,
    options: randomEvent.options,
  }
}
