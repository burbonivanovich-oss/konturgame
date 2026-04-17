# Стратегия тестирования — Бизнес с Контуром

## 📋 Подход к тестированию

После каждого этапа разработки проводится:
1. **Юнит-тесты** — логика и бизнес-правила
2. **Типизация** — проверка TypeScript strict mode
3. **Build тест** — компиляция без ошибок
4. **Ручное тестирование** — функциональность в браузере (при необходимости)

---

## 🧪 ЭТАП 1: Инициализация проекта — Результаты

### ✅ Статус: PASSED

**Дата:** 2026-04-17  
**Коммит:** d054bfe + f5c8d7f

### Юнит-тесты
```
✓ src/types/__tests__/game.test.ts  (4 tests)
  ✓ should allow valid BusinessType values
  ✓ should allow valid ServiceType values
  ✓ should create a valid GameState object
  ✓ should create a valid Event object

✓ src/stores/__tests__/gameStore.test.ts  (7 tests)
  ✓ should initialize with default state for shop
  ✓ should update balance
  ✓ should increment day
  ✓ should clamp reputation between 0 and 100
  ✓ should clamp loyalty between 0 and 100
  ✓ should load game state
  ✓ should update lastUpdated timestamp on state changes

Test Files  2 passed (2)
Tests       11 passed (11)
Duration    8.19s
```

### Проверка типизации
```bash
npm run type-check
# ✓ Ошибок: 0
```

### Проверка сборки
```bash
npm run build
# ✓ Компилируется без ошибок
```

---

## 🔧 Команды для тестирования

```bash
# Запуск всех тестов в режиме наблюдения
npm run test

# Запуск тестов один раз
npm run test -- --run

# Интерактивный UI для тестов
npm run test:ui

# Покрытие кода
npm run test:coverage

# Проверка типов
npm run type-check

# Build production
npm run build
```

---

## 📊 Структура тестов по этапам

### ЭТАП 1 ✅
- [x] Tests: `src/types/__tests__/game.test.ts` (4)
- [x] Tests: `src/stores/__tests__/gameStore.test.ts` (7)
- [x] Type check: ✓
- [x] Build: ✓

### ЭТАП 2 (ожидается)
- [ ] Tests: `src/services/__tests__/dayCalculator.test.ts` (минимум 10)
- [ ] Tests: `src/services/__tests__/economyEngine.test.ts` (минимум 15)
- [ ] Tests: `src/services/__tests__/stockManager.test.ts` (минимум 8)
- [ ] Tests: `src/services/__tests__/eventGenerator.test.ts` (минимум 5)
- [ ] Tests: `src/services/__tests__/victoryChecker.test.ts` (минимум 10)
- [ ] Type check: ✓
- [ ] Build: ✓

### Последующие этапы
- Аналогичный подход для каждого этапа

---

## 🎯 Критерии готовности этапа

Этап считается **ГОТОВ** (PASSED), если:
1. ✅ Все юнит-тесты проходят (`npm run test -- --run`)
2. ✅ Нет ошибок типизации (`npm run type-check`)
3. ✅ Build выполняется успешно (`npm run build`)
4. ✅ Код задокументирован (JSDoc для сложных функций)
5. ✅ Коммит с описанием (номер подзадачи + описание)

---

## 📝 Минимальное покрытие тестами

- **Бизнес-логика (сервисы):** 80%+
- **Типы и интерфейсы:** 100% (структурные)
- **Store (Zustand):** 100% (все actions)
- **UI компоненты:** 50%+ (основные сценарии)

---

## 🚀 Быстрый запуск тестов

```bash
# Быстрый цикл: type-check → test → build
npm run type-check && npm run test -- --run && npm run build
```

---

**Обновлено:** 2026-04-17 (ЭТАП 1)
