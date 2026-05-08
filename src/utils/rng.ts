// Seedable RNG. Uses a Mulberry32 hash function — small, fast, and good
// enough quality for game events. Module-level state lets us run the entire
// game (and tests) deterministically by calling `seedRng(n)` once.
//
// For one-off determinism (e.g. an isolated test scenario) prefer
// `createRng(seed)` which returns a self-contained generator without
// touching the module-level state.

let _state: number = (Math.random() * 2 ** 32) >>> 0

function mulberry32(state: { s: number }): number {
  state.s = (state.s + 0x6D2B79F5) >>> 0
  let t = state.s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Seed the module-level RNG. Call once at game start (or in test setup) to
 * get a deterministic sequence from `randFloat`, `randInt`, `pickWeighted`.
 */
export function seedRng(seed: number): void {
  _state = seed >>> 0
}

/** Float in [0, 1). Drop-in for Math.random(). */
export function randFloat(): number {
  const wrap = { s: _state }
  const v = mulberry32(wrap)
  _state = wrap.s
  return v
}

/** Integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(randFloat() * (max - min + 1)) + min
}

/** Pick a random element from an array. Returns undefined for empty arrays. */
export function pick<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(randFloat() * items.length)]
}

/**
 * Weighted pick. Each item has a numeric weight ≥ 0; total weight 0 returns
 * undefined. Weights need not sum to 1.
 */
export function pickWeighted<T>(
  items: readonly T[],
  getWeight: (item: T) => number,
): T | undefined {
  let total = 0
  for (const it of items) total += Math.max(0, getWeight(it))
  if (total <= 0) return undefined
  let r = randFloat() * total
  for (const it of items) {
    r -= Math.max(0, getWeight(it))
    if (r <= 0) return it
  }
  return items[items.length - 1]
}

/**
 * Create a self-contained RNG. Does not touch module-level state. Useful
 * when one piece of code needs determinism without affecting the rest of
 * the game's RNG sequence.
 */
export function createRng(seed: number): {
  randFloat: () => number
  randInt: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T | undefined
} {
  const wrap = { s: seed >>> 0 }
  const f = () => mulberry32(wrap)
  return {
    randFloat: f,
    randInt: (min, max) => Math.floor(f() * (max - min + 1)) + min,
    pick: <T,>(items: readonly T[]) => items.length === 0 ? undefined : items[Math.floor(f() * items.length)],
  }
}
