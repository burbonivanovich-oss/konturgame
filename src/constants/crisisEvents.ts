import type { EventTemplate } from '../types/game'

/**
 * Crisis events (v5.5) — high-impact destabilization that fires when the
 * player is comfortably winning. The point is to break flow and force a
 * real defensive choice, not to grief struggling players.
 *
 * Each event is gated by a "doing well" threshold (balanceMin / loyaltyMin /
 * reputationMin) so they only appear after the early game. Crisis events are
 * one-time per id to avoid stacking, and each offers a Kontur-shaped option
 * that reduces but does not eliminate the cost — services help, they don't
 * save you.
 */

export const CRISIS_EVENTS: EventTemplate[] = [
  {
    id: 'CRISIS_LOGISTICS_OVERREACH',
    title: 'Логистика не выдержала',
    description:
      'Заказов на этой неделе — на треть больше обычного, и вдруг звонок с базы: «Ваш фургон не выйдет, водитель уволился. Найдите за свой счёт». Поставщик ждёт оплаты сегодня, иначе — расторжение. Вы открываете калькулятор и понимаете: рост обогнал вас.',
    trigger: {
      balanceMin: 250_000,
      weekMin: 12,
      randomChance: 0.08,
      oneTime: true,
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'pay_premium_logistics',
        text: 'Заказать срочную перевозку (−65 000 ₽), сохранить отношения с поставщиком',
        consequences: { balanceDelta: -65000, loyaltyDelta: -1 },
      },
      {
        id: 'use_diadoc',
        text: 'Через Контур.Диадок переоформить контракт за день — поставщик подождёт',
        requiredService: 'diadoc',
        consequences: { balanceDelta: -15000, reputationDelta: 2 },
      },
      {
        id: 'break_contract',
        text: 'Расторгнуть контракт, искать нового поставщика',
        consequences: { balanceDelta: -10000, reputationDelta: -8, loyaltyDelta: -5 },
      },
    ],
  },
  {
    id: 'CRISIS_STAFF_POACHING',
    title: 'Сотрудника переманивают',
    description:
      'Лучшая ваша Светлана с заплаканными глазами: «Мне предложили в торговый центр в три раза больше. Я не хочу уходить, но...» Она ждёт ответа. Магазин без неё — это не магазин.',
    trigger: {
      reputationMin: 65,
      loyaltyMin: 60,
      weekMin: 10,
      randomChance: 0.07,
      oneTime: true,
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'match_offer',
        text: 'Поднять зарплату до их уровня (−40 000 ₽ единоразово)',
        consequences: { balanceDelta: -40000, loyaltyDelta: 8 },
      },
      {
        id: 'use_elba',
        text: 'Через Контур.Эльбу оформить долю в прибыли — она остаётся партнёром',
        requiredService: 'elba',
        consequences: { balanceDelta: -5000, loyaltyDelta: 12, reputationDelta: 2 },
      },
      {
        id: 'let_her_go',
        text: 'Отпустить с миром — найдём другую',
        consequences: { loyaltyDelta: -12, reputationDelta: -5 },
      },
    ],
  },
  {
    id: 'CRISIS_TAX_AUDIT',
    title: 'Внеплановая налоговая проверка',
    description:
      'Письмо в почте: «Назначена камеральная проверка по декларации за прошлый квартал. Срок предоставления документов — 5 рабочих дней». Без отлаженной отчётности это означает — ночи в Excel и риск штрафа за каждую недостающую бумажку.',
    trigger: {
      balanceMin: 150_000,
      weekMin: 14,
      randomChance: 0.09,
      oneTime: true,
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'hire_accountant',
        text: 'Нанять бухгалтера на проверку (−35 000 ₽), пройти спокойно',
        consequences: { balanceDelta: -35000, energyDelta: -10 },
      },
      {
        id: 'use_extern',
        text: 'Через Контур.Экстерн отчёт уже готов — отправить за час',
        requiredService: 'extern',
        consequences: { balanceDelta: 0, reputationDelta: 1 },
      },
      {
        id: 'go_alone',
        text: 'Делать самим — три ночи в декларациях',
        consequences: { balanceDelta: -15000, energyDelta: -35, reputationDelta: -3 },
      },
    ],
  },
]
