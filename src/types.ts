export type SceneId = string
export type SongId = string
export type QuoteId = string

export type SceneTime = 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night' | 'late-night'
export type SceneWeather = 'clear' | 'cloudy' | 'rain' | 'drizzle' | 'storm' | 'mist'

export type QuoteCategory =
  | 'rindu'
  | 'hujan'
  | 'penyembuhan'
  | 'kehilangan'
  | 'perpisahan'
  | 'malam'
  | 'kesepian'
  | 'harapan'
  | 'tenang'
  | 'cinta'
  | 'refleksi'
  | 'pulang'

/** Data contract consumed by the scene picker and cinematic backdrop. */
export interface Scene {
  id: SceneId
  name: string
  mood: string
  description: string
  asset: string
  accent: string
  animation: string
  defaultRain: boolean
  defaultFog: boolean
}

/** Extended scene shape for consumers that need semantic metadata. */
export interface ScenePreset extends Scene {
  subtitle: string
  timeOfDay: SceneTime
  weather: SceneWeather
  focalPoint: string
  palette: ScenePalette
  layers: SceneLayer[]
  quoteCategory: QuoteCategory
  tags: string[]
  isDefault?: boolean
}

export interface ScenePalette {
  background: string
  surface: string
  accent: string
  text: string
  glow: string
}

export interface SceneLayer {
  id: string
  type: 'gradient' | 'image' | 'rain' | 'mist' | 'grain' | 'light'
  opacity: number
  blendMode?: string
  source?: string
  position?: string
  scale?: number
}

/** A verified playable YouTube track. */
export interface Song {
  id: SongId
  title: string
  artist: string
  playlist: string
  videoId: string
  searchLink: string
  durationHint?: string
  /** Optional convenience fields for richer cards. */
  youtubeUrl?: string
  thumbnailUrl?: string
  tags?: string[]
  verified?: boolean
}

export type LyricsSource = 'demo' | 'lrc-import' | 'manual'

/** A lyric line uses seconds from the beginning of the song. */
export interface LyricsLine {
  start: number
  end: number
  text: string
}

/** Backwards-compatible singular spelling for library consumers. */
export type LyricLine = LyricsLine

export interface LyricsDocument {
  id: string
  songId?: SongId
  title?: string
  artist?: string
  source: LyricsSource
  offsetMs: number
  metadata: Record<string, string>
  lines: LyricsLine[]
  importedAt?: string
}

export interface LrcImportResult {
  document: LyricsDocument
  warnings: string[]
}

export interface Quote {
  id: QuoteId
  text: string
  category: QuoteCategory
  tags?: string[]
}

export interface UserPreferences {
  sceneId?: SceneId
  songId?: SongId
  quoteCategory?: QuoteCategory
  volume?: number
  muted?: boolean
  reducedMotion?: boolean
}
