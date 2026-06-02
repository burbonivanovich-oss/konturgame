/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Ссылка на Google Form для сбора фидбека плейтеста.
   * Задаётся при сборке через переменную окружения, например:
   *   VITE_FEEDBACK_FORM_URL="https://forms.gle/xxxx" npm run build
   * Если не задана — используется константа FEEDBACK_FORM_URL из constants/playtest.ts.
   */
  readonly VITE_FEEDBACK_FORM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
