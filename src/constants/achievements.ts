export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'business' | 'services' | 'special'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_day',
    name: 'Первый рабочий день',
    description: 'Завершить первый день работы',
    icon: '📅',
    category: 'progress',
  },
  {
    id: 'week_done',
    name: 'Первая неделя',
    description: 'Проработать 7 дней',
    icon: '📆',
    category: 'progress',
  },
  {
    id: 'month_done',
    name: 'Первый месяц',
    description: 'Проработать 30 дней',
    icon: '🗓️',
    category: 'progress',
  },
  {
    id: 'profitable_day',
    name: 'В прибыли',
    description: 'Получить положительную прибыль за день',
    icon: '💹',
    category: 'business',
  },
  {
    id: 'big_profit',
    name: 'Большой день',
    description: 'Заработать 50 000 ₽ прибыли за один день',
    icon: '💰',
    category: 'business',
  },
  {
    id: 'millionaire',
    name: 'Первый миллион',
    description: 'Накопить 1 000 000 ₽ на счету',
    icon: '🤑',
    category: 'business',
  },
  {
    id: 'high_rep',
    name: 'Уважаемый бизнес',
    description: 'Достичь репутации 90 и выше',
    icon: '⭐',
    category: 'business',
  },
  {
    id: 'loyal_staff',
    name: 'Счастливая команда',
    description: 'Достичь лояльности персонала 90 и выше',
    icon: '🤝',
    category: 'business',
  },
  {
    id: 'perfect_day',
    name: 'Идеальный день',
    description: 'Обслужить всех пришедших клиентов без потерь',
    icon: '✨',
    category: 'business',
  },
  {
    id: 'first_service',
    name: 'Контур в деле',
    description: 'Подключить первый сервис Контура',
    icon: '🔌',
    category: 'services',
  },
  {
    id: 'three_services',
    name: 'Тройной контур',
    description: 'Одновременно иметь 3 сервиса Контура',
    icon: '⚡',
    category: 'services',
  },
  {
    id: 'all_services',
    name: 'Полный Контур',
    description: 'Подключить все 7 сервисов Контура',
    icon: '🏆',
    category: 'services',
  },
  {
    id: 'synergy',
    name: 'Синергия',
    description: 'Активировать 3 и более синергии одновременно',
    icon: '🔗',
    category: 'services',
  },
  {
    id: 'first_campaign',
    name: 'В эфире',
    description: 'Запустить первую рекламную кампанию',
    icon: '📢',
    category: 'business',
  },
  {
    id: 'hall_upgrade',
    name: 'Расширение',
    description: 'Купить расширение торгового зала',
    icon: '🏗️',
    category: 'business',
  },
  {
    id: 'level_5',
    name: 'Профессионал',
    description: 'Достичь 5-го уровня',
    icon: '🎖️',
    category: 'progress',
  },
  {
    id: 'level_10',
    name: 'Мастер бизнеса',
    description: 'Достичь 10-го уровня',
    icon: '👑',
    category: 'progress',
  },
  {
    id: 'event_veteran',
    name: 'Ветеран',
    description: 'Пережить 10 различных событий',
    icon: '🎭',
    category: 'special',
  },
  {
    id: 'resilient',
    name: 'Несломимый',
    description: 'Восстановить репутацию с критического уровня (≤20) до 60+',
    icon: '💪',
    category: 'special',
  },
  {
    id: 'stock_master',
    name: 'Мастер склада',
    description: 'Не допустить просрочки товара 10 дней подряд',
    icon: '📦',
    category: 'business',
  },
]
