# 09 — Accessibility Audit (WCAG 2.1 AA)

**Дата:** 2026-05-07
**Стандарт:** WCAG 2.1 Level AA (с проверками по 2.2 SC 2.5.8)
**Аудитор:** accessibility-specialist

## 1. Semantics & Landmarks

`index.html` монтирует единственный `<div id="root">` без skip-navigation и без HTML-уровня landmarks. Вся структура регионов должна приходить из React. Чтение `MainScreen.tsx` и `MobileMainScreen.tsx` показывает: интерфейс собран из `<div>` с inline `style={}` — отсутствуют `<main>`, `<nav>`, `<header>`, `<aside>`, `<section>`. Левая панель навигации (`KLeftRail`) и табстрип в `MobileMainScreen` — обычные `<div>` и `<button>` без `role="navigation"`. Заголовок модалки в `Modal.tsx` — это `<div style={{ fontSize: 20, fontWeight: 700 }}>` вместо `<h2>` или элемента, связанного с диалогом через `aria-labelledby`. Skip-to-content нет. AT-пользователь попадает в плоский недифференцированный DOM без карты регионов.

## 2. Keyboard Navigation & Focus Management

`Modal.tsx` корректно слушает Escape. Однако контейнер модалки не имеет `role="dialog"`, `aria-modal="true"` или `aria-labelledby`. Фокус не запирается внутри модалки — клавиатурный пользователь Tab-ом уходит в фоновый контент. Нет `autoFocus` на первом интерактивном элементе или close-кнопке.

Mobile-табстрип использует `<button>` (хорошо для активации), но отсутствует `role="tablist"` / `role="tab"` / `aria-selected` — AT и клавиатурник не получают сигнала о выбранной табе.

`backdrop`-div в `Modal.tsx` имеет `onClick={onClose}`, но без `role="button"`/`tabIndex` — недоступен с клавиатуры.

## 3. Screen Reader Support (aria-)

Полный grep по `aria-` дал 2 совпадения:
- `OnboardingPanel.tsx:294` — `aria-label` на toggle (хорошая, но изолированная практика)
- `PromoCodeModal.tsx:41` — `aria-label="Закрыть"` на close (изолированная)

Все остальные интерактивные элементы — KPI-карточки, опции событий, табы навигации, тоглы сервисов — без ARIA. Нет `aria-live` для динамики (баланс, события, результаты дня). Нет `aria-disabled` на закрытых табах. Декоративные эмодзи в табах (`🏆`, `⚙️`, `📦`) не обёрнуты в `aria-hidden="true"` — скринридер озвучивает их Unicode-имена при каждой навигации.

## 4. Color Contrast & Color-as-Channel

Дизайн использует inline-токены `K` через `style={}` вместо Tailwind-утилит, что обходит автоматическую проверку контрастности на билде.

Из `MainScreen.tsx`:
- KPI sub-label рендерится в `rgba(255,255,255,0.6)` на саtuated-фоне (orange `#FF6B35`, violet, blue). Эффективная luminance vs белый текст на оранжевом ниже 4.5:1 — нарушает SC 1.4.3.
- Label-слой `rgba(255,255,255,0.7)` при `10px` — ниже 18px-минимума и 14px-bold-исключения для 3:1.
- Tailwind config: `secondary: '#999999'`. На `#FFFFFF` контраст ~2.85:1, нарушает SC 1.4.3.
- Статус сервиса (active/inactive) — только цвет фона (`SERVICE_ACCENT`). Нет shape/icon/text — нарушает SC 1.4.1 Use of Color.
- Прибыль/убыток на «Прибыль / день» — только цвет фона (`K.mint` vs `#c0392b`). Протанопия/деутеранопия не различает.

Тонов высокого контраста и colorblind-режима в `tailwind.config.js` нет.

## 5. Motion & prefers-reduced-motion

Grep `prefers-reduced-motion` — 0 совпадений по всему репозиторию (включая `tailwind.config.js`). CSS-transitions inline (`transition: 'background 0.2s'`) без guard. Любая анимация overlay/toast/day-progression проигрывается независимо от системной настройки «Уменьшить движения». Tailwind-варианты `motion-safe:` / `motion-reduce:` не настроены.

## 6. Touch Targets & Mobile

Mobile-кнопки header (achievements/help/settings) — 32×32 px. WCAG 2.5.5 (AAA) рекомендует 44×44, новый WCAG 2.2 SC 2.5.8 (AA) требует ≥24×24 с отступами. 32×32 — пограничный случай 2.5.8, но дискомфортно (особенно у achievements, перекрытой бейджем).

Mobile-табстрип `overflowX: 'auto'` + `scrollbarWidth: 'none'` без визуального индикатора скрытых табов — нарушает SC 1.3.3 Sensory Characteristics.

## 7. Top-7 P0/P1 Fixes

| # | Finding | file:line | WCAG | Severity |
|---|---|---|---|---|
| 1 | `Modal` без `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap | `src/components/modals/Modal.tsx:39-95` | 4.1.2 / 2.1.2 | **P0** |
| 2 | Нет `aria-live` для динамики (баланс, события) | `src/components/MainScreen.tsx:127+` | 4.1.3 | **P0** |
| 3 | Прибыль/убыток только цветом (`K.mint` vs `#c0392b`) | `src/components/MainScreen.tsx:167` | 1.4.1 | **P0** |
| 4 | Sub-label `rgba(255,255,255,0.6)` 10px на colored cards — фейл контраста и минимума размера | `src/components/MainScreen.tsx:180-186` | 1.4.3 / 1.4.4 | **P0** |
| 5 | Декор-эмодзи в табах без `aria-hidden` | `src/components/MobileMainScreen.tsx:139-200` | 1.1.1 | P1 |
| 6 | Нет `prefers-reduced-motion` guard нигде | `Modal.tsx:83-84`, `tailwind.config.js` | 2.3.3 (AAA) / 2.2 best practice | P1 |
| 7 | Mobile-табстрип без `role="tablist"`/`tab`/`aria-selected` | `src/components/MobileMainScreen.tsx:182-200` | 4.1.2 | P1 |

## Recommendations

1. **Срочно: модальная архитектура.** Внедрить `react-aria` или `radix-ui/react-dialog` для `Modal.tsx` — закроет focus trap, role, aria-labelledby и Esc/backdrop правильно.
2. **`aria-live` для главных KPI и тостов:** баланс/прибыль/события — `aria-live="polite"`.
3. **Цвет ≠ единственный канал:** добавить иконку/префикс «+/−» к прибыли, point/dot к статусу сервиса.
4. **Color audit:** запретить inline `rgba(...,0.6)` на цветных фонах — использовать токен с проверенным контрастом.
5. **Reduce motion:** глобальное правило в `globals.css` `@media (prefers-reduced-motion: reduce) { *,*::before,*::after { transition: none !important; animation: none !important; } }`.
6. **Mobile touch targets ≥40×40 px** + видимый индикатор скрытых табов (градиент справа/слева).
7. **Tab structure:** оборачивать `KLeftRail` и mobile-стрип в `role="tablist"`, элементы — `role="tab"` + `aria-selected` + `aria-controls`.
