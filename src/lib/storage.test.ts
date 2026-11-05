import { beforeEach, describe, expect, it } from 'vitest'
import { readJSON, uid, writeJSON } from './storage'

describe('local preferences storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('round trips namespaced JSON safely', () => {
    writeJSON('preferences', { rain: true, intensity: 55 })
    expect(readJSON('preferences', null)).toEqual({ rain: true, intensity: 55 })
  })

  it('returns fallback for malformed JSON and creates unique IDs', () => {
    window.localStorage.setItem('ruang-setelah-hujan:broken', '{bad')
    expect(readJSON('broken', { safe: true })).toEqual({ safe: true })
    expect(new Set(Array.from({ length: 50 }, () => uid())).size).toBe(50)
  })
})
