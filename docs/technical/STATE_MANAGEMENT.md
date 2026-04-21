# Управление состоянием (ЭТАП 3) — v2.0

**Версия:** 2.1 (полная реализация критических систем)  
**Дата обновления:** 2026-04-21

Здесь описан полный стек управления состоянием приложения на базе Zustand.

## Архитектура

```
GameStore (Zustand)
    ├── State properties (gameState)
    │   ├── currentWeek: number (1-52+)
    │   ├── dayOfWeek: number (0-6, 0 = Monday)
    │   ├── entrepreneurEnergy: number (0-100)
    │   └── ...
    ├── Actions (set/get methods)
    └── Middleware (localStorage auto-save)
        │
        ├── useGameState.ts (React Hook)
        │   ├── getActivatedServices()
        │   ├── getActiveServiceIds()
        │   ├── getTotalSubscriptionCost()
        │   └── Другие вспомогательные методы
        │
        ├── GameStateService.ts (Service Layer)
        │   ├── processNextWeek()
        │   ├── activateService()
        │   ├── purchaseUpgrade()
        │   ├── launchAdCampaign()
        │   └── Другие высокоуровневые операции
        │
        └── useLocalStorage.ts (Storage Hook)
            ├── useLocalStorageSync()
            ├── useGameSnapshot()
            └── Утилиты для работы с сохранениями
```

## Ключевые изменения v2.0

### Переход на недельный цикл

**v1.0 (устарело):**
```typescript
interface GameState {
  currentDay: number  // День игры
}
nextDay()  // Перейти к следующему дню
```

**v2.0 (актуально):**
```typescript
interface GameState {
  currentWeek: number  // Неделя игры (1-52+)
  dayOfWeek: number    // День недели (0-6)
  entrepreneurEnergy: number  // Энергия владельца
  weeklyEnergyRestored: boolean  // Флаг восстановления энергии
}
nextWeek()  // Перейти к следующей неделе (7 дней пакетно)
```

### Процесс недели

```typescript
// src/services/weekCalculator.ts
export function processWeek(state: GameState): DayResult {
  // Accumulate results for the week
  for (let dayNum = 0; dayNum < 7; dayNum++) {
    // Process each day of the week (7 iterations)
    // 1. Проверка просрочки
    // 2. Событие конкурента (если неделя 3)
    // 3. Расчёт клиентов, пропускной способности
    // 4. Расчёт выручки
    // 5. Расчёт расходов
    // 6. Обновление репутации и лояльности
  }
  // Возвращает сводку за неделю
}
```

## Компоненты

### 1. GameStore (`src/stores/gameStore.ts`)

Главное хранилище состояния приложения на базе Zustand с полной типизацией.

**Инициализация:**
```typescript
import { useGameStore } from '@/stores/gameStore'

const state = useGameStore()
```

**Доступные методы:**

#### Управление игровым циклом
- `startNewGame(businessType)` - начать новую игру
- `nextDay()` - перейти к следующему дню
- `setGameOver(isGameOver, reason?)` - установить игру в режим окончания
- `setVictory(isVictory)` - установить статус победы

#### Управление финансами и метриками
- `setBalance(amount)` - установить баланс
- `addBalance(delta)` - добавить/вычесть деньги
- `setReputation(value)` - установить репутацию (0-100)
- `addReputation(delta)` - изменить репутацию
- `setLoyalty(value)` - установить лояльность (0-100)
- `addLoyalty(delta)` - изменить лояльность

#### Управление сервисами Контура
- `toggleService(serviceId)` - переключить статус сервиса
- `activateService(serviceId)` - активировать сервис
- `deactivateService(serviceId)` - деактивировать сервис

#### Управление запасами
- `addStockBatch(batch)` - добавить партию товара
- `removeStockBatch(batchId)` - удалить партию
- `updateStockBatch(batchId, quantity)` - обновить количество товара

#### Рекламные кампании
- `addAdCampaign(campaign)` - запустить рекламную кампанию
- `removeAdCampaign(campaignId)` - прекратить кампанию
- `updateAdCampaignDays(campaignId, daysRemaining)` - обновить дни

#### Улучшения (Upgrades)
- `purchaseUpgrade(upgradeId)` - купить улучшение

#### События
- `setPendingEvent(event)` - установить ожидаемое событие
- `markEventAsResolved(eventId)` - отметить событие как разрешённое

#### Прогрессия
- `addAchievement(achievementId)` - добавить достижение
- `addExperience(amount)` - добавить опыт
- `setLevel(level)` - установить уровень

#### Система отката (для тестирования)
- `saveSnapshot()` - сохранить снимок состояния
- `rollback()` - восстановить последний снимок
- `clearRollback()` - удалить снимок

### 2. useGameState Hook (`src/hooks/useGameState.ts`)

Удобный React hook для работы с состоянием игры.

**Примеры использования:**

```typescript
import { useGameState } from '@/hooks/useGameState'

function MyComponent() {
  const {
    // State
    currentDay,
    balance,
    reputation,
    loyalty,
    services,
    level,
    experience,
    achievements,
    
    // Actions
    setBalance,
    addReputation,
    activateService,
    
    // Utility methods
    getActivatedServices,
    getActiveServiceIds,
    getTotalSubscriptionCost,
    hasService,
    hasPurchasedUpgrade,
    hasAchievement,
    getTotalStockValue,
  } = useGameState()

  // Проверить активен ли сервис
  if (hasService('market')) {
    // Сервис Маркет активирован
  }

  // Получить стоимость всех активных подписок
  const monthlyCost = getTotalSubscriptionCost()

  // Получить список активных сервисов
  const active = getActivatedServices()
}
```

**Доступные методы:**

- `getActivatedServices()` - получить список активных сервисов
- `getActiveServiceIds()` - получить ID активных сервисов
- `getTotalSubscriptionCost()` - получить стоимость всех подписок
- `hasService(serviceId)` - проверить активен ли сервис
- `hasPurchasedUpgrade(upgradeId)` - проверить куплено ли улучшение
- `hasAchievement(achievementId)` - проверить есть ли достижение
- `getActiveAdCampaign(campaignId)` - получить активную кампанию
- `getTotalAdCampaignsCost()` - получить стоимость всех кампаний
- `getTotalStockValue()` - получить стоимость всех товаров
- `getTotalStockQuantity()` - получить количество товара

### 3. GameStateService (`src/services/gameStateService.ts`)

Высокоуровневый слой бизнес-логики для работы с состоянием.

**Примеры использования:**

```typescript
import { GameStateService } from '@/services/gameStateService'

// Запустить следующий день
GameStateService.processNextDay(dayResult, pendingEvent)

// Активировать сервис
await GameStateService.activateService('market')

// Купить улучшение
await GameStateService.purchaseUpgrade('hall-expansion')

// Запустить рекламную кампанию
await GameStateService.launchAdCampaign('yandex-direct')

// Добавить товар
const batchId = GameStateService.addStock(100, 5, 10)

// Разрешить событие
GameStateService.resolveEvent(optionId)

// Начать новую игру
GameStateService.startNewGame('cafe')

// Получить статистику
const stats = GameStateService.getGameStats()
// { day, balance, reputation, loyalty, level, experience, achievements, activeServices, ... }
```

### 4. useLocalStorage Hook (`src/hooks/useLocalStorage.ts`)

Управление локальным сохранением игры.

**useLocalStorageSync:**
```typescript
import { useLocalStorageSync } from '@/hooks/useLocalStorage'

function App() {
  const { resetGameData, exportGameData } = useLocalStorageSync()

  return (
    <>
      <button onClick={resetGameData}>Сбросить данные</button>
      <button onClick={() => {
        const data = exportGameData()
        console.log(data)
      }}>Экспортировать</button>
    </>
  )
}
```

**useGameSnapshot:**
```typescript
import { useGameSnapshot } from '@/hooks/useLocalStorage'

function DebugPanel() {
  const {
    createSnapshot,
    getSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
  } = useGameSnapshot()

  return (
    <>
      <button onClick={createSnapshot}>Создать снимок</button>
      {getSnapshots().map(snapshot => (
        <div key={snapshot.key}>
          День {snapshot.day}, Баланс: {snapshot.balance}
          <button onClick={() => deleteSnapshot(snapshot.key)}>Удалить</button>
        </div>
      ))}
    </>
  )
}
```

## Автосохранение

Состояние игры автоматически сохраняется в `localStorage` при каждом изменении.

**Ключи хранилища:**
- `konturgame_state` - основное состояние игры
- `konturgame_rollback` - снимок для системы отката

**Загрузка при старте:**
```typescript
import { useInitializeGame } from '@/hooks/useGameState'

function App() {
  const { initialize } = useInitializeGame()

  useEffect(() => {
    initialize() // Загрузить сохранённую игру, если есть
  }, [])

  return <Game />
}
```

## Типы данных

### GameState (v2.1)
```typescript
interface GameState {
  // Основная информация
  businessType: BusinessType
  currentWeek: number      // 1-52+ (неделя игры)
  dayOfWeek: number        // 0-6 (0 = Monday)
  balance: number
  reputation: number
  loyalty: number
  entrepreneurEnergy: number  // 0-100, восстанавливается еженедельно

  // Инвентарь
  stock: Stock[]
  stockBatches: StockBatch[]
  capacity: number

  // Сервисы
  services: Record<ServiceType, Service>
  activeAdCampaigns: AdCampaign[]
  purchasedUpgrades: string[]

  // Прогрессия
  achievements: string[]
  level: number
  experience: number

  // События
  lastDayResult: DayResult | null
  pendingEvent: Event | null
  triggeredEventIds: string[]

  // Состояние игры
  isGameOver: boolean
  isVictory: boolean
  gameOverReason?: string

  // Счётчики
  consecutiveOverloadDays: number
  daysReputationZero: number
  daysSinceLastMonthly: number
  purchaseOfferedThisDay: boolean
  weeklyEnergyRestored: boolean  // Восстановлена ли энергия на этой неделе

  // Модификаторы
  temporaryClientMod: number
  temporaryCheckMod: number
  temporaryModDaysLeft: number

  // Кассовые аппараты
  cashRegisters: CashRegister[]

  // Ассортимент
  enabledCategories: string[]

  // Промокоды
  promoCodesRevealed: ServiceType[]
  pendingPromoCode: ServiceType | null

  // Микро-события
  seenMicroEventIds: string[]
  pendingMicroEvent: MicroEvent | null

  // === НОВЫЕ СИСТЕМЫ v2.1 ===
  
  // Поставщики
  suppliers: Supplier[]           // Все доступные поставщики
  activeSupplierId: string | null // ID текущего поставщика

  // Сотрудники
  employees: Employee[]           // Нанятые сотрудники

  // Качество сервиса/товара
  qualityLevel: number            // 0-100, старт: 50

  // Конкуренция (циклическая)
  competitorEventTriggered: boolean  // Флаг активного события
  weeksSinceCompetitorEvent: number  // Недель с последнего события

  // Временные метки
  createdAt: number
  lastUpdated: number
}
```

## Тестирование

Все методы store полностью покрыты тестами (38 тестов).

```bash
# Запустить тесты
npm test

# С UI
npm test:ui

# С покрытием
npm test:coverage
```

## Лучшие практики

1. **Используйте useGameState в компонентах:**
   ```typescript
   const { balance, reputation, setBalance } = useGameState()
   ```

2. **Используйте GameStateService для сложной логики:**
   ```typescript
   await GameStateService.activateService('market')
   ```

3. **Не обращайтесь к useGameStore напрямую в компонентах:**
   ```typescript
   // ❌ Плохо
   const state = useGameStore()
   
   // ✅ Хорошо
   const state = useGameState()
   ```

4. **Используйте rollback систему для отладки:**
   ```typescript
   const { saveSnapshot, rollback } = useGameStore.getState()
   saveSnapshot() // Сохранить текущее состояние
   // ... что-то делать ...
   rollback() // Вернуться к сохранённому состоянию
   ```

5. **Для локального тестирования используйте snapshots:**
   ```typescript
   const { createSnapshot } = useGameSnapshot()
   createSnapshot() // Сохранить день в снимок
   ```

## Интеграция с UI

### Компоненты должны:
1. Использовать `useGameState()` для доступа к состоянию
2. Вызывать actions через хук, а не через store напрямую
3. Использовать `GameStateService` для сложных операций

### Пример компонента:
```typescript
function KPIPanel() {
  const { currentDay, balance, reputation, loyalty } = useGameState()

  return (
    <div className="kpi-panel">
      <div>День: {currentDay}</div>
      <div>Баланс: ₽{balance.toLocaleString()}</div>
      <div>Репутация: {reputation}%</div>
      <div>Лояльность: {loyalty}%</div>
    </div>
  )
}
```

## Следующие этапы

После завершения ЭТАПА 3 (Управление состоянием) необходимо:
- **ЭТАП 4:** Главный UI и экран дневника
- **ЭТАП 5:** Модальные окна и взаимодействие
- **ЭТАП 6:** Система сервисов Контура
