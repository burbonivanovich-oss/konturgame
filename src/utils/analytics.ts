// Lightweight analytics buffer. Stores anonymous game events in localStorage
// and exposes them for later flushing to a real backend (PostHog / Yandex.Metrica /
// custom). Privacy-first: no PII, no IP collection, no fingerprinting. Players
// can opt out via the consent flag and the buffer never leaves the browser.
//
// Why local buffering? The game is single-player and offline-capable. We can't
// guarantee network reachability, and we don't want to block gameplay on a
// failed POST. Events accumulate in a ring buffer and are flushed when the
// player explicitly consents OR when a consumer subscribes via `getEvents()`.
//
// Event taxonomy (initial — extend as features land):
//
//   game.session.started         { businessType }
//   game.business.chosen          { businessType }
//   game.week.completed           { week, balance, netProfit }
//   service.activated             { service }
//   service.deactivated           { service }
//   game.victory                  { week, type, balance }
//   game.defeat                   { week, reason, balance }
//   promo.code.redeemed           { service }

export interface AnalyticsEvent {
  name: string
  ts: number
  data: Record<string, unknown>
}

const STORAGE_KEY = 'konturgame_analytics_v1'
const CONSENT_KEY = 'konturgame_analytics_consent_v1'
const MAX_EVENTS = 500  // ring buffer — drop oldest beyond this

function readBuffer(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBuffer(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    // Storage quota or privacy mode — silent drop. Telemetry must never
    // crash gameplay.
  }
}

/** Has the player explicitly opted in to telemetry collection? */
export function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

/** Set the consent flag (called from a settings/consent dialog). */
export function setConsent(consent: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent ? '1' : '0')
    if (!consent) localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Record an event. Drops on the floor if consent has not been given —
 * that's the privacy-first contract. Never throws.
 */
export function track(name: string, data: Record<string, unknown> = {}): void {
  if (!hasConsent()) return
  const event: AnalyticsEvent = { name, ts: Date.now(), data }
  const buffer = readBuffer()
  buffer.push(event)
  writeBuffer(buffer)
}

/** Read the buffer (for debugging or explicit flush to a real backend). */
export function getEvents(): AnalyticsEvent[] {
  return readBuffer()
}

/** Clear the buffer (after a successful flush). */
export function clearEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Pluggable backend adapter. Конкретный sink (PostHog, Яндекс.Метрика,
 * собственный endpoint) подключается через `setAnalyticsSink`. Без sink
 * события только буферятся локально и при flushEvents выбрасываются
 * в консоль (полезно для отладки).
 *
 * Пример подключения PostHog в main.tsx:
 *   import posthog from 'posthog-js'
 *   posthog.init('phc_xxx', { api_host: 'https://eu.i.posthog.com' })
 *   setAnalyticsSink((batch) => {
 *     for (const e of batch) posthog.capture(e.name, e.data)
 *     return Promise.resolve()
 *   })
 *
 * Пример Яндекс.Метрики:
 *   setAnalyticsSink((batch) => {
 *     for (const e of batch) ym(YM_ID, 'reachGoal', e.name, e.data)
 *     return Promise.resolve()
 *   })
 */
export type AnalyticsSink = (batch: AnalyticsEvent[]) => Promise<void>

let _sink: AnalyticsSink | null = null

export function setAnalyticsSink(sink: AnalyticsSink | null): void {
  _sink = sink
}

/**
 * Сбрасывает накопленные события в backend. Возвращает число отправленных.
 * Если sink не подключен — пишет batch в консоль и возвращает 0
 * (буфер не очищается, чтобы события не потерялись).
 */
export async function flushEvents(): Promise<number> {
  const batch = readBuffer()
  if (batch.length === 0) return 0
  if (!_sink) {
    console.info('[analytics] no sink configured; events:', batch)
    return 0
  }
  try {
    await _sink(batch)
    clearEvents()
    return batch.length
  } catch (err) {
    console.warn('[analytics] flush failed:', err)
    return 0
  }
}
