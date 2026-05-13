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
    body: 'Каждую неделю выбирайте фокус — он влияет на всю неделю целиком.\n\n• 🔥 Активная: +18% выручки, но −9 энергии/нед, −1.4 репутации, −1 лояльности\n• 🌿 Спокойная: −3% выручки, +17 энергии/нед, +0.7 репутации\n• ⭐ Качество: без штрафа к выручке, +5.6 репутации и +3.5 лояльности/нед\n\nЕсли не выбрать — −5% выручки за рассеянность.',
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
      const tier = s.businessTier ?? 1
      if (tier >= 3) return false
      return (s.currentWeek ?? 1) >= 12 && (s.balance ?? 0) > 200_000 && (s.reputation ?? 0) >= 60
    },
  },
  // Спринт 5e: новые моменты для механик, которые не объясняются явно.
  {
    id: 'fiscal-drive-purchased',
    icon: '🧾',
    title: 'Фискальный накопитель',
    body: 'К первой кассе докупили фискальный накопитель (+8 000 ₽).\n\nЭто обязательное по 54-ФЗ устройство — оно подписывает каждый чек электронной подписью и хранит данные для ФНС. Без него ОФД не может передавать чеки, и был бы штраф 10 000 ₽ за каждую продажу.\n\nРеальная вещь, не игровая абстракция.',
    shouldShow: (s) =>
      s.fiscalDriveOwned === true &&
      (s.cashRegisters?.length ?? 0) >= 1 &&
      (s.currentWeek ?? 1) <= 6,
  },
  {
    id: 'svetlana-manager-boost',
    icon: '⭐',
    title: 'Светлана разгрузила вас',
    body: 'Светлана как управленец усиливает всю команду:\n\n• +25% к эффективности обычных сотрудников (Никита, Олег, Андрей)\n• +40% к специалистам (бывшие профи: Сергей/Алла/Лариса)\n\nПлюс она берёт часть рутинных вопросов на себя — у вас тратится меньше энергии в неделю.\n\nПочему так? Она разруливает в смены поставщиков, договорённости, текучку — то, что раньше тащили вы.',
    shouldShow: (s) =>
      (s.employees ?? []).some(e => e.name === 'Светлана' && e.position === 'manager') &&
      (s.currentWeek ?? 0) <= ((s.employees ?? []).find(e => e.name === 'Светлана')?.hireDay ?? 0) / 7 + 2,
  },
  {
    id: 'oleg-svetlana-friction',
    icon: '⚠️',
    title: 'Олег и Светлана не сработались',
    body: 'Олег плохо переносит управление в команде. Когда есть менеджер (Светлана), он:\n\n• Работает на 10% хуже («давят сверху»)\n• Скисает быстрее обычного — может скатиться до 0.75 эффективности (вместо обычных 0.9)\n\nЕсли видите его прогулы и косяки — скоро прилетит событие с предложением расстаться. Через 4 недели после прихода Светланы.',
    shouldShow: (s) => {
      const hasSvetlana = (s.employees ?? []).some(e => e.name === 'Светлана' && e.position === 'manager')
      const hasOleg = (s.employees ?? []).some(e => e.name === 'Олег')
      if (!hasSvetlana || !hasOleg) return false
      // Show within 2 weeks of Svetlana hire (when player has just both)
      const svetlanaHireDay = (s.employees ?? []).find(e => e.name === 'Светлана')?.hireDay ?? 0
      const weeksSince = ((s.currentWeek ?? 0) * 7 - svetlanaHireDay) / 7
      return weeksSince >= 0 && weeksSince <= 2
    },
  },
]
