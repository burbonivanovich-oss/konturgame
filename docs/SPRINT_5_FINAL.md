# Спринт 5 (5a-5e) — Финальный отчёт

**Период:** 17 апреля — 13 мая 2026
**Активных дней:** ~17
**Коммитов:** 50+ за спринт, ~348 за всю историю проекта
**Время:** ~70-90 часов AI + ~10-15 часов активного взаимодействия

---

## 📋 Обзор

Серия из 5 балансировочных и нарративных спринтов: от грубой настройки экономики (5) до полноценной нарративной интеграции найма (5e). По итогу: симулятор готов для playtesting с реальными игроками.

**Готовность к показу:** **9/10** — остаётся только первый реальный playtest.

---

## 🎯 Главные итеративные решения

### Сделано
1. Дневной цикл → недельный (4-фазный)
2. Уровни/опыт игрока удалены, оставлен `businessTier 1/2/3`
3. Онбординг переписан с 26 шагов на 15
4. Дизайн-система внедрена (все экраны переведены)
5. Экономика откалибрована: 50/30/20 → 40/23/17/20 (победы/выжившие/банкрот/выгор)
6. Aggressive-тактика стала пунишишком
7. Личные цели подняты с 320-400К до 1.0-1.2М
8. Светлана переделана из премиум-первого найма в сюжетный второй найм
9. Hire-апгрейды удалены (найм только через события)
10. Экстерн скрыт из UI (6 сервисов)
11. Все P0/P1/P2 баги из аудита исправлены

---

## 💰 Экономика — финальное состояние

### Бизнес-параметры

| | Магазин | Кафе | Салон |
|---|---------|------|-------|
| Стартовый баланс | 80 000₽ | 80 000₽ | 80 000₽ |
| Базовые клиенты/день | 17 | 18 | 9 |
| Средний чек | 112₽ | 90₽ | 400₽ |
| Аренда/мес | 18 000₽ | 38 000₽ | 40 000₽ |
| Зарплата база/мес | 14 000₽ | 28 000₽ | 34 000₽ |
| **Итого фикс./мес** | **32 000₽** | **66 000₽** | **74 000₽** |

### Категории (basic — всегда доступна)

| Категория | Бизнес | Revenue/день | Cost/день | Маржа |
|-----------|--------|--------------|-----------|-------|
| Бакалея | Shop | 7 000 | 4 250 | 39% |
| Напитки | Cafe | 5 000 | 1 550 | 69% |
| Базовые услуги | Salon | 6 000 | 2 200 | 63% |

### Множитель расходов по неделе

```
W1-10:   ×0.65 (sandbox/grace)
W11-20:  линейная интерполяция 0.65 → 1.0
W21+:    ×1.0 (полная стоимость)
```

### Тактики недели

| Тактика | Revenue | Energy/нед | Rep/нед | Loyalty/нед |
|---------|---------|-----------|---------|-------------|
| 🔥 Aggressive | ×1.18 | −9 | −1.4 | −1.05 |
| 🌿 Calm | ×0.97 | +17.5 | +0.7 | 0 |
| ⭐ Service | ×1.0 | +2.1 | +5.6 | +3.5 |

### Энергобаланс

- Базовое восстановление: +42/нед
- Базовый расход (без сотрудников): shop 21+15(solo)=36, cafe 27+15=42, salon 20+15=35
- Solo penalty убирается при найме первого
- Manager (Светлана) — особое: +25% capacity к assistants, **+40% к specialists**, но Олег с `dislikesManager` теряет −10% и пол падает до 0.75

---

## 🛒 Сервисы Контура (6 активных)

| Сервис | Цена/год | Эффект |
|--------|----------|--------|
| 🏦 Bank | 0₽ | Эквайринг 1.5%, без него −30% клиентов |
| 📄 ОФД | 12 000₽ | Онлайн-касса, синергия с Маркетом |
| 🛒 Маркет | 24 000₽ | +20% пропускной, +15% чек, −20% списаний |
| 📁 Диадок | 24 000₽ | +5% клиентов, −25% энергии на закупки |
| 🔍 Фокус | 24 000₽ | +1 реп/день, проверка поставщиков |
| 📊 Эльба | 36 000₽ | +2 лояльности/день, бухгалтерия |

**Экстерн скрыт из UI** (Спринт 5e). `ServiceType` всё ещё включает `'extern'` для совместимости с тестами/сэйвами.

### Фискальный накопитель
К ПЕРВОЙ кассе обязательно идёт ФН за 8 000₽ (54-ФЗ). State: `fiscalDriveOwned: boolean`. Реализация — бандл в `purchaseRegister` action.

---

## 🧵 Нарративные цепочки

### Линия найма (полностью переделана в 5e)

```
W1-3:     Stage 0 онбординг (intro)
W3-5:     mikhail_crisis (W3-5) — знакомство с поставщиком
W4-14:    Stage 1 онбординг (Банк → Касса+ФН → ОФД)
W5-6:     🔔 solo_overload — пинок к найму
W7-8:     👥 first_hire — выбор первого из 4 кандидатов
W15:      📓 Дневник «нужен ещё человек» / «справлялся один, но...»
W19:      💬 Михаил между делом упоминает племянницу
W20+:     ⭐ svetlana_intro — Светлана сама приходит
W22+:     🚨 svetlana_demands_hire — если был solo
W23+:     💔 svetlana_to_anna — если отказали
W24+:     ⚠️ oleg_trouble_1 — если Олег в команде
W25+:     🚪 oleg_trouble_2 — финал
W28+:     📚 svetlana_growth_1 — просьба про курсы
```

### First-hire кандидаты

| Кандидат | ЗП | Eff (старт → финал) | Energy | Лояльн. |
|----------|-----|---------------------|--------|---------|
| 👨 Дальний родственник Андрей | 25K | 0.7 стабильно | 9 | −3 |
| 👨‍🎓 Студент Никита | 35K | **0.85 → 1.05** ↑ | 6 | 0 |
| 👨 Олег без энтузиазма | 38K | **1.0 → 0.9** ↓ | 6 | 0 |
| 🍳/🏪/💇 Бывший профи | 55K | 1.2 стабильно | 5 | +5 |
| (отказ) | — | — | — | −2 |

### Светлана (manager, W20+)

- ЗП 60K/мес, eff 1.3, energy 4
- Manager бонус к команде: +25% к assistants / **+40% к specialists**
- Backstory: 22 года, выпускница политеха, талантливая
- Появление: пятница вечером, ссылается на дядю-Михаила
- Если не нанять — она у Анны через 3 недели

### Олег под Светланой (двухступенчатый чейн)

- W24+: oleg_trouble_1 — «прогулы, нахамил клиентке». Выбор: дать неделю / уволить
- W25+: oleg_trouble_2 (если дал неделю) — «не пришёл в субботу». Единственный выход — расстаться

---

## 🎯 Личные цели (Спринт 5d)

| Цель | Сумма | Дедлайн | Нарратив |
|------|-------|---------|----------|
| `close_debt` | 1 000 000₽ | W46 | Кредитка 380K + потребительский 350K + долг маме 270K |
| `brother_tuition` | 1 100 000₽ | W48 | Платная учёба брата, 3 курса вперёд со скидкой −15% |
| `own_apartment` | 1 200 000₽ | W50 | Студия в Кировском, первый взнос 20% |

Реальное распределение по % оптимизации (% от PRO at deadline):

| Цель | Магазин | Кафе | Салон |
|------|---------|------|-------|
| close_debt 1.0M @ W46 | 74% | 64% | 58% |
| brother 1.1M @ W48 | 76% | 66% | 59% |
| own_apartment 1.2M @ W50 | 76% | 67% | 60% |

---

## 🏆 Win conditions

```ts
combined victory:  balance ≥ 800K
                + weekly profit ≥ 30K
                + 6 services active
                + tier ≥ 3
                + 7 achievements

year_one victory:  W ≥ 52
                + balance ≥ 200K (раньше: > 0)
                + reputation ≥ 50 (раньше: > 0)
```

«Победа» теперь означает реальное достижение, а не просто «дожил».

---

## 🎮 UX-фиксы

### Из аудита (P0)
- **`handleEventOption`** через `applyEventConsequence` — `hireEmployee`, `fireEmployee`, `energyDelta` больше не пропадают при UI-resolve
- **`extractState`** сохраняет: `personalGoal`, `weeklyTactic`, `businessTier`, `chosenEventOptions`, `lastDiaryEntry`, `diaryEntryWeeks`, `seenMicroEvents`, `fiscalDriveOwned`

### Из аудита (P1)
- **Defer event** — «Подумаю позже», единоразово
- **Burnout warning card** — красный алерт при первом обнулении энергии
- **Energy → revenue badge** — игрок видит «усталость режет выручку на 10/20%»
- **Upgrade requirement badges** — зависимости (cold-case → freezer и т.д.) с галочками/крестами
- **Monthly cost warnings** — апгрейды с salary/rent increase помечены красным
- **Tactic blurbs per-week** — игрок видит честные цифры за неделю
- **Crisis week telegraph** — чёткое предупреждение за неделю до crisis week

### Из аудита (P2)
- **Vibe-aware microevents** — 35 событий с тональностью, state-aware picker
- **Win conditions tightened** — combined 800K/30K, year_one 200K+50rep
- **Teaser tips** — 9-уровневая контекстная система
- **Mobile parity** — проверено, всё ок. Удалены orphan-модалы

---

## 📊 Текущий баланс симуляции (30 партий)

```
Победы:             12 (40%)  ← year_one + combined
Выжившие до W52:     7 (23%)  ← дотянули год, не дотянули до цели
Банкротства:         5 (17%)
Выгорания:           6 (20%)
```

**Распределение по типу бизнеса:**

| | Победы | Банкрот | Выгор |
|---|--------|---------|-------|
| Магазин | 3 | 2 | ~4 |
| Кафе | 5 | 1 | ~2 |
| Салон | 4 | 2 | 0 |

### Mixed-tactics (5 стратегий)

| Стратегия | Магазин W52 | Кафе W52 | Салон W52 |
|-----------|------------|----------|-----------|
| CASUAL базовое | 303K | 200K | 234K |
| CASUAL + апгрейды | 614K | 839K | 234K |
| CASUAL + 4 сервиса | 335K | 214K | 252K |
| MID (4+апгр) | 690K | 896K | 257K |
| PRO (всё+всё) | 1.80M | 2.01M | 2.30M |

---

## ✅ Тесты

- **14 файлов, 190 тестов, 100% pass**
- Покрытие основных систем: economyEngine, eventGenerator, achievementChecker, dayCalculator, stockManager, synergyEngine, victoryChecker, gameStore
- Информационные симуляции: `runs.test.ts` (30 партий), `mixedPlay.test.ts` (5 стратегий × 3 бизнеса)

---

## 📝 Что не сделано (известные ограничения)

### Сильные кандидаты на следующий спринт

1. **Туториальные подсказки для новых механик** — Manager bonus, employee growth/decay, vibe events нигде явно не объяснены игроку (только в коде / в текстах опций)
2. **Реальный playtest с 3-5 живыми людьми** — главный gap для движения от 9/10 к 10/10
3. **Stress test save/load миграций** — проверить с реальными старыми сэйвами
4. **Narrative consistency pass** — прочитать все события подряд и привести тон к единому
5. **Mobile UX тест на реальном устройстве** — функции есть, но не проверена juicy-feel

### Технические долги

- `handleEventOption` имеет unit-тесты на `applyEventConsequence`, но не на сам UI-flow
- Crisis weeks могут стакать 3-4 события (chain + crisis + random) — потенциально перегружает
- `seenMicroEvents` массив растёт неограниченно (мелочь)
- ServiceType всё ещё включает `'extern'` — формальный мёртвый код в типе
- 1 «year_end» edge case в симуляции иногда классифицируется как unknown

### Содержательные

- Achievements (20 штук) — не пересмотрены под новые win conditions
- NPC arcs для Tamara/Gena/Petrov/Anna — рабочие, но не тестировались в полном прохождении
- Diary entries — есть для backstory и dictionary, но мало контекстных вариантов
- Sounds/music — нет вообще
- Animations — минимальные (микро-transitions)

---

## 📁 Структура файлов (после спринта)

```
src/
├── types/game.ts                  # +personalGoal, weeklyTactic, growthRate, dislikesManager, fiscalDriveOwned, seenMicroEvents
├── stores/gameStore.ts            # +resolveEventOption, extended extractState, fiscalDriveOwned in purchaseRegister
├── constants/
│   ├── business.ts                # UPGRADES_CONFIG без hire-*, requiresServices без extern, VICTORY_* пересмотрено
│   ├── dailyMicroEvents.ts        # 35 событий с vibe (было 21)
│   ├── eventChains.ts             # +svetlana_intro/demands_hire/oleg_trouble_1/2, svetlana_growth с W18→W28
│   ├── firstHireEvents.ts         # NEW — SOLO_OVERLOAD, FIRST_HIRE_OPTIONS, SVETLANA_INTRO, MIKHAIL_RECOMMENDS_SVETLANA
│   ├── firstEncounters.ts         # -FIRST_EXTERN/-PAIN_EXTERN, Маркет 48K→24K
│   ├── onboarding.ts              # Stage 4 без Экстерна, текст buy_register обновлён
│   ├── personalGoals.ts           # 1.0-1.2M (было 320-400K), новые истории
│   ├── employees.ts               # без изменений (типы и позиции)
│   ├── weeklyTactics.ts           # aggressive жёстче, service без штрафа, blurbs per-week
│   ├── diary.ts                   # +2 entry для pre-Svetlana (W15)
│   └── npcExits.ts                # обновлено для новых ID целей
├── services/
│   ├── weekCalculator.ts          # state-aware micro picker, Olek/Svetlana auto-schedule, defer events
│   ├── eventGenerator.ts          # +applyEventConsequence для hireEmployee/fireEmployee, +revealNPC
│   ├── employeeManager.ts         # MANAGER_BOOST_DEFAULT/_SPECIALIST, dislikesManager, updateEmployeeGrowth
│   ├── victoryChecker.ts          # ALL_SERVICES без extern, YEAR_ONE строже
│   └── assortmentEngine.ts        # base категории дешевле, alcohol без extern
├── components/
│   ├── MainScreen.tsx             # handleEventOption через resolveEventOption
│   ├── MobileMainScreen.tsx       # handleEventOption через resolveEventOption
│   ├── EventPhaseOverlay.tsx      # +defer button, +requiredBusinessTypes filter
│   ├── Indicators.tsx             # +burnout warning, +energy→revenue badge
│   ├── BackstoryScreen.tsx        # новые описания backstory
│   └── views/DevelopmentView.tsx  # +RequirementBadge, monthly cost warnings
└── styles/globals.css             # +pulse-critical keyframe
```

**Удалено:**
- `src/components/modals/CampaignModal.tsx` (orphan)
- `src/components/modals/UpgradesModal.tsx` (orphan)

---

## 🚀 План для playtest-показа

### Что показать
1. Backstory selection (3 истории)
2. BusinessSelector (3 бизнеса)
3. Stage 0 туториал
4. Первые недели (solo, бaнк-касса-ОФД)
5. solo_overload событие (W5-6)
6. first_hire выбор (W7-8)
7. Свет ланa intro (W20)
8. Любое decision-deadline событие (показать defer)
9. Personal goal — финальная мотивация

### Что собирать обратной связью
- **Темп:** Не слишком ли медленно/быстро?
- **Понятность:** Что не понятно из текста? Где нужна подсказка?
- **Эмоция:** Какой момент запомнили? Что вызвало улыбку/тревогу?
- **Решения:** Сложно ли выбирать? Достаточно ли информации?
- **Цифры:** Не пугают ли числа в опциях найма?
- **Светлана:** Звучит ли её приход натурально?

### Чек-лист «перед показом»
- [ ] Прогнать сборку: `npm run build`
- [ ] Очистить localStorage между плейтестами
- [ ] Подготовить «черновой» сэйв на W19 для quick-Svetlana-демо
- [ ] Открыть на одном устройстве, не дать переключать вкладки (отвлекают)
- [ ] Записать сессию (с разрешения) — для разбора решений после

---

## 🔗 Связанные документы

- `CLAUDE.md` — общий контекст проекта (актуальный)
- `docs/audit/` — детальные аудиты по областям
- `docs/design/` — концептуальные документы (могут быть устаревшими)
- `git log --oneline --all` — полная история коммитов

---

*Документ актуален на: 13 мая 2026, коммит `9566573`*
*Спринт 5e завершён, основные системы в стабильном состоянии*
