import type { EventTemplate } from '../types/game'

// Standalone NPC events — not part of chains, fire randomly when the NPC is revealed.
// These deepen existing character relationships and add texture to ongoing stories.
export const NPC_EVENTS: EventTemplate[] = [

  // ── Михаил Власов (поставщик) ──────────────────────────────────────────────

  {
    id: 'NPC_MIKHAIL_DEAL',
    title: 'Михаил предлагает выгодную партию',
    description: 'Михаил Власов звонит неожиданно: "У меня освободилась партия — другой покупатель отказался в последний момент. Могу отдать вам со скидкой 18%, но нужен ответ сегодня." Предложение выглядит честным, но торопит.',
    trigger: { dayMin: 30, randomChance: 0.04 },
    npcId: 'mikhail',
    options: [
      {
        id: 'buy',
        text: 'Взять партию (−25 000 ₽, товар со скидкой)',
        consequences: { balanceDelta: -25000, checkModifier: 0.1, checkModifierDays: 21 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'decline',
        text: 'Отказаться — сейчас не нужно',
        consequences: {},
        npcRelationshipDelta: -3,
      },
    ],
  },

  {
    id: 'NPC_MIKHAIL_TIP',
    title: 'Михаил предупреждает о рисках',
    description: 'Михаил заходит ненадолго и говорит тихо: "Слышал, у одного из районных поставщиков проблемы — дважды срывал поставки на этой неделе. Смотрите, у вас случайно нет договора с Аркадием Лапиным?" Он явно намекает, что знает больше, чем говорит.',
    trigger: { dayMin: 50, randomChance: 0.035 },
    npcId: 'mikhail',
    options: [
      {
        id: 'heed',
        text: 'Поблагодарить и проверить поставщиков',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'ignore',
        text: 'Не обращать внимания',
        consequences: {},
        npcRelationshipDelta: 0,
      },
    ],
  },

  // ── Светлана Орлова (сотрудник) ────────────────────────────────────────────

  {
    id: 'NPC_SVETLANA_CONFLICT',
    title: 'Светлана и трудный клиент',
    description: 'Светлана подходит взволнованная: "Там покупатель скандалит — требует возврат без чека, угрожает написать в Роспотребнадзор. Я не знаю, как поступить. Вы сами поговорите с ним?"',
    trigger: { dayMin: 14, randomChance: 0.05 },
    npcId: 'svetlana',
    options: [
      {
        id: 'handle',
        text: 'Выйти и разрулить ситуацию лично',
        consequences: { reputationDelta: 3, loyaltyDelta: 2 },
        npcRelationshipDelta: 7,
      },
      {
        id: 'delegate',
        text: 'Поддержать Светлану — пусть сама справляется',
        consequences: { loyaltyDelta: -2 },
        npcRelationshipDelta: 3,
      },
      {
        id: 'refund',
        text: 'Вернуть деньги без вопросов (−1 500 ₽)',
        consequences: { balanceDelta: -1500, reputationDelta: 2, loyaltyDelta: 1 },
        npcRelationshipDelta: 4,
      },
    ],
  },

  {
    id: 'NPC_SVETLANA_RAISE',
    title: 'Светлана просит прибавку',
    description: 'Светлана просит поговорить. Серьёзно и спокойно: "Я работаю здесь больше трёх месяцев. Приношу стабильно больше других. Прошу прибавку — 5 000 ₽ в месяц. Это справедливо."',
    trigger: { dayMin: 90, randomChance: 0.045 },
    npcId: 'svetlana',
    options: [
      {
        id: 'agree',
        text: 'Согласиться (−5 000 ₽/мес)',
        consequences: { balanceDelta: -5000, loyaltyDelta: 5 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'partial',
        text: 'Пообещать пересмотреть через месяц',
        consequences: {},
        npcRelationshipDelta: -4,
      },
      {
        id: 'refuse',
        text: 'Отказать — бюджет не позволяет',
        consequences: { loyaltyDelta: -5 },
        npcRelationshipDelta: -14,
      },
    ],
  },

  // ── Инспектор Петров ───────────────────────────────────────────────────────

  {
    id: 'NPC_PETROV_HEADS_UP',
    title: 'Петров звонит неформально',
    description: 'Незнакомый номер. Трубку берёте — Петров. Без официоза: "Я вам не как инспектор звоню. По кварталу идут внеплановые проверки — на следующей неделе. Просто знайте." Пауза. "Это всё, что хотел сказать." Кладёт трубку.',
    trigger: { dayMin: 80, randomChance: 0.03 },
    npcId: 'petrov',
    options: [
      {
        id: 'prepare',
        text: 'Срочно привести документы в порядок (−3 000 ₽)',
        consequences: { balanceDelta: -3000, reputationDelta: 2 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'ignore',
        text: 'Ничего не делать — и так всё нормально',
        consequences: {},
        npcRelationshipDelta: 0,
      },
    ],
  },

  {
    id: 'NPC_PETROV_DOCUMENTS',
    title: 'Петров запрашивает документы',
    description: 'Официальный запрос от инспекции: предоставить копии договоров с поставщиками за последние полгода. Срок — три дня. Петров явно изучает цепочку поставок.',
    trigger: { dayMin: 60, randomChance: 0.035 },
    npcId: 'petrov',
    options: [
      {
        id: 'full',
        text: 'Предоставить все документы в срок',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'extern',
        text: 'Сформировать пакет через Контур.Экстерн (быстро и точно)',
        consequences: { reputationDelta: 4 },
        npcRelationshipDelta: 14,
        requiredService: 'extern',
        isContourOption: true,
      },
      {
        id: 'delay',
        text: 'Попросить отсрочку на неделю',
        consequences: { reputationDelta: -2 },
        npcRelationshipDelta: -6,
      },
    ],
  },

  // ── Анна Козлова (конкурент) ───────────────────────────────────────────────

  {
    id: 'NPC_ANNA_JOINT_PROMO',
    title: 'Анна предлагает совместную акцию',
    description: 'Анна заходит с конвертом. Внутри — проект листовки: "Два магазина, одна улица — скидки на всё". Смотрит прямо: "Перед праздниками все выигрывают от трафика. Пополам расходы, пополам выгода. Рискнём?"',
    trigger: { dayMin: 45, randomChance: 0.04 },
    npcId: 'anna',
    options: [
      {
        id: 'agree',
        text: 'Согласиться (−5 000 ₽ на печать, +клиенты)',
        consequences: { balanceDelta: -5000, clientModifier: 0.12, clientModifierDays: 10, reputationDelta: 2 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'skeptical',
        text: 'Согласиться, но без скидок со своей стороны',
        consequences: { balanceDelta: -2500, clientModifier: 0.06, clientModifierDays: 7 },
        npcRelationshipDelta: 3,
      },
      {
        id: 'refuse',
        text: 'Отказать — не доверяю',
        consequences: {},
        npcRelationshipDelta: -8,
      },
    ],
  },

  {
    id: 'NPC_ANNA_POACHING',
    title: 'Анна переманивает вашего клиента',
    description: 'Вы видите, как Анна на улице разговаривает с Ниной Сергеевной — вашей постоянной покупательницей. Раздаёт листовки, показывает что-то на телефоне. Нина слушает с интересом.',
    trigger: { dayMin: 55, randomChance: 0.045 },
    npcId: 'anna',
    options: [
      {
        id: 'intervene',
        text: 'Выйти и пригласить Нину зайти к вам',
        consequences: { loyaltyDelta: 3 },
        npcRelationshipDelta: -5,
      },
      {
        id: 'loyalty_card',
        text: 'Запустить карту лояльности (−4 000 ₽)',
        consequences: { balanceDelta: -4000, loyaltyDelta: 8, clientModifier: 0.05, clientModifierDays: 14 },
        npcRelationshipDelta: -3,
      },
      {
        id: 'watch',
        text: 'Не вмешиваться — клиент сам решит',
        consequences: { loyaltyDelta: -4 },
        npcRelationshipDelta: 0,
      },
    ],
  },
]
