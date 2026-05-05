import type { NPC, NpcId, NpcRole } from '../types/game'

// 8 NPCs total — 6 mechanically functional + 2 narrative-only.
// Each NPC has 3-5 episodes triggered at specific game weeks. After all
// episodes resolve, the NPC fades to background (no daily/weekly upkeep).

export interface NpcDefinition {
  id: NpcId
  name: string
  role: NpcRole
  portrait: string
  shortBlurb: string
  // Mechanical hook this NPC gates. UI surfaces it so players know what
  // meeting them unlocks.
  unlocks: string
  // Legacy fields kept for older UI code that still reads them. Modern UI
  // should use shortBlurb/unlocks; these mirror them so nothing breaks.
  shortRole?: string
  personality?: string
  startRelationship?: number
}

export const NPC_DEFINITIONS: NpcDefinition[] = [
  {
    id: 'katya',
    name: 'Катя',
    role: 'accountant',
    portrait: '👩‍💼',
    shortBlurb: 'Подруга со школы, теперь бухгалтер',
    unlocks: 'Ускоряет Эльбу + защита от налогового кризиса',
  },
  {
    id: 'viktor',
    name: 'Виктор',
    role: 'competitor',
    portrait: '🧔',
    shortBlurb: 'Сосед-предприниматель, открывает магазин рядом',
    unlocks: 'Весь конкурент-контент игры',
  },
  {
    id: 'denis',
    name: 'Денис',
    role: 'investor',
    portrait: '🧑‍🎓',
    shortBlurb: 'Однокурсник, ушёл в IT и поднялся',
    unlocks: 'Беспроцентный займ + альтернативный финал',
  },
  {
    id: 'irina',
    name: 'Ирина Петровна',
    role: 'mentor',
    portrait: '👩‍🏫',
    shortBlurb: 'Мама подруги, ведёт свой салон 20 лет',
    unlocks: 'Boost soft-метрик (репутация, лояльность)',
  },
  {
    id: 'artyom',
    name: 'Артём',
    role: 'colleague',
    portrait: '🧑‍💻',
    shortBlurb: 'Бывший коллега по корпоративной жизни',
    unlocks: 'VIP-сотрудник с двойной эффективностью',
  },
  {
    id: 'mikhail',
    name: 'Михаил Сергеевич',
    role: 'supplier',
    portrait: '👨‍🌾',
    shortBlurb: 'Поставщик-старичок, работает с района 30 лет',
    unlocks: '−10% к закупкам всех категорий',
  },
  {
    id: 'tamara',
    name: 'Бабушка Тамара',
    role: 'customer',
    portrait: '👵',
    shortBlurb: 'Постоянная клиентка, заходит каждую неделю',
    unlocks: 'Человеческое лицо твоего бизнеса',
  },
  {
    id: 'gena',
    name: 'Гена',
    role: 'schemer',
    portrait: '🤙',
    shortBlurb: 'Парень в спортивных штанах с очередным проектом века',
    unlocks: 'Комический риск-менеджмент (опционально)',
  },
]

// Auto-fill legacy fields from new ones so old UI code still finds them.
NPC_DEFINITIONS.forEach(def => {
  if (def.shortRole === undefined) def.shortRole = def.shortBlurb
  if (def.personality === undefined) def.personality = def.shortBlurb
  if (def.startRelationship === undefined) def.startRelationship = 50
})

export function createInitialNPCs(): NPC[] {
  return NPC_DEFINITIONS.map(def => ({
    id: def.id,
    name: def.name,
    role: def.role,
    portrait: def.portrait,
    isRevealed: false,
    modifiers: [],
    completedEpisodes: [],
    relationshipLevel: 50,  // legacy field for backwards-compat UI
  }))
}

export function getNpcDefinition(id: NpcId): NpcDefinition | undefined {
  return NPC_DEFINITIONS.find(n => n.id === id)
}

// Helper: sum of all modifier values for an NPC = effective opinion
export function getNpcOpinion(npc: NPC): number {
  return npc.modifiers.reduce((sum, m) => sum + m.value, 0)
}
