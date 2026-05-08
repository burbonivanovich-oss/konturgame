# Tools Programmer Audit — Бизнес с Контуром
**Reviewer:** Tools Programmer
**Date:** 2026-05-07
**Scope:** package.json, vite.config.ts, vitest.config.ts, test-setup.ts, gameStore.ts, SettingsModal.tsx, all services, all __tests__ directories

---

## Baseline: что уже есть

### CI / тестирование
- Vitest 1.x, coverage через @vitest/coverage-v8, UI через @vitest/ui
- 2904 строк тестов в 11 файлах — покрыты economyEngine, eventGenerator, achievementChecker, stockManager, synergyEngine, victoryChecker, gameStore, game types, npcArcs
- `simulation.test.ts` — headless прогон 7 сценариев × 20 недель, печатает таблицу в stdout; тест всегда зелёный
- `playerStyles.test.ts` — 6+ архетипов × 52 недели, stress-test баланса; тоже всегда зелёный
- `test-setup.ts` — localStorage mock (in-memory dict), без jsdom (environment: 'node')
- **Нет фикстур, нет моков в отдельных файлах** — `find` возвращает пустой результат

### Debug-инфраструктура
- `SettingsModal.tsx:24` — `handleExportState` пишет `JSON.stringify(state)` в `console.log` и вызывает `alert`. Только в продакшне, без гейта `import.meta.env.DEV`
- `SettingsModal.tsx:19` — `localStorage.removeItem('konturgame_state')` — ссылается на СТАРЫЙ ключ `konturgame_state`, а не на актуальный `konturgame_state_v7`. Баг: кнопка «Начать новую игру» не очищает v7-сохранение
- Ни один файл services/* не содержит `import.meta.env` или `process.env` — debug-флагов нет
- `gameStore.ts` уже реализует rollback через `saveSnapshot / rollback / clearRollback` — инфраструктура снапшотов есть

### RNG
- `Math.random()` используется напрямую в 11 местах: weekCalculator (×2), cashRegisterEngine (×1), eventGenerator (×5), qualityManager (×2), playerStyles.test (×1)
- Нет seeded-RNG — прогоны недетерминированы, replay невозможен «из коробки»

### Storybook
- Не установлен, stories-файлов нет
- Design-system: 12 файлов в `src/components/design-system/` (KHeaderBar, KLeftRail, KIcon, primitives, tokens — полноценный дизайн-кит без визуальных тестов)

### Visual тесты
- playwright/cypress/puppeteer не установлены, screenshot-тестов нет

---

## Инвентарь инструментов для разработки

### T1 — DevTools-панель в игре (только dev)

**Статус:** Отсутствует. `SettingsModal` содержит только `console.log` без `import.meta.env.DEV`-гейта.

**Что нужно:**
```
// pseudo-API
<DevToolsPanel>                         // рендерится только при import.meta.env.DEV
  <SeedControl value={rngSeed} onChange={setSeed} />       // seed для Math.random
  <JumpToWeek currentWeek={n} onJump={(w) => setWeek(w)} />
  <BalanceSlider value={balance} onChange={setBalance} />
  <UnlockAllServices onClick={unlockAll} />
  <ForceEventById eventId={id} onFire={fireEvent} />
  <PainEngineToggle enabled={painEnabled} onToggle={toggle} />
  <StateSnapshot onSnapshot={exportJSON} onRestore={importJSON} />
</DevToolsPanel>
```

**Зависимости:**
- Для seed-RNG нужно заменить все `Math.random()` на вызов инжектируемой функции `rng()` — 11 мест
- `import.meta.env.DEV` уже работает в vite.config.ts без изменений
- Zustand позволяет `useGameStore.setState({...})` напрямую — манипуляции со стором тривиальны

**Риски:** Если seed-RNG заменяется через глобальный патч `Math.random`, это затронет сторонние библиотеки. Рекомендуется явный injection (передача `rng` параметром в eventGenerator/weekCalculator).

---

### T2 — Экспорт/импорт сейва

**Статус:** Частично есть. `handleExportState` в SettingsModal уже вызывает `JSON.stringify` — нужно добавить download + upload.

**Что нужно:**
```
// pseudo-API
exportSave(): void
  // JSON.stringify(extractState(store)) → Blob → <a download="save_week{n}.json">

importSave(file: File): Promise<{ ok: boolean; error?: string }>
  // FileReader → JSON.parse → validate schema version
  // if (state.konturgame_version !== 'v7') → warn but allow migration
  // store.loadGame(parsed)
```

**Замечание:** `SettingsModal.tsx:19` ссылается на `localStorage.removeItem('konturgame_state')` вместо `konturgame_state_v7` — это самостоятельный баг, нужно исправить независимо от разработки T2.

**Зависимости:** `loadGame` уже реализована в gameStore и выполняет миграцию — re-использовать её как основной path для import.

---

### T3 — Headless Simulation Runner (CI smoke-test)

**Статус:** Прецедент есть — `simulation.test.ts` и `playerStyles.test.ts`. Но оба теста:
1. Всегда зелёные — нет assertion на баланс/выживаемость
2. Ограничены 20 и 52 неделями
3. Не запускаются в CI как отдельный job (включены в общий `npm test`)

**Что нужно:**
```
// pseudo-API: scripts/simulate.ts
runSimulation(config: SimConfig): SimReport
  config: { weeks: 45, businessType, services[], seed }
  report: {
    survived: boolean,
    finalBalance: number,
    weeklyBalances: number[],
    gameOverWeek?: number,
    gameOverReason?: string,
    achievementsUnlocked: string[],
    eventsTriggered: string[],
  }

// Вызов в CI:
// npx tsx scripts/simulate.ts --weeks=45 --all-types --seed=42 --assert-survival
```

**Assertions для CI:**
- Магазин выживает ≥ 90% прогонов при bank-only стратегии на 45 неделях
- Баланс не уходит в минус на первых 4 неделях при стандартном старте
- Кафе не банкротится раньше недели 10

**Зависимости:**
- `processWeek` уже тестируется без DOM (environment: 'node') — запускается в Node без vite
- `makeGameState` / `makeServices` helper уже дублируется в 2 тест-файлах — вынести в `src/test-utils/stateFactory.ts`

---

### T4 — Game Replay (детерминированный re-run)

**Статус:** Отсутствует. `Math.random()` используется напрямую — прогоны недетерминированы.

**Что нужно:**
```
// pseudo-API
interface ReplayLog {
  seed: number
  businessType: BusinessType
  weeks: WeekAction[]  // [{ servicesActive, eventChoices, upgradesPurchased }]
}

recordReplay(store): ReplayLog   // пишет действия игрока в реальном времени
replayRun(log: ReplayLog): SimReport  // воспроизводит с тем же seed → одинаковый результат

// Зависит от: seeded RNG (общая зависимость с T1)
```

**Ключевая техническая задача:** Mulberry32 или xorshift32 в виде `createRNG(seed: number): () => number` — ~10 строк. Все `Math.random()` заменяются на `state._rng()` (или инжекция через параметр).

**Ограничение:** `decisionLog` и `chosenEventOptions` уже хранятся в GameState — это 70% replay-лога уже есть. Не хватает только seed и детерминированного RNG.

---

### T5 — Storybook для дизайн-системы

**Статус:** Не установлен.

**Что нужно:**
- Storybook 8.x + `@storybook/react-vite` (совместим с Vite 5)
- Stories для: KHeaderBar, KLeftRail, KIcon (все иконки-вариации), KStatusBar, primitives (Button, Badge, Card из primitives.tsx)
- Decorator с `K`-токенами (paper background) из tokens.ts

**Ценность:** Design-system из 12 файлов используется во всех 14 модалках и 6 view. Без Storybook изменение токена или примитива невидимо ломает компоненты. Самый высокий ROI для дизайнера.

**Зависимости:** Отдельный vite-конфиг для Storybook (не конфликтует с игровым). Tailwind в Storybook потребует postcss-конфига, но он уже есть.

---

### T6 — Visual Snapshot Tests для модалок и вью

**Статус:** Отсутствует. Vitest имеет встроенный snapshot (текстовый), но не визуальный.

**Варианты:**
- `@vitest/browser` + Playwright для в-браузерных снапшотов (экспериментально в Vitest 1.x)
- Storybook Test Runner (если T5 реализован) — запускает stories как тесты
- Отдельный Playwright e2e suite

**Рекомендация:** Реализовать T5 первым, затем добавить `@storybook/test-runner` — тесты модалок идут через stories бесплатно. Standalone Playwright — избыточно пока нет Storybook.

**Объём покрытия:** 14 модалок + 6 вью = 20 поверхностей. Критичные: EventModal, WeekResultsOverlay, VictoryModal, GameOverModal.

---

### T7 — Авто-сборка таблицы баланса из constants/business.ts

**Статус:** Отсутствует. `docs/` создаётся вручную и отстаёт.

**Что нужно:**
```
// pseudo-API: scripts/gen-balance-table.ts
generateBalanceReport(): BalanceReport
  // читает SERVICES_CONFIG, BUSINESS_CONFIGS, ECONOMY_CONSTANTS
  // выводит services.md (цены, эффекты) и businesses.md (стартовые параметры)
  // JSON-вариант для дизайнеров в Figma/Notion

// npm script:
// "docs:balance": "npx tsx scripts/gen-balance-table.ts"
// Запускается в CI как check: если docs/generated/ отстаёт от constants/ — warn
```

**Ценность:** constants/business.ts — единственный источник правды, но дизайнеры работают с md-таблицами в docs/. Сейчас docs/design/*.md и CLAUDE.md содержат устаревшие значения (например, CLAUDE.md указывает аренду салона 55 000 ₽, а business.ts — 45 000 ₽).

---

### T8 — VS Code Snippets для NPC-эпизода

**Статус:** Отсутствует.

**Что нужно:**
```
// .vscode/npc-arc.code-snippets
"NPC Arc Episode": {
  "prefix": "npc-arc",
  "body": [
    "{",
    "  id: '${1:NPC_NAME}_${2|MEET,TEST,RESOLVE|}',",
    "  title: '$3',",
    "  description: '$4',",
    "  trigger: { dayMin: $5, dayMax: $6, randomChance: 1.0, oneTime: true${7:, requiresNpcRevealed: true} },",
    "  npcId: '${8:npc_id}',",
    "  options: [",
    "    {",
    "      id: '${9:option_a}',",
    "      text: '$10',",
    "      consequences: { ${11:reputationDelta: 2} },",
    "      npcRelationshipDelta: ${12:10},",
    "    },",
    "    {",
    "      id: '${13:option_b}',",
    "      text: '$14',",
    "      consequences: { ${15:balanceDelta: -2000} },",
    "      npcRelationshipDelta: ${16:5},",
    "    },",
    "  ],",
    "},"
  ]
}
```

**Ценность:** Авторы контента добавляют NPC-эпизоды в npcArcs.ts вручную. Снипет устраняет опечатки в полях id/trigger/options, которые приводят к silent-фейлам (события не показываются без runtime-ошибки).

---

## Обнаруженные баги / технический долг (попутно)

| # | Файл | Описание | Критичность |
|---|------|----------|-------------|
| B1 | `SettingsModal.tsx:19` | `localStorage.removeItem('konturgame_state')` — старый ключ, v7-сейв не очищается | Высокая |
| B2 | `SettingsModal.tsx:24` | `handleExportState` без `import.meta.env.DEV` — debug-функция в продакшне | Средняя |
| B3 | `gameStore.ts:1322` | `extractState` — три источника правды для списка полей (extractState + createInitialState + GameState тип) | Средняя |
| B4 | `Math.random()` × 11 | Недетерминированность — replay и воспроизведение багов невозможны | Средняя |
| B5 | `simulation.test.ts` | Нет assertions — тест всегда зелёный, CI не поймает balance regression | Средняя |

---

## Приоритизация и оценка

| ID | Инструмент | Приоритет | Трудозатраты | Обоснование |
|----|------------|-----------|--------------|-------------|
| T2 | Экспорт/импорт сейва | **P0** | 1–2 дня | Критично для bug reports. Инфраструктура (loadGame) уже есть. Быстрый wins. Также исправить B1. |
| T3 | Headless Simulation Runner с assertions | **P0** | 2–3 дня | CI smoke-test предотвращает баланс-регрессии. `simulation.test.ts` — 80% кода уже написано, нужны assertions + stateFactory. |
| T1 | DevTools-панель (in-game, DEV only) | **P1** | 3–5 дней | Ускоряет iteration для всей команды. Зависит от seed-RNG (T4 частично). |
| T4 | Seeded RNG (основа для T1 и replay) | **P1** | 1 день | Малый объём изменений (~11 мест), высокий множитель — разблокирует T1 и T4. |
| T7 | Авто-сборка таблицы баланса | **P1** | 1–2 дня | Дизайнеры работают с устаревшими docs. Скрипт + CI-check устраняют drift. |
| T8 | VS Code Snippets для NPC-эпизода | **P1** | 0.5 дня | Минимальные усилия, прямая польза для авторов контента прямо сейчас. |
| T5 | Storybook для дизайн-системы | **P2** | 3–4 дня | Высокая ценность, но требует отдельной Storybook-инфраструктуры. Зависимость для T6. |
| T4 | Game Replay (полный) | **P2** | 3–4 дня | После seeded RNG — 70% лога уже в decisionLog/chosenEventOptions. Нужно обвязать и проверить. |
| T6 | Visual Snapshot Tests | **P2** | 2–3 дня | Реализовать после T5 через @storybook/test-runner, иначе избыточный Playwright. |

**Суммарно P0+P1:** ~9–13 дней до стабильного CI и базового tooling.

---

## Архитектурные рекомендации

### Общая test-utils библиотека

`makeGameState` и `makeServices` дублируются в `simulation.test.ts` и `playerStyles.test.ts` (идентичный код). Вынести в `src/test-utils/stateFactory.ts` — это разблокирует T3 и исключает drift между двумя тестовыми сьютами.

### Seeded RNG как инфраструктурная зависимость

Прежде чем строить T1 (seed-контрол) или T4 (replay), нужно сделать одно решение: global injection или параметр-injection. Рекомендуется параметр: `processWeek(state, rng = Math.random)` — обратно-совместимо, testable, не трогает сторонние библиотеки.

### DevTools только через `import.meta.env.DEV`

Текущий `handleExportState` нарушает это правило — функция доступна в prod. Все debug-инструменты должны быть обёрнуты в `{import.meta.env.DEV && <DevPanel />}`.

### Сепарация smoke-tests от unit-tests в CI

Рекомендуется два npm script:
- `npm test` — только unit/integration (быстро, <30 сек)
- `npm run test:smoke` — simulation + playerStyles + balance assertion (45 недель × 3 типа, ~30 сек)

Сейчас оба прогона смешаны, а smoke-тесты без assertion не дают сигнал CI.
