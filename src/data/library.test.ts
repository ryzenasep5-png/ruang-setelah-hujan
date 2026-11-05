import { describe, expect, it } from 'vitest'
import { scenes } from './scenes'
import { songs } from './songs'

describe('cinematic library data', () => {
  it('contains twelve scenes with local assets', () => {
    expect(scenes).toHaveLength(12)
    expect(new Set(scenes.map((scene) => scene.id)).size).toBe(12)
  })

  it('contains verified songs with fallback links', () => {
    expect(songs.length).toBeGreaterThanOrEqual(18)
    expect(songs.every((song) => song.videoId && song.searchLink.includes('youtube.com/results'))).toBe(true)
  })
})
