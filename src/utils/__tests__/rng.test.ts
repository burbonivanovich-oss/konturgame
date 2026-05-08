import { describe, it, expect } from 'vitest'
import { seedRng, randFloat, randInt, pick, createRng } from '../rng'

describe('rng', () => {
  it('produces a deterministic sequence after seeding', () => {
    seedRng(42)
    const a = [randFloat(), randFloat(), randFloat()]
    seedRng(42)
    const b = [randFloat(), randFloat(), randFloat()]
    expect(a).toEqual(b)
  })

  it('different seeds produce different sequences', () => {
    seedRng(1)
    const a = [randFloat(), randFloat(), randFloat()]
    seedRng(2)
    const b = [randFloat(), randFloat(), randFloat()]
    expect(a).not.toEqual(b)
  })

  it('randFloat returns value in [0, 1)', () => {
    seedRng(123)
    for (let i = 0; i < 100; i++) {
      const v = randFloat()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('randInt returns inclusive bounds', () => {
    seedRng(7)
    let minHit = false, maxHit = false
    for (let i = 0; i < 500; i++) {
      const v = randInt(0, 3)
      if (v === 0) minHit = true
      if (v === 3) maxHit = true
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(3)
    }
    expect(minHit).toBe(true)
    expect(maxHit).toBe(true)
  })

  it('pick returns undefined for empty arrays', () => {
    expect(pick([])).toBeUndefined()
  })

  it('createRng is independent from module state', () => {
    seedRng(999)
    const isolated = createRng(42)
    const a = [isolated.randFloat(), isolated.randFloat()]
    // Module RNG advanced separately; reseed and confirm isolated still matches
    seedRng(0)
    const isolated2 = createRng(42)
    const b = [isolated2.randFloat(), isolated2.randFloat()]
    expect(a).toEqual(b)
  })
})
