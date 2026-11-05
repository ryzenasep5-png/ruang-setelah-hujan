import { describe, expect, it } from 'vitest'
import { getActiveLyricIndex, parseLrc } from './lyrics'

describe('timestamped lyrics', () => {
  it('parses LRC metadata, timestamps, and line bounds', () => {
    const result = parseLrc('[ti:Test]\n[ar:Artist]\n[00:01.00]Satu\n[00:04.50]Dua')
    expect(result.document.title).toBe('Test')
    expect(result.document.artist).toBe('Artist')
    expect(result.document.lines).toEqual([
      { start: 1, end: 4.5, text: 'Satu' },
      { start: 4.5, end: 9.5, text: 'Dua' },
    ])
    expect(getActiveLyricIndex(result.document.lines, 2)).toBe(0)
    expect(getActiveLyricIndex(result.document.lines, 5)).toBe(1)
  })
})
