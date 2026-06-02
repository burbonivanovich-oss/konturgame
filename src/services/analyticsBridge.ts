// Мост между игровым стором и слоем аналитики.
//
// Сами события объявлены в utils/analytics.ts (буфер + consent + sink). Здесь
// мы подписываемся на стор и переводим переходы состояния в события воронки:
// прошла неделя, подключён сервис, победа/поражение. UI-события (клик по CTA,
// открытие формы) трекаются точечно прямо из компонентов.
//
// Почему диффом по состоянию, а не вызовами из экшенов: так движок (weekCalculator,
// economyEngine) остаётся без зависимости на аналитику, а воронку нельзя «забыть»
// инструментировать при добавлении нового пути изменения состояния.

import { useGameStore } from '../stores/gameStore'
import {
  track,
  flushEvents,
  setAnalyticsSink,
  type AnalyticsEvent,
} from '../utils/analytics'

export interface AnalyticsSnapshot {
  week: number
  isVictory: boolean
  isGameOver: boolean
  gameOverReason?: string
  victoryType?: string | null
  balance: number
  activeServices: string[]
}

type StoreLike = {
  currentWeek?: number
  isVictory?: boolean
  isGameOver?: boolean
  gameOverReason?: string
  victoryType?: string | null
  balance?: number
  services?: Record<string, { isActive?: boolean } | undefined>
}

/** Снять диффабельный снимок с состояния стора. */
export function snapshotFromState(state: StoreLike): AnalyticsSnapshot {
  const services = state.services ?? {}
  const activeServices = Object.keys(services).filter((k) => services[k]?.isActive)
  return {
    week: state.currentWeek ?? 1,
    isVictory: !!state.isVictory,
    isGameOver: !!state.isGameOver,
    gameOverReason: state.gameOverReason,
    victoryType: state.victoryType ?? null,
    balance: state.balance ?? 0,
    activeServices,
  }
}

type Tracked = Pick<AnalyticsEvent, 'name' | 'data'>

/**
 * Чистая функция: какие события воронки породил переход prev → next.
 * Вынесена отдельно, чтобы тестировать без стора и подписок.
 */
export function computeTransitionEvents(
  prev: AnalyticsSnapshot,
  next: AnalyticsSnapshot,
): Tracked[] {
  const events: Tracked[] = []

  if (next.week > prev.week) {
    events.push({ name: 'game.week.completed', data: { week: next.week, balance: next.balance } })
  }

  if (!prev.isVictory && next.isVictory) {
    events.push({
      name: 'game.victory',
      data: { week: next.week, type: next.victoryType ?? 'year_one', balance: next.balance },
    })
  }

  if (!prev.isGameOver && next.isGameOver && !next.isVictory) {
    events.push({
      name: 'game.defeat',
      data: { week: next.week, reason: next.gameOverReason ?? 'unknown', balance: next.balance },
    })
  }

  const prevSet = new Set(prev.activeServices)
  const nextSet = new Set(next.activeServices)
  for (const s of next.activeServices) {
    if (!prevSet.has(s)) events.push({ name: 'service.activated', data: { service: s } })
  }
  for (const s of prev.activeServices) {
    if (!nextSet.has(s)) events.push({ name: 'service.deactivated', data: { service: s } })
  }

  return events
}

let _initialized = false

/**
 * Подключить мост: установить sink (если задан endpoint), подписаться на стор,
 * настроить flush. Вызывается один раз из main.tsx. Идемпотентна.
 */
export function initAnalyticsBridge(): void {
  if (_initialized) return
  _initialized = true

  // Прод-sink: если задан endpoint — шлём батчи туда (PostHog-совместимый
  // прокси или собственный сборщик). Иначе события только копятся локально.
  const endpoint = (import.meta.env?.VITE_ANALYTICS_ENDPOINT ?? '').trim()
  if (endpoint) {
    setAnalyticsSink(async (batch) => {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })
    })
  }

  let prev = snapshotFromState(useGameStore.getState())
  useGameStore.subscribe((state) => {
    const next = snapshotFromState(state as StoreLike)
    const events = computeTransitionEvents(prev, next)
    prev = next
    for (const e of events) track(e.name, e.data)
  })

  // Сброс буфера при уходе со страницы и при сворачивании вкладки —
  // только если sink настроен (иначе спамить консоль незачем).
  if (endpoint && typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => { void flushEvents() })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushEvents()
    })
    window.setInterval(() => { void flushEvents() }, 30_000)
  }
}
