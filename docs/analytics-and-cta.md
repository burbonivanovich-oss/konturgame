# Аналитика и конверсия (большая цель)

Игра — маркетинговый инструмент: показать ценность сервисов Контура и довести
игрока до `kontur.ru`. Чтобы это работало измеримо, в коде есть три связанных
слоя. Этот документ — как их включить в проде.

## 1. Воронка аналитики

### Как устроено
- `src/utils/analytics.ts` — приватный буфер событий в localStorage + consent
  + pluggable sink. Без согласия игрока (`hasConsent()`) события **не пишутся**.
- `src/services/analyticsBridge.ts` — подписан на стор, переводит переходы
  состояния в события воронки. Подключается один раз в `main.tsx`
  (`initAnalyticsBridge()`).
- `src/components/ConsentBanner.tsx` — баннер согласия (опт-ин, без тёмных
  паттернов). Смонтирован в `App.tsx`. Статус и переключение — в
  `PrivacyModal` (доступен из Настроек → «🔒 Приватность и данные»).

### Таксономия событий
| Событие | Данные | Где трекается |
|---|---|---|
| `game.session.started` | `{ returning }` | App mount |
| `game.business.chosen` | `{ businessType }` | старт игры |
| `game.week.completed` | `{ week, balance }` | bridge (диффом) |
| `service.activated` / `service.deactivated` | `{ service }` | bridge (диффом) |
| `game.victory` | `{ week, type, balance }` | bridge |
| `game.defeat` | `{ week, reason, balance }` | bridge |
| `cta.clicked` | `{ kind, service?, placement, businessType }` | VictoryModal |
| `feedback.opened` | `{}` | кнопка фидбека |
| `report.exported` | `{ source }` | экспорт отчёта |
| `error.caught` | `{ message }` | ErrorBoundary |

### Включить реальный backend
Без настройки события только копятся локально. Два способа подключить сбор:

**A. Generic endpoint (без зависимостей).** Задайте при сборке:
```bash
VITE_ANALYTICS_ENDPOINT="https://collector.example/ingest" npm run build
```
Bridge будет слать батчи `POST {events:[...]}` (flush по таймеру и на `pagehide`).

**B. PostHog / Яндекс.Метрика (через sink).** В `main.tsx` после `initAnalyticsBridge()`:
```ts
import posthog from 'posthog-js'
import { setAnalyticsSink } from './utils/analytics'
posthog.init('phc_xxx', { api_host: 'https://eu.i.posthog.com' })
setAnalyticsSink(async (batch) => { for (const e of batch) posthog.capture(e.name, e.data) })
```

## 2. CTA «Попробовать в реальности»

- `src/constants/konturLinks.ts` — URL'ы сервисов + UTM-метки. Показывается
  на финальном экране (победа и поражение) в `VictoryModal`: главная кнопка на
  `kontur.ru` + чипы сервисов, которые игрок подключал в игре.
- Каждый клик трекается как `cta.clicked` с `placement` (`victory`/`defeat`) и
  `service` — это и есть метрика конверсии «игра → Контур».

### Перед публичным запуском
- Сверьте пути сервисов в `SERVICE_PATHS` с актуальными продуктовыми страницами.
- Подставьте реальную UTM-кампанию (сейчас `utm_campaign=alpha`).
- При необходимости смените базовый домен: `VITE_KONTUR_BASE_URL=...`.

## 3. Что осталось до полной «большой цели»
- Дашборд воронки на стороне backend (D1/D7, completion, service adoption,
  CTA CTR) — на основе таксономии выше.
- Перебаланс экономики сервисов по данным (audit D1–D4), чтобы посыл
  «сервисы выгодны» был честным.
- A/B на тексты CTA и момент промо-кодов (audit D10).
