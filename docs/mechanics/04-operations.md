# 04. Операционные механики: поставщики, сотрудники, кассы, ассортимент, склад, качество

Это набор систем, которыми игрок управляет напрямую через модалки/вьюхи. Каждая оказывает влияние на основную экономическую формулу.

## 4.1. Поставщики

**Сервис:** `src/services/supplierManager.ts`. **Каталог:** `src/constants/suppliers.ts`.

Шесть поставщиков в трёх тирах. Игрок всегда использует одного активного поставщика.

| Тир | Поставщик | Цена | Качество | Надёжность |
|-----|-----------|------|----------|------------|
| economy | Опт-Эконом | −15% | −15% | 75% |
| economy | Дешёвый Опт | −12% | −20% | 70% |
| standard | Надёжный Поставщик (старт) | 0 | 0 | 90% |
| standard | Центр-Поставка | +8% | +5% | 85% |
| premium | Премиум-Качество | +20% | +15% | 95% |
| premium | Элит-Поставки | +25% | +20% | 98% |

- **Цена** → прямо корректирует `dailyCost` категорий в `assortmentEngine.ts`.
- **Качество** → прибавляется к `qualityLevel` в `qualityManager.ts`.
- **Надёжность** → `checkDeliverySuccess()`: при неудаче срабатывает событие «срыв поставки» (−30% товара или −35 000 ₽).

API:

```
switchSupplier(state, supplierId)      // переключить
getActiveSupplier(state)               // текущий
getPriceModifier(state): number        // множитель цены товара
getQualityModifier(state): number      // дельта качества
checkDeliverySuccess(state): boolean   // проверка надёжности
```

Премиум становится доступен с неделя 4+ или при репутации ≥ 60 (фильтр при выборе).

UI: поставщики управляются через `AssortmentModal` / `OperationsView` (в зависимости от экрана), выбор отображается карточками с подсветкой активного.

## 4.2. Сотрудники

**Сервис:** `src/services/employeeManager.ts`. **Каталог:** `src/constants/employees.ts`. **Модалка:** `HireEmployeeModal.tsx`.

Шесть универсальных позиций (в отличие от дизайна GDD, где описаны бариста / повара / маникюрщицы — в коде позиции унифицированы).

| Позиция | Зарплата/мес | Эффективность | Энергии/нед. |
|---------|--------------|---------------|--------------|
| Cashier (Кассир) | 45 000 | 0.8–1.2 | 5 |
| Assistant (Помощник) | 50 000 | 0.9–1.3 | 7 |
| Manager (Управляющий) | 75 000 | 1.0–1.5 | 10 |
| Specialist (Специалист) | 70 000 | 1.1–1.4 | 8 |
| Supervisor (Супервайзер) | 90 000 | 1.2–1.6 | 6 |
| Trainer (Тренер) | 85 000 | 1.1–1.5 | 9 |

Эффективность — случайное число в диапазоне при найме.

### Что они дают

- **Пропускная способность**: `capacity += employeeBonus × 10%`, где `employeeBonus = sum(efficiency)`.
- **Качество**: если средняя эффективность > 1.2 → +1 качество в неделю, < 0.9 → −1.
- **Энергия владельца**: работа в одиночку стоит 15 энергии в неделю дополнительно (штраф за solo). С сотрудниками штраф снимается, но каждый сотрудник сам стоит 5–10 энергии на «управление».

Формула недельной энергии: `20 + sum(energyCost) + (employees.length === 0 ? 15 : 0)`.

### Найм и увольнение

```
hireEmployee(state, position):
  if balance < monthlySalary: return false
  if entrepreneurEnergy < cost * 2: return false
  employees.push({position, efficiency: rnd(min,max), salary})
  balance -= monthlySalary                 // первый месяц вперёд
```

Увольнение — просто удаление из массива (никакой «компенсации» не предусмотрено).

Лимит одновременно нанятых сотрудников зависит от стадии бизнеса (см. `businessStages.ts` и 07-progression.md).

### События сотрудников

Часть событий вшита в `eventGenerator.ts`:

- запрос на повышение → выбрать +10% зарплаты или уход;
- болезнь → на день −efficiency;
- «сотрудник месяца» → +2 репутации.

## 4.3. Кассы

**Сервис:** `src/services/cashRegisterEngine.ts`. **Каталог:** `src/constants/cashRegisters.ts`. **Модалка:** `CashRegisterModal.tsx`.

Три типа касс:

| Тип | Стоимость | Пропускная | Поломка/день | Синергия |
|-----|-----------|------------|--------------|----------|
| Mobile | 8 000 ₽ | 20 чел. | 5% | — |
| Reliable | 25 000 ₽ | 60 чел. | 1% | — |
| Fast | 55 000 ₽ | 150 чел. | 0.5% | +Market → +25% пропускной |

При покупке 2‑й кассы — скидка 10%, 3‑й — 15%.

### Расчёт пропускной и штрафа

```
totalThroughput = сумма пропускных всех рабочих касс
overflow = served − totalThroughput
penaltyGroups = floor(overflow / 5)
penalty = min(0.8, penaltyGroups × 0.1) × revenue
```

Поломка кассы проверяется каждый день (`checkRegisterBreakdown`): при срабатывании касса не работает сутки и +15% штрафа к выручке.

## 4.4. Ассортимент и категории товаров

**Сервис:** `src/services/assortmentEngine.ts`. **Модалка:** `AssortmentModal.tsx`. **Вьюха:** `WarehouseView.tsx`.

Для магазина и кафе есть каталог категорий товаров. Для салона — услуги (описывается той же структурой).

Примеры для магазина:

| Категория | Маржа | Стоимость/день | Базовая выручка | Требует сервисов |
|-----------|-------|----------------|------------------|------------------|
| Бакалея (старт) | 15% | 500 ₽ | 5 500 ₽ | — |
| Молочка | 20% | 800 ₽ | 5 000 ₽ | market, ofd |
| Мясо и рыба | 30% | 1 200 ₽ | 7 000 ₽ | market, ofd, vet |
| Алкоголь | 40% | 2 000 ₽ | 10 000 ₽ | ofd, extern, egais |
| Табак | 35% | 1 000 ₽ | 5 500 ₽ | market, ofd |

Для кафе: напитки (65% маржа), готовая еда, десерты, барная карта.

### Расчёт выручки по категориям

```
calculateCategoryRevenue(state):
  для каждой активной категории:
    если все requiredServices у категории активны:
      revenue = baseRevenue
      cost    = dailyCost
      fine    = 0
    иначе:
      revenue = baseRevenue × 0.5     // штраф за нелегальную торговлю
      cost    = dailyCost
      fine    = baseRevenue × 0.1
  суммировать, вернуть { totalRevenue, totalDailyCost, totalFine }
```

Стратегия: включать категории постепенно, по мере подключения сервисов.

## 4.5. Склад (FIFO)

**Сервис:** `src/services/stockManager.ts`.

Только для магазина и кафе (у салона `hasStock: false`).

Склад хранится массивом «партий» `stockBatches`:

```
Batch { quantity, costPerUnit, dayReceived, expirationDays }
```

### Закупка и расход

```
addStock(state, quantity, costPerUnit):
  batches.push({quantity, costPerUnit, dayReceived: currentDay, expirationDays})

consumeStock(state, quantity):
  берём из самого старого батча (FIFO), потом из следующего
  возвращаем { consumed, cost } — общую себестоимость
```

### Просрочка

```
checkExpiry(state):
  для каждого батча:
    age = currentDay − dayReceived
    если age >= expirationDays:
      loss += quantity * costPerUnit * lossRate
      удалить батч
  return { expired, loss }
```

- Без **Market** — потеря 100% стоимости испорченного товара.
- С **Market** — 80% (списание, Маркет помогает пристроить в последний момент).

Сроки по бизнесам:

- магазин — 10 дней;
- кафе — 7 дней;
- салон — стока нет.

Достижение «мастер склада» (`stock_master`) выдаётся за 10 дней без просрочек.

## 4.6. Качество

**Сервисы:** `src/services/qualityManager.ts`, `src/services/qualityModifier.ts`.

`qualityLevel` — число 0–100, стартует с 50.

### Формула еженедельного пересчёта

```
updateQualityWeekly(state):
  quality = base
          + supplierQualityMod * 100    // ±15..20
          + (avgEmployeeEfficiency > 1.2 ? +1 : 0)
          + (avgEmployeeEfficiency < 0.9 ? −1 : 0)
          + (fokus.active ? +reputationImpact : 0)
          + (market.active ? +5 : 0)
          + (qualityUpgradePurchased ? +10 : 0)
  qualityLevel = clamp(0, 100, quality)
```

Плюс мелкие ежедневные события:

- quality > 85% → 10% шанс хорошего отзыва (+5 репутации);
- quality < 25% → 15% шанс жалобы (−5 репутации).

### Влияние на игру

Функция `qualityModifier.ts` применяется в `economyEngine.ts`:

| Диапазон | Клиенты | Средний чек | Репутация/нед. | Лояльность/нед. |
|----------|---------|-------------|-----------------|------------------|
| <30% | −30% | −15% | −2 | −3 |
| 30–45% | −10% | −8% | −1 | −1 |
| 45–60% | 0 | 0 | 0 | 0 |
| 60–80% | 0 | +8% | +1 | +1 |
| >80% | +20% | +15% | +2 | +3 |

Плюс отдельный «бренд-эффект» при одновременно высоких репутации + лояльности + качестве — до +40% клиентов и +10% к чеку.

## Экраны

- **OperationsView** — персонал, ассортимент, показатели стадии.
- **WarehouseView** — активные категории и их суточные деньги, кнопка в `AssortmentModal`.
- **AssortmentModal** — тумблер категорий с подсказкой о нужных сервисах.
- **HireEmployeeModal** — найм: должность/уровень/предсказанные зарплата и эффективность.
- **CashRegisterModal** — покупка касс и список текущих.
- **Indicators** — прогресс-бары качества, склада, обслуженности.

## Ключевые файлы

```
src/services/
  supplierManager.ts
  employeeManager.ts
  cashRegisterEngine.ts
  assortmentEngine.ts
  stockManager.ts
  qualityManager.ts
  qualityModifier.ts

src/constants/
  suppliers.ts
  employees.ts
  cashRegisters.ts
```
