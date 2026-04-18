# Требования к дизайну · Бизнес с Контуром

**Версия:** 1.0  
**Дата:** 2026-04-18  
**Статус:** Эталон для реализации

---

## 🎨 Цветовая палитра

Все цвета должны использоваться ТОЧНО по значениям. Исключения запрещены.

### Основные цвета бренда

| Название | Hex | RGB | Использование |
|----------|-----|-----|---|
| **Ink (Чёрный)** | `#0E1116` | 14, 17, 22 | Основной текст, фон рейла, кнопки |
| **White** | `#FFFFFF` | 255, 255, 255 | Фон карточек, текст на тёмных фонах |
| **Orange** | `#FF6A2C` | 255, 106, 44 | Доход, акценты, CTA-кнопки, Маркет |
| **Green** | `#14B88A` | 20, 184, 138 | Прибыль, успех, спасено, Экстерн, Диадок |
| **Blue** | `#3D5BE6` | 61, 91, 230 | Расходы, Банк, Эльба |
| **Purple** | `#8A4AE0` | 138, 74, 224 | К цели, ОФД |

### Фоновые поверхности

| Название | Hex | Использование |
|----------|-----|---|
| **Surface (основной фон)** | `#F4F2EE` | Фон экрана, контейнеры |
| **Surface-2 (вторичный)** | `#EBE8E2` | Разделители, неактивные элементы |

### Мягкие версии (soft) для фонов

| Название | Hex | Использование |
|----------|-----|---|
| **Orange-soft** | `#FFE2D1` | Фон предупреждений, подсказок |
| **Green-soft** | `#C5F0E0` | Фон успеха, синергий, активных сервисов |
| **Blue-soft** | `#D6DEFB` | Фон информации |
| **Purple-soft** | `#E3D2F8` | Фон сложных состояний |

### Семантические цвета

| Название | Hex | Использование |
|----------|-----|---|
| **Good (успех)** | `#14B88A` | Зелёные индикаторы, спасено |
| **Warn (предупреждение)** | `#FFB020` | Жёлтые индикаторы, персонал |
| **Bad (ошибка/риск)** | `#FF5A5A` | Красные индикаторы, убытки |

### Непрозрачности Ink

| Класс | Значение | Hex с альфой | Использование |
|-------|----------|---|---|
| **Ink** | 100% | `#0E1116` | Основной текст |
| **Ink-70** | 70% | `rgba(14,17,22,0.70)` | Вторичный текст |
| **Ink-50** | 50% | `rgba(14,17,22,0.50)` | Подписи, комментарии |
| **Ink-30** | 30% | `rgba(14,17,22,0.30)` | Разделители, границы |
| **Ink-10** | 8% | `rgba(14,17,22,0.08)` | Фон, очень светлые элементы |

---

## 🔤 Типографика

### Font Family

**Основной шрифт:** Manrope (от Google Fonts)  
**Подходит для:** Весь текст, кроме чисел в таблицах

```css
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Моноширинный шрифт:** JetBrains Mono  
**Подходит для:** Числовые таблицы, ID, коды

```css
font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

### Weights (доступные)

Использовать ТОЛЬКО эти веса:
- **400** — regular (основной текст)
- **500** — medium (вторичный текст)
- **600** — semibold (подписи, labels)
- **700** — bold (основные заголовки)
- **800** — extrabold (акцент, цифры, кнопки)

### Размеры и стили

#### Заголовки

| Класс | Size | Weight | Letter-spacing | Line-height | Использование |
|-------|------|--------|---|---|---|
| **h1** | 34px | 700 | -0.03em | 1.02 | Главные заголовки экранов |
| **h2** | 24px | 700 | -0.02em | 1.05 | Названия событий, итоги |
| **h3** | 18px | 700 | -0.015em | 1.1 | Названия карточек |
| **Eyebrow** | 11px | 600 | 0.08em | 1 | Надписи над заголовками, labels |

#### Основной текст

| Класс | Size | Weight | Line-height | Использование |
|-------|------|--------|---|---|
| **Body** | 14px | 500 | 1.4 | Основной текст описаний |
| **Small** | 12px | 500 | 1.35 | Подписи, вторичный текст |
| **Label** | 12px | 600 | 1 | Метки, tags |

#### Специальные стили

- **Numbers (k-num):** `font-variant-numeric: tabular-nums;` — выравнивание цифр по ширине
- **Mono (k-mono):** JetBrains Mono + tabular-nums — для таблиц и ID

### Letter-spacing (обязательно)

- Основной текст: `-0.01em`
- Заголовки: от `-0.015em` до `-0.03em`
- МАЙСКАП (eyebrow): `0.08em`
- Кнопки: `-0.01em`

### Font-smoothing

Для чёткого отображения:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 🔲 Радиусы скругления

Все радиусы КРАТНЫ 4px. Нет исключений.

| Название | Значение | Использование |
|----------|----------|---|
| **r-4** | 4px | Маленькие элементы, иконки |
| **r-8** | 8px | Chips, small tags |
| **r-12** | 12px | Карточки информации, блоки |
| **r-16** | 16px | Модальные окна, контейнеры |
| **r-20** | 20px | Основные карточки (KPI, stock) |
| **r-24** | 24px | Крупные блоки (события, сервисы) |
| **r-32** | 32px | Большие модальные окна |
| **r-pill** | 999px | Кнопки, pills, полностью скруглённые |

---

## 📐 Макет и сетка

### Desktop (основная платформа)

- **Размер:** 1440px × 900px
- **Padding:** 20px–40px от края
- **Gap между элементами:** 8px, 10px, 12px, 20px

### Структура Desktop Dashboard

```
┌─ LEFT RAIL (240px, тёмный) ─┬─────────────── MAIN (flex: 1) ──────────────┐
│ • Logo                       │ ┌─ KPI row (4 cards, 146px height) ─┐        │
│ • Day info + weather        │ │ Orange | Green | Blue | Purple    │        │
│ • Navigation (7 items)      │ └────────────────────────────────────┘        │
│ • Saved badge (bottom)      │ ┌─ Main row (1fr 380px gap:12px) ─┐           │
│                             │ │ ┌─ LEFT: Event+Capacity+Stock ┬ RIGHT: ┐ │
│                             │ │ │ │                           │ Indicators
│                             │ │ │                             │ Services
│                             │ │ │                             │ Next Day
│                             │ │ └─────────────────────────────┴────────┘ │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### Phone (мобильный)

- **Размер:** 390px × 844px
- **Layout:** Single column
- **Tab bar:** Внизу (88px высота)

### Grid системы

**Для KPI:** `grid-template-columns: 1.3fr 1fr 1fr 1fr;`  
**Для сервисов:** `grid-template-columns: 1fr 1fr;` (2-column)  
**Для опций события:** `grid-template-columns: repeat(3, 1fr);`

---

## 📱 Адаптивная верстка

### Брейкпойнты (Breakpoints)

| Устройство | Диапазон | Padding | Примечание |
|-----------|----------|---------|-----------|
| **Mobile** | 320px–479px | 12px–16px | Портрет смартфона |
| **Mobile Large** | 480px–599px | 16px | Большой смартфон |
| **Tablet Small** | 600px–767px | 16px–20px | Планшет портрет |
| **Tablet** | 768px–1023px | 20px–24px | Планшет ландшафт |
| **Desktop Small** | 1024px–1279px | 24px–32px | Ноутбук |
| **Desktop** | 1280px–1919px | 32px–40px | Стандартный монитор |
| **Desktop Large** | 1920px+ | 40px–48px | Широкий монитор |

### CSS Media Queries

```css
/* Mobile first approach */
@media (min-width: 480px) { /* Mobile Large */ }
@media (min-width: 600px) { /* Tablet Small */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop Small */ }
@media (min-width: 1280px) { /* Desktop */ }
@media (min-width: 1920px) { /* Desktop Large */ }
```

### Адаптивный Layout Dashboard

#### Mobile (320px–479px)

```
┌──────────────┐
│ Header/Logo  │
├──────────────┤
│              │
│   Content    │ (single column, full width)
│              │
├──────────────┤
│  Tab Bar     │ (88px, 5 tabs внизу)
└──────────────┘
```

**Изменения:**
- Нет левого рейла (скрыт или drawer)
- Content: 1 колона (padding: 12px)
- KPI cards: 2 columns вместо 4
- Event: padding 14px вместо 20px
- Font-size уменьшены на 10–15%
- Gap между элементами: 8px–10px вместо 12px–20px

#### Tablet (600px–767px)

```
┌─────────────────────────┐
│ Top bar | Hamburger     │
├───┬─────────────────────┤
│   │                     │
│ S │   Content           │ (2 columns)
│ i │                     │
│ d │                     │
│ e ├─────────────────────┤
│ b │  Tab Bar (bottom)   │
│ a │                     │
│ r └─────────────────────┘
```

**Изменения:**
- Sidebar: 180px (вместо 240px), скрыт по умолчанию (drawer)
- Content padding: 16px
- KPI cards: 2 columns на мобилях, 4 на горизонтали
- Event modal width: 90vw (max 600px)
- Font-size: базовые + 2px

#### Desktop Small (1024px–1279px)

```
┌─ LEFT RAIL (180px) ─┬──────────── MAIN (flex: 1) ────────────┐
│ Compact nav         │ ┌─ KPI row (3 cards instead of 4) ┐   │
│ (smaller icons)     │ └────────────────────────────────────┘   │
│                     │ ┌─ Main row (1fr 300px gap:12px) ┐      │
│                     │ │ LEFT + RIGHT layout              │    │
│                     │ └─────────────────────────────────┘    │
└─────────────────────┴──────────────────────────────────────────┘
```

**Изменения:**
- Sidebar: 180px (вместо 240px)
- KPI: grid-template-columns: 1.2fr 1fr 1fr (3 cards)
- Right panel: 300px (вместо 380px)
- Gap: 10px–12px
- Font-size: базовые

#### Desktop (1280px–1919px) — ЭТАЛОН

Стандартная структура 1440×900px как описано выше.

#### Desktop Large (1920px+)

```
┌─ LEFT RAIL (260px) ─┬─────────── MAIN (flex: 1) ─────────────┐
│ Большой sidebar     │ ┌─ KPI row (5 cards, new metric) ──┐  │
│                     │ └─────────────────────────────────────┘ │
│ Bigger icons        │ ┌─ Main row (1fr 420px gap:16px) ┐   │
│                     │ │ LEFT panel wider                 │    │
│                     │ │ RIGHT panel больше               │    │
└─────────────────────┴──────────────────────────────────────────┘
```

**Изменения:**
- Sidebar: 260px
- KPI: может быть 5 карточек, или все 4 с увеличенным размером
- Right panel: 420px
- Padding: 40px–48px
- Font-size: базовые + 10%

### Адаптивные компоненты

#### KPI Cards — Media Query

```css
/* Default (Desktop): 1.3fr 1fr 1fr 1fr */
grid-template-columns: 1.3fr 1fr 1fr 1fr;
height: 146px;
gap: 10px;

/* Desktop Small: 1.2fr 1fr 1fr */
@media (max-width: 1279px) {
  grid-template-columns: 1.2fr 1fr 1fr;
  height: 140px;
}

/* Tablet: 1fr 1fr (2 на каждую строку) */
@media (max-width: 767px) {
  grid-template-columns: 1fr 1fr;
  height: 120px;
  gap: 8px;
}

/* Mobile: 1fr (single column) */
@media (max-width: 479px) {
  grid-template-columns: 1fr;
  height: 100px;
  gap: 8px;
}
```

#### Числа в KPI — Font Size Адаптация

```css
/* Desktop */
.k-kpi-number { font-size: 42px; }

/* Tablet */
@media (max-width: 767px) {
  .k-kpi-number { font-size: 32px; }
}

/* Mobile */
@media (max-width: 479px) {
  .k-kpi-number { font-size: 24px; }
}
```

#### Event Modal — Responsive Width

```css
/* Desktop */
width: 900px;

/* Tablet Small */
@media (max-width: 767px) {
  width: 90vw;
  max-width: 600px;
}

/* Mobile */
@media (max-width: 479px) {
  width: 95vw;
  max-width: 100%;
  padding: 20px 16px;
  border-radius: 20px; /* уменьшить с 32px */
}
```

#### Services Grid — Колонки

```css
/* Desktop: 2 columns */
grid-template-columns: 1fr 1fr;
gap: 10px;

/* Tablet: 2 columns, но меньше */
@media (max-width: 767px) {
  gap: 8px;
}

/* Mobile: 1 column */
@media (max-width: 599px) {
  grid-template-columns: 1fr;
  gap: 8px;
}
```

#### Left Rail Navigation

```css
/* Desktop (240px) */
width: 240px;
padding: 24px 20px;

/* Tablet (collapsed) */
@media (max-width: 767px) {
  width: 180px;
  padding: 16px;
}

/* Mobile (hidden drawer) */
@media (max-width: 599px) {
  position: fixed;
  left: -240px;
  height: 100vh;
  transition: left 0.3s ease;
  z-index: 100;
  
  /* При открытии */
  &.open {
    left: 0;
  }
}
```

#### Текст — Адаптивный Font Size

| Элемент | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| h1 | 34px | 28px | 22px |
| h2 | 24px | 20px | 18px |
| h3 | 18px | 16px | 14px |
| Body | 14px | 13px | 12px |
| Small | 12px | 11px | 10px |
| Eyebrow | 11px | 10px | 9px |

```css
@media (max-width: 767px) {
  .k-h1 { font-size: 28px; }
  .k-h2 { font-size: 20px; }
  .k-h3 { font-size: 16px; }
  .k-body { font-size: 13px; }
  .k-small { font-size: 11px; }
  .k-eyebrow { font-size: 10px; }
}

@media (max-width: 479px) {
  .k-h1 { font-size: 22px; }
  .k-h2 { font-size: 18px; }
  .k-h3 { font-size: 14px; }
  .k-body { font-size: 12px; }
  .k-small { font-size: 10px; }
  .k-eyebrow { font-size: 9px; }
}
```

#### Padding/Gap Адаптация

```css
/* Desktop: 20px–40px */
padding: 40px;
gap: 20px;

/* Tablet: 16px–24px */
@media (max-width: 767px) {
  padding: 24px;
  gap: 16px;
}

/* Mobile: 12px–16px */
@media (max-width: 479px) {
  padding: 16px;
  gap: 12px;
}
```

### Адаптивные классы (можно добавить в CSS)

```css
/* Visibility helpers */
.hidden-mobile {
  @media (max-width: 599px) {
    display: none;
  }
}

.hidden-tablet {
  @media (min-width: 600px) and (max-width: 1023px) {
    display: none;
  }
}

.hidden-desktop {
  @media (min-width: 1024px) {
    display: none;
  }
}

.visible-mobile {
  display: none;
  @media (max-width: 599px) {
    display: block;
  }
}

/* Touch-friendly spacing on mobile */
@media (max-width: 767px) {
  .k-btn {
    min-height: 44px; /* Apple's recommended touch target */
  }
}
```

### Ориентация экрана

```css
/* Landscape mobile */
@media (max-height: 500px) {
  .k-tabbar {
    height: 44px; /* меньше на горизонтали */
  }
}

/* Portrait (default) */
@media (orientation: portrait) {
  /* стандартные стили */
}

/* Landscape */
@media (orientation: landscape) {
  body {
    padding-top: 20px;
    padding-bottom: 20px;
  }
}
```

### Safe Area (для notched devices)

```css
/* iPhone notch */
@supports (padding: max(0px)) {
  body {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
```

### Контрольный список адаптивности

При реализации проверить:

- [ ] Mobile 320px–479px выглядит хорошо
- [ ] Tablet 600px–767px — все элементы видны
- [ ] Desktop 1280px–1919px — эталонный дизайн
- [ ] Desktop Large 1920px+ — масштабируется корректно
- [ ] Font-size масштабируется по медиа-запросам
- [ ] Padding/gap кратны 4px и масштабируются
- [ ] Sidebar скрывается на мобилях (drawer)
- [ ] Buttons имеют минимум 44px высоты (touch)
- [ ] Images адаптивны (max-width: 100%)
- [ ] Layout переходит с flex/grid корректно
- [ ] Нет горизонтального скролла на мобилях
- [ ] Touch targets >= 44px на мобилях
- [ ] Safe areas учтены (notch, gesture areas)

---

## 🎯 Компоненты

### Кнопки

#### Primary Button (CTA)

```
Фон: --k-orange
Текст: --k-ink
Padding: 20px 24px (large), 10px 14px (small)
Border-radius: r-pill (999px)
Font-weight: 800
Font-size: 17px (large), 12px (small)
Курсор: pointer
Без border
Transition: scale на active
```

**Состояния:**
- Normal: базовый стиль
- Hover: тенью +2px
- Active: scale(0.99)
- Disabled: opacity 0.5

#### Secondary Button

```
Фон: --k-ink
Текст: #fff
Остальное как primary
```

#### Outline Button

```
Фон: transparent
Текст: --k-ink
Border: 1.5px solid --k-ink-10
Остальное как primary
```

### Cards (бенто-стиль)

#### Standard Card

```
Background: #fff или --k-surface
Border-radius: r-20 (20px)
Padding: 18px–20px
Box-shadow: none (плоский дизайн)
```

#### Colored Tile

```
Background: цвет бренда (orange, green, blue, purple)
Color: зависит от цвета (см. таблицу ниже)
Border-radius: r-20 (20px)
Padding: 18px–20px
```

| Цвет | Текст |
|------|-------|
| Orange | --k-ink (чёрный) |
| Green | --k-ink (чёрный) |
| Blue | #fff (белый) |
| Purple | #fff (белый) |
| Ink (тёмный) | #fff (белый) |

#### Bento Grid (KPI)

```
display: grid
grid-template-columns: 1.3fr 1fr 1fr 1fr
gap: 10px
height: 146px
```

Каждая карточка содержит:
- Eyebrow (label сверху)
- Большое число (font-size: 42px для income, 28px для остальных)
- Sparkline или progress bar
- Badge/status (optional)

### Pills & Chips

#### Pill (овальный tag)

```
Display: inline-flex
Align-items: center
Padding: 6px 10px–12px
Border-radius: r-pill (999px)
Font-size: 10px–11px
Font-weight: 800
Background: зависит от контекста (--k-orange, --k-green, и т.д.)
Color: зависит от фона (см. Colored Tile)
```

**Типы pills:**
- Status: `background: --k-orange; color: --k-ink;` + text "РИСК", "КОНТУР", и т.д.
- Badge: `background: --k-surface; color: --k-ink;` для счётчиков

#### Chip (прямоугольный tag)

```
Padding: 6px 10px
Border-radius: r-8 (8px)
Font-size: 12px
Font-weight: 600
Background: rgba(255,255,255,0.2) или --k-ink-10
Color: --k-ink
```

### Icons & Glyphs

#### Icon Square

```
Width: 36px
Height: 36px
Border-radius: r-12 (12px)
Background: --k-ink (или цвет)
Color: контрастный (обычно #fff)
Display: flex + center
Font-size: 14px
Font-weight: 800
```

**Глифы:** Используются символы Unicode (◎, ▦, ◆, □, ★, и т.д.)

### Индикаторы

#### Dot (цветная точка)

```
Width: 8px
Height: 8px
Border-radius: 50%
Display: inline-block
```

**Классы:**
- `.k-dot-green`: --k-good (#14B88A)
- `.k-dot-yellow`: --k-warn (#FFB020)
- `.k-dot-red`: --k-bad (#FF5A5A)

#### Progress Bar

```
Height: 6px (или 5px для мини)
Border-radius: r-pill (999px)
Background: --k-ink-10 (container)
Overflow: hidden
```

Наполнение (`span` внутри):
```
Position: absolute
Inset: 0
Background: цвет (--k-ink, --k-green, и т.д.)
Border-radius: inherit
```

#### Queue Visualization

Маленькие квадраты (10×10px) с border-radius: 3px  
Разные цвета обозначают разные состояния (served, lost, и т.д.)

### Sparkline

```
SVG с данными
Viewbox: 0 0 100 32
Stroke: 1.5px
Stroke-linecap: round
Stroke-linejoin: round
Fill: optional (область под линией с opacity 0.15)
```

---

## 🎭 Модальные окна

### Event Modal

```
Width: 900px (на desktop 1440px)
Background: --k-ink (#0E1116)
Color: #fff
Border-radius: r-32 (32px)
Padding: 36px
Display: flex + flex-direction: column
Gap: 24px
Box-shadow: 0 30px 80px rgba(0,0,0,0.4)
```

**Структура:**
1. Header (flex space-between):
   - Left: Badge + "День X · Событие Y/Z"
   - Right: Close button (32×32px, r-10, background: rgba(255,255,255,0.08))

2. Content (grid 1.1fr 1fr gap:28):
   - Left: Текст события, следующие события (pills)
   - Right: Bento иллюстрация (2 колонны, gap: 8px)

3. Options (grid repeat(3, 1fr) gap:10):
   - 3 карточки с выбором
   - Каждая: padding 18px, border-radius r-20, border: 1.5px solid rgba(255,255,255,0.12)

4. Hint (background: rgba(255,255,255,0.04), padding: 14px, border-radius r-14, font-size: 12px)

### Overlay (затемнение)

```
Position: absolute + inset: 0
Background: rgba(14,17,22,0.72)
Display: flex + center
Filter: blur(24px) на фоне + brightness(0.75)
```

---

## 🏪 Специфичные блоки для игры

### KPI Cards (Income, Net, Expenses, Goal)

#### Доход (Income) — Orange

```
Background: --k-orange
Color: --k-ink
Grid-column: 1.3fr (доминирует)
```

Содержит:
- Eyebrow: "ДОХОД ЗА ДЕНЬ"
- Число: 42px, font-weight: 800, class: k-num
- Badge: "+18%" (background: --k-ink, color: --k-orange)
- Sparkline (внизу)

#### Чистая прибыль (Net) — Green

```
Background: --k-green
Color: --k-ink
```

#### Расходы/месяц (Monthly) — Blue

```
Background: --k-blue
Color: #fff
```

#### К цели (To Goal) — Purple

```
Background: --k-purple
Color: #fff
Progress bar (внизу, белый, width: 67%)
```

### Событие (Event Block)

```
Background: --k-ink
Color: #fff
Border-radius: r-24
Padding: 20px
Display: flex + flex-direction: column
Gap: 14px
```

**Структура:**
1. Header:
   - Badge: "СОБЫТИЕ · ТРЕБУЕТ РЕШЕНИЯ"
   - Hint: "Блокирует Следующий день" (opacity: 0.5)
   - Counter: "1 / 1" (right)

2. Title: 28px, font-weight: 800, line-height: 1.05

3. Options (grid 3 columns):
   - Каждая опция: background: rgba(255,255,255,0.06), border: 1.5px solid rgba(255,255,255,0.1), padding: 14px
   - Содержит: название, цена/результат, вторичная информация (репутация, и т.д.)

### Пропускная способность (Queue/Capacity)

```
Display: flex + flex-direction: column
Gap: 12px
```

**Элементы:**
1. Заголовок + счётчик (120 / 137)
2. Stacked bar: flex с двумя div (flex: served, flex: lost)
3. Queue dots: flex + flex-wrap, каждый 10×10px, border-radius: 3px
4. Info box: padding 10px, background: --k-surface, color: var(--k-orange), border-radius: r-12

### Склад (Stock/Inventory)

```
Background: #fff
Border-radius: r-20
Padding: 18px
Display: flex + flex-direction: column
Gap: 10px
```

**Элементы:**
1. Заголовок + счётчик (108 ед · 5 дн)
2. Badge "20 ПРОСРОЧКА" (orange)
3. Day markers (7 полосок, flex, height: 8px, different colors)
4. Batch list (flex column, каждая batch: display grid с прогресс-баром)
5. Button "Заказать стандарт · 2 880 ₽"

### Экосистема Контура (Services)

```
Background: #fff
Border-radius: r-20
Padding: 14px
Display: flex + flex-direction: column
Gap: 10px
Flex: 1 (займёт остаток высоты)
```

**Структура:**
1. Header: "ЭКОСИСТЕМА · Контур · 4/7" + "Развернуть →"
2. Services grid (2 columns, gap: 6px):
   - Active service: background = цвет (orange, blue, green, purple), color: контрастный
   - Inactive: background: --k-surface, opacity: 0.55
   - Empty (+): border: 1.5px dashed --k-ink-30
   - Каждая карточка: padding 8px 10px, border-radius r-10, min-height: 32px, display: flex space-between
3. Synergies box (padding: 10px, background: --k-green-soft, border-radius r-12):
   - Label: "АКТИВНЫЕ СИНЕРГИИ · 2"
   - Список (flex column, gap: 4px)

### Итоги дня (Recap)

```
Display: grid (1fr 1fr) или flex
Gap: 20px
Background: --k-surface
Padding: 40px
```

**Левая часть (460px):**
1. Label: "ИТОГИ ДНЯ · 47 · ср, 14 мая"
2. Green card (чистая прибыль):
   - Big number: 72px, font-weight: 800
   - Unit: 18px, font-weight: 800
   - Badges: "+18% к среднему", "лучший день недели"
3. Orange card (achievement):
   - Icon: 52×52px (★)
   - Text: "ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО"

**Правая часть:**
1. Receipt table:
   - Header row (grid 4 columns)
   - Data rows (grid 4 columns)
   - Footer (bold, bigger numbers)
2. Progression row (2 cards):
   - Purple: К цели (progress bar)
   - Blue: Уровень (progress bar)
3. Button: "Продолжить · День 48 →"

---

## 🧭 Navigation Rail (левый рейл)

```
Width: 240px
Background: --k-ink
Color: #fff
Padding: 24px 20px
Display: flex + flex-direction: column
Flex-shrink: 0
```

**Структура:**
1. Logo (32×32px square) + "Бизнес / с Контуром"
2. Day info box:
   - Background: rgba(255,255,255,0.06)
   - Border-radius: r-12
   - Padding: 12px
   - Label: "КОФЕЙНЯ «ЗЕРНО»"
   - Day: "День 47" (18px, font-weight: 800)
   - Weather: icon + "Весна · солнечно · +8%"
3. Navigation items (flex column, gap: 2px):
   - Каждый: padding 10px 12px, border-radius r-10
   - Active: background: --k-orange, color: --k-ink
   - Inactive: background: transparent, color: #fff
   - Icon (22×22px, border-radius r-6) + label + optional badge
4. Flex spacer (flex: 1)
5. Saved rubles badge (внизу):
   - Background: --k-green
   - Color: --k-ink
   - Padding: 14px
   - Border-radius: r-16
   - Label: "СПАСЕНО С КОНТУРОМ"
   - Big number: 24px
   - ROI text: "×6 ROI · за 47 дней"

---

## 📱 Phone Frame (Mobile)

### Status Bar (44px)

```
Display: flex + space-between + center
Padding: 0 24px
Font-size: 15px
Font-weight: 600
```

**Элементы:**
- Время: "9:41" (class: k-num)
- Сигнал + WiFi + Батарея (иконки)

### Body

```
Flex: 1
Overflow: hidden
Display: flex + flex-direction: column
```

Содержит контент экрана (день, склад, события, и т.д.)

### Home Indicator (5px полоска внизу)

```
Position: absolute
Bottom: 8px
Width: 134px
Height: 5px
Border-radius: 3px
Background: --k-ink
Left: 50% + transform: translateX(-50%)
Opacity: 0.9
Z-index: 20
```

### Tab Bar (88px)

```
Position: absolute
Bottom: 0
Width: 100%
Height: 88px
Background: #fff
Display: flex + space-around + flex-start
Padding: 12px 12px 28px
Border-top: 1px solid --k-ink-10
```

**Каждый tab:**
- Flex column + center
- Gap: 4px
- Icon: 28×28px, border-radius r-8, background зависит от состояния
- Label: 10px, font-weight: 600
- Min-width: 56px

---

## 🌈 Color Usage by Component

### Background Colors

| Компонент | Цвет | Примечание |
|-----------|------|-----------|
| Page/Screen | --k-surface (#F4F2EE) | — |
| Card (white) | #fff | — |
| Left Rail | --k-ink (#0E1116) | Всегда тёмный |
| Modal | --k-ink (#0E1116) | Всегда тёмный |
| Overlay | rgba(14,17,22,0.72) | Полупрозрачный чёрный |

### Text Colors

| Компонент | Цвет | Когда |
|-----------|------|-------|
| Primary text | --k-ink | На светлом фоне |
| Secondary text | --k-ink-50 | На светлом фоне, менее важно |
| Tertiary text | --k-ink-70 | На светлом фоне, самое неважное |
| White text | #fff | На тёмном фоне |

### Tile Colors (для больших блоков)

| Бизнес-роль | Цвет | Текст |
|---|---|---|
| Доход/Income | --k-orange | --k-ink |
| Спасено/Saved | --k-green | --k-ink |
| Расходы/Expenses | --k-blue | #fff |
| Цель/Goal | --k-purple | #fff |
| Риск/Risk | --k-bad (#FF5A5A) | Depends |

---

## 🎬 Animations & Interactions

### Transitions

- Button active: `transition: scale .12s ease;` → `scale(0.99)`
- Hover effects: Subtle shadow or scale up slightly
- No flashing or sudden changes

### States

1. **Normal:** Default styling
2. **Hover:** Small scale increase or shadow
3. **Active:** Scale down (0.99)
4. **Disabled:** opacity 0.5, cursor: not-allowed

### Sparkline

- Stroke-linecap: round
- Stroke-linejoin: round
- Smooth curves (no sharp corners)

---

## 📐 Spacing System

Все отступы должны быть КРАТНЫ 4px.

| Значение | Использование |
|----------|---|
| 2px | Очень маленькие, между элементами |
| 4px | Внутри компонентов |
| 6px | Между иконкой и текстом |
| 8px | Малый gap, padding в pills |
| 10px | Стандартный padding в cards |
| 12px | Gap в сетках |
| 14px | Padding в больших cardах |
| 16px | Большой padding, gap между блоками |
| 18px | Padding в крупных компонентах |
| 20px | Основной padding, gap между секциями |
| 24px | Большой gap, padding в модальных окнах |
| 28px | Extra-large gap |
| 32px | Максимальный gap между основными блоками |
| 40px | Page padding на desktop |

---

## ✅ Контрольный список реализации

При реализации каждого компонента проверить:

- [ ] Цвета ТОЧНО соответствуют hex-кодам
- [ ] Шрифт — Manrope или JetBrains Mono
- [ ] Font-weight из списка (400, 500, 600, 700, 800)
- [ ] Letter-spacing применён корректно
- [ ] Радиусы скругления — из таблицы r-4...r-pill
- [ ] Padding/gap кратны 4px
- [ ] Flex/grid разметка соответствует описанию
- [ ] Тени нет (плоский дизайн) или использована заданная (для модалей)
- [ ] Состояния (normal, hover, active, disabled) работают
- [ ] Desktop 1440×900px + Phone 390×844px

---

## 📚 Примеры использования

### Primary Orange Button

```jsx
<button style={{
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Manrope, sans-serif',
  background: 'var(--k-orange)',
  color: 'var(--k-ink)',
  padding: '20px 24px',
  borderRadius: '999px',
  fontSize: '17px',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
}}>
  Следующий день
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 10h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</button>
```

### Green Card

```jsx
<div style={{
  background: 'var(--k-green)',
  color: 'var(--k-ink)',
  borderRadius: '20px',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}}>
  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
    ЧИСТАЯ
  </div>
  <div>
    <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
      +14 220 ₽
    </div>
    <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.7, marginTop: '4px' }}>
      после налога 6% и закупок
    </div>
  </div>
</div>
```

---

## 🚀 Заключение

Этот документ — **истина в последней инстанции** для дизайна игры. Все компоненты, страницы и модальные окна должны быть реализованы **ТОЧНО** по этим правилам.

При добавлении новых элементов:
1. Выбрать цвет из таблицы (не придумывать новые)
2. Использовать existing spacing scale
3. Применить Manrope с правильным weight
4. Скругления только из r-4...r-pill
5. Следовать pattern existing компонентов

**Никаких исключений. Никакого творчества в дизайне.**
