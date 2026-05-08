/**
 * Save migration framework.
 *
 * Раньше при бампе схемы (v6 → v7) сейв просто выкидывался — игрок терял
 * прогресс. Это было приемлемо в ранней разработке («схему чистим, не
 * мигрируем»), но больше нет — игроки уже доходят до 30+ недель,
 * терять такой прогон при апдейте плохо.
 *
 * Теперь ключ остаётся `konturgame_state_v7` (и далее v8, v9 ...), а
 * между ними работают функции миграции. Каждая миграция получает сейв
 * из предыдущей версии и возвращает сейв следующей. Цепочка миграций
 * прикладывается последовательно.
 *
 * Если миграция не нужна (новое поле имеет дефолт через ?? в extractState),
 * её можно не писать — schema bump делается только если структурно
 * меняем существующее поле.
 */

import type { GameState } from '../types/game'

export const CURRENT_SAVE_VERSION = 7

interface VersionedSave {
  __version?: number
  // … остальное произвольно
  [key: string]: unknown
}

type Migration = (save: VersionedSave) => VersionedSave

// Зарегистрированные миграции. Ключ — версия ИСХОДНОГО сейва, значение —
// функция, превращающая его в следующую версию.
const MIGRATIONS: Record<number, Migration> = {
  // Пример:
  // 7: (save) => ({
  //   ...save,
  //   __version: 8,
  //   newField: deriveFromOld(save),
  // }),
}

/**
 * Прикладывает все доступные миграции к сейву, пока версия не дойдёт до
 * CURRENT_SAVE_VERSION. Если миграции для текущей версии нет — возвращает
 * как есть (предполагается, что extractState разберёт его через дефолты).
 */
export function migrateSave(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null
  let save = raw as VersionedSave

  // Сейвы до v8 (когда мы ввели __version) считаются версией 7 — это
  // первая стабильная схема, в которой extractState уже умеет всё
  // нужное через дефолты. Если в будущем понадобится 7→8, миграция
  // получит этот промежуточный объект.
  let version = typeof save.__version === 'number' ? save.__version : 7

  // Защита от бесконечного цикла, если кто-то напишет миграцию,
  // которая не повышает версию.
  let safety = 50
  while (version < CURRENT_SAVE_VERSION && safety > 0) {
    const migrate = MIGRATIONS[version]
    if (!migrate) break
    save = migrate(save)
    const next = typeof save.__version === 'number' ? save.__version : version + 1
    if (next <= version) break
    version = next
    safety -= 1
  }

  // Финальная версия проставляется явно — extractState потом не зависит
  // от __version, но для саппорта и аналитики поле полезно.
  save.__version = CURRENT_SAVE_VERSION
  return save as unknown as GameState
}
