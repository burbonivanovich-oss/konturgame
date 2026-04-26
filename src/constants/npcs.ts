import type { NPC, NpcRole } from '../types/game'

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
    id: 'mikhail',
    name: 'Михаил Власов',
    role: 'supplier',
    portrait: '👨‍💼',
    shortRole: 'Ваш поставщик',
    personality: 'Работает на рынке 12 лет. Семейный человек, помнит добро и зло. Надёжный — пока его не прижмут.',
    startRelationship: 50,
  },
  {
    id: 'svetlana',
    name: 'Светлана Орлова',
    role: 'employee',
    portrait: '👩‍💼',
    shortRole: 'Лучший продавец',
    personality: 'Амбициозная и умная. Хочет расти и учиться. Если её не замечать — уйдёт к тому, кто заметит.',
    startRelationship: 60,
  },
  {
    id: 'petrov',
    name: 'Инспектор Петров',
    role: 'inspector',
    portrait: '👮',
    shortRole: 'Налоговый инспектор',
    personality: 'Формальный и дотошный. Уважает тех, кто соблюдает закон. Помнит нарушителей.',
    startRelationship: 40,
  },
  {
    id: 'anna',
    name: 'Анна Козлова',
    role: 'competitor',
    portrait: '👩',
    shortRole: 'Конкурент',
    personality: 'Открыла бизнес рядом специально. Умная и агрессивная, но умеет договариваться.',
    startRelationship: 20,
  },
  {
    id: 'marina',
    name: 'Марина Воронова',
    role: 'consultant',
    portrait: '👩‍💻',
    shortRole: 'Маркетолог-консультант',
    personality: 'Фрилансер с 6-летним опытом в digital-рекламе. Обаятельная, говорит убедительно. Результаты бывают разными — зависит от того, насколько глубоко она поймёт ваш бизнес.',
    startRelationship: 45,
  },
  {
    id: 'viktor',
    name: 'Виктор Семёнов',
    role: 'banker',
    portrait: '🏦',
    shortRole: 'Менеджер банка',
    personality: 'Менеджер местного отделения банка. Вежливый и обстоятельный. Умеет находить решения — но всегда в интересах банка прежде всего.',
    startRelationship: 50,
  },
  {
    id: 'gleb',
    name: 'Глеб Котов',
    role: 'blogger',
    portrait: '📱',
    shortRole: 'Блогер',
    personality: '23 года, 18 тысяч подписчиков в соцсетях. Пишет про жизнь района. Ищет контент — честный или скандальный, ему всё равно.',
    startRelationship: 30,
  },
  {
    id: 'tamara',
    name: 'Бабушка Тамара',
    role: 'customer',
    portrait: '👵',
    shortRole: 'Постоянная клиентка',
    personality: 'Тихая женщина за семьдесят. Заходит раз в неделю — за хлебом, за разговором, за тем, чтобы «выйти в люди». Никогда не торопится.',
    startRelationship: 50,
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
