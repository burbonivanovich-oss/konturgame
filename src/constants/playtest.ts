// Конфигурация alpha-плейтеста (10-15 человек).
//
// Один источник правды для: версии приложения, ссылки на форму фидбека и
// признака «плейтест-режим». Используется в SettingsModal, VictoryModal и
// ErrorBoundary, чтобы тестер из любой точки игры мог дать фидбек и прислать
// отчёт.

/**
 * Версия для отчётов плейтеста. Меняется руками при заметных правках баланса/
 * механик, чтобы при разборе отчётов было понятно, на какой сборке играл тестер.
 */
export const APP_VERSION = '0.1.0-alpha'

/**
 * Ссылка на Google Form для фидбека.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  ПЕРЕД ПЛЕЙТЕСТОМ: вставьте сюда ссылку на вашу Google Form          │
 * │  (шаблон вопросов — docs/playtest/google-form-questions.md),         │
 * │  либо задайте VITE_FEEDBACK_FORM_URL при сборке.                     │
 * │  Пока ссылка пустая — кнопки «Оставить фидбек» не показываются.      │
 * └─────────────────────────────────────────────────────────────────────┘
 */
const FALLBACK_FEEDBACK_FORM_URL = ''

/**
 * Итоговая ссылка на форму: env-переменная имеет приоритет над константой,
 * чтобы можно было подменить URL на этапе деплоя без правки кода.
 */
export const FEEDBACK_FORM_URL =
  (import.meta.env?.VITE_FEEDBACK_FORM_URL ?? '').trim() || FALLBACK_FEEDBACK_FORM_URL

/** Настроена ли форма фидбека (есть валидная ссылка). */
export function isFeedbackConfigured(): boolean {
  return /^https?:\/\//i.test(FEEDBACK_FORM_URL)
}

/** Открыть форму фидбека в новой вкладке (no-op, если не настроена). */
export function openFeedbackForm(): void {
  if (!isFeedbackConfigured()) return
  window.open(FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer')
}
