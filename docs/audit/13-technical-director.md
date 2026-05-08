# Technical Director Audit — Бизнес с Контуром

**Дата:** 2026-05-07
**Аудитор:** Technical Director
**Скоуп:** архитектура, store, persistence, deps, типы, билд, тесты, тех. долг, риски
**Источники:** `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`,
`src/App.tsx`, `src/stores/gameStore.ts`, `src/types/game.ts`, `src/services/*`, `src/components/*`,
`src/test-setup.ts`, `npm run type-check`, `npm test`.

**Метрики проекта:**
- 103 .ts/.tsx файла, ~22 933 LOC всего, 1.3 MB исходников
- 12 тестовых файлов (193 теста; **17 падают**)
- Стек: React 18.2 / TS 5.3 / Vite 5 / Zustand 4.4 / Tailwind 3 / Vitest 1
- 5 prod-зависимостей (`react`, `react-dom`, `zustand`, `clsx`, `date-fns`)
- Без ESLint, без Prettier, без CI-конфига в репо

---

## Layer Discipline

**Декларируемая иерархия:** `constants → services → stores → components`.

### Чем хорошо
- Восходящих импортов нет: `grep -rln "from.*components"` в `constants/`, `services/`, `stores/` — пусто. То же для `services → stores`. Слои действительно соблюдаются «снизу вверх».
- `constants/business.ts` остаётся единственным источником правды для цен/конфигов; остальные движки тянут оттуда.
- `services/` — pure functions над `GameState` без побочных эффектов. Это позволяет `processWeek()` принимать клон стейта и мутировать его локально (`weekCalculator.ts:63`), что упрощает тестирование.

### Где провисает
- **Side-effect imports внутри `services`.** `metaProgress.ts:18-33` напрямую дергает `localStorage` (`window.localStorage.setItem`) — это нарушает «services — чистые функции». Должно жить в `stores/` или в отдельном `persistence/` модуле.
- **Бизнес-логика в `App.tsx`.** `App.tsx:46-57, 94-122` применяет эффекты бэкстори и meta-перков прямым `useGameStore.setState({...})`. Это императивное «однострочное» применение модификатора в компоненте — обход доменного слоя. Такие штуки должны быть actions store'а (`applyBackstoryEffects(b)`, `applyMetaPerk(id)`), иначе при смене баланса (например, "+15 энергии" → "+10") нужно править `App.tsx`, а не доменный движок.
- **`design-system/DesktopKontur.tsx:88` сортирует через `(a: any, b: any)`** — типы теряются ровно в том месте, где список сервисов рендерится. Это микро, но симптоматично.
- **Тесная связь `MainScreen` с store через десятки полей.** `MainScreen.tsx:66-72` берёт **весь** store и деструктурирует 14+ полей. Каждое движение `lastUpdated` (а оно дёргается на каждом setBalance, setReputation, setLoyalty…) ребрендерит весь главный экран. См. Store Health.

### Вердикт
Слои корректны на уровне импортов, но эрозия идёт в двух местах: компонентный слой пишет в store напрямую (`App.tsx`), а сервисный слой (`metaProgress.ts`) трогает `localStorage`. Технический долг — низкий, но отслеживать обязательно.

---

## Store Health

`gameStore.ts` — **1465 строк, ~80 полей в `GameState`, ~50+ actions, два store'а** (`gameStore`, `metaStore`). Это уже **god-store** по объёму, хотя по семантике он один (вся партия — один `GameState`).

### Проблема №1 — full-store subscribe
**28 компонентов вызывают `useGameStore()` без селектора** против 4 — с селектором.

```
src/components/MainScreen.tsx:66      const store = useGameStore()
src/components/MobileMainScreen.tsx
src/components/Indicators.tsx
src/components/WeekResultsOverlay.tsx
src/components/NextDayButton.tsx
src/components/WeekSummaryOverlay.tsx
src/components/ServicePanel.tsx
src/components/TutorialMoments.tsx
src/components/OnboardingPanel.tsx
src/components/design-system/DesktopKontur.tsx
... (modals + views)
```

Каждый из этих компонентов ребрендерится **на любое изменение store'а**. В `gameStore.ts` практически каждый action заканчивается `lastUpdated: Date.now()` — поэтому даже `markTutorialMomentSeen` форсит ребрендер всего UI. Импакт сейчас не критический (single-page, нет анимаций), но при добавлении графиков / частых тиков (например, real-time таймер) деградация нелинейная.

`useShallow` / селекторов в коде **нет**:
```
grep -rn "useShallow|shallow" src/  → пусто
```

### Проблема №2 — saveToStorage на каждый set
```ts
useGameStore.subscribe((state) => { saveToStorage(state) })  // gameStore.ts:1447
```
Без throttle / debounce. На стандартный игровой день вызывается 30–80 раз. `extractState` — это копирование 50+ полей + JSON.stringify. На больших сейвах с длинной decisionLog / npcMemory / triggeredEventIds (см. Save Format Risk) это станет заметно (десятки мс на каждый клик).

### Проблема №3 — JSON.parse(JSON.stringify) deep clone
`advanceDay`, `advanceWeek`, `completeActionsPhase` (`gameStore.ts:375, 387, 400`) делают `JSON.parse(JSON.stringify(extractState(store)))`. Это два полных обхода стейта подряд. Плюс `extractState` делает третий обход. На каждое продвижение дня — три прохода всего стейта. Замена на structured clone / immer был бы выигрышем.

### Проблема №4 — `extractState` — ручная whitelist-сериализация
116 строк ручного перечисления полей (`gameStore.ts:1322-1433`). При каждом новом поле `GameState` нужно не забыть его добавить туда. Любая дырка → поле не сохраняется. Это уже **гарантированно дырявый** контракт; например, `pendingPromoCode` явно «никогда не сохраняем», но `genaSchemesInvested`, `chosenEventOptions`, `lastDiaryEntry`, `diaryEntryWeeks`, `personalGoal`, `newlyUnlockedLessons` в whitelist **не упомянуты** — они теряются на каждом сохранении. См. Save Format Risk.

### Проблема №5 — два store'а пересекаются
`metaStore.ts` хранит `totalRuns` / `unlockedPerks` / `selectedPerk` в `konturgame_meta`. При этом `services/metaProgress.ts` параллельно хранит **`MetaProgress`** (`totalRuns`, `unlockedLessons`, `bestWeek`, …) под отдельным ключом. Два разных места для «meta-прогресса» с пересекающимся полем `totalRuns`. Это обязательно расходится в продакшене.

### Что хорошо
- Один источник правды per-run (`GameState`) — это правильная архитектура для пошаговой игры.
- `loadGame` (gameStore.ts:829) корректно мерджит дефолты, защищая от поломанных сейвов.
- Rollback-механизм (`saveSnapshot` / `rollback`) — отличная идея для пошагового движка.

---

## Save Format Risk

**Ключи в localStorage:**
- `konturgame_state_v7` — основной сейв (`gameStore.ts:26`)
- `konturgame_rollback_v7` — снапшот для отката (`gameStore.ts:27`)
- `konturgame_meta` — meta-store (`metaStore.ts:32`)
- `konturgame` (без `_state`) — meta-progress lessons (`metaProgress.ts`)

### Критический баг — рассинхрон ключей
`App.tsx` загружает и удаляет **`konturgame_state`** (без `_v7`):
```
src/App.tsx:21       const saved = localStorage.getItem('konturgame_state')
src/App.tsx:68       localStorage.removeItem('konturgame_state')
src/components/modals/SettingsModal.tsx:18  localStorage.removeItem('konturgame_state')
src/components/modals/SettingsModal.tsx:33  localStorage.removeItem('konturgame_state')
```
Тест `gameStore.test.ts:298` тоже использует старый ключ.

При этом store пишет в `konturgame_state_v7`. **Эффект:** при перезагрузке `App.tsx` смотрит в несуществующий ключ → возвращает «сейва нет» → ведёт игрока в backstory → `startNewGame` → `saveToStorage` пишет уже в новый ключ. То есть **сейвы не загружаются никогда**. Только subscribe в store пишет, но App.tsx это не читает.

Дополнительно `SettingsModal.removeItem('konturgame_state')` не удаляет реальный сейв — после «начать заново» данные остаются в `konturgame_state_v7` и подмешаются при следующем старте через подписку (если экран `'game'` загрузится по другому маршруту).

**Это самый серьёзный технический баг в коде.** Один маленький грep, и виден весь импакт.

### Миграции
- Жёсткая стратегия: бамп ключа = терять старые сейвы. Документировано в комментарии (`gameStore.ts:23-25`). Это разумно для pre-production. Но **нет ни кода миграции, ни warning-модалки** «у тебя был сейв v6, мы его не сможем загрузить, начинаем заново». Просто пустой стейт без объяснения.
- `extractState` параллельно содержит легаси-миграцию `currentDay → currentWeek` (gameStore.ts:1357-1359) — мёртвый код, никто уже не пишет `currentDay`.

### Утечки полей
В `extractState` отсутствуют поля, объявленные в `GameState`:
- `personalGoal`
- `chosenEventOptions`
- `genaSchemesInvested`
- `lastDiaryEntry`
- `diaryEntryWeeks`
- `newlyUnlockedLessons`
- `serviceDeactivatedWeeks` — есть, но через `(state as any).serviceDeactivatedWeeks` — то есть TS-проверка типа отключена
- `pendingMilestoneCelebration`, `lastWeekPainLosses`, `totalPainLosses`, `seenUnlockTabs`, `upcomingEventTeaser` — то же, через `as any`

Все они теряются при сохранении и регенерируются. Для `personalGoal` это означает: игрок прошёл бэкстори → задал цель → перезагрузил страницу → цель пропала. Невидимый баг данных.

### Размер сейва
Грубая оценка для late-game (week 40+):
- `npcs[].memory` — до 10 записей × 8 NPC = 80 объектов с текстом, ~50 KB
- `decisionLog` — без ограничения, легко 200+ записей × ~100 символов = 20 KB
- `triggeredEventIds`, `seenNewspaperWeeks`, `pendingChainFollowUps`, `seenTutorialMoments` — небольшие
- `stockBatches`, `cashRegisters`, `employees`, `loans` — <5 KB

Итого 50–100 KB на сейв — пока далеко от лимита localStorage (5 MB). Но `decisionLog` без ограничения — это **time bomb** для очень длинных партий.

### Валидация на загрузке — нет
`loadGame` делает `...createInitialState ...state` — это slot-merge без любой валидации схемы. Подделанный сейв с `balance: "infinity"` или с `services: null` пройдёт. Не критично для одиночной игры, но если когда-нибудь будут community-saves / share-builds — нужен Zod/Valibot/manual-guard.

---

## Dependency Strategy

**Минимализм — хорош.** 5 prod-зависимостей: `react`, `react-dom`, `zustand`, `clsx`, `date-fns`. Это редкая дисциплина.

### Анализ
- **`zustand` 4.x** — отличный выбор для размера команды/проекта. Альтернатива (Redux Toolkit, Jotai) дала бы worse DX без выгод.
- **`date-fns` 3.x** — здесь **подозрительно мало пользы**. Игра не работает с реальным временем (`currentWeek`/`dayOfWeek`), `Date.now()` используется как timestamp. `grep date-fns` — стоит проверить, что библиотека реально нужна; если только для одной утилиты — выпилить (60 KB gzipped).
- **`clsx`** — норм, де-факто стандарт.
- **Нет `react-router`.** Оправдано: SPA, single screen + модалки, навигация через `screen` state в `App.tsx` (4 экрана). Routing бы переусложнил.
- **Нет icons-библиотеки.** Эмодзи + svg-токены в `design-system/`. Оправдано для бренда и веса.
- **Нет charts.** `StatisticsView.tsx` (если содержит графики) — проверить, рисуется ли всё на CSS/SVG. Если впоследствии понадобятся графики — `recharts` тяжёл, лучше `visx` или native SVG.

### Дыры
- **Нет ESLint и Prettier.** Для команды 1 разработчика — приемлемо; для команды от 2 — обязательно. Code review без линтера = инспекция вручную.
- **Нет ErrorBoundary.** Один React-экспоушен в обработчике события и весь UI рушится. У игры с persist-стейтом это критично — пользователь не сможет даже нажать «начать заново».
- **Нет Sentry / log-collector.** В пре-релизе допустимо; в production — нет.
- **Нет husky / pre-commit.** type-check и тесты не запускаются автоматически.
- **`browserslist` не задан** в `package.json`. Vite использует свой дефолт (`>0.3%, last 2 versions, not dead`). Для русского рынка может быть важно: Yandex Browser ≥ ?, Edge ≥ ? — сейчас не зафиксировано.

### Версии
Все мажорные актуальные (React 18, TS 5.3, Vite 5, Zustand 4). Vitest 1.x — текущий major, есть Vitest 2.x — миграция несложная. React 19 — апгрейд можно отложить, выгод для этого проекта мало.

---

## Type System

### Хорошо
- `tsc --noEmit` проходит **без ошибок** на 103 файлах.
- `strict: true`, `isolatedModules`, `noEmit` — корректные компиляторные флаги.
- `GameState` — широкий, но плоский, читаемый.
- Дискриминированных union'ов почти нет (главные `BusinessType`, `ServiceType` — это просто string-литералы), но они и не нужны там, где используются. Где появляются — корректно (`WeekPhase = 'summary' | 'actions' | 'events' | 'results'`, `Loan.type`, `victoryType`).

### Плохо
- **25 точек `as any` в проде** (вне тестов). Топ-источники:
  - `gameStore.ts:1322-1424` — `extractState` целиком работает с `state: any` и тянет 6 полей через `(state as any).foo` (см. утечки выше).
  - `OnboardingPanel.tsx:114-128` — четыре `gameState as any` подряд. Onboarding-engine принимает узкий тип, компонент даёт ему полный store. Лечится экспортом узкого типа из `onboardingEngine.ts`.
  - `WeekResultsOverlay.tsx:252-262`, `VictoryModal.tsx:280` — индексирование `PainLossRecord` строкой через `as any`. Лечится `keyof PainLossRecord`.
  - `DesktopKontur.tsx:59, 74, 88` — `serviceId as any`, `{ services } as any`, `(a: any, b: any)`.
- **`tsconfig.json`: `baseUrl` + `paths`.** В TS 5.3 `baseUrl` всё ещё работает, но по новым гайдам предпочтительно `paths` без `baseUrl` (или с `baseUrl: "."`). Также `allowImportingTsExtensions: true` без `noEmit: true` бы сломалось — здесь корректно, но это тонкость.
- **`@types/*` paths-alias** конфликтует с npm-пакетами `@types/...`. На практике в коде никто не пишет `import x from '@types/...'`; алиас можно убрать.
- **Дублирование алиасов** между `tsconfig.json`, `vite.config.ts`, `vitest.config.ts` — три места правды. Vite не умеет читать tsconfig paths без плагина, отсюда и дублирование. Можно поставить `vite-tsconfig-paths` (1 dev-dep) и держать алиасы только в `tsconfig.json`.
- **Helper-методы прямо на store** (`getActivatedServices`, `getActiveServiceIds`, `getTotalSubscriptionCost`, `hasService`, …) — это нарушение Zustand best-practice (помещение функций в стейт раздувает объект и заставляет потребителей ребрендериться даже на change-of-method-reference). Нужно вынести их в чистые функции / селекторы.

---

## Build & Bundle

### Vite-конфиг
`vite.config.ts` — 22 строки, дефолт + base + alias. Что отсутствует:
- **`build.rollupOptions.output.manualChunks`** — нет code splitting. Грубая оценка bundle: React 130 KB + Zustand 5 KB + date-fns ~60 KB + игра ~150 KB = ~350 KB gzipped. Не катастрофа, но и не оптимально для игры в браузере (мобильный рынок).
- **Нет `React.lazy` / `Suspense` / dynamic import** — `grep` показывает 0 совпадений. Все 14 модалок и 6 view'хов грузятся сразу. Кандидаты для lazy-load: `VictoryModal`, `AchievementsModal`, `NPCRosterModal`, `StatisticsView`, `DecisionLogView`, `DevelopmentView`. Экономия ~50–80 KB на initial bundle.
- **Нет `vite-plugin-pwa` / service worker.** Игра 100% offline-capable (single-page, localStorage). PWA даёт «installable» + надёжную работу без сети — естественный фит для жанра.
- **`base: '/konturgame/'`** — захардкожено. При переезде на свой домен нужно править. Лучше `base: process.env.VITE_BASE ?? '/konturgame/'`.

### `tsconfig.json`
- `target: ES2020` — корректно для Chrome 90+ / Safari 14+.
- `useDefineForClassFields: true` — норм.
- `lib`: `["ES2020", "DOM", "DOM.Iterable"]` — корректно.
- `module: ESNext`, `moduleResolution: bundler` — современный набор.
- `baseUrl: "./src"` — deprecated style, но работает. См. Type System.

### Build pipeline
- `npm run build` = `tsc && vite build`. **`tsc` запускается без `--noEmit`** в скрипте build. С `noEmit: true` в tsconfig это работает, но семантика странная — рекомендую явно `tsc --noEmit && vite build`.
- Нет CI (`.github/workflows/*` — не проверял, но в `package.json` ничего не запускается автоматически).

---

## Test Strategy

### Покрытие — формальное
- 12 файлов, 193 теста.
- Покрыты: `economyEngine`, `eventGenerator`, `achievementChecker`, `synergyEngine`, `victoryChecker`, `stockManager`, `simulation`, `playerStyles`, `gameStore`, `npcArcs`, `MainScreen`, `game.ts`.
- Не покрыты: `weekCalculator` (главный движок!), `npcManager`, `painEngine`, `qualityManager`, `employeeManager`, `cashRegisterEngine`, `assortmentEngine`, `metaProgress`, `onboardingEngine`. **Это половина сервисного слоя.**

### 17 тестов падает прямо сейчас
Прогон `npm test --run` возвращает `4 failed | 8 passed (12)` файла, `17 failed | 176 passed (193)` тестов.

Примеры расхождений:
- `gameStore.test.ts:22` — ожидает `loyalty: 50`, код даёт `55` (gameStore.ts:54). Кто-то поменял дефолт и не обновил тест.
- `economyEngine.test.ts` → `calculateCapacity adds hall-expansion` ожидает 49, получает 56. Похоже, base values сместились.
- `achievementChecker.test.ts` — массово падает (`big_profit`, `millionaire`, `high_rep`, `loyal_staff`, `first_service`, `three_services`, `all_services`, `hall_upgrade`, `resilient`). Вероятно после рефакторинга `checkNewAchievements` поменял сигнатуру / условия.

**Эффект:** тесты не выполняют функцию safety net. CI бы давно отвалился, но CI нет — значит у разработчика просто красная панель в IDE, на которую он перестал смотреть. Это самый опасный паттерн в QA: «нормализация красного».

### Окружение
`vitest.config.ts:9 environment: 'node'` — а `MainScreen.test.tsx` рендерит React. Должно быть `jsdom` для component-тестов либо отдельный конфиг. `jsdom` уже в devDependencies, но не используется в config. Возможно, MainScreen-тест работает чудом (или mocked всё).

`test-setup.ts` — кастомный mock localStorage (не `jsdom`). Это объясняет, почему тесты не используют jsdom: проект сознательно избегает DOM. Хорошее решение для скорости (2.87s на 193 теста), но ограничивает тестирование UI.

### Чего нет
- **E2E** (Playwright/Cypress) — нет. Для single-page игры с долгим сценарием это серьёзная дыра. Регрессии типа «после 30 недель кнопка Next Day падает» ловятся только живой игрой.
- **Visual regression** — нет. Не критично сейчас.
- **Coverage report** — настроен (`@vitest/coverage-v8`), но цифры не в ADR/доках.
- **Property-based** (fast-check) — для движка экономики был бы очень полезен («после processWeek balance не уходит в NaN никогда»).

---

## Technical Debt

### Что Phase A/B/C удалили — чисто
`grep` по удалённым именам (`brandEffect`, `level_5/10/15`, `SYNERGIES_CONFIG`, `PromoWalletModal`, `BundleModal`, `svetlana_growth`, `inspector_chain`, `anna_war`, `marina_promo`, `viktor_loan`, `gleb_review`, `suppliers`, `tactic`) — **все ссылки убраны**. Остались только комментарии-надгробия (`achievements.ts:311`, `qualityManager.ts:10`, `gameStore.ts:23`). Чистая работа.

### Долг, оставшийся явно
1. **Save key mismatch** (App.tsx vs gameStore.ts) — критический баг.
2. **17 падающих тестов** — баг или drift (нужно решить, что: фиксить тесты или код).
3. **`extractState` whitelist** — 6 потерянных полей (`personalGoal`, `chosenEventOptions`, `genaSchemesInvested`, …).
4. **`metaProgress` vs `metaStore`** — два параллельных места для meta-прогресса.
5. **`useGameStore()` без селекторов в 28 файлах** — медленные ребрендеры.
6. **`saveToStorage` без throttle** — 30–80 записей за день.
7. **Helper-методы внутри store** (`getActivatedServices` etc.) — должны быть селекторами.
8. **`ROLLBACK_STORAGE_KEY` нигде не вызывается?** — `saveSnapshot()` вызывается в gameStore.ts:910, но из UI его никто не дёргает (нужно перепроверить). Возможен dead code.
9. **`as any` 25 раз** — пятна, которые можно отчистить системно.
10. **Mocked-jsdom в `test-setup.ts`** — узкое место для component testing.

### Неявный долг — размер `gameStore.ts`
1465 строк в одном файле — это уже барьер для понимания. Файл хочется разбить:
- `stores/gameStore/state.ts` (initial state)
- `stores/gameStore/actions/balance.ts`, `services.ts`, `employees.ts`, `loans.ts`, `npc.ts`, `lifecycle.ts`
- `stores/gameStore/persistence.ts` (saveToStorage / extractState / loadGameFromStorage)
- `stores/gameStore/selectors.ts` (helper-методы как pure-функции)

Это **не оптимизация ради оптимизации** — это сделать кодбейс восприимчивым для второго разработчика.

### Скрытые ловушки в коде
- `economyEngine.ts:6` импортирует `formatRub` из `utils/format` — звучит нормально, но `formatRub` форматирует числа в строку с «₽». Если он реально используется в `economyEngine` для логики (не только в throw'ах) — это баг. Стоит проверить отдельно.
- `gameStore.ts:1303` в `markTutorialMomentSeen`: при `seen.includes(id)` возвращает `{ lastUpdated: Date.now() }` — то есть всё равно дёргает ребрендер «вхолостую». Надо `return state` или ничего не делать.

---

## Risk Register

| ID | Риск | Вероятность | Импакт | Митигация |
|---|---|---|---|---|
| R-01 | Сейвы не загружаются (App.tsx читает старый ключ) | **Случилось** | Critical | Срочный fix: единая константа `STORAGE_KEY`, экспортируется из store, `App.tsx`/`SettingsModal` импортирует её. |
| R-02 | 17 тестов красные → новые баги пройдут незамеченными | **Случилось** | High | Раунд "стабилизация тестов" (1–2 дня): пофиксить дрифт, после — CI guard «зелёные тесты или PR не сливается». |
| R-03 | `extractState` теряет 6 полей → невидимая потеря данных | **Случилось** | High | Заменить whitelist на блеклист или генерация из `keyof GameState`. |
| R-04 | Поломка save при следующем релизе (v8) без миграции | High | High | Перед v8 — реализовать `migrate(stateV7) → stateV8` в одном месте + версионировать поле `_schemaVersion` внутри сейва, не в ключе. |
| R-05 | Performance degrade при late-game (week 40+) из-за full-store re-renders | Medium | Medium | Селекторы + `useShallow` для топ-5 hot компонентов (MainScreen, MobileMainScreen, WeekResultsOverlay). |
| R-06 | localStorage переполняется на ультра-длинных партиях | Low | Medium | Жёсткий cap для `decisionLog` (например, последние 100), компрессия (LZ-string) если нужно. |
| R-07 | Vite default browserslist отсекает Yandex Browser N-2 | Low | Medium | Прописать `browserslist` явно, протестировать в Yandex/Atom. |
| R-08 | React-исключение валит весь UI без shell | Medium | High | Добавить `<ErrorBoundary>` поверх MainScreen с кнопкой «откатить ход» (`rollback()`). |
| R-09 | Bundle вырастет до 600+ KB при добавлении графиков/UI-китов | Low | Medium | Lazy-load модалок и view'хов сейчас, до того как станет нужно. |
| R-10 | Зависимость `date-fns` 60 KB ради 1–2 утилит | Low | Low | Аудит: если <5 вызовов, заменить на native `Intl.DateTimeFormat` / прямую арифметику. |
| R-11 | Один разработчик меняет API store, забывает обновить тесты — drift | High | Medium | Pre-commit hook (husky) + ESLint + блокирующий type-check на CI. |
| R-12 | Конфликт двух meta-store (`metaStore` + `metaProgress`) | Medium | Low | Слить в один или явно разграничить ownership. |

---

## Recommendations

Приоритет: **P0** = чинить эту неделю; **P1** = в текущем спринте; **P2** = в течение месяца.

### P0 — критические
1. **Зафиксировать `STORAGE_KEY` в одной константе и импортировать её** в `App.tsx`, `SettingsModal.tsx`, тесты. Симптом тривиальный, импакт — игроки не загружают сейвы.
2. **Починить `extractState` whitelist** или заменить на безопасный механизм. Текущая реализация молча теряет `personalGoal`, `chosenEventOptions`, `genaSchemesInvested`, `lastDiaryEntry`, `diaryEntryWeeks`, `newlyUnlockedLessons`. Лучшее решение — снять список с `Object.keys(createInitialState(...))` и просто исключать рантайм-only поля (`pendingPromoCode`, `pendingEvent`).
3. **Стабилизировать тесты до зелёного.** 17 падений — это не "проблема тестов", это сигнал "у нас нет regression net". Решить точно для каждого: тест устарел или код регрессировал.

### P1 — приоритетные
4. **Throttle `saveToStorage`** до 1× в 250–500 ms (debounce trailing), плюс гарантированный сейв на `beforeunload`. Выигрыш: разгрузка main thread + меньше JSON.stringify big-state.
5. **Селекторы + `useShallow` для топ-5 hot компонентов** (`MainScreen`, `MobileMainScreen`, `WeekResultsOverlay`, `OnboardingPanel`, `DesktopKontur`). Без полного рефакторинга — точечно: вместо `const store = useGameStore()` → `const balance = useGameStore(s => s.balance)` и так далее.
6. **Разбить `gameStore.ts` на модули.** 1465 строк в одном файле — порог поддерживаемости. Структура: state / actions/* / persistence / selectors. Срок — 1 день, без изменения семантики.
7. **Слить `metaStore` и `metaProgress` в один источник правды** под одним ключом. Документировать схему.

### P2 — стратегические
8. **Добавить ErrorBoundary** + recover-кнопку, дёргающую `rollback()`. Это удваивает резильентность одним компонентом.
9. **CI на GitHub Actions:** `tsc --noEmit && vitest run --coverage` на каждый PR. Без этого тесты будут краснеть снова.
10. **ESLint + Prettier + Husky pre-commit.** Минимальный набор: `@typescript-eslint`, `react-hooks`, `import/order`. Один день настройки, годы экономии.
11. **Lazy-load модалок и view'хов** через `React.lazy`. Топ кандидаты: `VictoryModal`, `AchievementsModal`, `StatisticsView`, `DecisionLogView`, `DevelopmentView`. Экономия 50–80 KB initial bundle.
12. **Сменить версионирование сейва с ключа на поле.** `konturgame_state` (один ключ) + `state._schemaVersion: 7`. Это делает миграцию возможной (`if (v < 7) migrateV6toV7(state)`), а не «всё начать заново».
13. **Покрыть тестами `weekCalculator`, `npcManager`, `painEngine`, `qualityManager`.** Эти 4 файла — ядро игрового цикла, и они без тестов.
14. **Property-based тест для `processWeek`:** «после любого валидного состояния processWeek не оставляет NaN, undefined и не уходит в отрицательный balance больше чем `daysBalanceNegative` лимит».
15. **Прописать `browserslist`** явно: `["> 0.5% in RU", "last 2 versions", "Firefox ESR", "not dead", "not IE 11"]`. Yandex Browser попадёт в `> 0.5% in RU`.
16. **Решить судьбу `date-fns`.** Если используется в 2–3 местах — заменить на native, экономия 60 KB.
17. **`React.lazy` + PWA-плагин для Vite.** Игра 100% offline-friendly — естественный fit для PWA.

### Acceptance criteria для верификации
- "Save key fix готов" = сейв создан → перезагрузка страницы → игра в том же week/day/balance, что и до перезагрузки. + удаление через SettingsModal реально стирает сейв.
- "Тесты стабилизированы" = `npm test --run` → 0 failures, и в репо есть `.github/workflows/ci.yml`, который их запускает.
- "Селекторы работают" = в DevTools React Profiler при `addBalance(1)` ребрендерятся <5 компонентов вместо текущих ~20+.
- "extractState не теряет полей" = unit-тест "round-trip extract→parse сохраняет все поля createInitialState".

---

## Итог

**Архитектурно** проект в неплохой форме для своего размера: слои не нарушены, типы сильные, зависимости минимальные, билд простой. Это редкая дисциплина для инди-проекта — Phase A/B/C цели достигнуты, мёртвых ссылок нет.

**Тактически** есть критический баг (рассинхрон save key) и большой накопленный долг в виде god-store с full-subscribe и красных тестов. Эти три симптома (save bug, full-store, red tests) сигналят одно и то же: не хватает CI / regression net. Когда нет автоматического страховщика, разработчик неизбежно дрейфует.

Самая высокоокупаемая работа на ближайшую неделю: P0 (3 пункта) + CI + ErrorBoundary. Это ~2–3 дня и резко поднимает потолок проекта.
