# Бизнес с Контуром — подробное описание проекта

**Версия:** 0.1.0
**Жанр:** одиночный экономический симулятор малого бизнеса (текстовый, browser)
**Целевая платформа:** web (desktop + mobile)
**Язык:** русский (захардкожено)
**Назначение:** маркетинговый промо-инструмент СКБ Контур — игрок управляет малым бизнесом и через игровые механики знакомится с 7 сервисами Контура.

---

## 1. Концепция и игровая идея

### 1.1. Сюжетная завязка

Игрок выбирает один из трёх типов малого бизнеса в условном российском городе:
- **🏪 Магазин у дома** (продуктовый): высокий поток, низкий чек, FIFO-склад с порчей.
- **☕ Кафе:** средний поток, средний чек, FIFO-склад, сезонность сильнее.
- **💅 Салон красоты:** малый поток, высокий чек, без склада, услуги вместо товаров.

Старт у всех одинаковый: 80 000 ₽ на счету, 50 репутации, 55 лояльности, 100 энергии. Дальше — выживание и рост в течение ~30–52 недель.

### 1.2. Центральный конфликт игры

Каждую неделю на игрока обрушиваются проблемы реального МСП: налоги, проверки, кражи, текучка кадров, конкуренты, сломанная касса, протухший товар, поставщик-кидалово, моральные дилеммы (взятка инспектору, обман сотрудника). На большинство из этих проблем у Контура есть **сервис-ответ**:

| Сервис | Цена/год | Что делает в игре |
|---|---:|---|
| **Контур.Маркет** | 48 000 ₽ | +20% пропускная, +15% чек, экспирация запасов снижена с 80% до 40% потерь |
| **Контур.Банк** | 36 000 ₽ | Кредиты под 5%, эквайринг (1.5% комиссии), безналичная оплата 60% клиентов |
| **Контур.ОФД** | 12 000 ₽ | Онлайн-касса (синергия с Маркетом), -0.5% налогов |
| **Контур.Диадок** | 24 000 ₽ | +5% клиентов (быстрый ЭДО), -25% энергии на закупки |
| **Контур.Фокус** | 24 000 ₽ | +1 репутации/день, защита от плохих поставщиков |
| **Контур.Эльба** | 36 000 ₽ | +2 лояльности/день, -35% энергии (автоотчётность) |
| **Контур.Экстерн** | 48 000 ₽ | -2% налогов |

Отдельная мета-механика — **бандл-тиры**: за 3+/5+/7 активных сервисов выручка получает прибавку +10/+20/+30%. Это единственная синергетическая система; парных синергий после Phase B нет.

### 1.3. Условия победы и поражения

**Победа** (`src/services/victoryChecker.ts`):
- *Year One:* выжить 52 недели с положительным балансом и репутацией.
- *Combined Victory:* достичь баланса ≥ 500 000 ₽, репутации ≥ 70, лояльности ≥ 70, активных сервисов ≥ 5.
- *Tier-3 Victory:* апгрейд до 3-го тира бизнеса.

**Поражение:**
- Балланс ≤ 0 в течение 3 дней подряд (банкротство).
- Репутация = 0 в течение 7 дней (репутационный коллапс).
- Энергия предпринимателя дошла до 0 (выгорание).

---

## 2. Технологический стек и сборка

### 2.1. Фронтенд

```
React 18.2 + TypeScript 5.3 + Vite 5
Zustand 4.4 (state) + Tailwind 3.3 (стили)
clsx 2.0 (className utilities) + date-fns 3.0 (хотя по факту не используется)
```

### 2.2. Тесты

```
Vitest 1.0 + jsdom 29 + @vitest/coverage-v8
```

12 файлов тестов в 5 директориях `__tests__/`:
- `src/types/__tests__` — типы
- `src/stores/__tests__` — Zustand-стор
- `src/components/__tests__` — компоненты (MainScreen)
- `src/constants/__tests__` — константы (npcArcs)
- `src/services/__tests__` — все 15 сервисов (economyEngine, eventGenerator, achievementChecker, stockManager, synergyEngine, victoryChecker, simulation, playerStyles)

После фиксов — **193/193 теста зелёные**.

### 2.3. Скрипты

```bash
npm run dev          # Vite dev-сервер на http://localhost:5173
npm run build        # tsc && vite build (production bundle)
npm run preview      # просмотр прод-сборки
npm run type-check   # tsc --noEmit (без эмита)
npm test             # vitest (watch-режим)
npm run test:ui      # vitest UI
npm run test:coverage  # покрытие
```

### 2.4. Хранение состояния

- localStorage, ключ `konturgame_state_v7` (после Phase B бамп схемы).
- Авто-сохранение на каждое изменение store через `useGameStore.subscribe(...)`.
- Старые сейвы (v6 и ниже) несовместимы с текущей схемой — их выкидывает на стартовый экран.

---

## 3. Архитектура кода

103 файла TypeScript/TSX, строгая иерархия слоёв (никаких восходящих импортов):

```
constants → services → stores → components
```

### 3.1. `src/types/game.ts`

Единый файл типов на ~600 строк. Здесь определены `GameState`, `Service`, `ServiceType`, `Modifiers`, `DayResult`, `WeekResult`, `Event`, `EventOption`, `NPC`, `NPCArcEpisode`, `Loan`, `PersonalGoal`, `MetaLesson` и десятки других. Источник правды для типизации всей игры.

### 3.2. `src/constants/` — данные игры

Все игровые данные — данные, не код:

| Файл | Содержит |
|---|---|
| `business.ts` | **Источник правды цен**: BUSINESS_CONFIGS, MONTHLY_EXPENSES, SERVICES_CONFIG, UPGRADES_CONFIG, AD_CAMPAIGNS_CONFIG, ECONOMY_CONSTANTS |
| `businessTiers.ts` | Тиры 1-2-3: множители аренды/зарплаты/чека/вместимости |
| `gameBalance.ts` | LOYALTY_CAPACITY_MODIFIER, COMPETITOR_CYCLE, REGISTER_BREAKDOWN_PENALTY_RATE, BANK_PAYMENT_RATIO, ENERGY_THRESHOLDS, PAIN_LOSSES (deprecated, оставлен для совместимости сейвов) |
| `achievements.ts` | ~17 ачивок в 4 волнах (1=всегда, 2=W12, 3=W26, 4=W52) |
| `employees.ts` | 6 универсальных ролей (cashier, assistant, manager, specialist, supervisor, trainer) |
| `cashRegisters.ts` | 3 типа касс: mobile / reliable / fast |
| `dailyMicroEvents.ts` | Микрособытия (отдельный пул) |
| `crisisEvents.ts` | Кризис-события для недель 10/20/30/40 |
| `eventChains.ts` | 2 цепочки: `mikhail_crisis` + `legacy` |
| `npcs.ts` | 8 NPC: Катя, Виктор, Денис, Ирина, Артём, Михаил, Тамара, Гена |
| `npcArcs.ts` | 24 эпизода NPC (3 на каждого: meet → test → resolve) |
| `npcEvents.ts` | 8 standalone-ивентов NPC |
| `npcExits.ts` | Финальные сцены NPC в VictoryModal |
| `personalGoals.ts` | Личные цели зависящие от backstory |
| `personalEvents.ts` | События привязанные к backstory игрока |
| `moralDilemmas.ts` | Моральные выборы (взятка, обман, предательство) |
| `metaLessons.ts` | 5 мета-уроков переносимых между прогонами |
| `cityNewspaper.ts` | Газетные сводки города (по неделям) |
| `diary.ts` | Дневниковые записи (срабатывают каждые 5 недель) |
| `recurringCustomers.ts` | Постоянные клиенты-посетители |
| `tutorialMoments.ts` | Контекстные подсказки |
| `promoCodes.ts` | 3 промо-кода: Bank/Market/Elba |
| `onboarding.ts` | SERVICE_UNLOCK_MAP (5 стадий медленной разблокировки сервисов; Эльба открывается ~12-я неделя) |
| `ownerInvestments.ts` | Покупки качества жизни предпринимателя (ноут, кресло, абонемент) |

### 3.3. `src/services/` — игровые движки (15 файлов)

| Файл | Назначение |
|---|---|
| `weekCalculator.ts` | **Главный цикл.** `processWeek(state)` запускает 7 дневных итераций; рассчитывает доход, расходы, налоги, репутацию, лояльность, экспирацию, события, ачивки |
| `economyEngine.ts` | Расчёт `clients`, `capacity`, `revenue`, `monthlyExpenses`, `taxes`, `dailySubscriptions`, `tierMultipliers`, `buildModifiers`, `getReputationModifier` |
| `synergyEngine.ts` | `calculateSynergyModifiers` — бандл-тиры 3+/5+/7+ → +10/20/30% выручки |
| `painEngine.ts` | **Stub.** Возвращает нули — Pain Engine был осознанно удалён в Phase B. Заменён на бандл-тиры + категории + дискретные события |
| `qualityManager.ts` | qualityLevel 0-100; обновление еженедельно; модификаторы клиентов (±20%) и чека (±10%) |
| `eventGenerator.ts` | Генерация событий: основной пул, цепочки, микро-события, кризисы, NPC-арки, моральные дилеммы, газета, дневник |
| `assortmentEngine.ts` | Расчёт выручки по категориям + штрафы за категории без оборудования |
| `cashRegisterEngine.ts` | Пропускная способность касс, поломки |
| `stockManager.ts` | FIFO-склад, экспирация (40% потерь с Маркетом, 80% без) |
| `employeeManager.ts` | Найм/увольнение, лимиты по тиру |
| `npcManager.ts` | Реляции NPC, opinion-stack «{NPC} помнит», anchor-записи 📌, пассивные эффекты |
| `onboardingEngine.ts` | 5-стадийный онбординг с медленной разблокировкой сервисов |
| `achievementChecker.ts` | `checkNewAchievements` — 27 ачивок в 4 волнах; гейты по `WAVE_UNLOCK_WEEKS` |
| `victoryChecker.ts` | Условия победы/поражения |
| `metaProgress.ts` | Накопительная мета-прогрессия (5 уроков, переносятся между прогонами) |

### 3.4. `src/stores/`

- `gameStore.ts` (1473 строки) — единственный Zustand-стор. State + 80+ actions + persistence через `extractState`/`saveToStorage`.
- `metaStore.ts` — мета-прогресс между прогонами (runs count, perks, unlocked lessons).

### 3.5. `src/components/` (структура)

```
components/
├── App.tsx, MainScreen.tsx, MobileMainScreen.tsx, ResponsiveLayout.tsx
├── BusinessSelector.tsx        — выбор бизнеса
├── BackstoryScreen.tsx         — выбор backstory (мотивация + личное)
├── PerkSelectionScreen.tsx     — выбор перка между прогонами
├── Indicators.tsx              — KPI-чипы
├── ServicePanel.tsx            — панель сервисов
├── NextDayButton.tsx           — главная кнопка прогресса
├── OnboardingPanel.tsx         — sticky-панель снизу
├── TutorialMoments.tsx         — контекстные подсказки
├── WeekResultsOverlay.tsx      — результаты недели (с pain-блоком, диаграммами)
├── WeekSummaryOverlay.tsx      — короткое подведение
├── modals/                     — 14 модалок
│   ├── Modal.tsx               — базовая
│   ├── EventModal.tsx          — событие/выбор
│   ├── AchievementsModal.tsx
│   ├── AssortmentModal.tsx
│   ├── CampaignModal.tsx       — рекламные кампании
│   ├── CashRegisterModal.tsx
│   ├── HelpModal.tsx
│   ├── HireEmployeeModal.tsx
│   ├── NPCRosterModal.tsx      — список NPC + opinion-stack
│   ├── OwnerInvestmentsModal.tsx
│   ├── PromoCodeModal.tsx
│   ├── SettingsModal.tsx
│   ├── UpgradesModal.tsx
│   └── VictoryModal.tsx
├── views/                      — 6 экранов навигации
│   ├── DecisionLogView.tsx
│   ├── DevelopmentView.tsx     — апгрейды + найм
│   ├── FinanceView.tsx         — финансы + кредиты
│   ├── OperationsView.tsx      — кассы + ассортимент + сотрудники
│   ├── StatisticsView.tsx
│   └── WarehouseView.tsx
└── design-system/              — DesktopKontur, KHeaderBar, KLeftRail, KStatusBar, KIcon, Logo, Phone (desktop preview), Spark, primitives, tokens.ts
```

11 режимов навигации в основном приложении.

---

## 4. Игровой цикл

### 4.1. Главный цикл `processWeek(state)`

Запускается на нажатие «Следующая неделя». 7 дневных итераций:

```
для каждого из 7 дней:
  1. computeBaseClients (база × тир)
  2. applyQualityModifier (±20% клиенты)
  3. applyCapacityLimit (пропускная способность)
  4. applyRegisterThroughput (лимит касс)
  5. applyBankPaymentRatio (60% если банк, 100% иначе)
  6. computeAvgCheck (база × тир × качество × модификаторы)
  7. revenue = served × avgCheck × (1 + synergy.revenueBonus)
  8. acquiringFee (-1.5% если банк)
  9. registerBreakdown (случайный шанс)
  10. energyModifier (низкая энергия = меньше выручки)
  11. taxes = revenue × (TAX_RATE − taxSaving)
  12. dailySubscriptions, monthlyExpense (1/28), employeeSalary (1/7), utilities, registerMaintenance
  13. dayNetProfit = revenue − expenses − painLosses
  14. expiry, qualityWeekly, reputationDelta, loyaltyDelta
  15. accumulate в weekResult

после 7 дней:
  16. competitorEvent (раз в N недель)
  17. milestone-checks (W10/W20/W30)
  18. checkNewAchievements
  19. NPC passive effects + chain follow-ups + arc events
  20. personalGoal (achieved/missed)
  21. diary entry (раз в 5 недель)
  22. micro-event (1 шт./неделя)
  23. main event OR crisis (W10/20/30/40)
  24. checkVictory / checkGameOver
  25. currentWeek += 1
```

### 4.2. Прогрессия

- **`businessTier` 1→2→3** — единственная видимая прогрессия. Каждый тир увеличивает аренду/зарплату/выручку/вместимость.
- **`onboardingStage` 0→4** — 5 стадий разблокировки сервисов (`SERVICE_UNLOCK_MAP`).
- **`reputation` / `loyalty` / `qualityLevel`** — числовые метрики с прямыми эффектами (без скрытого `brandEffect`).
- **`entrepreneurEnergy`** — ресурс предпринимателя; при ≤0 → выгорание (поражение).
- **Achievements** — 27 ачивок, разбитых на 4 волны, открываются по неделям.

---

## 5. Контентные системы

### 5.1. NPC и арки

8 NPC с фиксированными архетипами:
- **Катя Михеева** (бухгалтер) — школьная подруга
- **Виктор** (инспектор) — антагонист
- **Денис** (банкир) — гейтит кредиты
- **Ирина Петровна** (поставщица)
- **Артём** (молодой сотрудник)
- **Михаил** (ветеран) — кризисная цепочка
- **Тамара** (соседка)
- **Гена** (мутный посредник со схемами)

У каждого — **3-эпизодная арка** (meet → test → resolve), привязанная к окнам недель 5–10 / 20–25 / 35–45. Реляции хранятся в `state.npcs`. Opinion-stack показывает «{NPC} помнит» — список причин с дельтами +/−, где anchor-записи закреплены 📌.

### 5.2. События

5 параллельных пулов событий:
1. **Основной пул** (`generateEvent`) — общие события с альтернативами «Контур vs не-Контур».
2. **Цепочки** (`eventChains.ts`) — `mikhail_crisis` (4 шага), `legacy` (3 шага).
3. **Микро-события** (`dailyMicroEvents.ts`) — без блокирующей модалки.
4. **Кризис-события** (`crisisEvents.ts`) — раз в W10/20/30/40 вместо обычного.
5. **NPC-арки** (`npcArcs.ts`) + **личные события** (`personalEvents.ts`) + **моральные дилеммы**.

Жёсткое правило: **1 блокирующее событие на неделю**.

### 5.3. Финал

`VictoryModal` собирает итог:
- Тип победы (Year One / Combined / Tier-3).
- NPC-exit-сцены (только для тех NPC, чьи арки решены).
- Сводка ключевых решений из `decisionLog`.
- Дневник (последняя запись).
- Статистика (выручка, прибыль, активные сервисы, ачивки).
- Промо-коды (для тех сервисов, что были подключены).

---

## 6. Текущие известные проблемы (из аудита)

После последних фиксов **закрыты:**
- ✅ STORAGE_KEY mismatch (сейв не загружался)
- ✅ Двойной штраф репутации
- ✅ Мобильный EventModal не открывался
- ✅ ResponsiveLayout оборачивал реальный мобильник в Phone
- ✅ `hall_upgrade` ачивка ломалась на кафе/салоне
- ✅ extractState терял 6 полей (personalGoal, chosenEventOptions, etc.)
- ✅ 17 красных тестов синхронизированы с текущей балансировкой
- ✅ `simulation.test.ts` получил реальные assertions

**Остаются открытыми:**
- ⚠️ **Pain Engine = 0**: маркетинговое обещание «потеряно без Контура» не выполнено в runtime. Решение: либо реализовать через дискретные события, либо убрать UI-блок.
- ⚠️ **Экономика тиров 2-3**: T2 кафе −330 ₽/нед, T3 кафе −6 822 ₽/нед, T3 магазин окупается за 416 недель. Тиры экономически не оправданы.
- ⚠️ **Кафе сложнее в 8 раз**: 5 недель до банкротства vs 38 недель у салона при одинаковом старте.
- ⚠️ **Мониторинг отсутствует**: ни одного аналитического трекера.
- ⚠️ **VictoryModal без CTA**: главная конверсионная точка не имеет ссылки «Попробовать сервисы Контура».
- ⚠️ **Нет CI/CD**: GitHub Actions отсутствуют, регрессии ловятся вручную.
- ⚠️ **A11y**: модалки без `role="dialog"`, нет focus trap, нет `aria-live`, цвет — единственный канал для прибыли/убытка.
- ⚠️ **Нет seeded RNG**: тесты событий нон-детерминистичны.

---

## 7. Документация

- `CLAUDE.md` — инструкции для Claude Code (актуальная)
- `README.md` — пользовательский readme
- `GAME_DESIGN_DOCUMENT.md` — устаревший GDD (описывает удалённые системы: поставщиков, тактики, levels 1-10)
- `GAME_MECHANICS.md`, `SYSTEMS_INTERACTION.md`, `DIFFICULTY_AND_PLAYER_OPTIONS.md` — частично актуальны
- `DOCUMENTATION_INDEX.md` — индекс
- `docs/audit/` — **30 отчётов аудита** от специалистов разных дисциплин (создан в этой сессии)

---

## 8. История чисток

**Phase A/B/C** удалили:
- `getBrandEffect` (компаунд rep+loy → ×clients/×revenue) — невидимая математика
- `level` / `experience` — четвёртая параллельная прогрессия
- `SYNERGIES_CONFIG` (7 пар-синергий) — мёртвая константа
- Поставщиков (`suppliers.ts`) — dormant прототип
- Weekly tactic chooser
- `PromoWalletModal` + `BundleModal`
- 6 NPC-цепочек (заменены на 3-эпизодные арки)

После чисток код **стройнее, чем GDD**.

---

## 9. Маркетинговая цель

Игра — промо-инструмент Контура. Главная KPI:
- **Awareness:** игрок знакомится с экосистемой 7 сервисов органически, через игровые проблемы.
- **Conversion:** промо-коды (Bank/Market/Elba) активируются при подключении соответствующего сервиса в игре.

**Дыра воронки:** `VictoryModal` (пик эмоции) не имеет CTA в реальный мир. Это главный недостаток текущего билда — он зафиксирован в аудите аналитика и live-ops-дизайнера.

---

## 10. Кратко

Это **технически здоровая** игра с **выраженным нарративом** (8 NPC × 3 эпизода = 24 ивента) и **прозрачной экономикой** после Phase B-чисток. Главные слабости — экономический баланс тиров 2-3, отсутствие конверсионного CTA, отсутствие телеметрии и базовой a11y. После последних фиксов 9 P0-багов закрыты, 193/193 теста зелёные.
