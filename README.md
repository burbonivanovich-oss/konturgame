# Бизнес с Контуром

Экономический симулятор управления бизнесом. Игрок открывает один из трёх типов бизнеса и принимает стратегические решения каждый день, чтобы достичь прибыльности и подключить все сервисы Контура.

## Требования

- Node.js 18+ 
- npm или yarn

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Разработка (локальный сервер на http://localhost:5173)
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview

# Проверка типов
npm run type-check
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── modals/         # Модальные окна
│   ├── MainScreen.tsx
│   ├── KPIPanel.tsx
│   ├── Indicators.tsx
│   ├── NextDayButton.tsx
│   └── ServicePanel.tsx
├── types/              # TypeScript типы
│   └── game.ts
├── stores/             # Zustand хранилище
│   └── gameStore.ts
├── services/           # Бизнес-логика
├── hooks/              # Custom React hooks
├── styles/             # CSS
├── App.tsx
└── main.tsx
```

## Стек технологий

- **React 18** — UI библиотека
- **TypeScript** — статическая типизация
- **Vite** — быстрый сборщик
- **Zustand** — управление состоянием
- **Tailwind CSS** — утилити для стилей
- **date-fns** — работа с датами

## План разработки

См. `CLAUDE.md` для детального плана разработки по этапам.

## Лицензия

MIT
