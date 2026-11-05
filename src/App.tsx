import { AnimatePresence, motion } from 'motion/react'
import {
  Clock3,
  CloudRain,
  Expand,
  Film,
  Heart,
  Info,
  ListMusic,
  Menu,
  MessageCircleHeart,
  Moon,
  Pause,
  Play,
  Radio,
  Repeat,
  Search,
  Settings2,
  Shuffle,
  SkipBack,
  SkipForward,
  SunMoon,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, MutableRefObject, ReactNode } from 'react'
import { lyricsBySong, songs, scenes, quotes } from './data'
import type { LyricsLine, Scene, Song } from './types'
import { readJSON, writeJSON } from './lib/storage'

const SCENE_KEY = 'ruanghujan.scene.v1'
const FAV_SCENE_KEY = 'ruanghujan.favorite-scenes.v1'
const FAV_SONG_KEY = 'ruanghujan.favorite-songs.v1'
const RECENT_SONG_KEY = 'ruanghujan.recent-songs.v1'
const SETTINGS_KEY = 'ruanghujan.settings.v1'

const MOODS = [
  { id: 'heartbroken', label: 'Heartbroken', icon: '✦', scene: 'jendela-setelah-hujan', category: 'kehilangan' },
  { id: 'missing', label: 'Missing Someone', icon: '⌁', scene: 'lampu-kota-tengah-malam', category: 'rindu' },
  { id: 'betrayed', label: 'Betrayed', icon: '◇', scene: 'halte-yang-sepi', category: 'perpisahan' },
  { id: 'lonely', label: 'Lonely', icon: '○', scene: 'kamar-dengan-lampu-kuning', category: 'kesepian' },
  { id: 'midnight', label: 'Midnight', icon: '☾', scene: 'stasiun-pukul-tiga', category: 'malam' },
  { id: 'healing', label: 'Healing', icon: '✧', scene: 'subuh-di-balkon', category: 'penyembuhan' },
  { id: 'rainy', label: 'Rainy', icon: '⌇', scene: 'jendela-setelah-hujan', category: 'hujan' },
  { id: 'memories', label: 'Memories', icon: '◌', scene: 'atap-dan-bintang-pudar', category: 'refleksi' },
]

const DEFAULT_SETTINGS = {
  rain: true,
  fog: true,
  dust: true,
  glow: true,
  grain: true,
  parallax: true,
  visualizer: true,
  lowPerformance: false,
  rainIntensity: 58,
  rainSpeed: 48,
  zoom: 1.06,
  brightness: 0.62,
  lyricsSize: 1,
  quoteSize: 1,
  aspect: '9:16' as '9:16' | '16:9' | '1:1',
  autoScene: 'off' as 'off' | 'song' | '30' | '60' | '120',
}

type Settings = typeof DEFAULT_SETTINGS

type PlayerState = {
  current: Song | null
  playing: boolean
  ready: boolean
  failed: boolean
  time: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: 'off' | 'all' | 'one'
  playSong: (song: Song) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  openYouTube: (song: Song) => void
}

type YouTubeWindow = Window & {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}

let youtubeApiPromise: Promise<typeof YT> | null = null
function loadYouTubeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  const win = window as YouTubeWindow
  if (win.YT?.Player) return Promise.resolve(win.YT)
  if (youtubeApiPromise) return youtubeApiPromise
  youtubeApiPromise = new Promise((resolve, reject) => {
    let poll = 0
    const done = (value: typeof YT) => {
      window.clearInterval(poll)
      resolve(value)
    }
    win.onYouTubeIframeAPIReady = () => {
      if (win.YT?.Player) done(win.YT)
    }
    poll = window.setInterval(() => {
      if (win.YT?.Player) done(win.YT)
    }, 50)
    window.setTimeout(() => {
      window.clearInterval(poll)
      reject(new Error('YouTube API timeout'))
      youtubeApiPromise = null
    }, 15000)
    if (!document.getElementById('ruang-hujan-youtube-api')) {
      const script = document.createElement('script')
      script.id = 'ruang-hujan-youtube-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => {
        window.clearInterval(poll)
        youtubeApiPromise = null
        reject(new Error('YouTube API gagal dimuat'))
      }
      document.head.appendChild(script)
    }
  })
  return youtubeApiPromise
}

function useMusicPlayer(): PlayerState & { playerHolder: MutableRefObject<HTMLDivElement | null> } {
  const [current, setCurrent] = useState<Song | null>(songs[0] ?? null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(78)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const playerRef = useRef<YT.Player | null>(null)
  const playerHolder = useRef<HTMLDivElement | null>(null)
  const readyRef = useRef(false)
  const cancelledRef = useRef(false)
  const pendingRef = useRef<{ song: Song; play: boolean } | null>(null)
  const stateRef = useRef({ current, playing, shuffle, repeat, volume, muted })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    stateRef.current = { current, playing, shuffle, repeat, volume, muted }
  })

  const indexFor = useCallback((song: Song | null) => (song ? songs.findIndex((item) => item.id === song.id) : -1), [])
  const chooseIndex = useCallback(
    (direction: 1 | -1) => {
      if (!songs.length) return -1
      const index = indexFor(stateRef.current.current)
      if (stateRef.current.shuffle) {
        if (songs.length === 1) return 0
        let next = Math.floor(Math.random() * songs.length)
        if (next === index) next = (next + 1) % songs.length
        return next
      }
      return (index + direction + songs.length) % songs.length
    },
    [indexFor],
  )

  const loadSong = useCallback((song: Song, shouldPlay: boolean) => {
    setCurrent(song)
    setFailed(false)
    setTime(0)
    setDuration(0)
    pendingRef.current = { song, play: shouldPlay }
    const player = playerRef.current
    if (!player || !readyRef.current || !song.videoId) return
    if (shouldPlay) player.loadVideoById(song.videoId)
    else player.cueVideoById(song.videoId)
  }, [])

  const playSong = useCallback((song: Song) => loadSong(song, true), [loadSong])
  const next = useCallback(() => {
    const index = chooseIndex(1)
    if (index >= 0) loadSong(songs[index], true)
  }, [chooseIndex, loadSong])
  const previous = useCallback(() => {
    const player = playerRef.current
    if (player && readyRef.current && player.getCurrentTime() > 4) {
      player.seekTo(0, true)
      return
    }
    const index = chooseIndex(-1)
    if (index >= 0) loadSong(songs[index], true)
  }, [chooseIndex, loadSong])
  const togglePlay = useCallback(() => {
    const player = playerRef.current
    const song = stateRef.current.current ?? songs[0]
    if (!song) return
    if (!stateRef.current.current) setCurrent(song)
    pendingRef.current = { song, play: true }
    if (!player || !readyRef.current) return
    if (stateRef.current.playing) player.pauseVideo()
    else if (song.videoId) player.playVideo()
  }, [])
  const seek = useCallback((seconds: number) => {
    if (!playerRef.current || !readyRef.current) return
    playerRef.current.seekTo(seconds, true)
    setTime(seconds)
  }, [])
  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(100, value))
    setVolumeState(nextVolume)
    playerRef.current?.setVolume(nextVolume)
    if (nextVolume > 0) setMuted(false)
  }, [])
  const toggleMute = useCallback(() => {
    const nextMuted = !stateRef.current.muted
    setMuted(nextMuted)
    if (nextMuted) playerRef.current?.mute()
    else {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(stateRef.current.volume)
    }
  }, [])
  const toggleShuffle = useCallback(() => setShuffle((value) => !value), [])
  const cycleRepeat = useCallback(() => setRepeat((value) => (value === 'off' ? 'all' : value === 'all' ? 'one' : 'off')), [])
  const openYouTube = useCallback((song: Song) => {
    window.open(song.videoId ? `https://www.youtube.com/watch?v=${song.videoId}` : song.searchLink, '_blank', 'noopener,noreferrer')
  }, [])

  useEffect(() => {
    cancelledRef.current = false
    loadYouTubeApi()
      .then((YTNamespace) => {
        if (cancelledRef.current || !playerHolder.current) return
        playerRef.current = new YTNamespace.Player(playerHolder.current, {
          width: '1',
          height: '1',
          playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              readyRef.current = true
              event.target.setVolume(stateRef.current.volume)
              if (stateRef.current.muted) event.target.mute()
              setReady(true)
              const pending = pendingRef.current
              if (pending?.song.videoId) {
                if (pending.play) event.target.loadVideoById(pending.song.videoId)
                else event.target.cueVideoById(pending.song.videoId)
                pendingRef.current = null
              }
            },
            onStateChange: (event) => {
              if (event.data === 1) {
                setPlaying(true)
                setFailed(false)
                setDuration(event.target.getDuration() || 0)
              } else if (event.data === 2 || event.data === 5) setPlaying(false)
              else if (event.data === 0) {
                setPlaying(false)
                if (stateRef.current.repeat === 'one') {
                  event.target.seekTo(0, true)
                  event.target.playVideo()
                } else next()
              }
            },
            onError: () => {
              setFailed(true)
              setPlaying(false)
            },
          },
        })
      })
      .catch(() => setFailed(true))
    return () => {
      cancelledRef.current = true
      readyRef.current = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [next])

  useEffect(() => {
    const tick = () => {
      const player = playerRef.current
      if (player && readyRef.current) {
        setTime(player.getCurrentTime?.() ?? 0)
        const nextDuration = player.getDuration?.() ?? 0
        if (nextDuration) setDuration(nextDuration)
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { current, playing, ready, failed, time, duration, volume, muted, shuffle, repeat, playSong, togglePlay, next, previous, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat, openYouTube, playerHolder }
}

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function parseLrc(input: string): LyricsLine[] {
  const result: LyricsLine[] = []
  for (const line of input.split(/\r?\n/)) {
    const match = line.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/)
    if (!match) continue
    const start = Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3] ?? '0'}`)
    result.push({ start, end: start + 6, text: match[4].trim() || '…' })
  }
  return result.sort((a, b) => a.start - b.start).map((line, index, all) => ({ ...line, end: all[index + 1]?.start ?? line.end }))
}

function parseLyricsJson(input: string): LyricsLine[] {
  const parsed = JSON.parse(input) as { lyrics?: LyricsLine[] } | LyricsLine[]
  const lines = Array.isArray(parsed) ? parsed : parsed.lyrics ?? []
  return lines
    .filter((line) => typeof line.start === 'number' && typeof line.text === 'string')
    .map((line) => ({ start: line.start, end: line.end ?? line.start + 6, text: line.text }))
    .sort((a, b) => a.start - b.start)
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className="setting-row">
      <span>{label}</span>
      <span className={`toggle ${checked ? 'is-on' : ''}`}><span /></span>
    </button>
  )
}

function RangeSetting({ label, value, min, max, onChange, suffix = '%' }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; suffix?: string }) {
  return (
    <label className="range-setting">
      <span><span>{label}</span><output>{value}{suffix}</output></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.aside className="drawer" initial={{ x: '105%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '105%', opacity: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <div className="drawer-header"><div><p className="eyebrow">Ruang Setelah Hujan</p><h2>{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Tutup"><X size={18} /></button></div>
      <div className="drawer-content">{children}</div>
    </motion.aside>
  )
}

function App() {
  const playerBundle = useMusicPlayer()
  const { playerHolder, ...player } = playerBundle
  const [sceneId, setSceneId] = useState(() => readJSON(SCENE_KEY, scenes[0]?.id ?? 'jendela-setelah-hujan'))
  const [favoriteScenes, setFavoriteScenes] = useState<string[]>(() => readJSON(FAV_SCENE_KEY, []))
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>(() => readJSON(FAV_SONG_KEY, []))
  const [recentSongs, setRecentSongs] = useState<string[]>(() => readJSON(RECENT_SONG_KEY, []))
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY, {}) }))
  const [drawer, setDrawer] = useState<'scenes' | 'music' | 'settings' | 'moods' | null>(null)
  const [sceneSearch, setSceneSearch] = useState('')
  const [songSearch, setSongSearch] = useState('')
  const [libraryTab, setLibraryTab] = useState<'all' | 'favorites' | 'recent'>('all')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [mood, setMood] = useState('heartbroken')
  const [recordMode, setRecordMode] = useState(false)
  const [customBackground, setCustomBackground] = useState<{ src: string; kind: 'image' | 'video'; name: string } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0]
  const sceneAsset = (item: Scene | undefined) => {
    if (!item) return '/scenes/scene-01.jpg'
    const index = Math.max(0, scenes.findIndex((candidate) => candidate.id === item.id)) + 1
    return `/scenes/scene-${String(index).padStart(2, '0')}.jpg`
  }
  const currentMood = MOODS.find((item) => item.id === mood) ?? MOODS[0]
  const sceneLines = player.current ? lyricsBySong[player.current.id] ?? [] : []
  const activeLyric = sceneLines.findIndex((line) => player.time >= line.start && player.time < line.end)
  const activeLine = activeLyric >= 0 ? sceneLines[activeLyric] : null
  const shownQuote = quotes.filter((quote) => quote.category === currentMood.category)[quoteIndex % Math.max(1, quotes.filter((quote) => quote.category === currentMood.category).length)] ?? quotes[quoteIndex % quotes.length]

  useEffect(() => { writeJSON(SCENE_KEY, sceneId) }, [sceneId])
  useEffect(() => { writeJSON(FAV_SCENE_KEY, favoriteScenes) }, [favoriteScenes])
  useEffect(() => { writeJSON(FAV_SONG_KEY, favoriteSongs) }, [favoriteSongs])
  useEffect(() => { writeJSON(RECENT_SONG_KEY, recentSongs) }, [recentSongs])
  useEffect(() => { writeJSON(SETTINGS_KEY, settings) }, [settings])

  useEffect(() => {
    const timer = window.setInterval(() => setQuoteIndex((value) => value + 1), 16000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (settings.autoScene === 'off') return
    const delay = settings.autoScene === 'song' ? 999999999 : Number(settings.autoScene) * 1000
    if (delay > 100000000) return
    const timer = window.setInterval(() => {
      const index = scenes.findIndex((item) => item.id === sceneId)
      setSceneId(scenes[(index + 1) % scenes.length].id)
    }, delay)
    return () => window.clearInterval(timer)
  }, [sceneId, settings.autoScene])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await stageRef.current?.requestFullscreen?.()
    else await document.exitFullscreen?.()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select')) return
      if (event.key.toLowerCase() === 'h') setRecordMode((value) => !value)
      if (event.key.toLowerCase() === 'f') void toggleFullscreen()
      if (event.code === 'Space') {
        event.preventDefault()
        player.togglePlay()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const enterRecordMode = useCallback(async () => {
    setRecordMode(true)
    try {
      await stageRef.current?.requestFullscreen?.()
    } catch {
      // Full viewport mode remains available if browser fullscreen is denied.
    }
  }, [])

  const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }))

  function selectScene(next: Scene) {
    setSceneId(next.id)
    setDrawer(null)
    setNotice(`${next.name} dipilih`)
    window.setTimeout(() => setNotice(null), 1800)
  }

  function selectSong(song: Song) {
    player.playSong(song)
    setRecentSongs((current) => [song.id, ...current.filter((id) => id !== song.id)].slice(0, 12))
    setDrawer(null)
  }

  function toggleFavoriteScene(id: string) {
    setFavoriteScenes((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current])
  }

  function toggleFavoriteSong(id: string) {
    setFavoriteSongs((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current])
  }

  function randomScene() {
    const available = scenes.filter((item) => item.id !== sceneId)
    selectScene(available[Math.floor(Math.random() * available.length)] ?? scenes[0])
  }

  function handleUpload(file: File | undefined) {
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$|^video\/(mp4|webm)$/.test(file.type)) {
      setNotice('Gunakan JPG, PNG, WebP, MP4, atau WebM')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setNotice('File maksimal 8 MB agar tetap ringan')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCustomBackground({ src: String(reader.result), kind: file.type.startsWith('video/') ? 'video' : 'image', name: file.name })
      setDrawer(null)
      setNotice('Background pribadi aktif — hanya tersimpan di perangkat ini')
      window.setTimeout(() => setNotice(null), 2400)
    }
    reader.readAsDataURL(file)
  }

  function handleLyricsImport(file: File | undefined) {
    if (!file || !player.current) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const lines = file.name.toLowerCase().endsWith('.lrc') ? parseLrc(String(reader.result)) : parseLyricsJson(String(reader.result))
        if (!lines.length) throw new Error('empty')
        const key = `ruanghujan.lyrics.${player.current!.id}`
        writeJSON(key, lines)
        setNotice(`${lines.length} baris lirik berhasil diimpor`)
        window.setTimeout(() => setNotice(null), 2200)
      } catch {
        setNotice('Format lirik tidak dikenali. Gunakan JSON timestamp atau LRC.')
      }
    }
    reader.readAsText(file)
  }

  const visibleScenes = scenes.filter((item) => `${item.name} ${item.mood}`.toLowerCase().includes(sceneSearch.toLowerCase()))
  const visibleSongs = songs.filter((song) => {
    const searchMatch = `${song.title} ${song.artist} ${song.playlist}`.toLowerCase().includes(songSearch.toLowerCase())
    const tabMatch = libraryTab === 'all' || (libraryTab === 'favorites' && favoriteSongs.includes(song.id)) || (libraryTab === 'recent' && recentSongs.includes(song.id))
    return searchMatch && tabMatch
  })
  const sceneStyle = customBackground ? { backgroundImage: `url(${customBackground.src})` } : { backgroundImage: `url(${sceneAsset(scene)})` }
  const intensity = settings.lowPerformance ? Math.min(35, settings.rainIntensity) : settings.rainIntensity
  const rainDrops = Array.from({ length: settings.lowPerformance ? 28 : 76 }, (_, index) => index)

  return (
    <main className={`app-shell ${recordMode ? 'record-mode' : ''} ${settings.lowPerformance ? 'low-performance' : ''}`}>
      <div ref={stageRef} className={`cinema-stage aspect-${settings.aspect.replace(':', '-')}`} style={{ '--scene-brightness': settings.brightness, '--scene-zoom': settings.zoom } as CSSProperties}>
        <AnimatePresence mode="sync">
          <motion.div key={customBackground?.src ?? scene?.id} className="scene-layer active" style={sceneStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} />
        </AnimatePresence>
        {customBackground?.kind === 'video' ? <video className="scene-video" src={customBackground.src} autoPlay muted loop playsInline aria-label="Background video pribadi" /> : null}
        <div className="scene-overlay" />
        {settings.grain ? <div className="film-grain" /> : null}
        {settings.rain ? <div className="rain-layer" style={{ '--rain-opacity': intensity / 100 } as CSSProperties}>{rainDrops.map((drop) => <span key={drop} style={{ '--i': drop } as CSSProperties} />)}</div> : null}
        {settings.fog ? <div className="fog-layer" /> : null}
        {settings.dust ? <div className="dust-layer">{Array.from({ length: settings.lowPerformance ? 8 : 18 }, (_, index) => <span key={index} style={{ '--i': index } as CSSProperties} />)}</div> : null}
        {settings.glow ? <div className="light-glow" /> : null}

        <div className="youtube-holder" aria-hidden="true"><div ref={playerHolder} /></div>

        {!recordMode ? (
          <header className="cinema-topbar hide-in-record">
            <div className="brand-block"><p className="brand-name"><Moon size={20} fill="currentColor" /> Ruang Setelah Hujan</p><p className="brand-tagline">Untuk hati yang belum selesai...</p></div>
            <div className="top-actions">
              <button className="icon-button" type="button" onClick={() => setDrawer('moods')} aria-label="Mood"><MessageCircleHeart size={18} /></button>
              <button className="icon-button" type="button" onClick={() => toggleFavoriteScene(scene?.id ?? '')} aria-label="Favorite scene"><Heart size={18} fill={favoriteScenes.includes(scene?.id ?? '') ? 'currentColor' : 'none'} /></button>
              <button className="icon-button" type="button" onClick={toggleFullscreen} aria-label="Fullscreen"><Expand size={18} /></button>
              <button className="icon-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu"><Menu size={18} /></button>
            </div>
          </header>
        ) : null}

        <section className="cinema-copy" aria-label="Kata-kata malam">
          <AnimatePresence mode="wait"><motion.p key={shownQuote.id} className="aesthetic-quote" initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }} transition={{ duration: 0.8 }} style={{ fontSize: `${settings.quoteSize}rem` }}>{shownQuote.text}</motion.p></AnimatePresence>
        </section>

        <section className="lyric-stage" aria-live="polite">
          {sceneLines.length ? (
            <div className="lyric-stack">{sceneLines.slice(Math.max(0, activeLyric - 1), activeLyric + 3).map((line) => <p key={`${line.start}-${line.text}`} className={`lyric-line ${line === activeLine ? 'is-active' : ''}`} style={{ fontSize: `${settings.lyricsSize}rem` }}>{line.text}</p>)}</div>
          ) : (
            <p className="lyric-empty">Pilih lagu untuk mendengar kata-kata yang bergerak bersama waktu.</p>
          )}
        </section>

        <div className="scene-caption hide-in-record"><span>{customBackground?.name ?? scene?.name}</span><span className="caption-dot" /> <span>{scene?.mood}</span></div>

        {!recordMode ? (
          <>
            <div className="player-dock hide-in-record">
              <div className="timeline"><span>{formatTime(player.time)}</span><input type="range" min={0} max={player.duration || 1} value={Math.min(player.time, player.duration || 1)} onChange={(event) => player.seek(Number(event.target.value))} aria-label="Posisi lagu" /><span>{formatTime(player.duration)}</span></div>
              <div className="transport-row">
                <button className={`control-button subtle ${player.shuffle ? 'selected' : ''}`} type="button" onClick={player.toggleShuffle} aria-label="Shuffle"><Shuffle size={17} /></button>
                <button className="control-button" type="button" onClick={player.previous} aria-label="Previous"><SkipBack size={22} /></button>
                <button className="play-button" type="button" onClick={player.togglePlay} aria-label={player.playing ? 'Pause' : 'Play'}>{player.playing ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}</button>
                <button className="control-button" type="button" onClick={player.next} aria-label="Next"><SkipForward size={22} /></button>
                <button className={`control-button subtle ${player.repeat !== 'off' ? 'selected' : ''}`} type="button" onClick={player.cycleRepeat} aria-label="Repeat"><Repeat size={17} /></button>
              </div>
              <div className="now-playing"><button className="mini-cover" type="button" onClick={() => setDrawer('music')} aria-label="Buka music library"><Radio size={17} /></button><div className="track-meta"><strong>{player.current?.title ?? 'Satu Hari Nanti'}</strong><span>{player.current?.artist ?? 'Pilih lagu dari Music Library'}</span></div><div className="volume-control"><button className="icon-button" type="button" onClick={player.toggleMute} aria-label={player.muted ? 'Nyalakan suara' : 'Bisukan'}>{player.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button><input type="range" min={0} max={100} value={player.muted ? 0 : player.volume} onChange={(event) => player.setVolume(Number(event.target.value))} aria-label="Volume" /></div></div>
              {player.failed ? <button className="fallback-link" type="button" onClick={() => player.current && player.openYouTube(player.current)}>Pemutar gagal dimuat — buka lagu di YouTube</button> : null}
            </div>
            <div className="bottom-info hide-in-record"><div><span className="eyebrow">{player.current?.artist ?? 'RUANG SETELAH HUJAN'}</span><h2>{player.current?.title ?? 'Satu Hari Nanti'}</h2><p>{player.current ? `${player.current.playlist} · ${player.current.artist}` : 'Lagu tentang seseorang yang masih menunggu, meski tahu itu mustahil.'}</p></div><p className="handwritten">Karena pada akhirnya…<br />kita semua pernah menjadi seseorang yang menunggu.</p></div>
          </>
        ) : null}

        {menuOpen && !recordMode ? <div className="quick-menu hide-in-record"><button type="button" onClick={() => { setDrawer('scenes'); setMenuOpen(false) }}><SunMoon size={15} /> Scenes</button><button type="button" onClick={() => { setDrawer('music'); setMenuOpen(false) }}><ListMusic size={15} /> Music Library</button><button type="button" onClick={() => { setDrawer('settings'); setMenuOpen(false) }}><Settings2 size={15} /> Visual Settings</button><button type="button" onClick={() => { void enterRecordMode(); setMenuOpen(false) }}><Film size={15} /> Enter Cinematic Mode</button></div> : null}

        {!recordMode ? <div className="record-launch hide-in-record"><button type="button" onClick={() => void enterRecordMode()}><Film size={14} /> Enter Cinematic Mode</button></div> : null}
        {recordMode ? <button type="button" className="record-hotkey-hint" aria-label="Tekan H untuk menampilkan kontrol">H</button> : null}
      </div>

      <AnimatePresence>
        {drawer === 'scenes' ? <Drawer title="Scenes" onClose={() => setDrawer(null)}><div className="drawer-toolbar"><button type="button" className="soft-button" onClick={randomScene}><Shuffle size={14} /> Random Scene</button><label className="soft-button upload-button"><Upload size={14} /> Upload<input hidden type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => handleUpload(event.target.files?.[0])} /></label></div><div className="search-box"><Search size={15} /><input value={sceneSearch} onChange={(event) => setSceneSearch(event.target.value)} placeholder="Search scene..." /></div><div className="scene-list">{visibleScenes.map((item) => <article className={`scene-card ${item.id === scene?.id ? 'is-selected' : ''}`} key={item.id}><button type="button" className="scene-thumb" style={{ backgroundImage: `url(${sceneAsset(item)})` }} onClick={() => selectScene(item)} aria-label={`Pilih ${item.name}`}><span className="scene-mood">{item.mood}</span></button><div className="scene-card-copy"><div><strong>{item.name}</strong><p>{item.animation}</p></div><button className="tiny-favorite" type="button" onClick={() => toggleFavoriteScene(item.id)} aria-label="Favorite"><Heart size={15} fill={favoriteScenes.includes(item.id) ? 'currentColor' : 'none'} /></button></div></article>)}</div></Drawer> : null}
        {drawer === 'music' ? <Drawer title="Music Library" onClose={() => setDrawer(null)}><div className="search-box"><Search size={15} /><input value={songSearch} onChange={(event) => setSongSearch(event.target.value)} placeholder="Search songs, artist, playlist..." /></div><div className="tab-row"><button className={libraryTab === 'all' ? 'active' : ''} type="button" onClick={() => setLibraryTab('all')}>All</button><button className={libraryTab === 'favorites' ? 'active' : ''} type="button" onClick={() => setLibraryTab('favorites')}>Favorites</button><button className={libraryTab === 'recent' ? 'active' : ''} type="button" onClick={() => setLibraryTab('recent')}>Recently Played</button></div><div className="drawer-toolbar"><label className="soft-button upload-button"><Upload size={14} /> Import LRC/JSON<input hidden type="file" accept=".lrc,.json,application/json,text/plain" onChange={(event) => handleLyricsImport(event.target.files?.[0])} /></label></div><div className="song-list">{visibleSongs.map((song) => <article className={`song-row ${player.current?.id === song.id ? 'is-playing' : ''}`} key={song.id}><button type="button" className="song-play" onClick={() => selectSong(song)}>{player.current?.id === song.id && player.playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</button><button type="button" className="song-copy" onClick={() => selectSong(song)}><strong>{song.title}</strong><span>{song.artist} · {song.playlist}</span></button><button className="tiny-favorite" type="button" onClick={() => toggleFavoriteSong(song.id)} aria-label="Favorite song"><Heart size={15} fill={favoriteSongs.includes(song.id) ? 'currentColor' : 'none'} /></button></article>)}</div></Drawer> : null}
        {drawer === 'moods' ? <Drawer title="Mood Presets" onClose={() => setDrawer(null)}><p className="drawer-lead">Pilih suasana tanpa mengganti lagu yang sedang berputar.</p><div className="mood-list">{MOODS.map((item) => <button key={item.id} type="button" className={`mood-card ${mood === item.id ? 'is-selected' : ''}`} onClick={() => { setMood(item.id); const target = scenes.find((candidate) => candidate.id === item.scene); if (target) setSceneId(target.id); setDrawer(null) }}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.category}</small></button>)}</div></Drawer> : null}
        {drawer === 'settings' ? <Drawer title="Visual Settings" onClose={() => setDrawer(null)}><div className="settings-section"><p className="settings-title"><CloudRain size={14} /> Atmosphere</p><Toggle label="Rain" checked={settings.rain} onChange={() => updateSettings('rain', !settings.rain)} /><RangeSetting label="Rain Intensity" value={settings.rainIntensity} min={0} max={100} onChange={(value) => updateSettings('rainIntensity', value)} /><RangeSetting label="Rain Speed" value={settings.rainSpeed} min={0} max={100} onChange={(value) => updateSettings('rainSpeed', value)} /><Toggle label="Fog / Mist" checked={settings.fog} onChange={() => updateSettings('fog', !settings.fog)} /><Toggle label="Dust / Fireflies" checked={settings.dust} onChange={() => updateSettings('dust', !settings.dust)} /><Toggle label="Soft Glow" checked={settings.glow} onChange={() => updateSettings('glow', !settings.glow)} /><Toggle label="Film Grain" checked={settings.grain} onChange={() => updateSettings('grain', !settings.grain)} /><Toggle label="Parallax" checked={settings.parallax} onChange={() => updateSettings('parallax', !settings.parallax)} /></div><div className="settings-section"><p className="settings-title"><Settings2 size={14} /> Composition</p><label className="select-setting"><span>Aspect Ratio</span><select value={settings.aspect} onChange={(event) => updateSettings('aspect', event.target.value as Settings['aspect'])}><option value="9:16">9:16 · Reels / TikTok</option><option value="16:9">16:9 · YouTube</option><option value="1:1">1:1 · Feed</option></select></label><RangeSetting label="Background Zoom" value={Math.round(settings.zoom * 100)} min={100} max={125} suffix="%" onChange={(value) => updateSettings('zoom', value / 100)} /><RangeSetting label="Brightness" value={Math.round(settings.brightness * 100)} min={25} max={100} suffix="%" onChange={(value) => updateSettings('brightness', value / 100)} /><RangeSetting label="Lyrics Size" value={Math.round(settings.lyricsSize * 100)} min={75} max={150} suffix="%" onChange={(value) => updateSettings('lyricsSize', value / 100)} /><RangeSetting label="Quote Size" value={Math.round(settings.quoteSize * 100)} min={75} max={150} suffix="%" onChange={(value) => updateSettings('quoteSize', value / 100)} /></div><div className="settings-section"><p className="settings-title"><Clock3 size={14} /> Scene Automation</p><label className="select-setting"><span>Auto Change Scene</span><select value={settings.autoScene} onChange={(event) => updateSettings('autoScene', event.target.value as Settings['autoScene'])}><option value="off">Off</option><option value="song">Setiap lagu</option><option value="30">Setiap 30 detik</option><option value="60">Setiap 60 detik</option><option value="120">Setiap 120 detik</option></select></label><Toggle label="Visualizer" checked={settings.visualizer} onChange={() => updateSettings('visualizer', !settings.visualizer)} /><Toggle label="Low Performance Mode" checked={settings.lowPerformance} onChange={() => updateSettings('lowPerformance', !settings.lowPerformance)} /></div><div className="settings-shortcuts"><Info size={14} /><span><b>H</b> hide UI · <b>F</b> fullscreen · <b>Space</b> play/pause</span></div></Drawer> : null}
      </AnimatePresence>

      {notice ? <motion.div className="notice" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}</motion.div> : null}
    </main>
  )
}

export default App
