# Экраны и UI-компоненты «Бизнес с Контуром»

Полная документация к тому, что реально отрисовывает `src/components/`. Каждый компонент описан с позиций: за что отвечает, какие данные из `gameStore` читает, какие действия запускает, как связан с другими экранами.

## Высокоуровневая навигация

```
ResponsiveLayout  (переключает desktop/mobile по ширине 1024px)
├── [Первый запуск или после поражения]
│   ├── BusinessSelector  (выбор типа бизнеса)
│   ├── BackstoryScreen   (предыстория + ситуация)
│   └── PerkSelectionScreen (мета-перк, если не первый запуск)
│
└── [В игре]
    ├── MainScreen           (desktop, 8 вкладок в левой панели)
    └── MobileMainScreen     (мобильный, 3 вкладки)

Из любого экрана игры можно открыть модалки, оверлеи и помощь.
```

## Разбиение по файлам

| # | Файл | Что описывает |
|---|------|---------------|
| 01 | [entry-screens.md](./01-entry-screens.md) | Экраны входа: ResponsiveLayout, BusinessSelector, BackstoryScreen, PerkSelectionScreen |
| 02 | [main-screen.md](./02-main-screen.md) | MainScreen (desktop), MobileMainScreen, общая структура игры |
| 03 | [views.md](./03-views.md) | 6 основных вкладок: Dashboard, Finance, Operations, Warehouse, Development, Statistics, DecisionLog |
| 04 | [modals.md](./04-modals.md) | 16 модальных окон |
| 05 | [panels-overlays.md](./05-panels-overlays.md) | OnboardingPanel, ServicePanel, Indicators, NextDayButton, WeekSummaryOverlay, WeekResultsOverlay, дизайн-система |

## Статистика

| Категория | Количество |
|-----------|------------|
| Главные экраны / точки входа | 6 (включая Responsive) |
| Вкладки в MainScreen | 8 (из них 2 — экосистема и журнал) |
| Views-контейнеры | 6 |
| Модальные окна | 16 |
| Panels / Overlays | 6 |
| Design-system компоненты | ~6 (KLeftRail, KHeaderBar, DesktopKontur, DesktopDashboard, DesktopEvent, KStatusBar и др.) |

## Жизненный цикл недели в UI

```
weekPhase === 'summary'
    ↓  WeekSummaryOverlay («Начать неделю»)
weekPhase === 'actions'
    ↓  игрок решает события, управляет бизнесом,
       покупает сервисы, нанимает сотрудников и т.д.
    ↓  клик NextDayButton
weekPhase === 'results'
    ↓  WeekResultsOverlay (разбор прибыли, потерь, вех)
weekPhase → 'summary' (новой недели)
```

## Источник правды для данных

Все экраны читают данные из Zustand-стора `src/stores/gameStore.ts`:

- `currentWeek`, `dayOfWeek`, `weekPhase`, `balance`, `reputation`, `loyalty`, `entrepreneurEnergy`;
- `lastDayResult` — полный результат последнего дня (выручка, прибыль, клиенты и т.д.);
- `services`, `employees`, `cashRegisters`, `enabledCategories`, `stockBatches`, `loans`, `purchasedUpgrades`, `activeCampaigns`;
- `pendingEvent`, `pendingEventsQueue`, `triggeredEventIds`, `decisionLog`;
- `npcs`, `qualityLevel`, `milestoneStatus`;
- `onboardingStage`, `onboardingStepIndex`, `onboardingCompleted`;
- `isGameOver`, `isVictory`, `gameOverReason`.

Мета-прогрессия (перки, общая статистика забегов) — в `src/stores/metaStore.ts`.
