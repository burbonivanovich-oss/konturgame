// Экспорт отчёта плейтеста в .json-файл.
//
// Тестер скачивает отчёт (из настроек, с финального экрана или с экрана ошибки)
// и прикрепляет его к форме фидбека. Скрипт docs/playtest/replay.mjs парсит
// JSON и выдаёт postmortem: где умер, какие сервисы, решения, ачивки.

import { useGameStore } from '../stores/gameStore'
import { APP_VERSION } from '../constants/playtest'

export interface PlaytestReport {
  schemaVersion: number
  exportedAt: string
  app: { version: string; userAgent: string }
  /** Контекст, откуда сделан экспорт: настройки / финал / ошибка. */
  source?: string
  /** Заполняется только при экспорте с экрана ошибки. */
  error?: { message: string; stack?: string; componentStack?: string }
  /** Полный snapshot state'а — replay-скрипт извлекает что нужно. */
  state: unknown
}

/** Собрать payload отчёта. Функции стора в JSON отбрасываются автоматически. */
export function buildPlaytestReport(
  extra?: Pick<PlaytestReport, 'source' | 'error'>,
): PlaytestReport {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: {
      version: APP_VERSION,
      userAgent: navigator.userAgent.slice(0, 200),
    },
    ...extra,
    state: useGameStore.getState(),
  }
}

/** Имя файла вида `playtest-shop-inprogress-W12-<ts>.json`. */
function buildFilename(state: Record<string, unknown>): string {
  const week = (state.currentWeek as number | undefined) ?? 0
  const biz = (state.businessType as string | undefined) ?? 'unknown'
  const status = state.isGameOver
    ? `gameover-${(state.gameOverReason as string | undefined) ?? 'unknown'}`
    : state.isVictory
      ? 'victory'
      : `inprogress-W${week}`
  return `playtest-${biz}-${status}-${Date.now()}.json`
}

/** Скачать отчёт как .json-файл. Возвращает true при успехе. */
export function downloadPlaytestReport(
  extra?: Pick<PlaytestReport, 'source' | 'error'>,
): boolean {
  try {
    const report = buildPlaytestReport(extra)
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFilename((report.state as Record<string, unknown>) ?? {})
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('Не удалось сохранить отчёт плейтеста', err)
    return false
  }
}
