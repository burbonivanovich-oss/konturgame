# Бизнес с Контуром — CLAUDE.md

Экономический симулятор управления малым бизнесом. Игрок выбирает тип бизнеса (магазин, кафе, салон красоты) и ведёт его — задача выживать и расти. Ключевая механика: 7 сервисов Контура решают реальные игровые проблемы и демонстрируют их ценность игроку.

**Стек:** React 18 + TypeScript + Vite + Zustand + Tailwind CSS

## Команды

```bash
npm run dev          # локальный сервер http://localhost:5173
npm run build        # production build
npm run type-check   # tsc --noEmit
npm test             # vitest
```

## Архитектура

```
src/
├── types/game.ts           # Все типы — начинать отсюда
├── stores/gameStore.ts     # Zustand store, персист в localStorage (ключ konturgame_state_v7)
├── utils/
│   └── format.ts           # formatRub / formatRubSigned / formatNumber — единый форматер денег
├── constants/
│   ├── business.ts         # ИСТОЧНИК ПРАВДЫ: цены, параметры бизнеса, конфиги сервисов
│   ├── businessTiers.ts    # 1-2-3 тиры бизнеса (единственная видимая прогрессия)
│   ├── achievements.ts     # ~17 достижений в 4 волнах (level-* удалены)
│   ├── employees.ts        # 6 универсальных позиций сотрудников
│   ├── cashRegisters.ts    # 3 типа касс
│   ├── dailyMicroEvents.ts # Микрособытия (отдельный слой)
│   ├── promoCodes.ts       # 3 промо-кода (Bank / Market / Elba) + PROMO_SERVICES
│   ├── onboarding.ts       # SERVICE_UNLOCK_MAP — медленная разблокировка (Эльба ~12-я неделя)
│   ├── npcs.ts             # 8 NPC (Катя, Виктор, Денис, Ирина, Артём, Михаил, Тамара, Гена)
│   ├── npcArcs.ts          # 24 ивента: 3 эпизода (meet → test → resolve) на NPC
│   ├── npcEvents.ts        # 8 standalone-ивентов для текстуры
│   ├── npcExits.ts         # Финальные сцены NPC в VictoryModal
│   ├── eventChains.ts      # Только 2 цепочки: mikhail_crisis + legacy
│   └── ownerInvestments.ts # Покупки качества жизни владельца (ноут, кресло, абонемент)
├── services/
│   ├── weekCalculator.ts   # Основной цикл: processWeek() — 7 дневных итераций
│   ├── economyEngine.ts    # Доход, расходы, налоги, модификаторы
│   ├── eventGenerator.ts   # События, цепочки, микро- и кризис-события
│   ├── synergyEngine.ts    # BUNDLE_TIERS — 3+/5+/7+ сервисов = +10/20/30% к выручке
│   ├── painEngine.ts       # Потери от отсутствия каждого сервиса (стимул)
│   ├── employeeManager.ts  # Найм/увольнение
│   ├── qualityManager.ts   # qualityLevel 0-100 → ±20% клиентов, ±10% к чеку (без скрытого brandEffect)
│   ├── assortmentEngine.ts # Категории товаров
│   ├── cashRegisterEngine.ts
│   ├── onboardingEngine.ts
│   ├── achievementChecker.ts
│   ├── victoryChecker.ts
│   ├── npcManager.ts       # Реляции, память, пассивные эффекты NPC
│   └── stockManager.ts     # FIFO склад
└── components/
    ├── MainScreen.tsx      # Точка входа UI, 11 режимов навигации
    ├── MobileMainScreen.tsx # Мобильный вариант
    ├── ResponsiveLayout.tsx # Переключение desktop/mobile
    ├── BusinessSelector.tsx # Экран выбора бизнеса
    ├── OnboardingPanel.tsx # Sticky-панель онбординга снизу
    ├── modals/             # 14 модалок (PromoWallet/Bundle удалены)
    ├── views/              # 6 экранов (Finance, Operations, Warehouse, Development, Statistics, DecisionLog)
    └── design-system/      # DesktopKontur, KLeftRail, KHeaderBar, KStatusBar и пр.
```

## Источник правды для числовых значений

Всегда смотреть в `src/constants/business.ts`. Документы в `/docs` могут отставать.

### Актуальные цены сервисов (годовые, из кода)

| Сервис | Цена/год | Основной эффект |
|--------|----------|-----------------|
| Контур.Маркет | 48 000 ₽ | +20% пропускной, +15% чек, -20% списаний |
| Контур.Банк | 36 000 ₽ | Кредит под 5%, -30% энергии на операции |
| Контур.ОФД | 12 000 ₽ | Онлайн-касса, синергия с Маркетом |
| Контур.Диадок | 24 000 ₽ | +5% клиентов, -25% энергии на закупки |
| Контур.Фокус | 24 000 ₽ | +1 репутация/день, проверка поставщиков |
| Контур.Эльба | 36 000 ₽ | +2 лояльности/день, -35% энергии |
| Контур.Экстерн | 48 000 ₽ | -2% налогов |

### Стартовые параметры бизнеса (из кода)

| | Магазин | Кафе | Салон |
|---|---------|------|-------|
| Стартовый баланс | 80 000 ₽ | 80 000 ₽ | 80 000 ₽ |
| Базовые клиенты/день | 15 | 18 | 6 |
| Средний чек | 100 ₽ | 70 ₽ | 400 ₽ |
| Аренда/мес | 50 000 ₽ | 60 000 ₽ | 55 000 ₽ |
| Зарплата база/мес | 40 000 ₽ | 50 000 ₽ | 60 000 ₽ |

## Что реализовано

- **Игровой цикл:** `processWeek()` — 7 дневных итераций
- **Сервисы:** 7 сервисов + бандл-тиры (3+/5+/7+ → +10/20/30% к выручке) — единственная синергия
- **Качество:** `qualityLevel` 0-100, два видимых эффекта: ±клиенты, ±чек. Никаких скрытых компаунд-множителей (`brandEffect` удалён)
- **Достижения:** ~17 достижений в 4 волнах (`level_5`/`level_10`/`level_15` удалены)
- **События:** основные ивенты с Контур-альтернативами + цепочки (`mikhail_crisis`, `legacy`) + микрособытия + кризис-события
- **NPC:** 8 архетипов (Катя, Виктор, Денис, Ирина Петровна, Артём, Михаил, Тамара, Гена). У каждого — 3-эпизодная арка (meet → test → resolve), привязанная к окнам недель 5–10 / 20–25 / 35–45
- **Opinion-стек:** `NPCRosterModal` показывает «{NPC} помнит» — список причин с дельтами +/-, anchor-записи закреплены 📌
- **Реклама:** 10 кампаний, Campaign ROI аналитика
- **Улучшения:** 18 (6 на тип бизнеса) в `UPGRADES_CONFIG`
- **Сотрудники:** 6 универсальных позиций (cashier, assistant, manager, specialist, supervisor, trainer)
- **Pain Engine:** видимый блок «Потеряно без Контура» в `WeekResultsOverlay`
- **Онбординг:** медленная разблокировка через `SERVICE_UNLOCK_MAP` — Эльба открывается на ~12-й неделе
- **Промо-коды:** 3 кода (Bank / Market / Elba), `PromoCodeModal` срабатывает только при подключении этих сервисов. PromoWallet и BundleModal удалены
- **Займы:** тип `Loan`. **Гейтинг:** доступны только при активном Банке **И** открытом Денисе
- **Вехи:** `MilestoneView`, `milestoneStatus` (week10/20/30)
- **Кассы:** 3 типа (mobile/reliable/fast)
- **Ассортимент:** категории товаров с зависимостями от сервисов и апгрейдов
- **Owner Investments:** покупки качества жизни владельца (`OwnerInvestmentsModal`)
- **Мобильный layout:** `MobileMainScreen` + `ResponsiveLayout`
- **Единый формат денег:** `src/utils/format.ts` — округляет, рублёвый суффикс, знак для signed

## Что было удалено в чистках Phase A/B/C

- **Weekly tactic chooser** (3 тактики на неделю) — лишнее трение
- **Поставщики** (`suppliers.ts`, supplier-modal) — dormant прототип
- **`getBrandEffect`** — компаунд rep+loy → ×clients/×revenue/×price поверх всего, невидимая математика
- **`level` / `experience`** — четвёртая параллельная прогрессия. Осталась одна: `businessTier` 1-3
- **`SYNERGIES_CONFIG`** (7 пар-синергий) — мёртвая константа, рендерилась как 7 пустых чекбоксов
- **`PromoWalletModal` + `BundleModal`** — лишние модалки про маркетинг Контура
- **NPC-цепочки `svetlana_growth` / `inspector_chain` / `anna_war` / `marina_promo` / `viktor_loan` / `gleb_review`** — заменены на 3-эпизодные арки

## Тесты

Покрытие: `src/services/__tests__/`, `src/stores/__tests__/`, `src/types/__tests__/`, `src/constants/__tests__/`. Основные файлы: `economyEngine`, `eventGenerator`, `achievementChecker`, `stockManager`, `synergyEngine` (бандл-тиры), `victoryChecker`, `gameStore`, `simulation`, `playerStyles`, `npcArcs`.

## Сейв-формат

Ключ `localStorage`: **`konturgame_state_v7`**. После Phase B бамп — старые сохранения не загружаются (схема несовместима, чтобы не возиться с миграцией удалённых полей).
