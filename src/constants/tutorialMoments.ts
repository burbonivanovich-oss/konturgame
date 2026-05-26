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
    body: 'Каждую неделю выбирайте фокус — он влияет на всю неделю целиком.\n\n• 🔥 Активная: +18% выручки, но −9 энергии и −1.5 репутации/нед\n• 🌿 Спокойная: −3% выручки, +10 энергии и +0.7 репутации/нед\n• ⭐ Качество: без штрафа к выручке, +2 энергии и +7 репутации/нед\n\nЕсли не выбрать — −5% выручки за рассеянность.',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) === 1 &&
      (s.dayOfWeek ?? 0) >= 1 &&
      !s.weeklyTactic &&
      !!s.onboardingStage && s.onboardingStage >= 1,
  },
  {
    // Спринт 6 (UX Designer audit H6): W3 «что делать дальше» —
    // закрываем silence-gap между Stage 1 (W2) и Stage 2 (W10).
    // Раньше игрок 8 недель сидел без подсказок.
    id: 'next-steps-w3',
    icon: '🗺️',
    title: 'Что делать в следующие недели',
    body: 'Базовый набор подключён — Банк, ОФД, касса. Теперь у вас есть время разобраться: вкладывайтесь в улучшения, держите репутацию.\n\nКонтур.Маркет (учёт товаров) откроется ближе к 10-й неделе — пока окрепнет оборот и появится с чем работать. До этого — пробуйте разные тактики недели и наблюдайте, как они влияют на энергию и выручку.',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 3 &&
      (s.onboardingStage ?? 0) >= 1 &&
      !!s.services?.bank?.isActive &&
      !!s.services?.ofd?.isActive,
  },
  {
    id: 'finance-overview-w7',
    icon: '📊',
    title: 'Как читать финансы',
    body: 'В разделе «Финансы» (сайдбар слева) видно структуру расходов: аренда, зарплаты, налоги, подписки сервисов. Открывайте раз в 2-3 недели — там же ROI кампаний и общая прибыль.\n\nЕсли прибыль/неделя несколько недель в минусе — пора менять тактику или искать узкое место.',
    targetNav: 'finance',
    ctaLabel: 'К финансам',
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 7 &&
      (s.onboardingStage ?? 0) >= 1,
  },
  {
    id: 'upgrades-available',
    icon: '🔧',
    title: 'Время улучшать оборудование',
    body: 'Базовые сервисы подключены — теперь можно вкладываться в само место. В разделе «Улучшения» в сайдбаре: холодильники, кофемашины, кухни, барная стойка.\n\nНекоторые улучшения открывают новые категории товаров: морозильник → мясо/рыба, алкошкаф → алкоголь. Без них категория заблокирована.',
    targetNav: 'upgrades',
    ctaLabel: 'К улучшениям',
    // Спринт 6: возвращаем подсказку именно после Stage 1 (bank+register+OFD).
    // Player жаловался: «онбординг после ОФД и кассы не рассказывает что
    // можно подключать улучшения, нужно его возвращать неделе на 4-5».
    // W4 — соответствует моменту, когда Stage 1 завершена, но Stage 2 ещё
    // далеко (день 70 = W10). Заполняет «тихий» промежуток.
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 4 &&
      (s.onboardingStage ?? 0) >= 1 &&
      // дополнительно: Stage 1 действительно завершена (bank+ofd активны)
      !!s.services?.bank?.isActive &&
      !!s.services?.ofd?.isActive,
  },
  {
    id: 'marketing-available',
    icon: '📢',
    title: 'Рекламные кампании',
    body: 'В разделе «Реклама» в сайдбаре можно запускать кампании: промо, листовки, блогер.\n\nКаждая даёт +клиентов или +чек на 10-14 дней. Можно держать до 3 одновременно — но эффект уменьшается с каждой следующей (100% → 60% → 30%). ROI каждой кампании отслеживается внизу того же экрана.',
    targetNav: 'marketing',
    ctaLabel: 'К рекламе',
    // Спринт 6: триггер пересмотрен. Раньше ждал Stage 2 (W10+) — слишком
    // поздно, реклама уже могла бы пригодиться раньше для разгона.
    // Теперь — W6+, после установки Stage 1 (bank+register+OFD).
    shouldShow: (s) =>
      (s.currentWeek ?? 1) >= 6 &&
      (s.onboardingStage ?? 0) >= 1 &&
      !!s.services?.bank?.isActive,
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
    body: 'Условия для перехода на следующий уровень бизнеса открыты — уровень поднимется автоматически в конце недели. Новый тир увеличит клиентов, чек и ёмкость. Без затрат и без роста ренты/ЗП.',
    targetNav: 'tier',
    ctaLabel: 'К уровню',
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
    title: 'Касса по 54-ФЗ',
    body: 'Купили ККТ и фискальный накопитель пакетом (24 000 ₽).\n\nФН подписывает каждый чек электронной подписью и хранит данные для ФНС — без него ОФД не может передавать чеки, штраф до 10 000 ₽ за каждую продажу.\n\nЭто разовая compliance-покупка, а не апгрейд: больше касс докупать не нужно, и пропускную способность они не двигают — её определяет ёмкость точки.',
    shouldShow: (s) =>
      s.fiscalDriveOwned === true &&
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
