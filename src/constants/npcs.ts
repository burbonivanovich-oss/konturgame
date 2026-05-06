import type { NPC, NpcRole } from '../types/game'

// New roster (Phase C): 8 archetypes, each with a clear narrative function
// rather than a "modifier with portrait". Each gets a 3-episode arc in
// npcArcs.ts (meet → test → resolve) and either passes to background
// after their final episode or stays as an emotional anchor.
//
//  1. Катя         — подруга-бухгалтер   (Эльба-ассистент)
//  2. Виктор       — сосед-конкурент     (вся конкурент-история)
//  3. Денис        — друг-инвестор       (0% займы, альт-финал)
//  4. Ирина Петр.  — мама-наставница     (soft-метрики)
//  5. Артём        — бывший коллега      (VIP-сотрудник)
//  6. Михаил       — поставщик-старичок  (закупочные скидки)
//  7. Тамара       — постоянная клиентка (эмоциональный якорь)
//  8. Гена         — дядя-инвестор-схемы (комический рефрен)

export interface NPCDefinition {
  id: string
  name: string
  role: NpcRole
  portrait: string
  shortRole: string
  personality: string
  startRelationship: number
}

export const NPC_DEFINITIONS: NPCDefinition[] = [
  {
    id: 'katya',
    name: 'Катя Михеева',
    role: 'consultant',
    portrait: '👩‍💼',
    shortRole: 'Подруга-бухгалтер',
    personality: 'Школьная подруга, теперь бухгалтер с 8 годами стажа. Прямая, иногда резкая. Считает в уме быстрее любой Эльбы — но всё равно её ставит.',
    startRelationship: 65,
  },
  {
    id: 'viktor',
    name: 'Виктор Семёнов',
    role: 'competitor',
    portrait: '🧔',
    shortRole: 'Сосед-конкурент',
    personality: 'Открыл свой бизнес через дорогу полгода назад. Вежливый, но видит в вас угрозу. Может стать другом — а может объявить войну.',
    startRelationship: 30,
  },
  {
    id: 'denis',
    name: 'Денис Лапин',
    role: 'banker',
    portrait: '🤵',
    shortRole: 'Школьный друг-инвестор',
    personality: 'Делал стартапы, сейчас сидит на дивидендах от продажи одного. Подкидывает деньги «по дружбе» — но дружба у него тоже считается.',
    startRelationship: 55,
  },
  {
    id: 'irina',
    name: 'Ирина Петровна',
    role: 'consultant',
    portrait: '👩‍🦳',
    shortRole: 'Мама-наставница',
    personality: '30 лет проработала директором в советской столовой. Видит насквозь, говорит тихо, не повышает голос. Когда не одобряет — молчит.',
    startRelationship: 70,
  },
  {
    id: 'artem',
    name: 'Артём Грин',
    role: 'employee',
    portrait: '👨‍💻',
    shortRole: 'Бывший коллега',
    personality: 'Работали вместе в корпорации до того, как вы ушли. Талантливый, но устал от офиса. Ищет, где приложить руки — и спрашивает себя, не у вас ли.',
    startRelationship: 50,
  },
  {
    id: 'mikhail',
    name: 'Михаил Власов',
    role: 'supplier',
    portrait: '👨‍🦳',
    shortRole: 'Поставщик-старичок',
    personality: 'Работает на рынке 12 лет. Семейный человек, помнит добро и зло. Надёжный — пока не прижмут.',
    startRelationship: 50,
  },
  {
    id: 'tamara',
    name: 'Бабушка Тамара',
    role: 'consultant',
    portrait: '👵',
    shortRole: 'Постоянная клиентка',
    personality: 'Заходит к вам каждый день в 11:00. Покупает мало, говорит много. Помнит, как тут раньше были «Хлеб» и «Овощи». Эмоциональный барометр района.',
    startRelationship: 60,
  },
  {
    id: 'gena',
    name: 'Дядя Гена',
    role: 'banker',
    portrait: '🕴️',
    shortRole: 'Дядя со схемами',
    personality: 'Родственник, у которого «гениальная схема» меняется каждый месяц. Заработать на нём не получится. Послушать — иногда полезно: смешно, и пара трюков всё-таки рабочих.',
    startRelationship: 45,
  },
]

export function createInitialNPCs(): NPC[] {
  return NPC_DEFINITIONS.map(def => ({
    id: def.id,
    name: def.name,
    role: def.role,
    portrait: def.portrait,
    relationshipLevel: def.startRelationship,
    isRevealed: false,
    memory: [],
  }))
}

export function getNPCDefinition(id: string): NPCDefinition | undefined {
  return NPC_DEFINITIONS.find(d => d.id === id)
}
