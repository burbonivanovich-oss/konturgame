import type { GameState } from '../types/game'
import type { NavId } from '../components/design-system/KLeftRail'

export interface TutorialMoment {
  id: string
  icon: string
  title: string
  body: string
  // Optional CTA — opens this nav target
  targetNav?: NavId
  ctaLabel?: string
  // Returns true when the moment should appear. Evaluated each render.
  shouldShow: (state: GameState) => boolean
}

// Just-in-time tutorial moments — small dismissible cards that surface when
// the player first encounters a new game system. Independent of the main
// onboarding stages; these fire based on game state, not stage progression.
//
// Order matters: when multiple are eligible, the FIRST one wins. Player
// dismisses, next render may show the next eligible one.
export const TUTORIAL_MOMENTS: TutorialMoment[] = [
  {
    id: 'tactic-chooser',
    icon: '🎯',
    title: 'Тактика на неделю',
    body: 'Каждую неделю выбирайте фокус — он влияет на всю неделю целиком.\n\n• Активная: +20% выручки, но −2 энергии/день\n• Спокойная: −8% выручки, +2 энергии/день\n• Качество: −5% выручки, но +0.5 репутации и +1 лояльности/день\n\nЕсли не выбрать — −5% выручки за рассеянность.',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) === 1 &&
      (s.dayOfWeek ?? 0) >= 1 &&
      !s.weeklyTactic &&
      !!s.onboardingStage && s.onboardingStage >= 1,
  },
  {
    id: 'upgrades-available',
    icon: '🔧',
    title: 'Улучшения и оборудование',
    body: 'В Развитие → Улучшения можно покупать оборудование: холодильники, кофемашины, кухни, кассы.\n\nНовые категории требуют конкретных апгрейдов — например, мясо нужен морозильник, барная карта — стойку. Без них категория заблокирована.',
    targetNav: 'development',
    ctaLabel: 'К улучшениям',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 3 &&
      (s.onboardingStage ?? 0) >= 1,
  },
  {
    id: 'marketing-available',
    icon: '📢',
    title: 'Рекламные кампании',
    body: 'В Развитие → Реклама можно запускать кампании: промо, листовки, блогер.\n\nКаждая даёт +клиентов или +чек на 10-14 дней. Можно держать до 3 одновременно — но эффект уменьшается с каждой следующей. ROI отслеживается отдельно.',
    targetNav: 'development',
    ctaLabel: 'К рекламе',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 5 &&
      (s.onboardingStage ?? 0) >= 2,
  },
  {
    id: 'personnel-available',
    icon: '👥',
    title: 'Пора нанимать',
    body: 'Энергия падает — вы устаёте. В Управление → Персонал можно нанять кассиров, помощников, менеджеров.\n\nКаждый снимает часть нагрузки и даёт +пропускную способность. Зарплата ежемесячная, списывается автоматически.',
    targetNav: 'operations',
    ctaLabel: 'К персоналу',
    shouldShow: (s) =>
      (s.entrepreneurEnergy ?? 100) < 50 &&
      (s.employees?.length ?? 0) === 0 &&
      (s.currentWeek ?? 1) >= 4,
  },
  {
    id: 'tier-upgrade-ready',
    icon: '🚀',
    title: 'Можно вырасти!',
    body: 'Условия для перехода на следующий уровень бизнеса открыты. В Развитие → Уровень бизнеса можно перейти за разовую плату.\n\nНовый тир мультипликаторно увеличит клиентов, чек и ёмкость — но и аренду с зарплатой тоже. Считайте бюджет.',
    targetNav: 'development',
    ctaLabel: 'К уровням',
    shouldShow: (s) => {
      // Inline check: don't import canUpgradeTier to avoid circular dep
      const tier = s.businessTier ?? 1
      if (tier >= 3) return false
      // Crude condition: weeks 12+ and balance > 200K and rep > 60
      return (s.currentWeek ?? 1) >= 12 && (s.balance ?? 0) > 200_000 && (s.reputation ?? 0) >= 60
    },
  },
]
