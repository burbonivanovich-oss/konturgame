import { describe, it, expect } from 'vitest'
import { konturHomeUrl, konturServiceUrl, KONTUR_BASE_URL } from '../konturLinks'

describe('kontur links', () => {
  it('home url carries utm attribution including placement', () => {
    const url = konturHomeUrl('victory')
    expect(url.startsWith(KONTUR_BASE_URL)).toBe(true)
    expect(url).toContain('utm_source=biznes-s-konturom')
    expect(url).toContain('utm_medium=game')
    expect(url).toContain('utm_content=victory')
  })

  it('service url points at the product path with placement', () => {
    const url = konturServiceUrl('market', 'defeat')
    expect(url).toContain('/market')
    expect(url).toContain('utm_content=defeat')
  })

  it('bank (no dedicated path) falls back to the home page with utm', () => {
    const url = konturServiceUrl('bank', 'victory')
    expect(url.startsWith(`${KONTUR_BASE_URL}?`)).toBe(true)
    expect(url).toContain('utm_content=victory')
  })

  it('produces a valid, parseable URL', () => {
    expect(() => new URL(konturServiceUrl('elba', 'settings'))).not.toThrow()
  })
})
