# Release-Readiness Audit — Бизнес с Контуром
**Аудитор:** Release Manager  
**Дата:** 2026-05-07  
**Целевая платформа:** Веб-лендинг / поддомен, публичный интернет, российская аудитория  
**Версия кода:** 0.1.0 (HEAD: e78909a)

---

## 1. Версионирование

### Текущее состояние
- `package.json`: `"version": "0.1.0"` — не обновляется с момента инициализации проекта.
- Git-теги отсутствуют полностью (`git tag` возвращает пустой список).
- История коммитов ведётся без тегов релизов.

### Проблемы
| # | Проблема | Критичность |
|---|----------|-------------|
| V1 | Нет git-тегов ни на одном релизном срезе | BLOCKER |
| V2 | `package.json` version не отражает реальное состояние кода | HIGH |
| V3 | Нет стратегии версионирования, согласованной командой | HIGH |

### Рекомендуемая стратегия
Принять **CalVer для маркетинговой публикации** в сочетании с SemVer для технических сборок:

- Публичная версия: `YYYY.MM` (например `2026.05`) — отображается в `<title>` и футере при необходимости.
- Внутренняя версия package.json: `1.0.0` на первый релиз, патчи по hotfix-процессу.
- Git-тег на каждый релиз: `v1.0.0`, `v1.0.1-hotfix` и т.д.

### Действия до релиза
```bash
# 1. Обновить package.json
npm version 1.0.0

# 2. Поставить тег после успешного build+test
git tag -a v1.0.0 -m "First public release"
git push origin v1.0.0
```

---

## 2. Pre-Release Web Checklist

### 2.1 SEO и метатеги

**Текущий index.html:**
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
<meta name="description" content="Бизнес с Контуром - Экономический симулятор управления бизнесом" />
<title>Бизнес с Контуром</title>
```

Отсутствует весь блок Open Graph, Twitter Card, canonical, favicon-набор, и вместо кастомного favicon используется дефолтный `/vite.svg` из шаблона Vite.

| # | Элемент | Статус | Критичность |
|---|---------|--------|-------------|
| S1 | `og:title` | ОТСУТСТВУЕТ | HIGH |
| S2 | `og:description` | ОТСУТСТВУЕТ | HIGH |
| S3 | `og:image` (1200×630) | ОТСУТСТВУЕТ | HIGH |
| S4 | `og:url` | ОТСУТСТВУЕТ | HIGH |
| S5 | `og:type` | ОТСУТСТВУЕТ | MEDIUM |
| S6 | `twitter:card` | ОТСУТСТВУЕТ | MEDIUM |
| S7 | `twitter:site` | ОТСУТСТВУЕТ | LOW |
| S8 | `<link rel="canonical">` | ОТСУТСТВУЕТ | MEDIUM |
| S9 | Favicon набор (32×32 PNG, 180×180 apple-touch, `.ico`) | Только vite.svg-заглушка | BLOCKER |
| S10 | `<meta name="theme-color">` | ОТСУТСТВУЕТ | LOW |
| S11 | `<link rel="manifest">` (PWA-опционально) | ОТСУТСТВУЕТ | LOW |

**Шаблон для index.html** (вставить в `<head>`, URL подставить при деплое):
```html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="theme-color" content="#1A1F2E" />

<!-- SEO -->
<link rel="canonical" href="https://[SUBDOMAIN].kontur.ru/konturgame/" />
<meta name="description" content="Бизнес с Контуром — браузерный симулятор малого бизнеса. Открой кафе, магазин или салон и выведи его в прибыль с сервисами Контура." />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://[SUBDOMAIN].kontur.ru/konturgame/" />
<meta property="og:title" content="Бизнес с Контуром — симулятор малого бизнеса" />
<meta property="og:description" content="Открой кафе, магазин или салон. Принимай решения. Используй сервисы Контура — и выживи." />
<meta property="og:image" content="https://[SUBDOMAIN].kontur.ru/konturgame/og-image.png" />
<meta property="og:locale" content="ru_RU" />
<meta property="og:site_name" content="Контур" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Бизнес с Контуром — симулятор малого бизнеса" />
<meta name="twitter:description" content="Открой кафе, магазин или салон. Принимай решения. Используй сервисы Контура — и выживи." />
<meta name="twitter:image" content="https://[SUBDOMAIN].kontur.ru/konturgame/og-image.png" />
```

### 2.2 robots.txt и sitemap

Директория `public/` отсутствует — файлы не будут скопированы в `dist/` при сборке.

- `robots.txt`: нет.
- `sitemap.xml`: нет.
- `404.html`: нет.

**Шаблон robots.txt** (`public/robots.txt`):
```
User-agent: *
Allow: /

Sitemap: https://[SUBDOMAIN].kontur.ru/konturgame/sitemap.xml
```

**Шаблон sitemap.xml** (`public/sitemap.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[SUBDOMAIN].kontur.ru/konturgame/</loc>
    <lastmod>2026-05-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 2.3 Error Boundary

Нет ни одного `ErrorBoundary` компонента в `src/`. Приложение обёрнуто только в `React.StrictMode`. Необработанная JS-ошибка в любом компоненте (включая `processWeek()`) вызовет белый экран без каких-либо пользовательских указаний.

| # | Проблема | Критичность |
|---|----------|-------------|
| E1 | React ErrorBoundary отсутствует на уровне App | BLOCKER |
| E2 | Нет fallback UI при критическом сбое | HIGH |

Минимальный ErrorBoundary должен:
- Перехватывать ошибки на уровне `<App />`
- Отображать кнопку «Начать заново» с `localStorage.clear()` + reload
- Логировать в консоль (и в будущем — в мониторинг)

### 2.4 Fallback при отказе localStorage

**Критический баг:** в `App.tsx` строка 21 обращается к ключу `'konturgame_state'` (без суффикса `_v7`), тогда как `gameStore.ts` строка 26 использует `STORAGE_KEY = 'konturgame_state_v7'`. Это рассинхронизация: `App.tsx` никогда не найдёт сохранённую игру, которую записал `gameStore.ts`.

| # | Проблема | Критичность |
|---|----------|-------------|
| L1 | Ключ localStorage в App.tsx (`konturgame_state`) не совпадает с gameStore.ts (`konturgame_state_v7`) | BLOCKER |
| L2 | При `QuotaExceededError` сохранение падает с console.error, пользователь не уведомлён | HIGH |
| L3 | При `SecurityError` (iframe/private browsing с заблокированным storage) приложение не имеет graceful fallback | MEDIUM |
| L4 | `metaStore.ts` вызывает `loadMeta()` на верхнем уровне модуля при импорте — до mount. При недоступном localStorage это бросит синхронную ошибку без catch | HIGH |

---

## 3. Performance Budget

### Текущее состояние сборки
```
dist/assets/index-*.js    541 kB (minified) │ 168 kB gzip
dist/assets/index-*.css    18 kB            │   5 kB gzip
```

Vite сам предупредил: `Some chunks are larger than 500 kB after minification`.

Весь код — **один бандл без code splitting**. Нет ни одного `React.lazy()` или динамического `import()` в исходниках.

### Бюджеты для российского рынка

| Метрика | Цель | Текущая оценка |
|---------|------|----------------|
| JS gzip | ≤ 150 kB | 168 kB — ПРЕВЫШЕН |
| CSS gzip | ≤ 20 kB | 5 kB — OK |
| LCP | ≤ 2.5 s (3G) | Неизвестно, нет замеров |
| TTI | ≤ 3.5 s (3G) | Неизвестно; 541 kB JS угрожает |
| CLS | ≤ 0.1 | Вероятно OK (нет динамической вставки) |
| Fonts blocking | 0 blocking requests | 2 Google Fonts @import — БЛОКИРУЕТ рендер |

### Проблемы производительности

| # | Проблема | Критичность |
|---|----------|-------------|
| P1 | Единый бандл 541 kB без code splitting | HIGH |
| P2 | 2 Google Fonts в CSS `@import` — рендер-блокирующая загрузка | HIGH |
| P3 | Google Fonts grabs внешние запросы (fonts.googleapis.com, fonts.gstatic.com) — замедление на российских соединениях, + риск блокировки | HIGH |
| P4 | Нет `<link rel="preconnect">` для Google Fonts | MEDIUM |
| P5 | Нет настройки `build.rollupOptions.output.manualChunks` в vite.config.ts | MEDIUM |
| P6 | Нет `vite-plugin-compression` или аналога для br/gzip на уровне сервера | LOW |

**Рекомендация по Google Fonts (критично для РФ):** необходимо либо самостоятельно хостить шрифты Manrope и JetBrains Mono в `public/fonts/`, либо использовать системный стек. Внешний CDN ненадёжен в РФ.

---

## 4. Browser Support Matrix

### Декларированная поддержка
В `package.json` нет секции `browserslist`. В `vite.config.ts` нет настройки `build.target`. Vite по умолчанию таргетирует `modules` (Chrome 87+, Safari 14+, Firefox 78+).

### Российский рынок (Яндекс.Метрика данные 2025)
| Браузер | Доля РФ | Статус |
|---------|---------|--------|
| Chrome (Android) | ~42% | OK |
| Яндекс Браузер | ~18% | OK (Chromium-based) |
| Chrome (Windows) | ~17% | OK |
| Safari (iOS) | ~12% | Требует проверки |
| Firefox | ~4% | OK |
| Samsung Internet | ~3% | OK |
| Opera | ~2% | OK |

### Риски по Safari iOS
- Zustand + localStorage: совместим, но приватный режим может блокировать запись.
- CSS: Tailwind 3 хорошо поддерживает Safari 14+, но отдельные flex/grid конструкции требуют проверки.
- Нет деклараций `browserslist` — autoprefixer работает с дефолтными настройками, что может упустить нужные вендорные префиксы.

| # | Риск | Критичность |
|---|------|-------------|
| B1 | Safari iOS: localStorage в приватном режиме бросает исключение | HIGH |
| B2 | Нет явного `browserslist` — autoprefixer работает на дефолтах | MEDIUM |
| B3 | Яндекс Браузер не тестировался явно (следует добавить в QA matrix) | LOW |

---

## 5. Locale и шрифты

| Элемент | Статус |
|---------|--------|
| `<html lang="ru">` | OK |
| Кириллица в контенте | OK |
| Шрифт Manrope (все веса 400–800) | Загружается с Google CDN — РИСК |
| Шрифт JetBrains Mono (400–800) | Загружается с Google CDN — РИСК |
| `display=swap` в URL шрифтов | OK (предотвращает FOIT) |
| Системный fallback для кириллицы | OK (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`) |
| Числовой формат | OK (`formatRub` в `src/utils/format.ts`) |
| Даты | `date-fns` — OK, ru-locale не применяется (игра не отображает реальные даты) |

**Ключевой риск:** Google Fonts регулярно испытывает замедления и блокировки на территории РФ. При недоступности CDN пользователь получит системный шрифт (приемлемо) но с задержкой рендера из-за блокирующего `@import` (неприемлемо). Необходим переход на self-hosted шрифты или добавление `<link rel="preconnect">` + `<link rel="preload">` в `index.html`.

---

## 6. Юридические требования РФ

### 6.1 152-ФЗ «О персональных данных»

Игра использует `localStorage` для хранения игрового прогресса. С точки зрения закона:
- Данные хранятся **локально** в браузере пользователя.
- Если нет серверной аналитики и нет передачи данных третьим лицам — обработка ПДн минимальна.
- Однако при добавлении любой аналитики (Яндекс.Метрика, Sentry и пр.) сразу возникают обязательства по 152-ФЗ.

| # | Требование | Статус | Критичность |
|---|----------|--------|-------------|
| J1 | Политика конфиденциальности / обработки ПДн | ОТСУТСТВУЕТ | HIGH (если будет аналитика) |
| J2 | Согласие на cookies / localStorage | ОТСУТСТВУЕТ | MEDIUM (cookies — нет, localStorage — серая зона) |
| J3 | Контактные данные Контура на странице | ОТСУТСТВУЕТ в игре | MEDIUM |
| J4 | Ссылка на оферту/условия при «попробовать сервисы» | ОТСУТСТВУЕТ | HIGH (при наличии CTA на покупку) |

### 6.2 Cookies и трекинг

На текущий момент:
- Нет cookie consent banner.
- Нет аналитики.
- localStorage не является cookie, но ряд интерпретаций ePrivacy требует уведомления.

**Рекомендация:** добавить простое уведомление вида «Мы сохраняем прогресс игры в вашем браузере. Данные остаются на вашем устройстве» с кнопкой «Понятно». Это снимает риски и требует минимальных усилий.

### 6.3 Юридические ссылки

В игре нет ссылок на kontur.ru/legal или аналогичные страницы. Если игра публикуется под брендом Контур и содержит CTA «подключить сервис», необходима ссылка на оферту или условия использования соответствующего сервиса.

### 6.4 Шаблон footer-блока (минимально необходимый)

```
© 2026 СКБ Контур. Бизнес с Контуром — маркетинговая игра.
Прогресс сохраняется в вашем браузере локально.
Политика конфиденциальности | Условия использования | Контакты
```

---

## 7. Crisis Comms Plan

### Сценарии инцидентов

| Сценарий | Вероятность | Воздействие |
|----------|-------------|-------------|
| Критический JS-баг при старте (белый экран) | HIGH (нет ErrorBoundary) | Игра полностью недоступна |
| Потеря прогресса пользователя | HIGH (баг с ключом localStorage) | Негативный UX, жалобы |
| Google Fonts недоступны | MEDIUM | Визуальный регресс, задержка рендера |
| Превышение localStorage квоты (5 MB) | LOW | Тихое падение сохранения |

### Схема реагирования

```
Обнаружение инцидента
        │
        ▼
  Severity Assessment
  S1 (полный outage) → SEV1: немедленно, на связи весь on-call
  S2 (частичный баг) → SEV2: в рабочие часы, фикс в течение дня
        │
        ▼
  Hotfix Branch Protocol (см. раздел 8)
        │
        ▼
  Коммуникация (community-manager):
  - Баннер на странице игры: «Мы знаем о проблеме, работаем над исправлением»
  - Пост в телеграм/соц.сети Контура (если есть)
        │
        ▼
  Deploy fix → Verify → Снять баннер → Post-incident report
```

### Контакты on-call (заполнить перед релизом)

| Роль | Имя | Канал | Время ответа |
|------|-----|-------|--------------|
| Release Manager | [ИМЯ] | Telegram | 15 мин |
| Lead Programmer | [ИМЯ] | Telegram | 15 мин |
| DevOps Engineer | [ИМЯ] | Telegram | 15 мин |
| Community Manager | [ИМЯ] | Telegram | 30 мин |

### Статус-страница
Рекомендуется иметь хотя бы статическую страницу (Google Site или простой HTML), которую можно обновить вручную при инциденте.

---

## 8. Rollback и Feature Flags

### Текущее состояние

В коде присутствует `ROLLBACK_STORAGE_KEY = 'konturgame_rollback_v7'` в `gameStore.ts` — это внутренний механизм отката состояния игры (undo последнего хода). Это не механизм деплой-роллбека.

Механизма feature flags нет.

### Рекомендуемый деплой-роллбек

Для статичного SPA на поддомене достаточно:

1. **Версионированные релизные артефакты**: каждый `dist/` архивируется с меткой `v1.0.0`, `v1.0.1` и т.д. на сервере.
2. **Nginx alias-swap** (или эквивалент хостинга Контура): переключить симлинк `current` на предыдущую версию без даунтайма.
3. Время роллбека: < 5 минут при наличии артефактов.

**Шаблон скрипта роллбека** (координировать с devops-engineer):
```bash
# Проверить доступные релизы
ls /var/www/konturgame/releases/

# Переключить на предыдущую версию
ln -sfn /var/www/konturgame/releases/v1.0.0 /var/www/konturgame/current

# Проверить
curl -s -o /dev/null -w "%{http_code}" https://[SUBDOMAIN].kontur.ru/konturgame/
```

### Feature Flags (рекомендация для будущего)

Для маркетинговой игры достаточно простого механизма через URL-параметр или `localStorage`:

```typescript
// src/utils/featureFlags.ts
const flags = {
  ENABLE_NPC_ARCS: true,
  ENABLE_OWNER_INVESTMENTS: true,
  // Новые фичи добавлять сюда с default: false
}
```

При инциденте конкретную фичу можно отключить хотфиксом без полного роллбека.

---

## 9. Release-Day Checklist

### T-7 дней (Freeze)

- [ ] Code freeze подтверждён с lead-programmer
- [ ] Все S1/S2 баги закрыты (17 failing tests ДОЛЖНЫ быть исправлены)
- [ ] `package.json` version обновлён до `1.0.0`
- [ ] Git tag `v1.0.0-rc1` поставлен на release candidate
- [ ] Ключ localStorage в `App.tsx` исправлен на `konturgame_state_v7`
- [ ] ErrorBoundary добавлен и протестирован
- [ ] Google Fonts переведены на self-hosted или добавлен preconnect
- [ ] OG-теги и favicon-набор добавлены в index.html
- [ ] `public/robots.txt` создан
- [ ] Юридический footer добавлен (или согласована ссылка)

### T-3 дня (QA Sign-off)

- [ ] QA-lead подтвердил прохождение регрессии на Chrome Windows, Safari iOS, Яндекс Браузер
- [ ] QA-lead проверил мобильный layout (`MobileMainScreen`) на реальном устройстве
- [ ] Production build прогнан через Lighthouse: LCP ≤ 2.5s, TTI ≤ 3.5s
- [ ] Bundle size после оптимизации ≤ 150 kB gzip
- [ ] localhost-версия недоступна в production (проверить отсутствие dev-артефактов)
- [ ] Шрифты загружаются без внешних зависимостей (или с приемлемым fallback)

### T-1 день (Pre-Launch)

- [ ] Production build задеплоен на staging-URL
- [ ] Полный smoke-тест на staging: старт игры → выбор бизнеса → первая неделя → сохранение → перезагрузка → прогресс восстановлен
- [ ] OG-превью проверено через https://cards-dev.twitter.com/validator и https://developers.facebook.com/tools/debug/
- [ ] Favicon отображается корректно в Chrome, Safari, Firefox
- [ ] Community manager подготовил launch-пост (на согласование, не публиковать)
- [ ] On-call контакты подтверждены
- [ ] Rollback-план проверен с devops-engineer

### Release Day (T+0)

- [ ] Deploy production build с git tag `v1.0.0`
- [ ] Smoke-тест на production URL (не на staging)
- [ ] Игра открывается на мобильном Chrome и Safari iOS
- [ ] Прогресс сохраняется и восстанавливается корректно
- [ ] OG-карточка при шаринге в соцсетях отображается корректно
- [ ] Community manager публикует launch-объявление
- [ ] Мониторинг ошибок активирован (см. пункт 3 ниже)

### T+1 час (First-Hour Monitoring)

- [ ] Нет критических JS-ошибок в console (проверить через браузер DevTools на live URL)
- [ ] Нет сообщений о белом экране / поломке игры в каналах обратной связи
- [ ] Сервер возвращает 200 для основного URL и корректные 404 для несуществующих путей

---

## 10. Шаблон Release Notes

### Формат для первого релиза

```markdown
# Бизнес с Контуром — Версия 1.0.0
**Дата:** 2026-05-07

## Что это
Бизнес с Контуром — браузерный экономический симулятор управления малым бизнесом.
Открой кафе, магазин или салон и выведи его в прибыль с помощью сервисов Контура.

## Содержание релиза
- Три типа бизнеса: магазин, кафе, салон красоты
- 7 сервисов Контура с реальными игровыми эффектами
- 8 NPC-персонажей с трёхэпизодными арками
- 17 достижений
- Прогрессия через бизнес-тиры 1–3
- Мобильный и десктопный layout

## Известные ограничения
- Прогресс хранится в браузере. При очистке данных браузера прогресс будет утерян.
- Игра оптимизирована для Chrome, Safari, Яндекс Браузер на устройствах с экраном ≥ 360px.

## Техническое
Внутренняя сборка: 1.0.0.1 | Git: v1.0.0
```

### Формат для hotfix

```markdown
# Бизнес с Контуром — Версия 1.0.1
**Дата:** [ДАТА]
**Тип:** Hotfix

## Исправления
- [КРАТКОЕ ОПИСАНИЕ БАГА] — исправлено

## Примечание по сохранениям
Существующий прогресс сохраняется. Обновление применяется автоматически при следующем открытии игры.
```

---

## 11. Сводная таблица блокеров

| # | Категория | Проблема | Действие | Ответственный |
|---|-----------|----------|----------|---------------|
| 1 | localStorage | `App.tsx` читает ключ `konturgame_state`, `gameStore.ts` пишет `konturgame_state_v7` — сохранения не восстанавливаются | Исправить ключ в App.tsx | lead-programmer |
| 2 | Error Handling | Нет React ErrorBoundary — любая необработанная ошибка = белый экран | Добавить ErrorBoundary в main.tsx | lead-programmer |
| 3 | Test Suite | 17 тестов из 193 упали (achievementChecker, economyEngine, stockManager, gameStore) | Исправить до code freeze | lead-programmer / qa-lead |
| 4 | Favicon | Используется `/vite.svg` — дефолтная иконка шаблона Vite | Создать favicon-набор и добавить в public/ | ux-designer / devops-engineer |
| 5 | OG / Social | Нет Open Graph тегов — игра не будет иметь превью при шаринге | Добавить OG-блок в index.html | release-manager / community-manager |
| 6 | Google Fonts | Два `@import` Google Fonts блокируют рендер; риск недоступности в РФ | Self-host шрифты или добавить preconnect+preload | lead-programmer / devops-engineer |
| 7 | Legal | Нет политики конфиденциальности и юридического footer при использовании Контур-бренда и CTA «попробовать» | Согласовать минимальный legal footer с юридическим отделом Контура | producer / юридический отдел |

---

## 12. Post-Release Monitoring Plan

### Метрики (первые 72 часа)

Поскольку аналитика не интегрирована, мониторинг на старте — ручной:

| Метрика | Источник | Периодичность | Цель |
|---------|---------|---------------|------|
| Доступность URL | Uptime-мониторинг (pingdom/UptimeRobot) | 1 мин | 100% |
| JS-ошибки | Sentry (после интеграции) или ручная проверка console | При алерте | 0 критических |
| Отзывы/жалобы | Email, Telegram, соц.сети | Каждый час (первые 4 ч) | Нет S1-отчётов |
| Страница доступна с mobile | Ручная проверка | T+0, T+24h, T+72h | Без регрессов |

### Отчёты
- **T+24h report:** доступность, топ-жалобы, статус исправленных дефектов
- **T+72h report:** итоговое состояние, список issues для следующего патча, retro-пункты

---

*Подготовлен Release Manager. Требует согласования с producer перед code freeze.*
