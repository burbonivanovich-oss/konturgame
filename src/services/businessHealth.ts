import type { GameState } from '../types/game'

/**
 * Qualitative read of how the business is doing — replaces visible
 * reputation / loyalty / quality bars in the dashboard. The numbers still
 * exist in state and drive every mechanic; the player just feels them
 * through this one descriptor and through events, instead of staring at
 * three progress bars and wondering which to prioritise.
 *
 * Tones map to the existing K.mint / K.ink2 / K.orange / K.bad colour
 * tokens used elsewhere; the call site picks the right shade.
 */
export type HealthTone = 'good' | 'neutral' | 'warn' | 'bad'

export interface BusinessHealth {
  label: string
  tone: HealthTone
  hint: string
}

export function getBusinessHealth(state: GameState): BusinessHealth {
  const rep = state.reputation ?? 50
  const loy = state.loyalty ?? 50
  const qual = state.qualityLevel ?? 50
  const score = (rep + loy + qual) / 3

  // Hard floors — any single dimension going critical pulls the whole
  // descriptor down. Reputation under 20 means people are actively
  // avoiding you; that overrides good loyalty/quality averages.
  if (rep < 20 || loy < 20 || qual < 20) {
    return {
      label: 'Тревожно',
      tone: 'bad',
      hint: 'Где-то протекает — клиенты, команда или сервис',
    }
  }

  if (score >= 75) {
    return {
      label: 'Уверенно',
      tone: 'good',
      hint: 'К вам идут охотно, команда в тонусе, держите планку',
    }
  }
  if (score >= 60) {
    return {
      label: 'Хорошо',
      tone: 'good',
      hint: 'Поток ровный, без явных проблем',
    }
  }
  if (score >= 45) {
    return {
      label: 'Стабильно',
      tone: 'neutral',
      hint: 'Без перегрева, но и без рывков',
    }
  }
  if (score >= 30) {
    return {
      label: 'Шатко',
      tone: 'warn',
      hint: 'Что-то проседает — стоит присмотреться',
    }
  }
  return {
    label: 'Под ударом',
    tone: 'bad',
    hint: 'Слишком много фронтов одновременно',
  }
}

/**
 * Three-tier qualitative read for a single dimension (reputation, quality,
 * etc.) — used where a tier-upgrade gate or similar wants to say "good
 * enough" without exposing the number.
 */
export function getDimensionStatus(value: number): {
  label: string
  met: boolean
} {
  if (value >= 70) return { label: 'Прочно', met: true }
  if (value >= 55) return { label: 'Достаточно', met: true }
  if (value >= 40) return { label: 'Шатко', met: false }
  return { label: 'Слабо', met: false }
}
