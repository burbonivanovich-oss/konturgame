# Tech Art Audit — Бизнес с Контуром
**Дата:** 2026-05-07  
**Аудитор:** Technical Artist  
**Стек:** React 18 + TypeScript + Vite 5 + Zustand + Tailwind CSS 3

---

## 1. Иконографический пайплайн

### Текущее состояние

`KIcon` (`src/components/design-system/KIcon.tsx`) — монолитный switch-case из **35 иконок**, встроенных как inline JSX SVG. Каждая иконка — отдельный `<svg>` элемент рисующийся полностью в runtime.

**Плюсы:**
- Нулевые HTTP-запросы на иконки
- Иконки colorable через `color` prop и `currentColor`
- Нет зависимостей от внешних библиотек
- `strokeWidth` параметризован

**Минусы и риски:**
- **Нет tree-shaking.** Весь switch-case компилируется в бандл целиком, даже если в данном экране используется одна иконка. При 35 иконках сейчас это незначительно (~3-4 KB gzip), но при росте до 60-80 иконок станет заметным.
- **Нет SVGO-оптимизации.** Пути в иконках написаны вручную и компактны, но нет гарантии, что они оптимальны (лишние точки, неоптимальные команды).
- **Нет Storybook или каталога.** Невозможно визуально проверить иконки без запуска игры.
- **`name` — string без автодополнения.** Typo в `name="dash board"` даст дефолтный пустой круг молча.
- **`strokeWidth` дефолт 1.6 — нечётное значение.** На нечётных разрешениях возможен subpixel anti-aliasing с размытием. Рекомендуется 1.5 или 2.
- `Logo.tsx` использует отдельный inline SVG (прямоугольник), не через KIcon — нет расхождения пока, но при обновлении логотипа нужно помнить о двух точках.

### Что нет и чего не хватает

- Нет ни одного `.svg` файла в проекте — ни в `public/`, ни в `src/assets/` (папки не существуют). Всё иконографическое содержимое полностью встроено в JSX.
- Нет `vite-plugin-svgr` или аналога.
- Нет `svgo` в devDependencies.
- Иконка для `favicon` — `/vite.svg` (дефолтный Vite логотип) — не заменена на брендовую.

### Рекомендации

1. Добавить `as const` union type для допустимых имён иконок: `type IconName = 'dashboard' | 'eco' | ...` — это даст compile-time проверку.
2. При росте иконного набора свыше 50 штук рассмотреть разделение KIcon на именованные экспорты (`IconDashboard`, `IconEco`, ...) — это позволит Rollup tree-shake неиспользуемые.
3. Заменить favicon `/vite.svg` на брендовый SVG с логотипом Контура.
4. Округлить `strokeWidth` дефолт до 1.5.

---

## 2. Анимации и VFX

### Инвентарь существующих анимаций

**Определено в globals.css:**
| Keyframe | Свойства | Применение |
|----------|----------|------------|
| `fadeIn` | opacity 0→1, scale 0.97→1 | OnboardingPanel inline style |
| `slideUp` | opacity + translateY(12px)→0 | MobileMainScreen inline style |
| `fadeOverlay` | opacity 0→1 | Определена, но нигде не применяется |
| `navPulse` | box-shadow ripple | OnboardingPanel, KLeftRail, TutorialMoments, DesktopKontur, OperationsView (через `.nav-pulse`) |
| `navWiggle` | translateX ±1.5px | Применяется вместе с navPulse |
| `coachArrowBounce` | translateY 0→-4px | `.coach-arrow` класс определён, применяется в TutorialMoments |

**Применяемые inline transitions:**
- `NextDayButton`: `transition: 'all 0.2s ease'` на фоне кнопки
- `BusinessSelector`: `transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s'` на карточках выбора
- `Modal` close button: `transition: 'background 0.2s'`
- `AchievementsModal` progress bar: `transition: 'width 0.3s ease'` — единственная анимация данных
- `MilestoneView.css`: `.milestone-card { transition: all 0.3s ease }` + hover translateY(-2px)

**Анимация при открытии модальных окон:** отсутствует. `Modal.tsx` рендерится мгновенно (`if (!isOpen) return null`), без входящей анимации. `WeekResultsOverlay` появляется мгновенно.

### Критические пробелы

**"Следующая неделя →"** — главная CTA кнопка в `WeekResultsOverlay` — статичная кнопка без pulse/glow/hover-эффекта. Это главное игровое действие, совершаемое ~40 раз за игровую сессию.

**Победа (VictoryModal):** 56px emoji `🏆` — единственный «момент триумфа». Нет конфетти, нет scale-in анимации, нет particle burst.

**Достижения:** разблокировка ачивки не имеет никакого визуального feedback, кроме появления в списке.

**Недельный результат:** net profit hero-блок появляется без анимации. Цифра не «считается» снизу вверх. Для игрового симулятора это упущенная возможность для ощущения прогресса.

**Milestone celebration** в WeekResultsOverlay: violet-блок с emoji появляется без fanfare.

### Отсутствующий стек

В `package.json` нет:
- Framer Motion
- React Spring
- anime.js
- canvas-confetti
- Lottie

Единственная анимационная инфраструктура — CSS keyframes в `globals.css` + редкие inline `transition`.

### Performance-оценка существующих анимаций

`navPulse` + `navWiggle` на элементах левого рейла — анимируют `box-shadow` и `transform`. `box-shadow` вызывает repaint (не на compositor thread), `transform` — compositor. Поскольку анимация идёт на idle состоянии (ожидание клика), а не на scroll/60fps loop, критичности нет. На mid-tier mobile (Snapdragon 665) при одновременной работе 3-4 пульсирующих кнопок может давать 2-3 dropped frames — допустимо.

### Рекомендации

1. **Кнопка "Следующая неделя →"** — добавить CSS glow-пульс аналогичный `navPulse` + плавный фоновый shimmer через `@keyframes`. Это самое высокоприоритетное изменение.
2. **Modal entrance** — добавить `animation: fadeIn 0.18s ease-out` на `.modal-content` без Framer Motion (чистый CSS, 0 KB добавки).
3. **VictoryModal** — `canvas-confetti` (3.5 KB gzip) — минимальная зависимость для одноразового эффекта конфетти при победе. Не требует Framer Motion.
4. **Числовые counter-up** — реализуемы через `useEffect` + `requestAnimationFrame` без внешних зависимостей. Net profit в WeekResultsOverlay должен «насчитываться» за 600ms.
5. **Achievement unlock** — короткий scale(1.0)→scale(1.08)→scale(1.0) + box-shadow flash в CSS, без библиотек.
6. **Framer Motion — не рекомендуется** для этого проекта. Добавит ~40 KB gzip к бандлу (текущий JS — 594 KB); для этого уровня анимаций достаточно CSS + 1-2 строк RAF.

---

## 3. Изображения и оптимизация

### Текущее состояние

**Нет ни одного растрового изображения в проекте.** Папки `public/` и `src/assets/` не существуют. 

- `index.html` ссылается на `/vite.svg` для favicon — это Vite-дефолт, файл физически отсутствует в проекте (нет `public/` директории), favicon не отображается.
- NPC «портреты» в коде (`npcs.ts`) — Unicode emoji (`🧑‍💼`, `👨‍🍳` и т.д.), не растровые.
- Все иконки — inline SVG в JSX.
- Нет WebP, нет PNG, нет JPEG во всём репозитории.

### Что это означает

Для текущего scope — хорошо: нулевой image payload, нет проблем с LCP. Если в будущем появятся иллюстрации (онбординговый экран, NPC аватары, фоновые текстуры бизнеса), нужно будет настроить пайплайн.

### Рекомендации (превентивные)

1. Создать `public/` директорию и разместить там брендовый `favicon.svg`.
2. При добавлении первых растровых ассетов — подключить `vite-plugin-imagemin` или `@squoosh/lib` в build pipeline.
3. NPC аватары, если будут заменены с emoji на иллюстрации, выпускать только в WebP + PNG fallback, max 128×128px @2x.

---

## 4. Шрифты

### Текущее состояние

**Два шрифта, оба с Google Fonts:**

| Шрифт | Начертания | Использование | Загрузка |
|-------|-----------|---------------|----------|
| Manrope | 400, 500, 600, 700, 800 | Основной UI | Google Fonts CDN |
| JetBrains Mono | 400, 500, 600, 700, 800 | `.k-mono`, числовые данные | Google Fonts CDN |

**Критические проблемы:**

1. **FOUT (Flash of Unstyled Text) — гарантирован.** `globals.css` использует `@import url('https://fonts.googleapis.com/...')` без `font-display: swap` или `optional`. Браузер не применяет `display=swap` при CSS `@import` (он работает только при `<link>` с параметром в URL). Реальная стратегия — FOIT (невидимый текст) до загрузки шрифта.

2. **Двойной импорт Manrope.** Шрифт Manrope импортируется дважды: в `globals.css` строка 1 И в `design.css` строка 3. Это два отдельных DNS lookup + два resource hint — лишний round-trip.

3. **Несоответствие в tailwind.config.js:** `fontFamily.sans` задан как `'Lab Grotesque K'` — шрифт, которого нет в Google Fonts импортах и нет нигде в проекте. Это мёртвый fallback (браузер сразу переходит к `-apple-system`). Tailwind-утилиты `font-sans` применяются к несуществующему шрифту.

4. **JetBrains Mono — 5 начертаний** (400-800) при реальном использовании только в `.k-mono` и `.k-num`. Достаточно 400 + 700 — это сэкономит ~60 KB.

5. **Нет `<link rel="preconnect">`** в `index.html` для `fonts.googleapis.com` и `fonts.gstatic.com` — задержка первого подключения +100-300ms на cold load.

### Рекомендации

1. В `index.html` добавить:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```
2. Заменить CSS `@import` на `<link>` в `index.html` с параметром `display=swap`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
   ```
3. Удалить дублирующий `@import` из `design.css`.
4. Исправить `tailwind.config.js`: заменить `'Lab Grotesque K'` на `'Manrope'`.
5. Рассмотреть self-hosting шрифтов через `fontsource` npm пакеты (`@fontsource/manrope`, `@fontsource/jetbrains-mono`) — избавит от внешней зависимости и даст гарантию FOUT=0 после первой загрузки.

---

## 5. Тёмная тема

### Текущее состояние

**Архитектурная готовность: низкая.**

- `tailwind.config.js` не содержит `darkMode` конфигурации — Tailwind dark: utilities недоступны.
- `globals.css` не содержит `@media (prefers-color-scheme: dark)` блоков.
- `design.css` определяет CSS-переменные в `:root` (хорошо!), но нет `[data-theme="dark"]` или `@media (prefers-color-scheme: dark)` секции с переопределениями.
- Компоненты используют смешанный подход: ~30% через CSS-переменные (`var(--k-surface)`), ~70% через hardcoded цвета из `tokens.ts` объекта `K` (inline styles). Например, `WeekResultsOverlay` использует `K.white`, `K.line`, `K.bone` — hardcoded hex-значения, которые при тёмной теме останутся светлыми.
- `Phone.tsx` имеет `dark?: boolean` prop, но он передаётся только в `KStatusBar` и `KHome` — изменяет цвет статус-бара, но не тему всего интерфейса.

### Что нужно для полноценной тёмной темы

Потребуется:
1. Дублировать все переменные в `design.css` под `[data-theme="dark"]` или `@media (prefers-color-scheme: dark)` (24 переменные).
2. Перевести все inline `style={{ background: K.white }}` на CSS-переменные — это затрагивает ~15 компонентов.
3. Добавить `darkMode: 'class'` или `'media'` в `tailwind.config.js`.

### Рекомендации

Тёмная тема нецелесообразна в ближайшем спринте — слишком высокий рефакторинг-долг из-за inline styles. Правильный путь: при следующем рефакторинге стилей переводить компоненты на `var(--k-*)` переменные вместо `K.*` констант — это создаст фундамент для темизации без дополнительных усилий. Tailwind dark: utilities при этом подключить уже сейчас (`darkMode: 'class'` в конфиге) — не ломает ничего, но создаёт инфраструктуру.

---

## 6. Графический пайплайн (Figma → Код)

### Текущее состояние

**Пайплайна Figma→код не существует как автоматизированного процесса.**

- Нет Storybook.
- Нет Style Dictionary или Tokens Studio.
- Нет `figma-export` или аналогов в devDependencies.
- Дизайн-токены существуют в двух местах: `src/components/design-system/tokens.ts` (JS объект `K`) и `src/styles/design.css` (CSS-переменные `:root`). Они синхронизированы вручную — нет автогенерации.

**Свидетельство рассинхронизации:**
- `tailwind.config.js` определяет `kontour.orange: '#FF6B35'`
- `tokens.ts` определяет `K.orange: '#FF6A2C'`  
- `design.css` определяет `--k-orange: #FF6A2C`

`#FF6B35` (Tailwind) vs `#FF6A2C` (tokens/CSS) — это **разные оранжевые** на 1 hex-единицу по зелёному каналу. На экране незаметно, но свидетельствует об отсутствии единого источника правды для цветов.

**Аналогично:**
- `tailwind.config.js` определяет `kontour.green: '#4CAF50'` vs `K.mint: '#14B88A'` — разные зелёные.
- `kontour.blue: '#1E88E5'` vs `K.blue: '#3D5BE6'` — разные синие.

Tailwind `kontour.*` утилиты (`bg-kontour-orange`, `text-kontour-green`) рендерят другие цвета, чем дизайн-система через `K.*`. Реально Tailwind utility-классы с `kontour.*` не используются в кодовой базе (компоненты используют inline styles с `K.*`), поэтому это пока не видимый баг, но технический долг.

### Рекомендации

1. **Единый источник правды для цветов:** один файл `src/design-tokens.json` (или `tokens.ts`) с последующей автогенерацией и `tailwind.config.js`, и CSS-переменных. Инструмент: `style-dictionary` или просто `vite` плагин, читающий один JS объект.
2. **Немедленное исправление:** выровнять `tailwind.config.js` с `tokens.ts` — либо синхронизировать hex-значения, либо удалить `kontour.*` расширение из Tailwind если оно не используется.
3. **Storybook** — рекомендуется при команде 2+ дизайнеров. Для текущего solo-проекта достаточен `/design-preview` роут с каталогом компонентов из design-system.

---

## 7. Performance Budget VFX (60fps на mid-tier mobile)

### Целевое устройство

Mid-tier mobile 2024: Snapdragon 695 / MediaTek Dimensity 700, Chrome 120+, 4-8GB RAM. Экран 1080p. CSS Compositor budget: ~4ms/frame на анимации.

### Текущий профиль

**JS bundle:** 594 KB (не gzip). Для ориентира: React 18 = ~130 KB, Zustand = ~3 KB, date-fns tree-shaken ≈ 10-30 KB. Остальное — игровой код. Без CDN gzip это ~200-250 KB gzip — приемлемо, но есть запас.

**CSS bundle:** 18 KB — отлично, минимальный.

**Текущие VFX нагрузки:**

| Эффект | Свойства | Compositor? | Риск |
|--------|----------|-------------|------|
| `navPulse` | box-shadow | НЕТ (repaint) | Низкий — idle state |
| `navWiggle` | transform | ДА | Нет риска |
| `coachArrowBounce` | transform | ДА | Нет риска |
| `backdropFilter: blur(8px)` на WeekResultsOverlay | backdrop-filter | ДА (GPU) | Средний на low-end GPU |
| `backdropFilter: blur(4px)` на Modal | backdrop-filter | ДА (GPU) | Средний на low-end GPU |

**`backdropFilter: blur()` — единственный реальный performance risk.** На Adreno 610 (Snapdragon 662) blur на full-viewport overlay стоит 5-8ms/frame. Если одновременно открыты два overlay с blur — возможны dropped frames.

**Рекомендации:**

1. Добавить `will-change: transform` на элементы с `navPulse` + `navWiggle` — это принудительно поднимает их на compositor layer. Сейчас box-shadow заставляет браузер делать repaint всего элемента каждый кадр.
2. Для `backdropFilter` использовать `@media (prefers-reduced-motion: reduce)` fallback: `background: rgba(26,26,34,0.85)` без blur. Это критично для accessibility и производительности.
3. **Performance budget для будущих VFX:**
   - Одновременно активных CSS анимаций: не более 8
   - Одновременно compositor-overlay с backdrop-filter: не более 1
   - Particle burst (конфетти победы): максимум 150 частиц, 2-3 секунды, авто-стоп
   - Counter-up анимации чисел: через RAF, не через CSS `@keyframes` на `counter`
   - Не использовать `filter: blur()` на элементах внутри игрового экрана (только на overlay backdrop)
4. Добавить CSS:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
   Этого правила нет в globals.css — это и accessibility нарушение, и performance safety net.

---

## Приложение: Обнаруженные технические долги (не включённые в топ-5)

- **`fadeOverlay` keyframe** определён в globals.css, но нигде не используется — мёртвый код.
- **`CampaignROIView.css` и `MilestoneView.css`** используют hardcoded hex (`#4ade80`, `#ef4444`, `#60a5fa`) из Tailwind палитры вместо `--k-*` переменных — рассинхронизация с дизайн-системой.
- **`MilestoneView.css` `.milestone-card:hover { transform: translateY(-2px) }`** — hover transform без `will-change` и без reduced-motion guard. На touch devices hover persistent state может застрять.
- **`fontFamily: 'Manrope, sans-serif'`** прописан вручную в ~15 компонентах вместо наследования от `body`. Если шрифт изменится, потребуется правка в 15 местах.
- **VictoryModal кнопки** содержат emoji в JSX тексте (`'▶️ Новая игра'`, `'🔄 Попробовать снова'`) — эти emoji рендерятся системным шрифтом OS, могут отличаться визуально на разных платформах. Лучше заменить на KIcon или Unicode-символы без emoji sequence.
- **`index.html` lang="ru"** — корректно. Но отсутствует `<meta name="theme-color">` для мобильных браузеров (адресная строка остаётся белой вместо брендового цвета).
