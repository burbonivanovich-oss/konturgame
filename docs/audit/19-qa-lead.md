# 19 — QA Strategy

**Дата:** 2026-05-07
**Стек:** React 18 + TypeScript + Vite + Zustand + Vitest

## 1. Текущая пирамида тестов

Только юнит-тесты через Vitest, 12 файлов:
- `src/services/__tests__/`: economyEngine, eventGenerator, achievementChecker, stockManager, synergyEngine, victoryChecker, simulation, playerStyles
- `src/stores/__tests__/`: gameStore
- `src/constants/__tests__/`: npcArcs
- `src/types/__tests__/`: game
- `src/components/__tests__/`: MainScreen

Критика:
- Vitest `environment: 'node'`, но `MainScreen.test.tsx` — компонентный. `jsdom` установлен, но не активирован — тест в составе 17 красных.
- Нет `@testing-library/react` в `package.json`.
- `test:coverage` есть, но без CI — % покрытия неизвестен.
- Нет `@testing-library/user-event`, `msw`.

**Вывод:** широкое основание юнитов, но 17 красных делают его нестабильным. Компонентного уровня де-факто нет.

## 2. Покрытие критичных путей

**Save/Load:** баг с ключом (`konturgame_state` vs `konturgame_state_v7`) не покрыт тестом. Должны быть проверены: запись после `processWeek()`, чтение при init, поведение при missing key, при несовместимой схеме.

**Victory/Defeat:** `victoryChecker.test.ts` есть, но edge cases (победа на 30-й, банкротство на 0, незавершённые milestones) — под вопросом.

**Navigation 11 режимов:** `MainScreen.test.tsx` либо не рендерит, либо падает при `environment: 'node'` без RTL.

**Mobile layout:** `MobileMainScreen` и `ResponsiveLayout` — 0 тестов. Любое CSS-изменение ломает мобильный вид незамеченно.

## 3. Симуляционные тесты — отсутствие assertions

`simulation.test.ts` всегда зелёный, в нём нет `expect()`. Ложная уверенность.

Нужные assertions:
- После N недель `balance != NaN`, не уходит в `-Infinity`.
- При всех 7 сервисах синергия применяется один раз, не дважды.
- `qualityLevel ∈ [0, 100]` после 52 недель.
- При балансе < 0 в течение 3 недель подряд срабатывает defeat.
- Доход недели коррелирует с `clients × avgCheck ± 30%`.

**Тип:** Integration, **BLOCKING**.

## 4. Detеrminism — отсутствие seeded RNG

`eventGenerator.ts`, `weekCalculator.ts` используют `Math.random()` без seed. Последствия:
- Тесты событий не воспроизводимы.
- Flake-риск в CI.
- Невозможны 1000-прогон бенчи.

**Решение:** ввести LCG или `seedrandom` (1 КБ). `gameStore` хранит seed; тесты передают фикс seed.

**Тип:** Logic, **BLOCKING** для eventGenerator.

## 5. E2E план (Playwright)

Минимум 5 тестов:

1. **New game:** выбор бизнеса → 1-я неделя → баланс изменился.
2. **Save/load:** завершить неделю → reload → состояние восстановлено.
3. **Promo trigger:** купить ОФД (нет промо) → купить Маркет (промо открывается).
4. **Victory:** через store установить win → VictoryModal с NPC exits.
5. **Mobile:** viewport 375×812 → MobileMainScreen, не Phone-wrapper.

Конфиг: `@playwright/test` + `webServer: { command: 'npm run dev', port: 5173 }`.

## 6. Visual Regression

**Рекомендация:** Playwright snapshots вместо Storybook+Chromatic (меньше overhead).

Снимать:
- `VictoryModal` (финал, высокая видимость).
- `WeekResultsOverlay` с Pain Engine.
- `OnboardingPanel` (sticky positioning).
- Mobile main view @375px.

Storybook можно добавить позже отдельно.

## 7. Release Quality Gates (CI)

CI отсутствует. Минимум GitHub Actions:

| Gate | Команда | Когда блокирует |
|---|---|---|
| 1. Type Safety | `npm run type-check` | каждый PR |
| 2. Tests | `npm test -- --run` | каждый PR (после фикса 17 красных) |
| 3. Build | `npm run build` | каждый PR |
| 4. Coverage ≥60% (≥80% для services) | `npm run test:coverage` | advisory → блокирующее после стабилизации |
| 5. E2E smoke (5 кейсов) | Playwright | перед релизом |

**Definition of Release Ready:**
- Gates 1-3 зелёные на каждом PR
- Gate 4 зелёный после установки порогов
- Gate 5 зелёный перед публичным деплоем
- 0 открытых S1/S2 багов
- `simulation.test.ts` содержит реальные assertions

## 8. Top-7 рекомендаций

1. **Починить 17 красных тестов** — немедленно. Большинство из-за `environment: 'node'` на компонентном тесте → добавить `environmentMatchGlobs: [['src/components/**', 'jsdom']]`.
2. **Добавить assertions в `simulation.test.ts`** — конвертировать «скрипт» в реальный тест.
3. **Подключить CI (Gates 1-3)** — без него улучшения условны.
4. **Seeded RNG** — `seedrandom` + seed в state. Снимет flake-риск.
5. **Покрыть save-key bug тестом** — `expect(localStorage.getItem('konturgame_state_v7')).not.toBeNull()` после init.
6. **`jsdom` для компонентов** через `environmentMatchGlobs`. Разблокирует MainScreen-тесты.
7. **5 Playwright E2E** перед первым публичным деплоем.

## Summary

Тестовая база — 12 файлов, 17 красных. `simulation.test.ts` зелёный без assertions. Нет CI, RNG seed, e2e, visual reg. Save-key bug не покрыт. Порядок работ: красные → CI → seed RNG → save-key test → Playwright.
