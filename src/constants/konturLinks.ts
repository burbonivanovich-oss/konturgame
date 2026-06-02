// Ссылки на реальные сервисы Контура для CTA «Попробовать в реальности».
//
// Большая цель игры — не развлечь, а показать ценность сервисов и довести
// игрока до kontur.ru. Здесь — единый источник правды для URL'ов и UTM-меток,
// чтобы маркетинг мог подменить кампанию/ссылки в одном месте.
//
// ⚠️ Перед публичным запуском: сверьте пути с актуальными продуктовыми
// страницами и подставьте реальные UTM/кампанию (или задайте базу через
// VITE_KONTUR_BASE_URL).

import type { ServiceType } from '../types/game'

export const KONTUR_BASE_URL =
  (import.meta.env?.VITE_KONTUR_BASE_URL ?? '').trim() || 'https://kontur.ru'

// Путь продуктовой страницы для каждого сервиса. Пустая строка → главная.
const SERVICE_PATHS: Record<ServiceType, string> = {
  market: '/market',
  bank: '',
  ofd: '/ofd',
  diadoc: '/diadoc',
  fokus: '/focus',
  elba: '/elba',
  extern: '/extern',
}

const UTM_SOURCE = 'biznes-s-konturom'
const UTM_MEDIUM = 'game'
const UTM_CAMPAIGN = 'alpha'

function withUtm(url: string, placement: string): string {
  const sep = url.includes('?') ? '&' : '?'
  const params = new URLSearchParams({
    utm_source: UTM_SOURCE,
    utm_medium: UTM_MEDIUM,
    utm_campaign: UTM_CAMPAIGN,
    utm_content: placement,
  })
  return `${url}${sep}${params.toString()}`
}

/** Ссылка на главную Контура с UTM-меткой места клика. */
export function konturHomeUrl(placement: string): string {
  return withUtm(KONTUR_BASE_URL, placement)
}

/** Ссылка на продуктовую страницу сервиса с UTM-меткой места клика. */
export function konturServiceUrl(service: ServiceType, placement: string): string {
  const path = SERVICE_PATHS[service] ?? ''
  return withUtm(`${KONTUR_BASE_URL}${path}`, placement)
}
