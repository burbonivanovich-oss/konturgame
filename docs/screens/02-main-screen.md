# 02. MainScreen и MobileMainScreen

## MainScreen (desktop)

**Файл:** `src/components/MainScreen.tsx`.

**Роль:** Главный контейнер игры на десктопе. Управляет 8 вкладками, всеми модалками, фазами недели, очередью событий, онбордингом и тостами.

### Общая раскладка

```
MainScreen (100vh)
├── KLeftRail              ← вертикальная панель навигации (слева)
├── KHeaderBar             ← верхняя строка статуса
├── OnboardingPanel        ← подсказки онбординга (если активен)
├── Основной контент (flex:1)
│   │
│   ├── activeView === 'dashboard'   → DashboardView (KPI, событие, очередь, склад, статусы)
│   ├── activeView === 'ecosystem'   → DesktopKontur (каталог сервисов + синергии)
│   ├── activeView === 'warehouse'   → WarehouseView
│   ├── activeView === 'finance'     → FinanceView
│   ├── activeView === 'operations'  → OperationsView
│   ├── activeView === 'development' → DevelopmentView
│   ├── activeView === 'statistics'  → StatisticsView
│   └── activeView === 'journal'     → DecisionLogView
│
└── Глобальные модали и оверлеи
    ├── HelpModal, SettingsModal, AchievementsModal
    ├── CashRegisterModal, HireEmployeeModal, OwnerInvestmentsModal
    ├── PromoWalletModal, PromoCodeModal, BundleModal
    ├── MicroEventModal, UpgradesModal, CampaignModal, AssortmentModal
    ├── VictoryModal
    └── WeekSummaryOverlay, WeekResultsOverlay  (по фазам недели)
```

### Какие данные читает из gameStore

- **Время и фаза:** `currentWeek`, `dayOfWeek`, `weekPhase`.
- **Баланс и показатели:** `balance`, `reputation`, `loyalty`, `entrepreneurEnergy`, `qualityLevel`, `level`.
- **Результаты дня:** `lastDayResult` (выручка, прибыль, обслужено, упущено, расходы, налог, pain).
- **Игровые сущности:** `services`, `employees`, `cashRegisters`, `enabledCategories`, `stockBatches`, `npcs`, `loans`, `purchasedUpgrades`, `activeCampaigns`.
- **События:** `pendingEvent`, `pendingEventsQueue`, `triggeredEventIds`, `decisionLog`.
- **Онбординг:** `onboardingStage`, `onboardingStepIndex`, `onboardingCompleted`.
- **Игровое состояние:** `isGameOver`, `isVictory`, `gameOverReason`, `savedBalance`, `promoCodesRevealed`.

### Основные обработчики

#### `handleEventOption(optionId)`

Вызывается при выборе варианта в текущем событии:

1. `applyEventConsequence(state, event, optionId)` — все последствия (деньги, репутация, лояльность, энергия, временные модификаторы, активация сервиса, NPC, триггер цепочки).
2. Если выбран вариант с `isContourOption: true` — вычислить «сэкономлено X ₽» (разница с вариантом-проигрышем), показать тост.
3. Записать в `decisionLog`.
4. `markEventAsResolved()` — убрать событие, подставить следующее из `pendingEventsQueue`.

#### `handleNextDay()` / `completeActionsPhase()`

Проверяет, что нет незавершённого события. Если есть — показывает warn-тост «Сначала разрешите событие». Если нет — запускает следующий день через `processWeek()` или переключает фазу.

#### `handleNavClick(viewId)`

- Меняет `activeView`.
- Отслеживает впервые посещённые вкладки — показывает тост «Открылся журнал» и т.п.
- Проверяет блокировки (некоторые вкладки недоступны в ранние недели).

### Правая панель Dashboard

Отдельный «боковой» блок, собранный из дизайн-системы:

- статус-пилы: репутация, лояльность, энергия, качество;
- компактный список активных синергий;
- индикатор стадии бизнеса;
- мини-сетка сервисов 2×3 с зелёными индикаторами активных;
- **NextDayButton** как главный CTA.

### Центр Dashboard

- **4 KPI-карточки:** баланс, прибыль за день, расходы за день, обслужено клиентов.
- **Чек-лист дня:** напоминание «Разрешить событие», «Нажать следующий день».
- **Карточка события** (`DesktopEvent` из дизайн-системы): тёмный фон, портрет NPC, текст, варианты ответов с иконками КОНТУР / РИСК.
- **Виджет очереди:** сетка точек — зелёные обслужены, оранжевые ушли.
- **Виджет склада:** прогресс-бары партий FIFO с днями до истечения.

### Тосты

- «Контур.Банк сэкономил X ₽» — когда события удалось пройти с меньшим ущербом благодаря активному сервису.
- «Разблокирован раздел Журнал» — при первой разблокировке вкладки.
- «Контур.Маркет подключён: +20% клиентов…» — при активации сервиса.

## MobileMainScreen

**Файл:** `src/components/MobileMainScreen.tsx`.

**Роль:** Компактный вариант UI для экранов < 1024px. Использует ту же бизнес-логику (`gameStore`), но перепаковывает её в 3 вкладки.

### Вкладки

1. **День**
   - 2 KPI-карточки: баланс, прибыль за вчера.
   - Быстрые кнопки: «Закупка», «Касса», «Энергия» → соответствующие модалки.
   - Карточка события (если есть).
   - NextDayButton внизу.
2. **Индикаторы** — компонент `Indicators`.
3. **Сервисы** — `OnboardingPanel` + `ServicePanel`.

Все модалки работают так же, как на десктопе, но обычно вызываются снизу (sheet-стиль).

## Фазы недели и оверлеи

`weekPhase` определяет, какой оверлей показать поверх основного контента:

- `summary` → `WeekSummaryOverlay` («Начать неделю»).
- `actions` / `events` → оверлеев нет, обычная игра.
- `results` → `WeekResultsOverlay` (разбор итогов недели).

При `isGameOver === true` или `isVictory === true` — поверх всего показывается `VictoryModal`.

## Ключевые файлы

```
src/components/
  MainScreen.tsx
  MobileMainScreen.tsx
  ResponsiveLayout.tsx
  design-system/
    KLeftRail.tsx
    KHeaderBar.tsx
    DesktopKontur.tsx
    DesktopDashboard.tsx
    DesktopEvent.tsx
    KStatusBar.tsx
src/stores/
  gameStore.ts
```
