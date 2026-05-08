# UI Programmer Audit — Бизнес с Контуром
_Date: 2026-05-07 | Auditor: ui-programmer agent_

---

## 1. Store Subscription Patterns (селекторы + useShallow)

### Текущее состояние

Оба корневых компонента — `MainScreen.tsx` и `MobileMainScreen.tsx` — вызывают `useGameStore()` без аргумента-селектора. Это означает подписку на весь объект `GameState`:

```ts
// MainScreen.tsx > DashboardView (строки 66–72)
const store = useGameStore()
const { currentWeek, balance, reputation, ... } = store

// MobileMainScreen.tsx (строки 48–53)
const {
  pendingEvent, pendingEventsQueue, isGameOver, ...
} = useGameStore()
```

Zustand с `useStore()` без селектора подписывает компонент на **любое изменение** в store. Поскольку `lastUpdated` или `currentWeek` обновляется при каждом тике игрового цикла (`processWeek`), оба компонента перерендериваются при каждой итерации. При 11 режимах навигации в `MainScreen` и до 9 вкладок в `MobileMainScreen` это создаёт каскадные ненужные ре-рендеры.

### Масштаб проблемы

По условию задачи, 28 файлов используют `useGameStore()` без селектора. Это god-store full-subscribe паттерн: вся игра пересчитывается на каждый `setState` вызов, включая незначительные обновления (например, `purchaseOfferedThisDay`).

### Рекомендуемое решение

Переход на гранулярные селекторы. Для примитивов — прямой селектор:
```ts
const balance = useGameStore(s => s.balance)
const currentWeek = useGameStore(s => s.currentWeek)
```
Для объектов и массивов — `useShallow` из `zustand/shallow`:
```ts
import { useShallow } from 'zustand/react/shallow'
const { pendingEvent, pendingEventsQueue } = useGameStore(
  useShallow(s => ({ pendingEvent: s.pendingEvent, pendingEventsQueue: s.pendingEventsQueue }))
)
```
`useShallow` выполняет поверхностное сравнение, не вызывая ре-рендер при идентичном содержимом. Критично применить хотя бы к компонентам, которые рендерятся всегда: `DashboardView`, `MobileMainScreen`, `KHeaderBar`, `KStatusBar`.

---

## 2. Desktop/Mobile Code Duplication

### Что продублировано

`MainScreen.tsx` и `MobileMainScreen.tsx` содержат фактически идентичные блоки:

- **Hero balance card** — разметка карточки баланса в `DashboardView` (строки 144–163) и в `MobileMainScreen` (строки 230–250) отличаются только `fontSize: 32` vs `fontSize: 26` и наличием `boxShadow`. Шаблон разметки, набор полей и стили — идентичны.
- **`handleEventOption` логика** — функция 45+ строк в `MobileMainScreen.tsx` (строки 76–124) дублирует аналогичную обработку в `MainScreen.tsx`. Оба файла вызывают `useGameStore.getState()` напрямую, применяют `addBalance` / `addReputation` / `addLoyalty`, вычисляют savings и вызывают `markEventAsResolved`. Это не UI-код — это бизнес-логика, вынесенная в компонент, и она продублирована.
- **`ONBOARDING_ACTION_TO_NAV` / `ONBOARDING_ACTION_TO_TAB`** — две записи с идентичными ключами в MainScreen (строки 40–49) и MobileMainScreen (строки 57–66). Различаются только значения (`NavId` vs строка-таб).
- **Импорты модалок** — оба файла импортируют 9–11 одних и тех же модальных компонентов.
- **6 экранов-view** — оба файла рендерят идентичные `FinanceView`, `WarehouseView`, `OperationsView` и т.д. без адаптации к форм-фактору.

### Вывод

`MobileMainScreen` — не адаптация `MainScreen`, а независимая копия с дрейфующей логикой. При исправлении бага в `handleEventOption` нужно исправлять в двух местах. P0-баг с `EventModal` (не открывается при `pendingEvent`) является прямым следствием этого: в мобильном варианте `setShowEventModal(true)` нигде не вызывается автоматически при появлении `pendingEvent` — логика была добавлена в десктопный путь, но не перенесена.

---

## 3. Component Size Hotspots

| Компонент | Оценочный размер | Проблема |
|---|---|---|
| `MainScreen.tsx` | ~600+ строк | Оркестрирует 11 режимов навигации, содержит `DashboardView` как вложенный компонент, управляет 8+ локальными `useState` |
| `MobileMainScreen.tsx` | ~500+ строк (первые 300 прочитаны, файл продолжается) | Монолит с логикой событий, модалок, онбординга и 9 вкладок |
| `DashboardView` (внутри `MainScreen.tsx`) | ~300+ строк | Определён внутри того же файла, а не вынесен. Содержит: KPI strip, pending event card, synergies panel, stock batches — отдельные смысловые блоки |

`DashboardView` определён как функция внутри `MainScreen.tsx`. Это означает, что при каждом ре-рендере `MainScreen` создаётся новая ссылка на функцию-компонент — React будет размонтировать и монтировать его заново вместо обновления.

---

## 4. Modal Architecture (стек, ESC, z-index, focus)

### Текущее состояние

Каждая модалка управляется отдельным `useState` флагом в родительском компоненте. В `MobileMainScreen` насчитывается минимум 8 таких флагов (строки 36–45). Это flat-флаг архитектура без централизованного стека.

**Отсутствие стека** означает:
- Невозможно правильно обработать ESC для последовательно открытых модалок (закрывается не верхняя, а та, в которой зарегистрирован listener первой).
- z-index расставлены вручную в каждой модалке — нет гарантии правильного порядка наслоения при одновременно открытых модалках.
- `Modal.tsx` (если существует как обёртка) не читался из-за лимита файлов, но само наличие 14 отдельных модалок без единого portal-контейнера — риск z-index конфликтов.

**Focus management**: при открытии модалок через флаги нет автоматического переноса фокуса внутрь модалки. Закрытие модалки не возвращает фокус на триггер-кнопку. Это нарушение WCAG 2.1 (SC 2.4.3, SC 2.1.1).

**P0 — EventModal не открывается на mobile**: `showEventModal` инициализируется `false` и нигде не устанавливается в `true` автоматически при появлении `pendingEvent`. На десктопе событие отображается inline в `DashboardView` без отдельной модалки. На mobile — модалка есть, но триггер отсутствует.

---

## 5. Token Usage vs Hard-coded Tailwind

### Текущее состояние

Проект использует дизайн-систему на основе объекта `K` (токены), импортируемого из `./design-system/tokens`. Стили применяются через inline `style={{}}`, а не через Tailwind-классы. Это последовательный подход, но с рядом проблем:

**Хардкод значений внутри токенизированного кода:**
- `MainScreen.tsx`, строка 107: `background: 'rgba(255,255,255,0.10)'` — захардкожен цвет, не токен.
- Строки 150, 180: `fontSize: 10`, `letterSpacing: '0.08em'`, `fontWeight: 700` — типографические значения без токенов.
- Строка 249: `isMoral ? K.orange : K.orange` — условие, возвращающее одно и то же значение, потенциальная ошибка (ожидался другой цвет для `isMoral`).
- Строка 167: `bg: lastDayResult ? K.violet : K.muted` — семантически непонятно, почему расходы `violet`.

**Дублирование стилей между desktop и mobile**: кард баланса описан дважды с незначительными отличиями в числах шрифта и тени, без общего токена для "hero card style".

**Tailwind**: Tailwind объявлен в стеке (`CLAUDE.md`) но в читаемых компонентах не используется — всё через inline styles. Это ОК как намеренный выбор, но тогда Tailwind в зависимостях — мёртвый груз для production bundle.

---

## 6. List Performance & Memoization

### Проблемы

**`serviceOrder.map()` без ключей от stable id**: строка 120 в `MainScreen.tsx` объявляет `serviceOrder: ServiceType[]` и затем итерирует по ней. Сами ключи (`key={s.id}` или аналог) в читаемом диапазоне не видны — нужно проверить render-блок, но архитектурный риск присутствует.

**Inline objects в render**: на каждый рендер создаются новые объекты в массиве `[{icon, label, value, bg, sub}, ...]` (строки 166–169 в `MainScreen.tsx`). Это стандартный React anti-pattern при высокочастотных ре-рендерах — массив пересоздаётся каждый раз, что ломает memo-оптимизации дочерних компонентов.

**`batchesWithInfo`** (строки 99–104): `.map().sort().slice()` цепочка вычисляется на каждый рендер без `useMemo`. При активном game loop с частыми обновлениями store это лишняя работа.

**`getActiveSynergies(store)`** (строка 95): функция принимает весь store и вызывается inline на каждый рендер `DashboardView`. Если `synergyEngine` выполняет нетривиальные вычисления, это кандидат на `useMemo(fn, [services])`.

**`getTotalThroughput(cashRegisters, store)`** (строка 92): аналогично — принимает store целиком, вызывается на каждый рендер.

---

## 7. Top-7 Refactor Priorities с file:line

| # | Приоритет | Файл:строка | Описание | Трудозатраты |
|---|---|---|---|---|
| **P0** | Критичный | `src/components/MobileMainScreen.tsx:36–45, 76–125` | EventModal не открывается при `pendingEvent`. Добавить `useEffect(() => { if (pendingEvent) setShowEventModal(true) }, [pendingEvent])`. Отдельно — вынести `handleEventOption` в shared hook `useEventHandler`. | ~2 ч |
| **P1** | Высокий | `src/components/MainScreen.tsx:66` `src/components/MobileMainScreen.tsx:48` | Заменить `useGameStore()` без селектора на `useShallow`-селекторы по фактически используемым полям. Начать с этих двух файлов, затем аудит оставшихся 26. | ~4 ч |
| **P2** | Высокий | `src/components/MainScreen.tsx:54–126` | `DashboardView` определён внутри модуля `MainScreen` как локальная функция. Вынести в `src/components/views/DashboardView.tsx`. Устранит ошибку с пересозданием компонента на каждый рендер родителя. | ~2 ч |
| **P3** | Средний | `src/components/MobileMainScreen.tsx:76–124` `src/components/MainScreen.tsx` (аналог) | Дублированная логика `handleEventOption`. Вынести в `src/hooks/useEventHandler.ts`, возвращающий `{ handleEventOption, savingsToast }`. Использовать в обоих компонентах. | ~3 ч |
| **P4** | Средний | `src/components/MainScreen.tsx:107, 150, 166–169, 249` | Хардкод `rgba()` и дублирующиеся стили hero-карточки. Добавить токены для overlay-цветов в `design-system/tokens.ts`. Вынести стили hero-карточки баланса в shared-объект или компонент `HeroBalanceCard`. Строка 249: исправить `isMoral ? K.orange : K.orange` — вероятно, должен быть другой цвет. | ~2 ч |
| **P5** | Средний | `src/components/MainScreen.tsx:92–104` | Обернуть `getActiveSynergies`, `getTotalThroughput`, `batchesWithInfo` в `useMemo` с правильными dep-массивами (`[services]`, `[cashRegisters]`, `[stockBatches, currentWeek]`). Предотвратит лишние пересчёты при ре-рендерах от несвязанных полей store. | ~1 ч |
| **P6** | Низкий | `src/components/MobileMainScreen.tsx` (весь файл) + `src/components/MainScreen.tsx` | Ввести централизованный modal stack: контекст `ModalContext` с методами `openModal(id)` / `closeModal()` / `closeAll()`. Обеспечит правильный ESC-handling, z-index порядок, возврат фокуса. Снизит количество `useState`-флагов в обоих файлах с 8+ до 1 строки. | ~6 ч |

---

## Итого

Критических проблем — 1 (P0 EventModal), перформанс-проблем высокого приоритета — 2 (god-store subscriptions, DashboardView как inline-компонент). Остальные — технический долг, накопленный при параллельном ведении desktop и mobile путей без общих абстракций. Рефакторинг P0–P2 суммарно ~8 часов и устраняет наибольший риск регрессий при дальнейшем развитии.
