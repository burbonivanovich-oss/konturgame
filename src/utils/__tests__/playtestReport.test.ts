import { describe, it, expect, beforeEach } from 'vitest'
import { buildPlaytestReport } from '../playtestReport'
import { isFeedbackConfigured, FEEDBACK_FORM_URL, APP_VERSION } from '../../constants/playtest'
import { useGameStore } from '../../stores/gameStore'
import ErrorBoundary from '../../components/ErrorBoundary'

describe('playtest report', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('shop')
  })

  it('builds a report with version, timestamp and a state snapshot', () => {
    const report = buildPlaytestReport({ source: 'test' })
    expect(report.schemaVersion).toBe(1)
    expect(report.app.version).toBe(APP_VERSION)
    expect(report.source).toBe('test')
    expect(typeof report.exportedAt).toBe('string')
    // snapshot должен содержать ключевые игровые поля
    const state = report.state as Record<string, unknown>
    expect(state.businessType).toBe('shop')
    expect(state.currentWeek).toBe(1)
  })

  it('attaches error info when exported from the error boundary', () => {
    const report = buildPlaytestReport({
      source: 'error-boundary',
      error: { message: 'boom', stack: 'at x', componentStack: 'in App' },
    })
    expect(report.error?.message).toBe('boom')
  })

  it('does not serialize store action functions', () => {
    const report = buildPlaytestReport()
    const json = JSON.stringify(report)
    // функции отбрасываются JSON.stringify — отчёт остаётся компактным/валидным
    expect(json).toContain('"businessType"')
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

describe('feedback config', () => {
  it('treats empty / non-url FEEDBACK_FORM_URL as not configured', () => {
    // По умолчанию (без VITE_FEEDBACK_FORM_URL) форма не настроена.
    if (!/^https?:\/\//i.test(FEEDBACK_FORM_URL)) {
      expect(isFeedbackConfigured()).toBe(false)
    } else {
      expect(isFeedbackConfigured()).toBe(true)
    }
  })
})

describe('ErrorBoundary', () => {
  it('flips to error state via getDerivedStateFromError', () => {
    const next = ErrorBoundary.getDerivedStateFromError(new Error('kaboom'))
    expect(next.hasError).toBe(true)
    expect(next.error?.message).toBe('kaboom')
  })
})
