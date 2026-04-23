import { create } from 'zustand'
import type { MetaPerk } from '../types/game'

export const META_PERKS: MetaPerk[] = [
  {
    id: 'extra_capital',
    name: '+10 000 ₽ к старту',
    description: 'Начинаете с дополнительными деньгами — чуть больше времени на первый шаг.',
  },
  {
    id: 'rent_grace_week1',
    name: 'Первая неделя без аренды',
    description: 'Арендодатель согласился подождать: первые 7 дней без платежей за аренду.',
  },
  {
    id: 'bank_headstart',
    name: 'Контур.Банк с первого дня',
    description: 'Расчётный счёт открыт заранее — не теряете 40% клиентов в первую неделю.',
  },
  {
    id: 'reputation_boost',
    name: 'Репутация 70 вместо 50',
    description: 'О вашем бизнесе уже слышали — старт с более высоким доверием клиентов.',
  },
  {
    id: 'energy_reserve',
    name: '+15 к начальной энергии',
    description: 'Вы отдохнули перед запуском. Больше сил на первые решения.',
  },
]

const META_STORAGE_KEY = 'konturgame_meta'

interface MetaStoreState {
  totalRuns: number
  unlockedPerks: string[]
  selectedPerk: string | null
}

interface MetaStoreActions {
  incrementRuns: () => void
  selectPerk: (id: string | null) => void
  consumeSelectedPerk: () => string | null
  getAvailablePerks: () => MetaPerk[]
}

type MetaStore = MetaStoreState & MetaStoreActions

function loadMeta(): MetaStoreState {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MetaStoreState
  } catch {}
  return { totalRuns: 0, unlockedPerks: [], selectedPerk: null }
}

function saveMeta(state: MetaStoreState) {
  localStorage.setItem(META_STORAGE_KEY, JSON.stringify(state))
}

// Perks unlock after each completed run (0-indexed: perk 0 unlocks after run 1)
function computeUnlockedPerks(totalRuns: number): string[] {
  return META_PERKS.slice(0, Math.min(totalRuns, META_PERKS.length)).map(p => p.id)
}

const initial = loadMeta()

export const useMetaStore = create<MetaStore>((set, get) => ({
  ...initial,
  unlockedPerks: computeUnlockedPerks(initial.totalRuns),

  incrementRuns: () => {
    const totalRuns = get().totalRuns + 1
    const unlockedPerks = computeUnlockedPerks(totalRuns)
    const next = { ...get(), totalRuns, unlockedPerks }
    set(next)
    saveMeta(next)
  },

  selectPerk: (id) => {
    const next = { ...get(), selectedPerk: id }
    set(next)
    saveMeta(next)
  },

  consumeSelectedPerk: () => {
    const { selectedPerk } = get()
    if (!selectedPerk) return null
    const next = { ...get(), selectedPerk: null }
    set(next)
    saveMeta(next)
    return selectedPerk
  },

  getAvailablePerks: () => {
    const { unlockedPerks } = get()
    return META_PERKS.filter(p => unlockedPerks.includes(p.id))
  },
}))
