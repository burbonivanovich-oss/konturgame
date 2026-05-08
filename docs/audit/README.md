# Аудит проекта «Бизнес с Контуром» — сводный отчёт

**Дата:** 2026-05-07
**Ветка:** `claude/project-audit-documentation-z2RA4`
**Версия игры:** 0.1.0 (`konturgame_state_v7`)
**Объём аудита:** 30 параллельных специализированных отчётов

## Об аудите

Аудит проведён 30 специализированными агентами по основным дисциплинам разработки игры: креативное направление, дизайн, экономика, нарратив, UX, доступность, арт, инженерия, безопасность, производительность, аналитика, QA, DevOps, релиз, локализация, аудио, инструменты и коммуникации.

Каждый агент выдал независимый отчёт. Большинство выводов сошлись на **одних и тех же критических проблемах**, что повышает достоверность диагноза.

---

## 📌 Главное в одной строке

> Игра в коде **значительно сильнее**, чем в документации. Чистки Phase A/B/C — правильный шаг. Но в проде нас ждёт классический «парадокс молчаливых регрессий»: сейв не загружается, USP-механика возвращает нули, 17 тестов красные, CI нет. До релиза — 6 недель плотной работы при готовой команде.

---

## 🚨 Критические находки (P0 — блокеры релиза)

### [BUG-1] Сейв никогда не загружается
**Подтверждено:** technical-director, analytics-engineer, tools-programmer
**Файлы:** `src/App.tsx:21,68`, `src/components/modals/SettingsModal.tsx:18,33`, `src/stores/gameStore.ts:26`
`App.tsx` читает ключ `'konturgame_state'`, store пишет `'konturgame_state_v7'`. Прогресс игрока **никогда не восстанавливается** между сессиями. Это критически искажает D1/D7-метрики и делает любую длинную игру невозможной.
**Фикс:** вынести `STORAGE_KEY` в общий экспорт, сослаться отовсюду. ~30 минут.

### [BUG-2] Pain Engine возвращает нули — основной USP не работает
**Подтверждено:** game-designer, economy-designer, gameplay-programmer, producer
**Файлы:** `src/services/painEngine.ts`, `src/services/weekCalculator.ts:247`
Главное маркетинговое обещание игры — «вот сколько вы потеряли БЕЗ сервисов Контура» — в runtime возвращает нули. Дополнительно `calculatePainLosses` получает `dayRevenue` дважды (revenue и normalizer), что усугубляет.
**Фикс:** перепроверить аргументы вызова + восстановить расчёт через `PAIN_LOSSES`. Без этого подключение ОФД/Диадок/Эльбы экономически нерационально.

### [BUG-3] `extractState` whitelist теряет поля при сохранении
**Подтверждено:** technical-director
**Файл:** `src/stores/gameStore.ts:1322-1433`
Молча не сохраняются: `personalGoal`, `chosenEventOptions`, `genaSchemesInvested`, `lastDiaryEntry`, `diaryEntryWeeks`, `newlyUnlockedLessons`. Даже если BUG-1 исправить, эти поля теряются после reload.
**Фикс:** заменить whitelist на blacklist «не-сериализуемых» полей, добавить валидацию схемы при загрузке.

### [BUG-4] `registerOverflowPenalty` декларируется, но не списывается
**Подтверждено:** systems-designer, gameplay-programmer
**Файл:** `src/services/weekCalculator.ts:202/307/424`
UI показывает игроку штраф за переполнение кассы, но из баланса деньги не вычитаются. Декларация-без-эффекта.
**Фикс:** вычесть `registerMissed × avgCheck` из `dayNetProfit`.

### [BUG-5] 17 тестов красные в trunk
**Подтверждено:** technical-director, qa-lead
**Причина:** `vitest.config.ts` — `environment: 'node'`, но `MainScreen.test.tsx` — компонентный тест. `jsdom` установлен, но не активирован.
**Фикс:** добавить `environmentMatchGlobs: [['src/components/**', 'jsdom']]`. Затем установить `@testing-library/react`.

### [BUG-6] `simulation.test.ts` всегда зелёный без assertions
**Подтверждено:** qa-lead, tools-programmer
**Файл:** `src/services/__tests__/simulation.test.ts`
Тест запускает прогон, но не проверяет ничего. Ложная уверенность в баланс-стабильности.

### [BUG-7] Mobile EventModal не открывается на `pendingEvent`
**Подтверждено:** ux-designer, ui-programmer
**Файл:** `src/components/MobileMainScreen.tsx`
`showEventModal` нигде не устанавливается в `true` при появлении события — мобильный игрок видит заблокированную кнопку «Следующий день» без подсказки. **Полная блокировка прогресса на мобильном устройстве.**

### [BUG-8] `recordEventChoice` пропущен в mobile-обработчике
**Подтверждено:** ux-designer, ui-programmer
Мобильная версия не вызывает `recordEventChoice` и `addDecisionLogEntry` — Decision Log и зависимые ачивки на мобильном некорректны.

### [BUG-9] `ResponsiveLayout` оборачивает мобильный UI в `<Phone>` desktop-preview
**Подтверждено:** ux-designer
**Файл:** `src/components/ResponsiveLayout.tsx`
На реальных телефонах создаёт скролл-в-скролле и ломает viewport.

### [BUG-10] Двойной штраф репутации на клиентов
**Подтверждено:** systems-designer, producer
**Файл:** `src/services/economyEngine.ts:89` + `src/services/weekCalculator.ts:134`
При reputation < 30 трафик умножается дважды (0.5 × 0.75 = 0.375 базового). Скрытая компаунд-математика, противоречит декларированной прозрачности.

### [BUG-11] Достижение `year_one_no_debt` физически недостижимо
**Подтверждено:** systems-designer
**Файл:** `src/services/achievementChecker.ts:36`
`WAVE_UNLOCK_WEEKS[4]` требует `>=52`, но проверка вызывается до инкремента недели. Реальная неделя — 51, ачивка не выдаётся, на следующей итерации игра завершена.

### [BUG-12] Достижение `hall_upgrade` недостижимо для кафе и салона
**Подтверждено:** systems-designer
ID `hall-expansion` существует только в `UPGRADES_CONFIG.shop`. Без пометки business-type.

---

## ⚠️ Высокий приоритет (P1)

### Дизайн и баланс

| # | Находка | Источник |
|---|---|---|
| D1 | **T2/T3 для кафе и магазина математически убыточны.** Кафе T3: −6 822 ₽/нед. Магазин T3 окупается за 416 недель. | economy-designer |
| D2 | **Стартовая сложность не выровнена.** Кафе с банком: 5 недель до банкротства, салон: 38 недель. Одинаковый стартовый баланс — нечестный выбор. | economy-designer |
| D3 | **ОФД/Диадок не окупаются прямо.** Берутся только ради бандл-тира. ROI ~226-453 недель. Нужны уникальные эффекты (Диадок: −5% закупочных цен). | economy-designer |
| D4 | **Бандл-тир делает выгодными мусорные покупки.** Прирост от тира перекрывает стоимость 2 дешёвых сервисов даже при 0-ROI. Свобода выбора иллюзорна. | economy-designer |
| D5 | **Низкая decision density** между событиями. Игра — симулятор-таймер без weekly focus. | game-designer |
| D6 | **Eventgen-конкуренция:** все 8 NPC-meet (randomChance: 1.0) попадают в общий пул из ~50 шаблонов. У ~33% игроков ни один ключевой NPC не открывается к W10. | level-designer |
| D7 | **Газета (`cityNewspaper`) никогда не вызывается** из weekCalculator. Мёртвый dispatcher. | level-designer |
| D8 | **W26-29 — нарративная пустыня.** 4 недели без NPC-/cityNewspaper-якорей. | level-designer, narrative |
| D9 | **mikhail_crisis_1 хронологический конфликт.** Стартует на W3-5 («вы же меня знаете»), MEET-арка приходит позже на W5-10. | narrative-director |
| D10 | **Промо-коды в неправильный момент.** Триггер при подключении сервиса (low emotion), а не в VictoryModal/GameOver (peak emotion). | live-ops |
| D11 | **Только 3 из 7 сервисов имеют промо-коды** (Bank/Market/Elba). Фокус, Диадок, Экстерн, ОФД — без конверсионного пути. | live-ops |
| D12 | **Заявленная длина прогона 30-45 недель, реальная победа `year_one` требует ≥52.** Расхождение онбординга и кода. | live-ops, systems |
| D13 | **Алкоголь для ИП недопустим (171-ФЗ).** Апгрейд `liquor-cabinet` — фактическая ошибка от лица Контура. | world-builder |
| D14 | **Декабрь у кафе −15% (как январь/февраль).** В реальности — пик корпоративов. | world-builder |
| D15 | **Конфликт двух «Кать»:** в `personalEvents` (backstory friend) и в NPC-арках. Разные персонажи с одним именем. | world-builder |

### Инженерия и архитектура

| # | Находка | Источник |
|---|---|---|
| E1 | **God-store + 28 файлов с `useGameStore()` без селектора.** Re-render storm при каждом тике. | technical-director, ui, performance |
| E2 | **`saveToStorage` 30-80 раз/день** с `JSON.stringify` 50+ полей. 40-160 мс блокировки на mobile/день. | performance, technical-director |
| E3 | **`gameStore.ts` 1465 строк.** Порог поддерживаемости пройден. Разделить на state/actions/persistence/selectors. | technical-director, lead |
| E4 | **`Math.random()` без seed** в eventGenerator/weekCalculator. Тесты не воспроизводимы, replay невозможен. | tools, qa-lead, gameplay |
| E5 | **`calculateSynergyModifiers` вызывается 14 раз за неделю** (двойной вызов из buildModifiers + day loop). | gameplay-programmer |
| E6 | **`calculateQualityLevel` накапливается, не сбрасывается** при отключении сервиса. | systems-designer |
| E7 | **Аддитивный стек вместимости** обходит тир-прогрессию: T1 + 3 апгрейда = вместимость 84, T2 = 49. | systems-designer |
| E8 | **CI отсутствует.** Любая регрессия попадает в trunk. | technical-director, devops, qa-lead |
| E9 | **`baseUrl` в `tsconfig` deprecated** в TS 7.0. | technical-director |
| E10 | **`date-fns` подключён, но не используется.** ~70-90 KB gzip dead weight. | localization, performance |

### UX и UI

| # | Находка | Источник |
|---|---|---|
| U1 | **Pain Engine виден только до W6**, исчезает раньше окончания онбординга (W12+). | ux-designer |
| U2 | **`Modal` без `role="dialog"`, focus trap, `aria-labelledby`.** P0 a11y для всех 14 модалок. | accessibility |
| U3 | **Нет `aria-live` для динамических KPI** (баланс, события). Скринридер молчит. | accessibility |
| U4 | **Прибыль/убыток только цветом** (`K.mint` vs `#c0392b`). Color-as-channel violation. | accessibility |
| U5 | **Sub-label `rgba(255,255,255,0.6)` 10px на цветных карточках** — фейл контраста и минимума размера. | accessibility |
| U6 | **Нет `prefers-reduced-motion`** нигде в проекте. | accessibility, tech-art |
| U7 | **`Lab Grotesque K`** в `tailwind.config.js` — несуществующий шрифт; Manrope импортируется дважды; нет `<link rel="preconnect">`. | tech-art |
| U8 | **Operations vs Development путаница.** «Купить кассу» в Operations, но это инвестиция. | ux-designer |
| U9 | **`tailwind.config.js` `kontour.*`** содержит другие hex, чем `tokens.ts` — 2 источника правды. | art-director, tech-art |
| U10 | **`K.mint == K.good`.** Brand identity и success signaling — один цвет. | art-director |
| U11 | **VictoryModal без анимации/конфетти** в момент пика эмоции. | tech-art, audio |
| U12 | **Эмодзи в табах не `aria-hidden`.** Скринридер озвучивает Unicode-имена. | accessibility |

### Нарратив и текст

| # | Находка | Источник |
|---|---|---|
| N1 | **Микрособытия от 3-го лица**, остальной нарратив — от 2-го. Несогласованность ~7+ событий. | writer |
| N2 | **Описание ачивки `synergy` противоречит механике** бандл-тиров. | writer |
| N3 | **«Вы успешно управляли бизнесом и освоили экосистему Контура!»** в VictoryModal — ломает тон. | narrative-director, writer |
| N4 | **Артём может получить TEST «ошибка инвентаризации»**, даже если не нанят. | narrative-director |
| N5 | **Моральные дилеммы изолированы от NPC-памяти.** Катя-бухгалтер не реагирует на взятку инспектору. | narrative-director |
| N6 | **NPC спрятаны в RosterModal**, не видны в основном UI. Самое сильное конкурентное преимущество — скрыто. | creative-director, live-ops |

### Безопасность и приватность

| # | Находка | Источник |
|---|---|---|
| S1 | **localStorage без валидации схемы.** Поломка JSON → краш игры (DoS на самого себя). | security |
| S2 | **Нет CSP в `index.html`.** | security |
| S3 | **152-ФЗ соответствие неоформлено.** Нет cookie-баннера, нет privacy notice. | security, release |
| S4 | **Промо-коды клиентские** — обходятся тривиально (если важны для KPI, нужен серверный gate). | security |

### Аналитика и релиз

| # | Находка | Источник |
|---|---|---|
| A1 | **0 аналитики в коде.** Продукт работает вслепую. | analytics |
| A2 | **VictoryModal не имеет CTA «Попробовать в реальности».** Нулевая конверсия из победы. | analytics, live-ops |
| A3 | **Нет CHANGELOG, semver, тэгов.** Нельзя rollback. | release, devops |
| A4 | **Нет 404, error-boundary, fallback при отказе localStorage.** | release, security |
| A5 | **Нет performance budget** (TTI, LCP, CLS, bundle cap). | release, performance |

---

## 📋 Приоритизированный план улучшений (3 спринта по 2 недели)

### Sprint 1 — «Truth & Trust» (P0)

Цель: убрать ложные обещания и молчаливые регрессии.

- [ ] **BUG-1** Унификация `STORAGE_KEY` (App.tsx, SettingsModal.tsx, gameStore.ts).
- [ ] **BUG-2** Pain Engine: фикс аргументов + восстановление PAIN_LOSSES.
- [ ] **BUG-3** `extractState` blacklist + валидация схемы при загрузке.
- [ ] **BUG-4** `registerOverflowPenalty` — реальное списание.
- [ ] **BUG-5** Vitest `environmentMatchGlobs` для компонентных тестов.
- [ ] **BUG-6** Реальные assertions в `simulation.test.ts`.
- [ ] **BUG-7..9** Мобильный EventModal автоматическое открытие, recordEventChoice, удаление Phone-wrapper на мобильном.
- [ ] **BUG-10** Двойной штраф репутации.
- [ ] **BUG-11..12** Достижимые ачивки (year_one_no_debt, hall_upgrade).
- [ ] **E8** GitHub Actions CI: type-check + tests + build на PR.
- [ ] **N3** Переписать финальный текст VictoryModal.
- [ ] **D13** Удалить `liquor-cabinet` или ограничить ИП-режимом.

**DoD:** 0 красных тестов, CI зелёный, save loads, Pain Engine показывает реальные числа, мобильный прогон не блокируется.

### Sprint 2 — «Feel & Density»

Цель: повысить decision density, нарративную живость и UX-полировку.

**Дизайн/баланс:**
- [ ] **D5** Weekly Focus (Трафик / Качество / Маржа) — еженедельный лёгкий выбор.
- [ ] **D1/D2** Перебалансировка тиров кафе/магазина и стартовых параметров.
- [ ] **D3** Уникальный прямой эффект Диадока (−5% закупок).
- [ ] **D6** Arc scheduler для NPC-meet — гарантированная встреча в окнах.
- [ ] **D7** Подключить cityNewspaper к weekCalculator.
- [ ] **D8** Заполнить W26-29 NPC-эпизодами или newspaper.
- [ ] **D9** Снять конфликт mikhail_crisis_1 vs MEET (либо переписать MEET для уже-знакомого).
- [ ] **D14/D15** Декабрь кафе и переименование одной Кати.

**UX/UI:**
- [ ] **U1** Pain Engine виден до завершения онбординга всех сервисов.
- [ ] **U2..U6** Базовый a11y-пакет: react-aria Modal, aria-live для KPI, иконка/префикс для прибыли, prefers-reduced-motion.
- [ ] **U7** Шрифты: убрать Lab Grotesque, дедуплицировать Manrope, добавить preconnect.
- [ ] **U8** Перенести «Кассы» в Development.
- [ ] **U9..U10** Один источник цветов: либо `tokens.ts`, либо Tailwind. Развести `K.mint` и `K.good`.
- [ ] **N6** NPC-карточки в DashboardView, реакции в WeekResultsOverlay.

**Нарратив:**
- [ ] **N1..N2** Унифицировать на 2-е лицо, переписать описание synergy.
- [ ] **N4..N5** Гейт TEST-эпизодов по фактическому найму, эхо moral-dilemma в NPC-памяти.

**Архитектура:**
- [ ] **E1** Перевести 28 файлов на `useShallow`-селекторы.
- [ ] **E2** Throttle/debounce `saveToStorage` (раз в N мс или после processWeek).
- [ ] **E4** Seeded RNG (`seedrandom` + seed в state).
- [ ] **E5** Кешировать `calculateSynergyModifiers` в начале недели.

**DoD:** все P1-блокеры закрыты, мобильный/десктоп IA унифицирован, NPC видны в основном цикле.

### Sprint 3 — «Analytics & Release»

Цель: довести до публичной готовности.

**Аналитика:**
- [ ] **A1** PostHog Cloud EU + 47-event taxonomy.
- [ ] **A2** CTA «Попробовать в реальности» в VictoryModal/GameOver.
- [ ] Funnel-дашборд + cohort-метрики (D1/D7, completion rate, service adoption).

**Архитектура:**
- [ ] **E3** Разделить `gameStore.ts` на 4 файла.
- [ ] **E9** Удалить `baseUrl` или `ignoreDeprecations`.
- [ ] **E10** Удалить `date-fns` (или начать использовать).

**QA / Release:**
- [ ] 5 Playwright E2E (new game / save-load / promo / victory / mobile).
- [ ] Visual snapshots (VictoryModal, WeekResultsOverlay, Onboarding).
- [ ] Performance budget + Lighthouse CI gate.
- [ ] Coverage ≥60% (≥80% в `services/`).
- [ ] Error Boundary + fallback при отказе localStorage.
- [ ] 152-ФЗ согласие, privacy notice.
- [ ] CHANGELOG, semver, теги.
- [ ] Audio MVP (~5 ключевых SFX по `27-sound-design.md`).
- [ ] Tech-art: конфетти на победу, fadeIn модалки.
- [ ] In-game feedback (раздел community).

**DoD:** v1.0.0-rc1, 0 S1/S2, телеметрия активна, CTA конверсии работает, политика приватности опубликована.

---

## 🎯 Рекомендованная команда (минимум для 6 недель)

| Роль | FTE | Ответственность |
|---|---|---|
| Tech Lead (full-stack React) | 1.0 | Sprint 1 P0-фиксы, рефакторинг store, CI |
| Game Designer / Narrative / UX | 1.0 | Балансировка, weekly focus, NPC scheduler, диалоги |
| Producer + Creative Director | 0.5 | GDD v3.0, ADR, координация |
| QA Engineer | 0.2 | E2E и регрессии в конце каждого спринта |
| (Опционально) Sound Designer | 20-30 ч | 5-10 ключевых SFX |

Без CD/Audio проект достижим за 6 недель. С audio MVP — 7-8 недель.

---

## 📚 Документация: что переписать

Из аудитов producer и creative-director:

1. **`GAME_DESIGN_DOCUMENT.md` устарел на 2 итерации.** Описывает удалённые системы (поставщики, тактики, level 1-10, бесконечную песочницу). **Переписать до v3.0** перед демо стейкхолдерам.
2. **`GAME_MECHANICS.md`, `SYSTEMS_INTERACTION.md`** — частично устарели (`brandEffect` ссылки).
3. **`DIFFICULTY_AND_PLAYER_OPTIONS.md`** — проверить vs текущие 3 типа бизнеса.
4. **`docs/design/UI Спецификация.md`** — синхронизировать с фактическим IA (11 режимов, 14 модалок).
5. **CLAUDE.md** — точнее всего отражает текущее состояние, но содержит устаревшие числа (аренда салона 55 000 ₽ vs 45 000 ₽ в коде).

Целевая архитектура документации:
- `docs/audit/` (этот документ) — снимок состояния на 2026-05-07.
- `docs/decisions/` — ADR по ключевым решениям (Pain Engine, Bank, Bundle).
- `docs/design/` — актуальный GDD v3.0 + UI Спецификация.

---

## 🗂️ Индекс отчётов

### Креатив, дизайн, нарратив (12)
- [01 — Creative Director](./01-creative-director.md): brand-vs-game tension, дуга игры, иконографический конфликт.
- [02 — Game Designer](./02-game-designer.md): decision density, Pain Engine, weekly focus.
- [03 — Economy Designer](./03-economy-designer.md): T2/T3 убыточны, кафе vs салон, ROI сервисов, мёртвый PAIN_LOSSES.
- [04 — Systems Designer](./04-systems-designer.md): 25 формульных проблем, двойной штраф, недостижимые ачивки.
- [05 — Narrative Director](./05-narrative-director.md): хронологический конфликт Михаила, opinion-stack, isolation moral dilemmas.
- [06 — Writer](./06-writer.md): 3-е лицо в micro-events, противоречие synergy, тон финала.
- [07 — World Builder](./07-world-builder.md): 16 фактологических проблем, алкоголь у ИП, конфликт Кать.
- [08 — UX Designer](./08-ux-designer.md): mobile EventModal, Phone wrapper, 11 режимов.
- [09 — Accessibility](./09-accessibility.md): WCAG 2.1 AA, 7 P0/P1 фиксов.
- [10 — Art Director](./10-art-director.md): два источника цветов, K.mint==K.good, нет animation tokens.
- [11 — Live Ops](./11-live-ops.md): промо-коды в неправильный момент, скрытая мета-прогрессия.
- [12 — Level Designer](./12-level-designer.md): cityNewspaper не вызывается, eventgen-конкуренция, W26-29 пустыня.

### Инженерия (7)
- [13 — Technical Director](./13-technical-director.md): save-key, extractState, god-store, 17 красных.
- [14 — Lead Programmer](./14-lead-programmer.md): API чистота, дублирование, magic numbers.
- [15 — Gameplay Programmer](./15-gameplay-programmer.md): processWeek, RNG, dead paths.
- [16 — UI Programmer](./16-ui-programmer.md): selectors, DRY desktop/mobile, modal stack.
- [17 — Performance](./17-performance.md): re-render storm, I/O, code splitting, dead deps.
- [18 — Security](./18-security.md): CSP, localStorage, 152-ФЗ.
- [28 — Tech Art](./28-tech-art.md): шрифты, цвета, motion guard, конфетти.

### QA / Release / Process (5)
- [19 — QA Lead](./19-qa-lead.md): пирамида, simulation assertions, e2e план.
- [20 — QA Tester](./20-qa-tester.md): smoke / regression / edge / golden runs / a11y.
- [22 — DevOps](./22-devops.md): CI workflow, branch protection, semver, dependabot.
- [23 — Release Manager](./23-release-manager.md): RU compliance, performance budget, rollback.
- [25 — Producer](./25-producer.md): risk register, 3-sprint roadmap, RACI.

### Аналитика / Локализация / Audio / Tools / Community (6)
- [21 — Analytics](./21-analytics.md): 47-event taxonomy, PostHog+Метрика, A/B-план.
- [24 — Localization](./24-localization.md): нет i18n, 1908 cyrillic-строк, react-i18next план.
- [26 — Audio Director](./26-audio-director.md): «рабочий джаз», Howler.js, MVP 90 ч.
- [27 — Sound Design](./27-sound-design.md): 47 SFX-спецификаций.
- [29 — Tools Programmer](./29-tools-programmer.md): save export, headless sim runner, devtools panel.
- [30 — Community](./30-community.md): in-game feedback, Telegram, crisis playbook.

---

## ✅ Следующие действия (для продюсера)

1. **Сегодня-завтра:** триаж BUG-1..12, назначение спринт-1 фиксов.
2. **На этой неделе:** ADR по Pain Engine (delete vs revive vs gamify), CI workflow.
3. **Через неделю:** GDD v3.0 черновик, демо для стейкхолдеров с честным state-of-game.
4. **Через 6 недель:** v1.0.0-rc1, soft-launch для closed-beta из 50-100 предпринимателей.
