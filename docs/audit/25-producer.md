# Producer Audit — «Бизнес с Контуром»

**Дата:** 2026-05-07
**Аудитор:** Producer
**Версия:** Phase C / save `konturgame_state_v7`
**Источники:** CLAUDE.md, README.md, GAME_DESIGN_DOCUMENT.md (v2.0, 2026-04-20),
DOCUMENTATION_INDEX.md, GAME_MECHANICS.md, SYSTEMS_INTERACTION.md,
DIFFICULTY_AND_PLAYER_OPTIONS.md, package.json, soseed-аудиты
01–11 в `docs/audit/`, `git log` (последние 20 коммитов).

---

## 1. Scope Reality Check

### 1.1. Что объявлено в коде и работает (ground truth)

| Подсистема | Статус | Комментарий |
|---|---|---|
| Недельный цикл `processWeek` (7 дневных итераций) | работает | Структурно надёжен (game-designer audit). Один pendingEvent / неделю — правильный default. |
| 7 сервисов Контура с годовыми ценами | работает | Цены: `business.ts`. Bank = 0 ₽/год (документ говорит «18 000»). |
| Bundle Tiers (3+/5+/7+ → +10/20/30% revenue) | работает | Единственная синергия. Прозрачна для игрока через виджет «СПАСЕНО». |
| Tier 1→2→3 прогрессия | работает | Единственная видимая прогрессия после Phase A/B. |
| 8 NPC + 3-эпизодные арки (24 ивента) | работает частично | См. дыры в § 1.3. |
| Кризис-события / event chains (`mikhail_crisis`, `legacy`) | работает | Но крайне мало ёмкости (3 кризиса на 60+ недель — game-designer audit). |
| Pain Engine UI «Потеряно без Контура» | работает | Виден только до недели 6 (UX audit). |
| Кассы (3 типа) / FIFO склад | работает | См. дыры (`registerOverflowPenalty`, `EXPIRY_DAYS['beauty-salon']=0`). |
| Достижения (~17 в 4 волнах) | работает | Несколько недостижимы (см. § 1.3). |
| Промо-коды (Bank / Market / Elba) | работает | Чисто маркетинговая фича. |
| Owner Investments | работает | Слабо интегрирован с экономикой (game-designer). |
| Mobile layout (`MobileMainScreen`) | работает | Но IA различается с desktop (UX audit). |
| Тесты | работает | 12 тест-файлов, покрытие основных сервисов. CI отсутствует. |

### 1.2. Что объявлено в /docs, но **удалено** из кода

GDD v2.0 (2026-04-20) и связанные документы описывают игру, которой нет.

| Декларация документа | Реальность кода |
|---|---|
| Поставщики (1 базовый + 6 возможных, проверка через Фокус, 4-сторонние связи) | `suppliers.ts` удалён в Phase A |
| Энергия владельца как «уникальная механика», выгорание как многомерная система | Энергия осталась как простой счётчик; выгорание — bool flag + 1-week grace |
| Weekly tactic chooser (3 тактики/нед), «энергия ограничивает действия» | Удалён, фундаментальный принцип GDD не реализован |
| Уровни 1-10+ (LEVEL_TABLE) | `level/experience` удалены, остался businessTier 1-3 |
| Сервисы 6 000–24 000 ₽/год | Реальные цены 12 000–48 000 ₽/год (другая экономика) |
| 7 пар-синергий | Удалены в Phase A; bundle-тиры — другая модель |
| Бесконечная песочница, нет финала | VictoryChecker + VictoryModal + NPC-exits → игра имеет финал на нед. 30–45 |
| 35–50% событий/нед, 60–70% негативных | События ограничены 1/неделю |
| Реклама с риском блогера как ключевой нарратив | Реклама есть, риск блогера в кризис-событиях, но не как основной нарратив |
| 9 стратегий A–I с метриками выживаемости | Не валидированы в текущем балансе; pain=0 + bundle = доминантная стратегия |
| 4 уровня сложности (CASUAL/NORMAL/HARD/INSANE) | Не реализованы; один режим |

**Вывод:** GDD устарел на 2 итерации (Phase A/B/C). `DOCUMENTATION_INDEX.md`,
`GAME_MECHANICS.md`, `SYSTEMS_INTERACTION.md`, `DIFFICULTY_AND_PLAYER_OPTIONS.md`
описывают **другую игру**. Это критический риск для команды и любых внешних
проверок (стейкхолдеры Контура читают GDD, а не CLAUDE.md).

### 1.3. Что объявлено как «реализовано», но скрытно сломано

Сводка из соседних аудитов и кода. Это «invisible debt» — то, что игрок
не видит, но что разрушает доверие к балансу/прогрессии.

**Критическое (P0):**

1. **Pain Engine = 0** (game-designer audit, sysdes § 3). `painEngine.ts` возвращает
   нули, `PAIN_LOSSES` в `gameBalance.ts` — мёртвая константа. UI «Потеряно без
   Контура» показывает 0 после недели 6. Игра обещает «честно показать ценность»,
   но ничего не показывает. Это удар по основной маркетинговой механике игры.
2. **Bank = 0 ₽/год** (game-designer audit). Сервис, на котором держится
   40% платежей, бесплатный → ROI бесконечен → игрок никогда не выбирает.
3. **`year_one_no_debt` физически недостижимо** (sysdes § 7). Wave 4 анлок на
   неделе 52, проверка делается на неделе 51, на неделе 52 игра завершена.
4. **Двойной штраф репутации** (sysdes § 2). При rep < 30 клиенты × 0.5 × 0.9 =
   × 0.45 — невидимая компаунд-математика, противоречит обещанию «никаких
   скрытых множителей».
5. **`registerOverflowPenalty` показывается, но не списывается** (sysdes § 6).
   UI лжёт игроку.
6. **`mikhail_crisis_1` срабатывает до знакомства с Михаилом** (narrative § 1).
   Чейн на неделе 3–5, MEET — на неделе 5–10. «Вы же меня знаете» при ещё
   не представленном персонаже.
7. **Кризис-события исчерпываются после 3 срабатываний** (game-designer). На
   неделе 40+ генератор молча возвращает обычное событие. Pacing сломан.

**Высокое (P1):**

8. **Двойной путь обновления `qualityLevel`** (sysdes § 1). `calculateQualityLevel`
   и `updateQualityWeekly` мутируют одну переменную, бонусы стекаются.
9. **Нейтральная зона качества 40–70 поглощает старт + Market + upgrade**
   (sysdes § 1). Игрок не видит эффекта качества до тира 2.
10. **`hall_upgrade` достижение существует только для магазина** (sysdes § 7).
    Кафе и салон не могут разблокировать.
11. **Backstory-достижения зависят от ID событий, которых может не быть в
    `EVENTS_DATABASE`** (sysdes § 7).
12. **`synergy` achievement описан как «3 синергии», но проверяет 5 сервисов**
    (sysdes § 7). Описание устарело со времён `SYNERGIES_CONFIG`.
13. **`calculateCapacity` аддитивный стек апгрейдов**: тир 1 + 3 апгрейда дают
    больше capacity, чем тир 2 (sysdes § 2). Тир перестаёт быть осью прогрессии.
14. **Микрособытия без выбора** (game-designer § 1, дыра 1). 6 из 7 дней недели —
    пассивный нарратив.
15. **Mobile vs Desktop IA расходятся**: 8 разделов на desktop vs 9 табов на
    mobile, кнопки Достижений/Окружения по-разному размещены (UX audit).
16. **`PainEngine` window `currentWeek <= 6`** — мотивационный feedback исчезает
    ровно в момент подключения Маркета (UX audit).
17. **`milestoneStatus.week10` тихий fail** (game-designer): если пропущено,
    нет UI-сигнала.

**Средние/низкие (P2):** см. полные списки в sysdes (25 проблем) и UX audits.

### 1.4. Tone / Vision misalignment (creative-director audit)

- GDD говорит «honest, business-grim», UI — emoji-first / pastel.
- NPC — самая сильная часть тона, но они невидимы в основном цикле
  (только через NPCRosterModal).
- «Бесконечная песочница» обещание vs финальный экран.

Это не «сломано», но это тоновый раскол, который GDD маскирует.

---

## 2. Risk Register (Top-10)

Шкала: P (probability) и I (impact) от 1 (низкий) до 5 (критический).
Score = P × I. Сортировка по score.

| # | Риск | P | I | Score | Owner | Mitigation |
|---|---|---|---|---|---|---|
| R1 | **Документация описывает другую игру** (GDD v2.0 устарел на 2 итерации; стейкхолдеры Контура читают GDD). Внешний демо-show может развалиться на вопросе «а где поставщики?» | 5 | 5 | 25 | Producer | Sprint 1: переписать GDD до v3.0 + DOCUMENTATION_INDEX. Удалить устаревшие docs или пометить как «archived». См. § 7. |
| R2 | **Pain Engine = 0 — основная маркетинговая ценность игры не реализована.** «Игра показывает, сколько вы теряете без Контура» — единственный USP. Сейчас показывает 0 после недели 6. | 5 | 5 | 25 | Game Designer + Tech Director | Sprint 1: либо реализовать Pain Engine с числами из `PAIN_LOSSES` и расширить UI window, либо удалить Pain UI как «ложное обещание». Решение — за creative-director. |
| R3 | **Bank = 0 ₽/год убивает экономическое напряжение**. Доминантная стратегия — подключить всё → нет дилеммы. | 4 | 4 | 16 | Game Designer | Sprint 1: либо вернуть символическую цену (например 12 000 ₽/год), либо документировать как intentional «freemium как реальный РКО». |
| R4 | **Скрытая компаунд-математика возвращается** (двойной штраф репутации, двойное обновление quality, capacity-стек апгрейдов). Это противоречит явному обещанию Phase B «убить скрытую математику». | 4 | 4 | 16 | Tech Director | Sprint 1: ADR + рефакторинг этих 3 точек. См. sysdes recs 2, 5, 6. |
| R5 | **Кризис-события исчерпываются** после 3 срабатываний; на неделе 40+ peak напряжённости отсутствует. | 4 | 4 | 16 | Game Designer + Narrative | Sprint 2: добавить 4–6 кризис-событий, либо сделать кризисы рекуррентными с вариациями. |
| R6 | **Backstory/Personal goals/NPC arcs декоративны** в основном цикле (UX § «BackstoryScreen изолирован», narrative findings). Игрок не чувствует, что у него есть Катя. | 3 | 5 | 15 | Narrative + UX | Sprint 2: NPC-touchpoints в Dashboard, регулярные «Катя пишет / Тамара зашла» инлайн-карточки. Не новые ивенты — UI-поверхности для существующих. |
| R7 | **Недостижимые/некорректные достижения** (`year_one_no_debt`, `hall_upgrade`, backstory chain). Игрок видит «X / 17» и не понимает, почему 100% невозможен. | 3 | 4 | 12 | Game Designer | Sprint 1: пройти список из sysdes § 7. Либо снять, либо починить, либо помечать «only for shop» в описании. |
| R8 | **CI отсутствует** (нет workflow в репо), `npm test` запускается локально. Регрессии в баланс/save format ловят только вручную. Save v7 уже сломал v6. | 4 | 3 | 12 | Tech Director | Sprint 1: GitHub Actions / GitLab CI: type-check + test + build на PR. Save schema validation тест. |
| R9 | **Команда не определена**. По git log видно один автор. Если это инди-команда из 1–2 человек, риск bus factor = 5. Если есть распределение — оно не зафиксировано. | 3 | 4 | 12 | Producer | Sprint 1: зафиксировать RACI (см. § 4). Документировать, кто отвечает за какие папки. |
| R10 | **Мобильная и десктопная IA расходятся** (UX audit). При запуске на мобиле — в 9 табов, на desktop — 8 разделов + 2 модалки. Игрок-стейкхолдер Контура смотрит игру с телефона. | 3 | 3 | 9 | UX-Designer | Sprint 2: унификация — один источник правды для навигации. |

### Дополнительные риски, которые мониторим (не топ-10)

- R11. Тон-раскол (creative-director § 2). Опасно для long-term identity, но не блокирует релиз.
- R12. Тиражирование сейв-формата. v7 ломает v6 — если игроки уже играют, миграции нет.
- R13. Производительность: 1 074 строк в `eventGenerator.ts` — God-file. Поддержка усложнена.
- R14. Локализация: вся текстовка в коде на русском, нет i18n-ключей. Если Контур попросит EN — рефакторинг недели на 2.
- R15. Нет аналитики (события игрока не трекаются). Нельзя ответить на вопросы маркетинга «сколько игроков выживает до недели 30».

---

## 3. 3-Sprint Roadmap

Допущения: спринты 2 недели, команда ~ 2–4 человека (см. § 4),
20 % capacity на буфер. Старт — понедельник 2026-05-11.

### Sprint 1 — «Truth & Trust» (12 мая – 23 мая 2026)

**Цель спринта:** игра не лжёт игроку и команде. P0-фиксы +
синхронизация документации.

**Goals:**

- Pain Engine либо работает с реальными числами, либо удалён из UI.
- Bank-вопрос решён (директорское решение, цена либо обоснованный 0).
- Все скрытые компаунд-множители либо устранены, либо документированы как ADR.
- GDD переписан до v3.0; устаревшие docs архивированы.
- CI работает, регрессии не уйдут в main.

**Tasks:**

| ID | Task | Owner | Est | Dep | Status |
|---|---|---|---|---|---|
| S1-01 | ADR-01: решение по Pain Engine (включить/удалить) | creative-director | 1 d | – | TODO |
| S1-02 | Реализовать Pain Engine из `PAIN_LOSSES` (ИЛИ) | tech-director | 3 d | S1-01 | conditional |
| S1-03 | Удалить Pain UI блок (ИЛИ) | tech-director | 0.5 d | S1-01 | conditional |
| S1-04 | ADR-02: решение по Bank annualPrice | creative-director + game-designer | 1 d | – | TODO |
| S1-05 | Применить ADR-02 (цена + balance retest) | game-designer | 1 d | S1-04 | TODO |
| S1-06 | Fix двойного штрафа репутации (sysdes rec 2) | tech-director | 1 d | – | TODO |
| S1-07 | Fix `registerOverflowPenalty` (применить к балансу ИЛИ убрать из UI) | tech-director | 1 d | – | TODO |
| S1-08 | Fix `year_one_no_debt` достижения | tech-director | 1 d | – | TODO |
| S1-09 | Fix `hall_upgrade` (3 версии или пометка по бизнесу) | game-designer | 1 d | – | TODO |
| S1-10 | Fix `synergy` description / threshold (sysdes 21) | game-designer | 0.5 d | – | TODO |
| S1-11 | Аудит backstory achievements: какие event ID существуют | game-designer | 1 d | – | TODO |
| S1-12 | Fix `mikhail_crisis_1` хронологии (либо передвинуть, либо требовать MEET) | narrative-director | 1 d | – | TODO |
| S1-13 | GitHub Actions CI: type-check + test + build на PR | tech-director | 1 d | – | TODO |
| S1-14 | GDD v3.0: переписать §1–4 (vision, loop, mechanics) | creative + producer | 3 d | S1-01, S1-04 | TODO |
| S1-15 | Архивировать `GAME_MECHANICS.md`, `SYSTEMS_INTERACTION.md`, `DIFFICULTY_*` в `docs/archive/` | producer | 0.5 d | S1-14 | TODO |
| S1-16 | Sprint 1 retro + demo (запись 5 мин видео) | producer | 0.5 d | – | TODO |

**Buffer:** ~3 дня на bugfix и regression.

**Critical path:** S1-01 → S1-02/03 → S1-14 (Pain decision unblocks GDD rewrite).

**Risks для спринта:**
- Если creative-director недоступен для ADR-01 / ADR-02 — спринт срывается.
- Pain Engine реализация может вскрыть новые баги в economyEngine.

**Definition of Done:** см. § 5.

---

### Sprint 2 — «Feel & Density» (26 мая – 6 июня 2026)

**Цель:** игрок чувствует, что у него есть NPC, и каждое решение имеет
вес. Закрыть P1-проблемы decision density.

**Goals:**

- NPC видны в основном цикле (не только через NPCRosterModal).
- Кризис-события достаточны для 60-week run.
- `qualityLevel` имеет видимый эффект до тира 2.
- Mobile и Desktop IA унифицированы.

**Tasks:**

| ID | Task | Owner | Est | Dep | Status |
|---|---|---|---|---|---|
| S2-01 | NPC inline-карточки в Dashboard (Катя пишет / Тамара зашла) | ux + narrative | 3 d | – | TODO |
| S2-02 | Микрособытия с выбором (хотя бы 1 из 7 дней) | game-designer | 2 d | – | TODO |
| S2-03 | 4–6 новых кризис-событий или recurrence pattern | narrative + game-designer | 3 d | – | TODO |
| S2-04 | Fix двойного пути `qualityLevel` (sysdes rec 6) | tech-director | 2 d | – | TODO |
| S2-05 | Сузить нейтральную зону качества (40–70 → 50–60) | game-designer | 1 d | S2-04 | TODO |
| S2-06 | Унификация Mobile/Desktop IA (один источник правды) | ux + tech-director | 3 d | – | TODO |
| S2-07 | Fix `calculateCapacity` (убрать аддитивный стек) | tech-director | 1 d | – | TODO |
| S2-08 | Расширить Pain Engine window до недели 12 (или сделать toggleable) | ux + game-designer | 1 d | – | TODO |
| S2-09 | Закрыть Гена-арку (один RESOLVE-ивент в окне 35–45) | narrative-director | 1 d | – | TODO |
| S2-10 | NPCRosterModal: подсветка «у вас новое сообщение от Кати» | ux | 1 d | S2-01 | TODO |
| S2-11 | Sprint 2 retro + demo | producer | 0.5 d | – | TODO |

**Buffer:** ~2 дня.

**Critical path:** S2-01 → S2-10 (NPC visibility — самая большая ценность).

---

### Sprint 3 — «Analytics & Release» (9 июня – 20 июня 2026)

**Цель:** замерить, где игроки умирают; подготовить к публичному запуску /
демо для Контура.

**Goals:**

- Telemetry: ключевые funnel-точки (week-survival, service activation, victory path).
- Performance baseline (Lighthouse, bundle size).
- Release candidate: tagged `v1.0.0-rc1`.
- Docs финализированы для внешнего читателя.

**Tasks:**

| ID | Task | Owner | Est | Dep | Status |
|---|---|---|---|---|---|
| S3-01 | Telemetry events (анонимные): week_complete, service_activated, game_over_reason, victory | tech-director | 3 d | – | TODO |
| S3-02 | Telemetry backend (минимальный — Plausible/PostHog или собственный endpoint) | tech-director | 2 d | – | TODO |
| S3-03 | Funnel-дашборд (сколько % доходит до недели 10/20/30) | producer + analytics | 1 d | S3-01, S3-02 | TODO |
| S3-04 | Performance audit: bundle size, Lighthouse, mobile FPS | tech-director | 1 d | – | TODO |
| S3-05 | Save schema validation test (regression test для save v7) | tech-director | 1 d | – | TODO |
| S3-06 | A11y baseline: keyboard nav, contrast, screen reader для модалок | ux | 2 d | – | TODO |
| S3-07 | i18n preparation: вынести строки в централизованный модуль (без перевода) | tech-director | 2 d | – | TODO |
| S3-08 | Маркетинг-страница (one-pager) для Контура | producer + creative | 1 d | – | TODO |
| S3-09 | GDD v3.0 финал + ревью creative-director | creative + producer | 1 d | S1-14 | TODO |
| S3-10 | Release notes / changelog | producer | 0.5 d | – | TODO |
| S3-11 | Tag `v1.0.0-rc1` | tech-director | 0.5 d | all | TODO |
| S3-12 | Sprint 3 retro + milestone demo | producer | 1 d | – | TODO |

**Buffer:** ~2 дня.

**Critical path:** S3-01 → S3-02 → S3-03 → S3-11.

---

## 4. Team & RACI

Допущение: это инди-проект для маркетинга Контура, бюджет ограничен.
Реалистичный состав — 3–4 человека core team + опциональные специалисты на
час.

### 4.1. Минимально необходимые роли

| Роль | FTE | Можно ли совмещать? |
|---|---|---|
| Producer (я) | 0.3 | Совмещается с PM/Scrum lead |
| Tech Director / Lead Engineer | 0.8 | Должен быть один человек, нельзя дробить ответственность за архитектуру |
| Game Designer (баланс, ивенты, числа) | 0.5 | Совмещается с Narrative для инди-масштаба |
| Narrative Director | 0.3 | Можно совместить с Game Designer (одно лицо) |
| Creative Director | 0.2 | Принимает ADR. Может быть лицом Контура / маркетинга |
| UX-Designer | 0.4 | Один человек на mobile + desktop |
| Frontend Engineer (React/TS) | 1.0 | Может быть Tech Director если сильный |
| QA / Test Engineer | 0.2 | Совмещается с GD на инди-уровне |

**Реалистичный минимум:** 3 человека.

- **Лид-инженер** (Tech Director + Frontend, 1.0 FTE) — основной рабочий.
- **Гейм-дизайнер-нарратив** (GD + Narrative + UX, 1.0 FTE) — контент и фичи.
- **Продюсер-CD** (Producer + Creative Director, 0.5 FTE) — направление и
  стейкхолдер-комм.

QA — 0.2 FTE подрядчик на спринт-end.

### 4.2. RACI для ключевых решений

R = Responsible, A = Accountable, C = Consulted, I = Informed.

| Решение | Producer | Tech Lead | Game Designer | Creative Director | UX |
|---|---|---|---|---|---|
| Архитектура / тех-стек | C | A,R | I | I | I |
| Game balance numbers | I | C | A,R | C | I |
| Pillars / vision | C | I | C | A,R | C |
| Sprint scope | A,R | C | C | C | C |
| Scope cuts | A | C | R | C | I |
| New feature approval | C | C | R | A | C |
| UI / IA | I | C | C | C | A,R |
| Release / tag | A,R | R | I | I | I |
| Documentation accuracy | A,R | C | C | C | I |
| Risk register | A,R | C | C | C | C |

### 4.3. Ритуалы

- **Daily standup** — 15 мин, async через комментарии в issue tracker.
- **Sprint planning** — 2 ч, понедельник недели 1 спринта.
- **Sprint review/demo** — 1 ч, пятница недели 2.
- **Retro** — 30 мин сразу после demo.
- **ADR review** — раз в спринт, 30 мин.

---

## 5. Definition of Done

DoD дифференцирована по типу таска. Каждая задача в спринте должна
ссылаться на соответствующий DoD.

### 5.1. Code feature (новая механика, fix)

- [ ] Код в main через PR с минимум 1 review.
- [ ] `npm run type-check` зелёный.
- [ ] `npm test` зелёный, добавлен тест если поведение тестируемо.
- [ ] Если меняется state schema — bump save version, добавить в CLAUDE.md
      раздел «Сейв-формат».
- [ ] Если меняется числовая константа — обновить `CLAUDE.md` таблицу
      «Актуальные цены сервисов» / «Стартовые параметры».
- [ ] Manual smoke-test на dev: сценарий, описанный в acceptance criteria.
- [ ] Если меняется UI — скриншот desktop + mobile в PR description.

### 5.2. Game design / balance change

- [ ] ADR (если меняется fundamental rule).
- [ ] Балансовый расчёт записан в PR (от чего к чему).
- [ ] Прогон simulation test (`simulation.test.ts`) в 3 стратегиях.
- [ ] Update CLAUDE.md «Что реализовано».
- [ ] Update GDD v3.0 раздел.

### 5.3. Narrative content (новый ивент / NPC arc-эпизод)

- [ ] Ивент в правильном файле (`events/`, `npcArcs.ts`, `npcEvents.ts`).
- [ ] Указаны окна недель, requirements, options.
- [ ] Минимум 2 опции с разными последствиями.
- [ ] Тест: ивент срабатывает в окне (`eventGenerator.test.ts` extension).
- [ ] Tone check: соответствует тон-гайду NPC (см. tone доку Sprint 2).
- [ ] Тщательная вычитка на typos.

### 5.4. UX / UI change

- [ ] Скриншоты до/после в PR.
- [ ] Desktop + mobile проверены.
- [ ] Keyboard nav работает (a11y baseline).
- [ ] Контраст AA+ (WCAG).
- [ ] No regression в Lighthouse score.

### 5.5. Documentation

- [ ] Source-of-truth: указан, актуален.
- [ ] Cross-links: все ссылки рабочие.
- [ ] Changelog в `DOCUMENTATION_INDEX.md`.
- [ ] Метка даты обновления.

### 5.6. Sprint-level DoD

- [ ] Все P0-таски закрыты.
- [ ] Demo записано / показано.
- [ ] Retro проведено, action items в backlog.
- [ ] Risk register обновлён.

---

## 6. Process

### 6.1. PR Template

```
## Что меняется
<1-2 предложения>

## Зачем
<motivation, ссылка на issue / спринт-таск>

## Тип изменения
- [ ] Bugfix
- [ ] Feature
- [ ] Balance change
- [ ] Refactor
- [ ] Documentation
- [ ] UI/UX

## DoD checklist
- [ ] type-check passes
- [ ] tests pass
- [ ] manually smoke-tested
- [ ] save schema unchanged OR bumped + documented
- [ ] CLAUDE.md updated если задело SOT (numbers, architecture)
- [ ] Screenshots (если UI)

## Acceptance criteria (как мы проверим)
- <криterion 1>
- <криterion 2>

## Связанные ADR
<ID или N/A>
```

### 6.2. Code review

- **Кто ревьюит:** минимум 1 человек, не автор.
- **SLA:** ревью в течение 24 ч в рабочий день. Если блокировано >24 ч —
  эскалация продюсеру.
- **Что проверяется:**
  - Соответствие DoD типу.
  - Архитектура (нет дублей логики, нет God-файлов в которые добавляется
    ещё 200 строк).
  - Числа: согласованы между `business.ts`, `gameBalance.ts`, документами.
  - Тон/нарратив для ивентов.
- **Что НЕ блокирует:** стилистические придирки, micro-optimisation. Это
  суjest, не block.

### 6.3. Branching strategy

- `main` — protected, всегда green.
- `feature/<sprint-id>-<short-name>` — feature ветки.
- `fix/<issue-id>-<short>` — багфиксы.
- Squash-merge в main с осмысленным сообщением (см. style по `git log`:
  «Phase B: kill hidden math», «Lock Gena scheme pool to fixed 7»).

### 6.4. Retro

- Формат: 4Ls (Liked / Learned / Lacked / Longed for) — 25 мин.
- Action items: max 3 на спринт, owner + date due.
- Хранение: `docs/retros/SPRINT-N.md`.

### 6.5. Demo

- 5–10 мин видеозапись в конце спринта.
- Структура: что было обещано → что показываем → что дальше.
- Аудитория: команда + creative-director + (опционально) Контур-стейкхолдер.

### 6.6. ADR (Architecture / Design Decisions)

- Хранение: `docs/adr/ADR-NNN-title.md`.
- Триггер: любое решение с downstream-эффектом > 1 спринт (Pain on/off,
  Bank price, IA унификация, save schema).
- Шаблон: Context / Decision / Consequences / Alternatives considered.

### 6.7. Сейв-схема policy

- Bump version при любом breaking-changed в state.
- Migration not required для альфы (мы в альфе), но **миграция обязательна
  с момента публичного релиза** (после Sprint 3 / RC1).
- Тест save-load round-trip (S3-05).

---

## 7. Documentation Plan

### 7.1. Текущее состояние

| Документ | Дата | Статус | Что делать |
|---|---|---|---|
| `CLAUDE.md` | актуален | SOURCE OF TRUTH | Поддерживать. Обновлять при изменении SOT. |
| `README.md` | минимальный | OK | Обновить раздел «Документация» в Sprint 1. |
| `GAME_DESIGN_DOCUMENT.md` | 2026-04-20 v2.0 | УСТАРЕЛ | Переписать до v3.0 (S1-14). |
| `GAME_MECHANICS.md` | 2026-04-20 | УСТАРЕЛ (~9500 слов) | Архивировать. Заменить на `docs/mechanics/` (по подсистемам). |
| `SYSTEMS_INTERACTION.md` | 2026-04-20 | УСТАРЕЛ | Архивировать. Часть переписать в GDD v3.0 § «Системы». |
| `DIFFICULTY_AND_PLAYER_OPTIONS.md` | 2026-04-20 | УСТАРЕЛ (стратегии не валидированы) | Архивировать. Перевалидировать в Sprint 3 (после баланс-фиксов). |
| `DOCUMENTATION_INDEX.md` | 2026-04-20 | УСТАРЕЛ | Переписать после S1-15. |
| `docs/design/DESIGN_REQUIREMENTS.md` | неизв. | проверить | Sprint 1 sweep. |
| `docs/design/UI Спецификация.md` | неизв. | проверить | Sprint 1 sweep. |
| `docs/audit/01..11` | 2026-05-07 | актуальны | Хранить как референс. |

### 7.2. Целевая структура документации

```
/
├── README.md                          # быстрый старт
├── CLAUDE.md                          # SOT для разработки
├── GAME_DESIGN_DOCUMENT.md            # v3.0, vision + design
├── docs/
│   ├── adr/
│   │   ├── ADR-001-pain-engine.md
│   │   ├── ADR-002-bank-price.md
│   │   └── ...
│   ├── audit/                         # текущие экспертные аудиты
│   ├── archive/                       # 2026-04 GDD v2.0 и связанные
│   │   ├── GAME_MECHANICS.md
│   │   ├── SYSTEMS_INTERACTION.md
│   │   └── DIFFICULTY_AND_PLAYER_OPTIONS.md
│   ├── retros/
│   │   └── SPRINT-N.md
│   ├── status/
│   │   └── IMPLEMENTATION_STATUS.md   # числа + что работает (живой документ)
│   └── design/                        # художественные / UX-спеки
```

### 7.3. План работы по документации

- **Sprint 1:** S1-14 (GDD v3.0 §1–4), S1-15 (архивация).
- **Sprint 2:** GDD v3.0 §5–8 (NPC, контент, экономика).
- **Sprint 3:** S3-09 (финал GDD), S3-08 (one-pager для Контура).

### 7.4. Definition of «doc up to date»

- Дата изменения < 30 дней (или явная пометка «stable, last reviewed YYYY-MM»).
- Числа сходятся с `src/constants/business.ts`.
- Все ссылки рабочие.
- Раздел «Что реализовано» в CLAUDE.md синхронизирован.

---

## Заключение

Игра в коде сильнее, чем игра в документации. Phase A/B/C-чистки — правильное
направление: меньше скрытой математики, чище модель прогрессии. Но три вещи
не сходятся:

1. **Pain Engine = 0** — основное обещание игры пустое.
2. **Документация = другая игра** — стейкхолдеры читают неактуальное.
3. **Скрытая математика возвращается** через side-channels (двойной штраф
   репутации, capacity-стек, double quality update).

Sprint 1 закрывает эти три, и тогда игра впервые становится по-настоящему
готовой к показу. Sprint 2 добавляет глубину NPC-touchpoints и decision
density. Sprint 3 — telemetry и release.

Всего 6 недель работы команды из 3 человек до RC1. Это реалистично при
условии, что директорские ADR (Pain on/off, Bank price) принимаются в
первую неделю Sprint 1.
