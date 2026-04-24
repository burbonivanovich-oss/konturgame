# 07. Прогрессия: уровни, достижения, вехи, стадии, условия победы, мета-перки

Система долгосрочных целей и мета-прогрессии между забегами.

## 7.1. Уровни и опыт

**Файл:** `src/stores/gameStore.ts` (поля `level`, `experience`).

```
levelThresholds = [0, 100, 200, 350, 500, 650, 750, 850, 930, 1000]
level = min(10, firstThresholdExceeded + 1)

выдача опыта в конце недели:
  +7 за неделю (EXPERIENCE_PER_WEEK)
  + floor(weekProfit / 10_000) * 50  (EXPERIENCE_PER_10K_PROFIT)
```

Уровень нужен для одного из условий победы и разблокирует часть улучшений/сотрудников.

## 7.2. Достижения

**Сервис:** `src/services/achievementChecker.ts`. **Каталог:** `src/constants/achievements.ts`.

Всего 20 достижений, логически разбитых на 4 «волны» по тому, когда их можно получить:

### Волна 1 (с начала)

- `first_day` — прожить первый день;
- `week_done` — прожить первую неделю;
- `month_done` — прожить месяц (4 недели);
- `profitable_day` — первая прибыльная смена;
- `first_campaign` — запустить первую рекламу;
- `stock_master` — 10 дней без просрочки;
- `first_register` — первая касса;
- `event_veteran` — пережить 5 событий;
- `survived_competitor` — выстоять под давлением конкурента;
- `milestone_week10` — дойти до недели 10.

### Волна 2 (неделя 12+)

`big_profit`, `milestone_week20`, `high_rep`, `loyal_staff`, `hall_upgrade`, `first_service`, `three_services`, `level_5`.

### Волна 3 (неделя 26+)

`synergy`, `all_services`, `level_10`, `promo_collector`.

### Волна 4 (неделя 52+)

`survival_year_one`, `full_promo`, `resilient`, `milestone_week30`.

Проверка:

```
checkNewAchievements(state, lastResult):
  new = []
  для каждого a из ACHIEVEMENTS:
    если он уже есть — пропуск
    если currentWeek < a.earliestWeek — пропуск
    если ACHIEVEMENT_CHECKS[a.id](state, lastResult):
      new.push(a.id)
  return new
```

Проверки (`ACHIEVEMENT_CHECKS`) — это словарь функций; каждая возвращает boolean.

## 7.3. Вехи (милестоуны)

**Поле:** `state.milestoneStatus = { week10, week20, week30 }`.

Отдельный слой «мотивационных» чек-пойнтов. При достижении недели 10/20/30 выдаётся статус и соответствующее достижение, а `WeekResultsOverlay` показывает особый градиентный блок «Вы выжили N недель!».

Есть также `MilestoneView` (отображение вех в UI), но он интегрирован в `StatisticsView`, не отдельной вкладкой.

## 7.4. Стадии бизнеса

**Файл:** `src/constants/businessStages.ts`.

Пять стадий:

1. **Startup** — 0+ недель;
2. **Малый** — ~5+ недель или уровень 3+;
3. **Развивающийся** — ~12+ недель или уровень 5+;
4. **Средний** — ~24+ недели или уровень 7+;
5. **Крупный** — ~40+ недель или уровень 9+.

Условия — комбинация недель, уровня, баланса, количества сервисов. Стадия определяет:

- `maxEmployees` — лимит одновременно нанятых;
- какие улучшения и кассы доступны;
- формулировки в UI («ранний этап — не переживайте за убытки» и т. п.).

UI: стадия видна в правой панели `MainScreen` и в `OperationsView`.

## 7.5. Улучшения (апгрейды)

**Конфиг:** `UPGRADES_CONFIG` в `src/constants/business.ts` — 18 улучшений (по 6 на каждый тип бизнеса).

- Категории: помещение, оборудование, маркетинг, сотрудники.
- Каждый апгрейд разовый, даёт постоянные бонусы (пропускная способность, чек, лояльность, качество).
- Открываются по стадии/уровню.

Покупка: `purchaseUpgrade(id)` в `gameStore.ts`. Стоимость списывается из баланса, `purchasedUpgrades.push(id)`, пересобираются модификаторы в `economyEngine`.

UI: вкладка «Улучшения» в `DevelopmentView.tsx` + `UpgradesModal.tsx`.

## 7.6. Рекламные кампании

**Конфиг:** `CAMPAIGNS` в `src/constants/business.ts`.

10 кампаний, включая «рискованного блогера». Параметры: стоимость, длительность, бонус клиентов, возможный негативный эффект (например, +40% клиентов на 1 неделю, но с шансом −10 репутации).

Ограничения:

- максимум N кампаний одновременно (зависит от стадии);
- `CAMPAIGN_DIMINISHING_FACTORS = [1.0, 0.5, 0.3, 0.2]` — каждая следующая даёт меньше эффекта;
- ROI агрегируется в `StatisticsView` → Campaigns tab.

## 7.7. Промо-коды

**Файлы:** `src/constants/promoCodes.ts`, модалки `PromoCodeModal.tsx`, `PromoWalletModal.tsx`, `BundleModal.tsx`.

- Игрок находит/получает промо-коды как награды (за вехи, достижения).
- Коды хранятся в `promoCodesRevealed`; использованные — в `promoCodesUsed`.
- Награда: деньги, бесплатная подписка на сервис на N недель, скидочный бандл.
- `BundleModal` показывает комбо-предложения (сервисы пакетом со скидкой).
- Достижения `promo_collector` и `full_promo` завязаны на использование промо‑кодов.

## 7.8. Условия победы

**Файл:** `src/services/victoryChecker.ts`.

Шесть флагов, каждый по отдельности даёт один из типов «победы» в `VictoryModal`:

1. `weeklyProfitReached` — `weeklyProfit >= 20 000 ₽`;
2. `balanceReached` — `balance >= 1 000 000 ₽`;
3. `allServicesConnected` — все 7 сервисов активны;
4. `levelReached` — `level >= 10`;
5. `achievementsReached` — получено 16+ достижений из 20;
6. `yearOneComplete` — пережить 52‑ю неделю с положительным балансом и репутацией.

Логика:

```
если currentWeek > 52 и balance > 0 и reputation > 0:
  → ПОБЕДА (yearOneComplete)

если одновременно:
    weeklyProfit >= 20k И balance >= 1M И allServicesConnected И level >= 10:
  → ПОБЕДА (composite)
```

## 7.9. Условия поражения

Проверяются в `weekCalculator.ts` в конце недели:

- **Bankruptcy** — `balance < 0` три недели подряд (`gameOverReason: 'bankruptcy'`).
- **Reputation loss** — `reputation == 0` четыре недели подряд (`reason: 'reputation'`).
- **Burnout** — `entrepreneurEnergy <= 0` (`reason: 'burnout'`, мгновенно).

`VictoryModal` в режиме `defeat` показывает причину и предлагает начать заново.

## 7.10. Мета-прогрессия: перки между забегами

**Стор:** `useMetaStore()`. **Экран:** `PerkSelectionScreen.tsx`.

После проигрыша перед следующим запуском игрок выбирает один перк. Перки разблокируются по мере количества пройденных забегов (`totalRuns`).

Примеры:

- `extra_capital` — дополнительный стартовый капитал;
- `rent_grace_week1` — первая неделя без аренды;
- `bank_headstart` — Контур.Банк активен сразу;
- `reputation_boost` — +X стартовой репутации;
- `energy_boost` — +X стартовой энергии.

Выбранный перк применяется в `startNewGame()`: соответствующие поля стейта инициализируются с учётом бонуса.

Мета-стор сохраняется отдельно от игрового стора (разные ключи в localStorage), чтобы не сбрасываться при начале нового забега.

## Экраны, где это видно

- **MainScreen → правая панель** — уровень, стадия.
- **AchievementsModal** — все достижения с прогресс-барами, фильтром по волнам.
- **WeekResultsOverlay** — вехи, новые достижения.
- **StatisticsView** — общий прогресс, история забегов, вехи, кампании и ROI.
- **VictoryModal** — финальный экран (победа / поражение).
- **PerkSelectionScreen** — между забегами.
- **DevelopmentView** — улучшения и кампании.
- **PromoCodeModal / PromoWalletModal / BundleModal** — промо-коды и бандлы.

## Ключевые файлы

```
src/services/
  achievementChecker.ts
  victoryChecker.ts
src/constants/
  achievements.ts
  businessStages.ts
  promoCodes.ts
src/stores/
  gameStore.ts         // level, experience, milestoneStatus, purchasedUpgrades
  metaStore.ts         // totalRuns, selectedPerk, unlocked perks
src/components/
  PerkSelectionScreen.tsx
  views/StatisticsView.tsx
  modals/AchievementsModal.tsx, VictoryModal.tsx,
         UpgradesModal.tsx, PromoCodeModal.tsx,
         PromoWalletModal.tsx, BundleModal.tsx
```
