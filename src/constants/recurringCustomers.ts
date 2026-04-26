import type { EventTemplate } from '../types/game'

export const RECURRING_CUSTOMER_EVENTS: EventTemplate[] = [
  {
    id: 'CUST_NINA',
    title: 'Нина Сергеевна снова зашла',
    description: 'Нина Сергеевна — ваша самая верная покупательница. Приходит каждую неделю, знает всех сотрудников по именам. Сегодня она пришла расстроенная: у вас не оказалось её любимого товара.',
    trigger: { dayMin: 7, randomChance: 0.06 },
    options: [
      {
        id: 'apologize',
        text: 'Извиниться и пообещать завезти',
        consequences: { loyaltyDelta: 2 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'compensate',
        text: 'Предложить скидку 10% на следующий визит (−500 ₽)',
        consequences: { balanceDelta: -500, loyaltyDelta: 5, reputationDelta: 2 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'ignore',
        text: 'Ничего не сделать — сама придёт',
        consequences: { loyaltyDelta: -3, reputationDelta: -2 },
        npcRelationshipDelta: -8,
      },
    ],
  },
  {
    id: 'CUST_ARTYOM',
    title: 'Артём пришёл за советом',
    description: 'Артём — молодой парень, только переехал в район. Он стал заходить к вам почти каждый день. Сегодня попросил совета: у него день рождения сестры, а бюджет ограничен.',
    trigger: { dayMin: 14, randomChance: 0.055 },
    options: [
      {
        id: 'help',
        text: 'Помочь подобрать подарок в бюджет',
        consequences: { loyaltyDelta: 4, clientModifier: 0.05, clientModifierDays: 3 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'upsell',
        text: 'Предложить что-то подороже (+1 500 ₽)',
        consequences: { balanceDelta: 1500, loyaltyDelta: -2 },
        npcRelationshipDelta: -5,
      },
      {
        id: 'ignore',
        text: 'Отправить гуглить самому',
        consequences: { loyaltyDelta: -1 },
        npcRelationshipDelta: -3,
      },
    ],
  },
  {
    id: 'CUST_IRINA',
    title: 'Ирина Михайловна хочет корпоратив',
    description: 'Ирина Михайловна — управляющая соседнего офисного центра. Она постоянный клиент и теперь хочет организовать корпоратив для своих сотрудников. Просит спецусловия.',
    trigger: { dayMin: 21, randomChance: 0.04 },
    options: [
      {
        id: 'agree',
        text: 'Дать скидку 15% на крупный заказ (−3 000 ₽)',
        consequences: { balanceDelta: -3000, reputationDelta: 5, clientModifier: 0.1, clientModifierDays: 14 },
        npcRelationshipDelta: 15,
      },
      {
        id: 'partial',
        text: 'Предложить скидку 5%  (−1 000 ₽)',
        consequences: { balanceDelta: -1000, reputationDelta: 2, clientModifier: 0.05, clientModifierDays: 7 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'refuse',
        text: 'Отказать — не делаем скидок',
        consequences: { reputationDelta: -3 },
        npcRelationshipDelta: -10,
      },
    ],
  },
  {
    id: 'CUST_KOLYA',
    title: 'Дядя Коля рассказывает историю',
    description: 'Дядя Коля — пенсионер, который живёт в соседнем доме. Он любит поговорить и часто задерживается у прилавка. Сегодня он рассказывает историю о том, как ваш бизнес изменил район к лучшему.',
    trigger: { dayMin: 10, randomChance: 0.05 },
    options: [
      {
        id: 'listen',
        text: 'Послушать и поблагодарить',
        consequences: { reputationDelta: 3, loyaltyDelta: 2 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'short',
        text: 'Вежливо сослаться на занятость',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 0,
      },
    ],
  },
]
