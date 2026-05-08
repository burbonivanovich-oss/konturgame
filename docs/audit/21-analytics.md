# Аналитика и телеметрия — «Бизнес с Контуром»

**Версия:** 1.0 | **Дата:** 2026-05-07  
**Роль:** Analytics Engineer  
**Отчитывается:** technical-director (система), producer (инсайты)  
**Координирует:** game-designer (дизайн-инсайты), economy-designer (экономика)

---

## 1. Current State — Аудит

### Что найдено в коде

| Файл | Статус |
|------|--------|
| `index.html` | Нет сторонних скриптов, нет GA/YM тегов |
| `src/main.tsx` | Чистый React mount, никакого SDK аналитики |
| `src/App.tsx` | Нет вызовов `track()`, `gtag()`, `ym()` |
| `package.json` | Зависимостей аналитики нет совсем |
| `src/stores/gameStore.ts` | localStorage-only, нет сетевых вызовов |

**Вывод: аналитика полностью отсутствует.** Данных о поведении игроков нет. Продукт летит вслепую.

### Что уже есть в игровой модели и пригодно для трекинга

Игровое состояние богатое — `GameState` содержит ~60 полей. Ключевые из них, которые нужно телеметрировать:

- `businessType` — shop / cafe / beauty-salon
- `currentWeek` — неделя (прокси для глубины сессии)
- `balance`, `reputation`, `loyalty` — здоровье бизнеса
- `services.*isActive` — 7 подписок Контура
- `isVictory`, `isGameOver`, `gameOverReason` — исход
- `promoCodesRevealed` — 3 промокода (bank / market / elba)
- `achievements` — ~17 достижений
- `completedChainIds`, `activeChainIds` — NPC-арки
- `milestoneStatus.week10/20/30` — вехи
- `onboardingCompleted`, `onboardingStage` — онбординг
- `playerBackstory.motivation/personal` — архетип игрока
- `totalPainLosses.*` — потери без Контура по сервисам

### Критический пробел для бизнеса

VictoryModal содержит CTA «Новая игра», но **нет кнопки «Попробовать в реальности»**. Конверсия из игровой победы в реального клиента Контура не отслеживается и не стимулируется. Это главный пробел с точки зрения цели продукта.

---

## 2. Event Taxonomy — Таксономия событий

### Конвенция именования

```
[category].[action].[detail?]
```

Все события несут общий контекст (envelope):

```typescript
interface EventEnvelope {
  event: string           // имя события
  session_id: string      // uuid v4, сбрасывается при перезагрузке страницы
  anonymous_id: string    // uuid v4, персистится в localStorage (не PII)
  ts: number              // Date.now()
  app_version: string     // из package.json
  platform: 'desktop' | 'mobile'  // ResponsiveLayout уже умеет различать
}
```

### Категория: game — жизненный цикл игры

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `game.session.started` | Загрузка App.tsx, экран backstory | `has_save: bool`, `runs_count: int` | Считать DAU/WAU, видеть возвраты |
| `game.backstory.completed` | `handleBackstoryComplete()` | `motivation`, `personal` | Сегментация по архетипу |
| `game.business.chosen` | `handleGameStart()` | `business_type`, `meta_perk_id?` | Какой бизнес популярен |
| `game.started` | `startNewGame()` в store | `business_type`, `run_number` | Воронка старта |
| `game.week.completed` | конец `processWeek()`, после `state.currentWeek += 1` | `week`, `balance`, `reputation`, `loyalty`, `active_services: string[]`, `net_profit`, `energy` | Ретеншн, churn-неделя |
| `game.milestone.reached` | `milestoneStatus.week10/20/30 = true` | `milestone: 'week10'|'week20'|'week30'`, `balance`, `business_type` | Funnel глубины |
| `game.victory` | `setVictory(true)` | `week`, `balance`, `reputation`, `victory_type`, `active_services: string[]`, `completed_chains: string[]` | Completion rate, attribution |
| `game.defeat` | `setGameOver(true, reason)` | `week`, `reason: 'bankruptcy'|'burnout'|'reputation'`, `balance`, `active_services: string[]`, `total_pain_losses_rub` | Churn-причины |
| `game.restarted` | `handleRestartGame()` | `previous_week`, `previous_outcome` | Ретеншн после поражения |

### Категория: service — подписки Контура (ключевой бизнес-сигнал)

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `service.subscribed` | `activateService()` / `toggleService()` (активация) | `service_id`, `week`, `balance`, `business_type`, `is_first_service: bool`, `unlocked_services_count` | Конверсия в сервисы |
| `service.cancelled` | `deactivateService()` / `toggleService()` (деактивация) | `service_id`, `week`, `reason_balance: bool` (balance < cost) | Отток, ценовое давление |
| `service.bundle_tier_reached` | synergyEngine: 3+/5+/7+ сервисов | `tier: 3|5|7`, `active_services: string[]`, `week` | Синергия как retention hook |

### Категория: progression — прогрессия и NPC

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `progression.onboarding.completed` | `completeOnboarding()` | `week`, `skipped_steps_count` | Качество онбординга |
| `progression.onboarding.skipped` | `skipOnboarding()` | `week` | Опытные игроки |
| `progression.achievement.unlocked` | `addAchievement()` | `achievement_id`, `week` | Engagement, design balance |
| `progression.npc_arc.resolved` | NPC episode resolve (meet/test/resolve) | `npc_id`, `arc_stage: 'meet'|'test'|'resolve'`, `week`, `relationship_level`, `choice_id` | NPC engagement |
| `progression.chain.completed` | `markChainCompleted()` | `chain_id`, `week` | Narrative depth |
| `progression.tier.upgraded` | `upgradeBusinessTier()` | `new_tier: 2|3`, `week`, `balance` | Progression health |

### Категория: economy — экономические решения

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `economy.loan.taken` | `takeLoan()` | `loan_type`, `amount`, `week`, `balance_before` | Stress signal |
| `economy.loan.repaid` | `repayLoan()` | `loan_id`, `week`, `interest_paid` | Recovery pattern |
| `economy.upgrade.purchased` | `purchaseUpgrade()` | `upgrade_id`, `week`, `balance_before` | Upgrade popularity |
| `economy.ad_campaign.started` | `addAdCampaign()` | `campaign_id`, `cost`, `week` | Ad ROI analysis |
| `economy.cash_register.bought` | `buyCashRegister()` | `register_type`, `week`, `balance_before` | Equipment adoption |

### Категория: promo — конверсия в реальный продукт (главный бизнес-сигнал)

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `promo.code.revealed` | `revealPromoCode()` | `service_id`, `promo_code`, `week` | Промо-охват |
| `promo.code.copied` | клик «Скопировать» в PromoCodeModal | `service_id`, `promo_code`, `week` | Намерение попробовать |
| `promo.code.redeemed` | (будущий deeplink callback или UTM) | `service_id`, `promo_code`, `source` | Реальная конверсия |
| `promo.cta.clicked` | клик «Попробовать в реальности» (кнопка нужна!) | `service_id`, `context: 'victory'|'promo_modal'|'pain_block'`, `week` | Главная конверсия |

### Категория: ui — взаимодействие с интерфейсом

| Событие | Когда | Ключевые свойства | Зачем |
|---------|-------|-------------------|-------|
| `ui.modal.opened` | открытие любой из 14 модалок | `modal_id`, `week` | UX friction analysis |
| `ui.tab.switched` | навигация по 11 режимам MainScreen | `from_tab`, `to_tab`, `week` | Feature discovery |
| `ui.pain_block.viewed` | показ блока «Потеряно без Контура» | `week`, `top_loss_service`, `top_loss_rub` | Pain awareness |

### Категория: error — технические сбои

| Событие | Когда | Ключевые свойства |
|---------|-------|-------------------|
| `error.save.failed` | catch в `saveToStorage()` | `error_message`, `state_size_kb` |
| `error.load.failed` | catch в App.tsx `useEffect` | `error_message` |
| `error.week.blocked` | `checkWeekBlocked()` вернул `blocked: true` | `reason`, `week` |

---

## 3. Funnels — Воронки конверсии

### Воронка 1: Полный жизненный цикл (Acquisition → Conversion)

```
[F1] game.session.started
        |
        v  (drop-off: bounced before choosing business)
[F2] game.business.chosen
        |
        v  (drop-off: quit at game start)
[F3] game.week.completed (week=1)   ← Неделя 1
        |
        v  (drop-off: early churn)
[F4] service.subscribed (any)       ← Первый сервис
        |
        v  (drop-off: stuck, no value perception)
[F5] game.week.completed (week=5)   ← Неделя 5
        |
        v  (drop-off: mid-game churn)
[F6] game.week.completed (week=10)  ← Веха 1, открывается Эльба ~12 нед
        |
        v
[F7] game.week.completed (week=20)  ← Веха 2
        |
        v
[F8] game.victory  OR  game.defeat
        |
        v  (KEY BUSINESS CONVERSION — currently missing CTA!)
[F9] promo.cta.clicked              ← «Попробовать в реальности»
        |
        v
[F10] promo.code.redeemed           ← Реальный пользователь Контура
```

**Ожидаемые бенчмарки (нужно уточнить после первых 30 дней):**

| Шаг | Ожидаемый CR | Примечание |
|-----|-------------|------------|
| F1 → F2 | 70-80% | Backstory — низкий барьер |
| F2 → F3 | 60-70% | Первая неделя — ключевое удержание |
| F3 → F4 | 40-50% | Первый сервис — главный engagement hook |
| F4 → F7 | 25-35% | Mid-game completion |
| F7 → F8 victory | 15-25% | Completion rate |
| F8 → F9 | Target: 50% | Сейчас: 0% (кнопки нет) |
| F9 → F10 | Target: 20-30% | Внешний deeplink |

### Воронка 2: Pain → Service subscription (in-game)

```
ui.pain_block.viewed
    → (service_id X shown as top loss)
    → service.subscribed (service_id = X)
```

Мерим: % игроков, подключивших сервис после просмотра Pain-блока с этим сервисом.  
Это прямой сигнал эффективности pain-механики.

### Воронка 3: Promo → Real-world conversion

```
promo.code.revealed (service_id)
    → promo.code.copied
    → promo.cta.clicked
    → [UTM redirect] → promo.code.redeemed
```

---

## 4. Cohort KPIs — Ключевые метрики

### Retention & Engagement

| Метрика | Определение | Цель |
|---------|-------------|------|
| **D1 Retention** | % сессий с `game.session.started` на следующий день | > 30% |
| **D7 Retention** | То же для 7-го дня | > 15% |
| **Week 1 Completion** | % сессий с `game.week.completed week=1` | > 60% |
| **Week 5 Reach** | % сессий с `game.week.completed week=5` | > 30% |
| **Week 10 Reach** | % сессий с `game.week.completed week=10` | > 20% |
| **Elba Unlock Rate** | % сессий с `service.subscribed service_id=elba` | > 25% |
| **Completion Rate** | % сессий с `game.victory` | > 15% |
| **Avg Session Depth** | Медиана `currentWeek` при `game.defeat` или `game.victory` | > 12 |

### Churn Analysis

| Метрика | Сигнал |
|---------|--------|
| **Churn Week** | Мода недели при `game.defeat` по причине | Где чаще всего умирают |
| **Churn by Reason** | `game.defeat.reason` распределение | Bankruptcy vs Burnout vs Reputation |
| **Churn by Business** | CR per `business_type` | Баланс бизнес-типов |
| **Service Churn** | `service.cancelled` rate per service | Ценовая чувствительность |

### Service Adoption (главный продуктовый KPI)

| Метрика | Определение |
|---------|-------------|
| **Service Adoption Rate** | % сессий с хотя бы 1 активным сервисом к неделе N |
| **Service Portfolio Depth** | Среднее число активных сервисов к неделе 10/20/30 |
| **Bundle Tier Rate** | % сессий достигших tier 3+ / 5+ / 7+ |
| **First Service** | Частота первого подключённого сервиса (какой сервис "вход в экосистему") |
| **Service Sequence** | Типичный порядок подключения сервисов |

### Business Conversion (KPI Контура)

| Метрика | Определение |
|---------|-------------|
| **Promo Reveal Rate** | % сессий с `promo.code.revealed` |
| **Promo Copy Rate** | % revealed → copied |
| **CTA Click Rate** | % `game.victory` / `game.defeat` → `promo.cta.clicked` |
| **Real Conversion** | % `promo.cta.clicked` → `promo.code.redeemed` |

---

## 5. A/B Testing Plan

### Принципы

- Назначение варианта — при `game.session.started` или `game.business.chosen`, сохраняется в `anonymous_id`-to-variant map на бэкенде
- Не менять вариант в середине запуска (session split)
- Минимальный размер выборки per variant: 200 сессий доходящих до измеряемой точки
- Метрика успеха всегда первична одна; вторичные — guardrails
- Максимум 1 активный эксперимент в категории одновременно

### Эксперимент A/B-01: Цены сервисов (экономический баланс)

**Гипотеза:** Снижение цены OFD с 12 000 ₽/год до 8 000 ₽ увеличит adoption rate первого сервиса.

| | Control | Variant |
|--|---------|---------|
| OFD | 12 000 ₽/год | 8 000 ₽/год |
| Bank | 36 000 ₽/год | 36 000 ₽/год |

**Метрика успеха:** `service.subscribed (service_id=ofd)` rate к неделе 5  
**Guardrail:** `game.week.completed week=10` rate не падает (снижение сложности не должно разрушить retention)  
**Точка замера:** Неделя 5  
**Минимальная выборка:** 200 на группу

### Эксперимент A/B-02: Длительность онбординга (UX friction)

**Гипотеза:** Пропуск backstory-экрана и прямой старт с выбора бизнеса снизит ранний churn.

| | Control | Variant |
|--|---------|---------|
| Экраны до игры | Backstory → Business select | Business select (backstory опциональна) |

**Метрика успеха:** `game.week.completed week=1` rate (Week 1 Completion)  
**Guardrail:** NPC arc engagement (completion rate `progression.npc_arc.resolved`) не падает — backstory питает NPC-диалоги  
**Риск:** Потеря нарративного контекста. Нужно согласовать с game-designer.

### Эксперимент A/B-03: Bundle tier threshold (синергия)

**Гипотеза:** Снижение первого bundle-тира с 3 до 2 сервисов (+10% выручки) ускорит adoption второго сервиса.

| | Control | Variant |
|--|---------|---------|
| Tier 1 threshold | 3 сервиса | 2 сервиса |
| Tier 2 threshold | 5 сервисов | 4 сервиса |
| Tier 3 threshold | 7 сервисов | 6 сервисов |

**Метрика успеха:** `service.bundle_tier_reached tier=3/4` rate к неделе 15  
**Guardrail:** `game.victory` rate не деградирует (нельзя сделать игру слишком лёгкой)

### Эксперимент A/B-04: CTA-текст в VictoryModal (конверсия)

**Гипотеза:** Контекстный CTA с упоминанием конкретного сервиса конвертирует лучше, чем общий.

| | Control | Variant |
|--|---------|---------|
| CTA | «Попробуйте Контур бесплатно» | «Вы использовали [service]. Получите 3 месяца бесплатно.» |
| Персонализация | нет | по наиболее используемому сервису в run |

**Метрика успеха:** `promo.cta.clicked` rate от `game.victory`  
**Примечание:** Этот эксперимент возможен только после реализации самой CTA-кнопки (см. раздел 7).

### Эксперимент A/B-05: Pain-блок позиционирование

**Гипотеза:** Показ pain-блока сразу после `game.defeat` (до «Попробовать снова») увеличит promo copy rate.

| | Control | Variant |
|--|---------|---------|
| Pain-блок | В WeekResultsOverlay | В VictoryModal (defeat path), перед CTA |

**Метрика успеха:** `promo.code.copied` rate среди поигравших до defeat  
**Guardrail:** `game.restarted` rate не падает (не должно отпугивать от реиграбельности)

---

## 6. Privacy Design — Конфиденциальность

### Принципы (GDPR / 152-ФЗ)

1. **Нет PII.** Не собираем имени, email, IP, устройств-идентификаторов. `anonymous_id` — это UUID, сгенерированный на клиенте, без привязки к личности.

2. **Opt-in согласие.** При первом запуске показываем баннер: «Мы собираем анонимную статистику для улучшения игры. Данные не содержат личной информации.» Кнопки: «Согласен» / «Отказаться». Выбор сохраняется в `localStorage` (`konturgame_analytics_consent`). Без согласия — никаких событий.

3. **Минимизация данных.** В события не включаем: содержание диалогов с NPC, тексты решений, IP, User-Agent (только `platform: desktop/mobile`).

4. **Право на удаление.** В настройках (SettingsModal) — кнопка «Удалить аналитические данные». Отправляет запрос на сервер с `anonymous_id` для удаления. Очищает `anonymous_id` из localStorage.

5. **Хранение.** Raw events — 90 дней. Агрегаты — indefinitely. Не передаём третьим лицам за пределами стека (PostHog self-hosted или Яндекс.Метрика с маскировкой).

6. **Промокоды.** Коды `GAME-BANK-2026` etc. не содержат личных данных, привязаны к `anonymous_id` только для дедупликации. UTM-параметры deeplink не несут PII.

### Что НЕ трекаем никогда

- Содержание `decisionLog[].text` (нарративные решения)
- `playerBackstory.personal` (личная ситуация игрока)
- `npcs[].memory[].text` (диалоги с NPC)
- Точный timestamp более детальный, чем час суток

---

## 7. Stack Recommendation — Выбор инструментов

### Анализ опций

| Стек | За | Против |
|------|------|--------|
| **PostHog (self-hosted)** | Open-source, GDPR-ready, session recording, feature flags для A/B, бесплатный self-host | Нужен сервер для хостинга |
| **PostHog (cloud EU)** | Быстрый старт, EU-регион = 152-ФЗ дружелюбен, бесплатно до 1M событий/мес | Данные за пределами РФ |
| **Яндекс.Метрика** | Бесплатная, сервера в РФ (152-ФЗ), WebVisor | Нет event-level API, нет A/B экспериментов, закрытый алгоритм |
| **Mixpanel** | Мощный funnel/cohort analysis | Платный при объёме, данные за рубежом |
| **Собственный** | Полный контроль | Месяцы разработки, нет смысла |
| **Amplitude** | Мощный | Платный, данные за рубежом |

### Рекомендация: PostHog Cloud (EU) + Яндекс.Метрика (fallback)

**Первичный стек: PostHog Cloud EU**

Причины:
- Единственный вариант с feature flags — нужны для A/B тестов (#5)
- Event-level SQL через ClickHouse — можно строить любые воронки
- SDKs для браузера: `posthog-js`, интеграция за 1 день
- Бесплатный tier: 1M событий/месяц — хватит для MVP
- EU-регион + explicit consent flow — соответствие GDPR/152-ФЗ

**Резервный: Яндекс.Метрика (цели)**

Параллельно настраиваем Метрику только для ключевых конверсионных целей:
- Цель "Игра запущена" (`game.business.chosen`)
- Цель "Промокод скопирован" (`promo.code.copied`)
- Цель "CTA нажат" (`promo.cta.clicked`)

Метрика бесплатна, сервера в РФ — страховка на случай требований 152-ФЗ к локализации.

### Архитектура интеграции

```
GameStore actions
       |
       v
Analytics Service (src/services/analyticsService.ts)
  - check consent flag
  - build EventEnvelope
  - posthog.capture(event, properties)
  - ym(COUNTER_ID, 'reachGoal', goal_id)   // только для 5 ключевых целей
       |
       v
PostHog JS SDK → PostHog Cloud EU
                              |
                              v
                    ClickHouse (events raw)
                    + Dashboards (see §8)
                    + Feature Flags (A/B)
```

Реализация: тонкий `analyticsService.ts` — обёртка над PostHog SDK. Все вызовы `track()` идут через него, не напрямую в gameStore. Это позволяет мокировать в тестах и менять стек без правки store.

---

## 8. Dashboards

### Dashboard 1: Daily Health (ежедневный мониторинг)

**Аудитория:** Producer, команда  
**Период:** Rolling 7 дней, обновление hourly

| Chart | Метрика | Источник | Инсайт |
|-------|---------|----------|--------|
| Line: DAU | `game.session.started` unique `anonymous_id` per day | events | Есть ли рост/спад |
| Funnel: Session → W1 → W5 → W10 | CR на каждом шаге | events | Где теряем игроков |
| Bar: Defeat reasons | `game.defeat.reason` distribution | events | Что убивает больше всего |
| Stat: Avg session depth | Median `currentWeek` at game end | events | Средняя глубина |
| Stat: D1 / D7 Retention | Cohort retention | session + anonymous_id | Удерживает ли игра |

### Dashboard 2: Service Adoption (продуктовый KPI)

**Аудитория:** Producer, economy-designer  
**Период:** Rolling 30 дней

| Chart | Метрика | Инсайт |
|-------|---------|--------|
| Stacked bar: Services по неделям | % сессий с active service_id к неделе N | Когда подключают каждый сервис |
| Sankey/Flow: Service sequence | Типичный порядок подключения | Что является «входными воротами» |
| Bar: First service | Частота первого подключённого сервиса | Какой сервис = первое знакомство |
| Line: Bundle tier rates | % tier 3/5/7 per cohort week | Синергия реально работает? |
| Scatter: Services active vs Victory rate | По run | Корреляция подписок с победой |

### Dashboard 3: Conversion Funnel (бизнес-KPI Контура)

**Аудитория:** Маркетинг Контура, Producer  
**Период:** Rolling 30 дней + all-time

| Chart | Метрика | Инсайт |
|-------|---------|--------|
| Funnel: Victory → CTA → Code Copy → Redeem | 4-step CR | Где теряем конверсию |
| Bar: Promo by service | Reveal / Copy / Redeem per service | Какой промокод работает лучше |
| Line: Promo copy rate trend | по дням | Эффект маркетинговых активностей |
| Table: UTM attribution | Источник → promo.code.redeemed | ROI каналов привлечения |

### Dashboard 4: A/B Experiment Monitor

**Аудитория:** Product, Analytics  
**Период:** Per experiment (активен + 14 дней после)

| Chart | Метрика |
|-------|---------|
| Time series: Primary metric per variant | Ежедневная динамика |
| Confidence interval bar | Статистическая значимость |
| Table: Guardrail metrics | Контроль побочных эффектов |
| Funnel per variant | Полная воронка split by variant |

### Dashboard 5: Economy Health

**Аудитория:** Economy-designer, game-designer  
**Период:** Rolling 30 дней

| Chart | Метрика | Инсайт |
|-------|---------|--------|
| Bar: Avg balance by week | Median balance per `currentWeek` | Кривая сложности |
| Bar: Pain losses by service | `totalPainLosses.*` distribution | Какой pain mechanic ощутимее |
| Line: Service cancel rate | `service.cancelled` per week | Когда игроки отказываются от сервисов |
| Heatmap: Defeat week × business_type | Churn concentration | Баланс бизнес-типов |
| Bar: Loan usage rate | `economy.loan.taken` per week | Финансовый стресс-индикатор |

---

## 9. Rollout Plan

### Фаза 0 — Предварительно (сейчас, без кода)

- [ ] Согласовать taxonomy с game-designer: убедиться, что нарративные данные не собираются
- [ ] Согласовать с technical-director: архитектура `analyticsService.ts` и consent flow
- [ ] Зарегистрировать PostHog EU аккаунт, получить API key
- [ ] Зарегистрировать Яндекс.Метрика счётчик
- [ ] Подготовить consent banner текст (юрист Контура согласует формулировки)

### Фаза 1 — MVP (Sprint 1, ~3 дня разработки)

Реализует программист по спецификации из этого документа:

1. `src/services/analyticsService.ts` — обёртка PostHog + consent check
2. Consent banner в App.tsx (opt-in перед первым стартом)
3. 8 ключевых событий: `game.session.started`, `game.business.chosen`, `game.started`, `game.week.completed`, `game.victory`, `game.defeat`, `service.subscribed`, `promo.code.revealed`
4. Dashboard 1 (Health) в PostHog

**Проверить после 7 дней:** события приходят, воронка строится.

### Фаза 2 — Conversion (Sprint 2, ~2 дня)

1. CTA-кнопка «Попробовать в реальности» в VictoryModal (и в defeat path)
2. `promo.cta.clicked` и `promo.code.copied` события
3. UTM deeplinks: `https://kontur.ru/[service]?utm_source=game&utm_medium=promo&utm_campaign=GAME-[SERVICE]-2026&utm_content=[anonymous_id]`
4. Dashboard 3 (Conversion)

### Фаза 3 — Full Taxonomy (Sprint 3, ~3 дня)

Все остальные события по таксономии (§2): progression, economy, ui, error.  
Dashboards 2, 4, 5.

### Фаза 4 — A/B Framework (Sprint 4+)

1. PostHog Feature Flags интеграция
2. Первый эксперимент: A/B-04 (CTA текст) — самый простой, высокий impact
3. После первых результатов: A/B-01 (цены сервисов)
4. Ветки `src/constants/business.ts` параметризуются через feature flag values

### Приоритет реализации

```
P0 (блокирует всё остальное):
  - consent flow
  - game.session.started / game.business.chosen / game.started
  - game.victory / game.defeat

P1 (основная воронка):
  - game.week.completed (недели 1/5/10/20/30)
  - service.subscribed / service.cancelled
  - CTA кнопка + promo.cta.clicked

P2 (глубокий анализ):
  - progression.* / economy.*
  - ui.pain_block.viewed

P3 (оптимизация):
  - A/B framework
  - error tracking
```

---

## Приложение: Зависимости от кода, требующие внимания

1. **VictoryModal не имеет CTA-кнопки.** Конверсии нет вообще. Это P0 для бизнес-цели.
2. **`localStorage` key несовместимость.** App.tsx читает `'konturgame_state'`, gameStore пишет `'konturgame_state_v7'`. При загрузке сохранения ключ не совпадает → `loadGame` никогда не вызывается из `useEffect`. Это уже баг, не связанный с аналитикой, но влияет на метрику retention (повторные визиты не восстанавливают игру).
3. **`analyticsService.ts` должен быть stateless singleton**, не Zustand store — чтобы не попасть в круговую зависимость store → analytics → store.
4. **Event `game.week.completed`** нужно трекать в конце `processWeek()` или в `completeActionsPhase()` после `set({...stateCopy})` — там известен финальный `currentWeek` и баланс.
