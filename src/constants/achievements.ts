export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'business' | 'services' | 'special'
  wave: 1 | 2 | 3 | 4  // unlock wave (1=always, 2=wk12, 3=wk26, 4=wk52)
}

export const WAVE_UNLOCK_WEEKS: Record<number, number> = {
  1: 0,
  2: 12,
  3: 26,
  4: 52,
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Wave 1 — always available (weeks 1-8 goals)
  {
    id: 'first_day',
    name: 'Первый рабочий день',
    description: 'Завершить первую неделю работы',
    icon: '📅',
    category: 'progress',
    wave: 1,
  },
  {
    id: 'week_done',
    name: 'Первая неделя',
    description: 'Проработать 7 дней',
    icon: '📆',
    category: 'progress',
    wave: 1,
  },
  {
    id: 'month_done',
    name: 'Первый месяц',
    description: 'Проработать 30 дней',
    icon: '🗓️',
    category: 'progress',
    wave: 1,
  },
  {
    id: 'profitable_day',
    name: 'В прибыли',
    description: 'Получить положительную прибыль за день',
    icon: '💹',
    category: 'business',
    wave: 1,
  },
  {
    id: 'first_campaign',
    name: 'В эфире',
    description: 'Запустить первую рекламную кампанию',
    icon: '📢',
    category: 'business',
    wave: 1,
  },
  {
    id: 'stock_master',
    name: 'Мастер склада',
    description: 'Не допустить просрочки товара 10 дней подряд',
    icon: '📦',
    category: 'business',
    wave: 1,
  },
  {
    id: 'first_register',
    name: 'Первая касса',
    description: 'Купить первую кассовую систему',
    icon: '🖥️',
    category: 'business',
    wave: 1,
  },
  {
    id: 'event_veteran',
    name: 'Ветеран',
    description: 'Пережить 10 различных событий',
    icon: '🎭',
    category: 'special',
    wave: 1,
  },
  {
    id: 'survived_competitor',
    name: 'Конкурент побежден',
    description: 'Выжить во время атаки конкурента на неделю 4+',
    icon: '🛡️',
    category: 'special',
    wave: 1,
  },
  {
    id: 'milestone_week10',
    name: 'Первый рубеж',
    description: 'Достичь вехи на 10-й неделе: 100 000 ₽ на балансе или 1 000 ₽ прибыли за неделю',
    icon: '🎯',
    category: 'progress',
    wave: 1,
  },

  // Wave 2 — unlocks week 12
  {
    id: 'big_profit',
    name: 'Большая неделя',
    description: 'Заработать 100 000 ₽ прибыли за одну неделю',
    icon: '💰',
    category: 'business',
    wave: 2,
  },
  {
    id: 'milestone_week20',
    name: 'Полпути',
    description: 'Достичь вехи на 20-й неделе: 250 000 ₽ на балансе или 5 000 ₽ прибыли за неделю',
    icon: '🏁',
    category: 'progress',
    wave: 2,
  },
  {
    id: 'high_rep',
    name: 'Уважаемый бизнес',
    description: 'Достичь репутации 90 и выше',
    icon: '⭐',
    category: 'business',
    wave: 2,
  },
  {
    id: 'loyal_staff',
    name: 'Счастливая команда',
    description: 'Достичь лояльности персонала 90 и выше',
    icon: '🤝',
    category: 'business',
    wave: 2,
  },
  {
    id: 'hall_upgrade',
    name: 'Расширение',
    description: 'Купить расширение торгового зала',
    icon: '🏗️',
    category: 'business',
    wave: 2,
  },
  {
    id: 'first_service',
    name: 'Контур в деле',
    description: 'Подключить первый сервис Контура',
    icon: '🔌',
    category: 'services',
    wave: 2,
  },
  {
    id: 'three_services',
    name: 'Тройной контур',
    description: 'Одновременно иметь 3 сервиса Контура',
    icon: '⚡',
    category: 'services',
    wave: 2,
  },
  {
    id: 'synergy',
    name: 'Синергия',
    description: 'Активировать 3 и более синергии одновременно',
    icon: '🔗',
    category: 'services',
    wave: 2,
  },
  {
    id: 'promo_collector',
    name: 'Коллекционер',
    description: 'Собрать 5 промокодов на услуги Контура',
    icon: '🎟️',
    category: 'services',
    wave: 2,
  },
  {
    id: 'resilient',
    name: 'Несломимый',
    description: 'Восстановить репутацию с критического уровня (≤20) до 60+',
    icon: '💪',
    category: 'special',
    wave: 2,
  },

  // Wave 3 — unlocks week 26
  {
    id: 'millionaire',
    name: 'Первый миллион',
    description: 'Накопить 1 000 000 ₽ на счету',
    icon: '🤑',
    category: 'business',
    wave: 3,
  },
  {
    id: 'level_5',
    name: 'Профессионал',
    description: 'Достичь 5-го уровня',
    icon: '🎖️',
    category: 'progress',
    wave: 3,
  },
  {
    id: 'all_services',
    name: 'Полный Контур',
    description: 'Подключить все 7 сервисов Контура',
    icon: '🏆',
    category: 'services',
    wave: 3,
  },
  {
    id: 'full_promo',
    name: 'Полный набор',
    description: 'Собрать все 7 промокодов на услуги Контура',
    icon: '🏆',
    category: 'services',
    wave: 3,
  },
  {
    id: 'milestone_week30',
    name: 'Три квартала',
    description: 'Достичь вехи на 30-й неделе: 500 000 ₽ на балансе или 10 000 ₽ прибыли за неделю',
    icon: '🚀',
    category: 'progress',
    wave: 3,
  },
  {
    id: 'survival_year_one',
    name: 'Выжил первый год!',
    description: 'Прожить весь первый год с положительным балансом и репутацией',
    icon: '🎉',
    category: 'special',
    wave: 3,
  },

  // Wave 4 — unlocks week 52
  {
    id: 'perfect_day',
    name: 'Идеальный день',
    description: 'Обслужить всех пришедших клиентов без потерь',
    icon: '✨',
    category: 'business',
    wave: 4,
  },
  {
    id: 'level_10',
    name: 'Мастер бизнеса',
    description: 'Достичь 10-го уровня',
    icon: '👑',
    category: 'progress',
    wave: 4,
  },
]
