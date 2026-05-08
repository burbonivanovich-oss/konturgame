# Аудит систем: Бизнес с Контуром
**Версия:** Phase C (сохранение v7)  
**Дата аудита:** 2026-05-07  
**Аудитор:** Systems Designer Agent

---

## 1. Quality Curve

### Формула

```
qualityLevel = clamp(0, 100, state.qualityLevel + empBonus + fokusBonus + marketBonus + upgradeBonus)
```

| Символ | Тип | Диапазон | Описание |
|--------|-----|----------|----------|
| `state.qualityLevel` | float | 0–100 | Накопленный уровень качества в сохранении |
| `empBonus` | float | unbounded | `(getEmployeeCapacityBonus - employeeCount) * 10` |
| `fokusBonus` | int | 0 или 1 | `fokus.effects.reputationBonus` (равен 1) |
| `marketBonus` | int | 0 или 5 | +5 при активном Маркете |
| `upgradeBonus` | int | 0 или 10 | +10 если ID апгрейда содержит 'quality'/'premium'/'interior' |
| `result` | int | 0–100 | Расчётное качество — используется только для пороговых эффектов |

**Вычисленное качество применяется только в двух функциях:**

- `getQualityClientModifier`: q < 40 → −0.20; q ≥ 70 → +0.10; q ≥ 80 → +0.20
- `getQualityPricePremium`: q < 40 → −0.10; q ≥ 70 → +0.05; q ≥ 80 → +0.10

**Проблема 1 — двойной расчёт qualityLevel** (`qualityManager.ts:20–41`, `qualityManager.ts:70–84`)

`calculateQualityLevel()` пересчитывает качество с нуля, прибавляя к `state.qualityLevel` бонусы от сотрудников, сервисов и апгрейдов на каждый вызов. Параллельно `updateQualityWeekly()` мутирует `state.qualityLevel` через `avgEfficiency`. Два разных пути обновления работают на одной переменной. Результат: `state.qualityLevel` дрейфует через `updateQualityWeekly`, а `calculateQualityLevel` применяет свои бонусы сверху. Если марджинальная эффективность высокая, bonuses накапливаются каждую неделю дважды — через `state.qualityLevel` (который поднялся на +1 из `updateQualityWeekly`) и через фиксированные добавки (+5 Market, +10 upgrade). При этом bonuses от сервисов/апгрейдов суммируются не к «базе», а к уже изменённому `state.qualityLevel`. Это может привести к тому, что удаление сервиса не снизит фактическое качество ниже предыдущего `state.qualityLevel`.

**Проблема 2 — нейтральная зона 40–70 слишком широкая**

20 из 30 возможных очков диапазона дают нулевой эффект. Начиная с 50 (старт) игрок не видит никакого стимула инвестировать в качество до тех пор, пока не пересечёт порог 70. Стартовое значение 50 + фиксированный Market bonus (+5) + upgrade bonus (+10) = 65 — всё ещё в нейтральной зоне. Это делает механику качества практически бесполезной до тира 2.

**Проблема 3 — `empBonus` без ограничения сверху**

`empBonus = (getEmployeeCapacityBonus(state) - state.employees.length) * 10`. Если у всех сотрудников `efficiency > 1.0`, сумма не ограничена. Например, 5 сотрудников с эффективностью 1.5 дают `(7.5 - 5) * 10 = +25` к качеству. Это сбивает поведение `calculateQualityLevel` при максимальном штате на тире 3.

**Диапазон выходных значений:** Клиентский модификатор ∈ {−0.20, 0, +0.10, +0.20}; ценовой премиум ∈ {−0.10, 0, +0.05, +0.10}. Оба корректно ограничены на 4 ступени. Вырожденных NaN не обнаружено.

---

## 2. Modifier Stacking

### Порядок применения (weekCalculator.ts:127–179)

```
totalClients
  = baseClients(tier)
  × (1 + seasonal + advertising + event)   [additive internal to calculateClients]
  × reputation                              [multiplicative, отдельным шагом]
  × (1 + qualityClientMod)                 [multiplicative]
  × repClientMod                            [multiplicative, 0.75/0.90/1.0]
  → min(totalClients, capacity)
  → − registerMissed
  → × bankPaymentRatio                      [multiplicative]
```

**Порядок корректен в целом.** Аддитивные факторы (seasonal, advertising, event) применяются вместе, что соответствует задекларированной механике. Все мультипликативные факторы применяются в отдельных шагах.

**Проблема 4 — репутация применяется дважды**

`calculateClients` принимает `modifiers.reputation` и умножает на него (`economyEngine.ts:89`). Затем `weekCalculator.ts:134` применяет отдельный `repClientMod` (0.75/0.90) для репутации < 30. Таким образом, при reputation = 14: `getReputationModifier(14) = 0.5` (economyEngine.ts:81) × `repClientMod = 0.75` → суммарный коэффициент **0.375×** базовых клиентов. Это составной эффект, невидимый игроку, и не задокументированный как intentional. При reputation = 40–80 коэффициент 1.0, поэтому только при падении ниже 30 происходит «скрытый» второй штраф.

**Проблема 5 — `checkBonus` суммируется из разных источников без документации**

`buildModifiers` (economyEngine.ts:207): `checkBonus = getCheckUpgradesBonus + serviceCheckBonus + temporaryCheckMod`. Затем `avgCheck = baseCheck × (1 + checkBonus + advertisingCheckPenalty)` (economyEngine.ts:129). Затем `avgCheck = avgCheck × (1 + qualityPricePremium)` (weekCalculator.ts:161). Оба применяются мультипликативно друг к другу. Итого при полном стеке (Market +15%, upgrades +32%, quality +10%, ads −20%): `(1 + 0.15 + 0.32 − 0.20) × 1.10 = 1.297`. Это ожидаемо, но нигде не задокументировано.

**Проблема 6 — `synergyMods.revenueBonus` применяется к выручке ДО вычета банковской комиссии**

`weekCalculator.ts:171–178`: бандл-бонус применяется к `baseRevenue`, затем банковская комиссия (`acquiringRate`) применяется к уже увеличенной сумме. Это означает, что при активном Банке (комиссия 1.5%) и бандл-бонусе +30% чистый выигрыш от бандла равен `0.30 × (1 - 0.015) = 29.55%`. Погрешность незначительная (< 0.5%), но при изменении ставки комиссии в будущем эффект накопится.

**Проблема 7 — `calculateCapacity` смешивает аддитивные и мультипликативные бонусы**

`economyEngine.ts:109`: `Math.round(baseCapacity × (capacityMod + upgradeBonus + synergyBonus))`. Здесь `capacityMod` начинается с 1.0, к нему аддитивно прибавляются `upgradeBonus` и `synergyBonus`. Однако `upgradeBonus` — это сумма `capacityBonus` из нескольких апгрейдов (например, 0.1 + 0.5 + 0.6 = 1.2), что при сложении с `capacityMod = 1.2` даёт `2.4×` вместо ожидаемых `1.2 × 1.2 = 1.44×`. Это де-факто аддитивный стек, но при большом количестве апгрейдов вместимость может вырасти до `1.0 + 1.2 (от трёх апгрейдов)+ 0.2 (Market) = 2.4×` базовой, что для магазина тира 1 даёт 35 × 2.4 = 84 посадочных места — больше чем у тира 2 (35 × 1.4 = 49). Тир, таким образом, перестаёт быть основной осью прогрессии пропускной способности.

---

## 3. Pain Engine vs Synergy Bundles

**Двойного учёта нет.** `painEngine.ts` полностью обнулён — все значения возвращают 0 (`painEngine.ts:18–24`). Константы `PAIN_LOSSES` в `gameBalance.ts:63–97` задокументированы но не используются в расчётах. Бандл-бонус (`synergyEngine.ts`) и прямые эффекты сервисов (`buildModifiers`) не пересекаются с pain-системой.

**Остаточный риск**: `weekCalculator.ts:248–257` по-прежнему суммирует `additionalPainLoss = pain.market + pain.ofd + ...` и вычитает его из `dayNetProfit`, но поскольку все значения равны 0, на практике это мертвый код. Тем не менее, он занимает место и создаёт ложное впечатление, что pain engine работает.

---

## 4. Win/Loss Conditions

### Банкротство (victoryChecker.ts:6–8)

```
checkBankruptcy: state.daysBalanceNegative >= 3
```

Переменная `daysBalanceNegative` считает недели (weekCalculator.ts:447–451), несмотря на своё имя. Комментарий в коде признаёт это (weekCalculator.ts:444). Таким образом, банкротство наступает через 3 недели отрицательного баланса. При декременте на 1 вместо сброса (weekCalculator.ts:450) механика корректна против эксплойта «микро-займа».

**Проблема 8 — займы могут привести к банкротству вне цикла баланса**

`weekCalculator.ts:429–440`: погашение долга вычитается из `state.balance` уже ПОСЛЕ вычисления `weekNetProfit` и ПОСЛЕ обновления `state.balance = newBalance`. Т.е. `state.balance` может уйти в минус из-за займа, и это произойдёт **до** вызова `checkBankruptcy` — но `daysBalanceNegative` не увеличится в этом цикле (счётчик уже обновлён в строке 447). Проверка банкротства на следующей неделе заметит отрицательный баланс, но задержка в 1 неделю может ввести игрока в заблуждение.

### Репутационное поражение (victoryChecker.ts:11–15)

```
checkReputationLoss: reputation === 0 && daysReputationZero >= 6
```

Корректно. `updateGameOverCounters` (victoryChecker.ts:40–46) сбрасывает счётчик при reputation > 0.

**Проблема 9 — `daysReputationZero` сбрасывается в 0 мгновенно**

Если репутация падает до 0, а затем уходит в +1 (от fokus или события), счётчик `daysReputationZero` обнуляется. Это означает, что игрок, колеблющийся около 0 (0 → 1 → 0 → 1...) никогда не получит game over по репутации, даже проведя 20+ недель на грани. Это может быть дизайнерским решением, но стоит подтвердить intentionally.

### Победа (victoryChecker.ts:36–62)

| Условие | Значение | Комментарий |
|---------|----------|-------------|
| `VICTORY_WEEKLY_PROFIT` | 20 000 ₽/нед | Для кафе тира 1 (база ~9 800 ₽/нед чистой прибыли) требует тир 2 + сервисы |
| `VICTORY_BALANCE` | 500 000 ₽ | Примерно 6× стартового баланса |
| `VICTORY_ACHIEVEMENTS` | 7 | Из ~35 доступных — достижимо |
| `allServicesConnected` | все 7 сервисов | Требует ~228 000 ₽/год подписок |
| `yearOneComplete` | неделя 52 + balance > 0 + rep > 0 | Простейший путь |

**Проблема 10 — `combined` победа практически недостижима для кафе тира 1**

Базовая выручка кафе: 18 клиентов × 70 ₽ × 7 дней × 0.6 (без банка) = ~5 292 ₽/нед. Даже с тиром 2 (×1.4 клиентов, ×1.5 чек): ~18 × 1.4 × 70 × 1.5 × 7 = ~18 522 ₽/нед выручки. После всех расходов (аренда 50 000+25 % → ~12 500/нед, зарплаты, налоги, подписки ~700/нед) чистая прибыль ≈ 5 000–6 000 ₽/нед. Порог `VICTORY_WEEKLY_PROFIT = 20 000` требует тира 3 + полного пакета сервисов + удачных событий. Для магазина картина аналогичная. Это может быть сознательным решением («combined — хардкорный путь»), но риск — большинство игроков победят только через `year_one`, не испытав сложной механики.

**Проблема 11 — `weeklyProfit` в `getVictoryStatus` берётся из `lastDayResult?.netProfit`**

`lastDayResult.netProfit` — это прибыль за всю последнюю неделю (7 дней), не за 1 день. Название переменной `VICTORY_WEEKLY_PROFIT` и использование `netProfit` совпадают. Проблема здесь формальная: `netProfit` в `DayResult` на самом деле является недельным итогом (weekCalculator.ts:404). Это не ошибка, но семантически вводит в заблуждение (поле называется `dayNumber`, хотя содержит `state.currentWeek - 1`).

---

## 5. Stock Manager (FIFO)

### Алгоритм FIFO

`consumeStock` (stockManager.ts:27–47): итерирует `stockBatches` в порядке добавления, забирает из каждого батча сколько нужно, затем фильтрует нулевые батчи. FIFO реализован корректно при условии, что батчи всегда добавляются в конец массива (`addStock` — push, stockManager.ts:25).

### Срок годности

`checkExpiry` (stockManager.ts:50–75): `age = currentWeek*7 + dayOfWeek - batch.dayReceived`. Проверяет `age >= expirationDays`. Для магазина `expirationDays = 10`, кафе = 7, салон = 0.

**Проблема 12 — `lossRate` при истечении срока в 0.8 слишком высокая без контекста**

`EXPIRY_LOSS_RATE = 0.8` (business.ts:222): 80% стоимости товара списывается при истечении. Это не выручка — это `costPerUnit`, т.е. себестоимость. При стандартных параметрах (`DEFAULT_UNIT_COST = 8`, `DEFAULT_BATCH_SIZE = 48`): 48 × 8 × 0.8 = 307.2 ₽ за батч. На фоне недельной выручки магазина (~10 500 ₽) это незначительно. Но если `costPerUnit` берётся из ассортиментного движка (где может быть выше), потери могут быть значительными.

**Проблема 13 — `beauty-salon` с `expirationDays = 0` потенциальный баг**

`EXPIRY_DAYS['beauty-salon'] = 0` (stockManager.ts:7). При `age >= 0` каждый батч будет помечен как истёкший мгновенно, в первый же день после получения. Однако `config.hasStock = false` для салона (business.ts:48), и `checkExpiry` возвращает `{ expired: 0, loss: 0 }` сразу. Проверка корректна, но константа `expirationDays = 0` в `EXPIRY_DAYS` не нужна и вводит в заблуждение — её следует удалить или сделать `undefined`.

**Проблема 14 — `needsRestock` использует `baseClients` без тир-мультипликатора**

`predictedDemand` (stockManager.ts:87–91): `config.baseClients * days` — не учитывает тир бизнеса. На тире 3 реальный поток клиентов в 2.5× выше базового, и `needsRestock` будет занижать потребность в запасах. Это UI-подсказка, но игрок может ориентироваться на неё.

---

## 6. Cash Register

### Пропускная способность

`getTotalThroughput` корректно агрегирует с синергийным бонусом Market+Fast (+25%). `calculateRegisterPenalty` линейная: все клиенты сверх throughput теряются. Корректно.

**Проблема 15 — `checkRegisterBreakdown` игнорирует количество касс в батче**

`cashRegisterEngine.ts:33–40`: для каждой записи `CashRegister` с `count > 1` вероятность поломки проверяется один раз — не `count` раз. Т.е. 3 кассы одного типа имеют ту же вероятность поломки, что и 1 касса. Это занижает риск при масштабировании.

**Проблема 16 — `registerOverflowPenalty` в отчёте, но не в балансе**

`weekCalculator.ts:202`: `registerOverflowPenalty = registerMissed * avgCheck`. Это значение попадает в `result.registerOverflowPenalty` (строка 424) и в `weekRegisterOverflow` (строка 307), но нигде не вычитается из `dayNetProfit` или `state.balance`. Потеря клиентов (missed++) отражается в репутации, но денежный эффект penalty не применяется к балансу. В UI это показывается как «потеряно», но реального штрафа нет.

**Проблема 17 — `null`-path при пустом массиве касс**

`getTotalThroughput` возвращает 0 при `registers.length === 0`. В `weekCalculator.ts:149`: `registerThroughput > 0 ? calculateRegisterPenalty(...) : 0`. При нулевом throughput penalty = 0, т.е. без касс ограничений нет — игрок может не покупать кассы без штрафа кроме missing `first_register` achievement. Это скрытый дизайнерский выбор, не задокументированный.

---

## 7. Achievement Coverage

### Полная карта достижений

| ID | Проверка | Волна | Статус |
|----|----------|-------|--------|
| `first_day` | currentWeek >= 1 | 1 | Тривиальное — выполняется после любой недели |
| `week_done` | currentWeek >= 2 | 1 | Тривиальное |
| `month_done` | currentWeek >= 5 | 1 | Тривиальное |
| `profitable_day` | netProfit > 0 | 1 | Легко достижимо на неделе 1–2 |
| `perfect_day` | missed === 0 && clients > 0 | 1 | Достижимо: при низком потоке + высокой вместимости |
| `big_profit` | netProfit >= 100 000/нед | 2 | Только тир 3 или Crisis Week удача |
| `millionaire` | balance >= 1 000 000 | 3 | Недостижимо до поздней игры |
| `high_rep` | reputation >= 90 | 2 | Достижимо с Fokus + хорошие события |
| `loyal_staff` | loyalty >= 90 | 2 | Достижимо с Elba + decay контроль |
| `synergy` | activeServices >= 5 | 2 | Описание «3 и более синергии» устарело — сейчас bundles, не synergies |
| `hall_upgrade` | purchasedUpgrades includes 'hall-expansion' | 2 | Только магазин — у кафе/салона нет этого ID |
| `survived_competitor` | currentWeek >= 4 && competitorEventTriggered | 1 | Может никогда не сработать если competitorInterval не достигнут к неделе 4 |
| `promo_collector` | promoCodesRevealed.length >= 3 | 2 | Требует активации Bank, Market, Elba |
| `year_one_no_debt` | неделя 52 + daysBalanceNegative === 0 | 4 | Волна 4 = разблокируется в неделю 52, но победа наступает тоже в неделю 52 — достижение никогда не выдастся |
| Backstory choice (7 шт.) | chosenEventOptions\[id\] === option | 1 | Зависят от событий, которых нет в EVENTS_DATABASE (PERS_CORP_OFFER и др.) |

**Проблема 18 — `year_one_no_debt` физически недостижимо**

Волна 4 разблокируется при `currentWeek >= 52` (`WAVE_UNLOCK_WEEKS[4] = 52`). Победа `year_one` проверяется при `currentWeek >= 52`. Достижение `year_one_no_debt` также проверяется при `currentWeek >= 52`. Но `checkNewAchievements` вызывается в `processWeek` до `state.currentWeek += 1` (строка 647), т.е. при `currentWeek === 51` на момент проверки. Волна 4 разблокируется при `currentWeek >= 52`, поэтому на неделе 51 (момент проверки) волна ещё заблокирована. На следующем вызове `processWeek` (неделя 52) игра уже завершена и `processWeek` бросает `Error('Игра уже завершена')`. Достижение `year_one_no_debt` **никогда не выдаётся**.

**Проблема 19 — `hall_upgrade` только для магазина**

Проверка `purchasedUpgrades.includes('hall-expansion')`. Этот ID существует только в `UPGRADES_CONFIG.shop`. Для кафе и салона достижение недостижимо. В ACHIEVEMENTS нет пометки о бизнес-типе.

**Проблема 20 — backstory achievements зависят от несуществующих event IDs**

`choice_refused_old_boss` требует `chosenEventOptions['PERS_CORP_OFFER'] === 'refuse_proudly'`. Поиск по `EVENTS_DATABASE`, `MORAL_DILEMMA_EVENTS`, `PERSONAL_BACKSTORY_EVENTS` (из eventGenerator.ts imports) нужен для верификации. Если эти события не генерируются в нужных окнах, достижения недостижимы.

**Проблема 21 — описание `synergy` устарело**

Описание: «Активировать 3 и более синергии одновременно». Проверка: `countActiveServices(s) >= 5`. Пять сервисов — это бандл-тир 2, не «синергии». Описание вводит игрока в заблуждение.

---

## 8. Edge Cases

### Отрицательный баланс

Баланс не clamped снизу. `state.balance` может принимать отрицательные значения. `applyWeeklyMicroEvent` (weekCalculator.ts:760): `state.balance = Math.max(0, state.balance + e.balanceDelta)` — здесь баланс clamp'ится в 0. Это означает, что микро-событие может «погасить» отрицательный баланс бесплатно, если `balanceDelta < 0`. Противоречие: штрафное микро-событие не может добавить долг поверх нуля.

### NaN риски

Деление на ноль защищено в большинстве мест:
- `economyEngine.ts:89`: `calculateClients` — нет деления.
- `weekCalculator.ts:269`: `load = capacity > 0 ? served / capacity : 0` — защищено.
- `weekCalculator.ts:492`: `totalClientDivisor = Math.max(0.01, ...)` — защищено.

**Проблема 22 — `calculateDailySubscriptions` делит на 365, а не на 360 или 364 (7×52)**

`economyEngine.ts:168`: `Math.round(total / 365)`. Игровой год = 52 недели × 7 дней = 364 дня. Использование 365 создаёт недоплату в ~0.27% годовой стоимости каждого сервиса. Для полного стека (228 000 ₽/год): недоплата ~615 ₽/год. Незначительно, но семантически некорректно.

### Переполнения

Баланс — `number` (float64), предел ~9×10^15 рублей. При обычном геймплее не достигается.

**Проблема 23 — `consecutiveOverloadDays` не сбрасывается при начале новой недели**

`state.consecutiveOverloadDays` обновляется внутри дневного цикла (weekCalculator.ts:272). При `load < threshold` сбрасывается в 0. При переходе между неделями состояние сохраняется. Если последние 2 дня недели — перегрузка, а первые 3 дня следующей — тоже перегрузка, счётчик корректно достигнет 5. Это корректное поведение.

**Проблема 24 — `daysSinceLastMonthly` приводит к нулевым расходам в первые 28 дней навсегда**

`weekCalculator.ts:231–234`: monthly expense = 0 пока `daysAlive < MONTHLY_CYCLE_WEEKS * 7 = 28`. Дней в `daysAlive` нет до тех пор, пока `state.daysSinceLastMonthly` не инициализирован — он начинается как `undefined ?? 0`. После 28 дней расходы начинают начисляться. Это intentional «grace period», но при сохранении/загрузке если `daysSinceLastMonthly` не сохраняется, он сбрасывается в 0 и grace period повторяется.

**Проблема 25 — `burnout` game over не устанавливает `gameOverReason` при первом срабатывании**

`weekCalculator.ts:362–371`: при первом обнулении энергии `burnoutWarningActive = true`, но `isGameOver` остаётся `false`. На второй неделе устанавливается `isGameOver = true` с `gameOverReason = 'burnout'`. Это intentional (grace week), но если игрок успевает восстановить энергию через `applyWeeklyMicroEvent` (которое может дать `energyDelta > 0` прямо в `applyWeeklyMicroEvent` после проверки), `burnoutWarningActive` сбрасывается. Порядок корректен.

---

## Recommendations (приоритизированные)

1. **[КРИТИЧНО] `year_one_no_debt` никогда не выдаётся** — сдвинуть волну 4 на 51, или добавить пост-победную проверку достижений.
2. **[ВЫСОКИЙ] Двойной штраф репутации** (`economyEngine.ts:89` + `weekCalculator.ts:134`) — при reputation < 30 клиентский поток умножается дважды (0.5 × 0.90 = 0.45×). Объединить в одну функцию или задокументировать как intentional.
3. **[ВЫСОКИЙ] `registerOverflowPenalty` не применяется к балансу** (`weekCalculator.ts:202`/`307`/`424`) — потеря клиентов показывается, но деньги не списываются. Либо убрать из UI, либо применить штраф.
4. **[ВЫСОКИЙ] `hall_upgrade` achievement недостижимо для кафе и салона** — добавить тип бизнеса в описание или создать аналоги для других типов.
5. **[СРЕДНИЙ] `calculateCapacity` аддитивный стек апгрейдов** (`economyEngine.ts:109`) — три апгрейда вместимости магазина дают 1.2× больший результат, чем тир-апгрейд. Разделить на `capacityMod × (1 + upgradeBonus)` или задокументировать как intentional.
6. **[СРЕДНИЙ] Двойной путь обновления `qualityLevel`** (`qualityManager.ts:20–41` vs `70–84`) — `calculateQualityLevel` добавляет бонусы к `state.qualityLevel`, а `updateQualityWeekly` мутирует ту же переменную. Нужно разделить на «базовый уровень» (мутируется) и «расчётный» (только для чтения).
7. **[НИЗКИЙ] `needsRestock` не учитывает тир бизнеса** (`stockManager.ts:87`) — подставить `getEffectiveBaseClients(state)` вместо `config.baseClients`.
