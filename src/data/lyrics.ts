import type { LyricsDocument, LyricsLine, LrcImportResult, SongId } from '../types'

/**
 * Demo-only lines are intentionally original placeholders, not transcriptions
 * of any recording. Replace them with a user's own LRC import when available.
 */
export const lyricsBySong: Record<string, LyricsLine[]> = {
  'rindu-yang-tidak-selesai-sesi-potret': [
    { start: 0, end: 6, text: 'Demo: malam menyimpan cahaya yang pelan.' },
    { start: 6, end: 12, text: 'Kita belajar rindu tanpa mengetuk pintu.' },
    { start: 12, end: 18, text: 'Hujan menghapus jejak, bukan cerita.' },
    { start: 18, end: 24, text: 'Tarik napas; halaman baru menunggu.' },
  ],
  'rindu-yang-tidak-selesai-serana': [
    { start: 0, end: 6, text: 'Demo: sisa suara berdiam di jendela.' },
    { start: 6, end: 12, text: 'Jarak membuat sunyi terdengar dekat.' },
    { start: 12, end: 18, text: 'Kita tidak hilang, hanya berubah arah.' },
    { start: 18, end: 24, text: 'Pagi akan datang dengan nama yang baru.' },
  ],
  'rindu-yang-tidak-selesai-museum-duka': [
    { start: 0, end: 6, text: 'Demo: kenangan duduk di kursi paling tenang.' },
    { start: 6, end: 12, text: 'Debu waktu menutup bingkai yang lama.' },
    { start: 12, end: 18, text: 'Yang pergi boleh tinggal sebagai pelajaran.' },
    { start: 18, end: 24, text: 'Hari ini kita menyalakan lampu sendiri.' },
  ],
  'rindu-yang-tidak-selesai-jakarta-hari-ini': [
    { start: 0, end: 6, text: 'Demo: jalan ramai, hati berjalan pelan.' },
    { start: 6, end: 12, text: 'Lampu kota memantulkan wajah yang berani.' },
    { start: 12, end: 18, text: 'Tidak semua pulang harus menuju tempat lama.' },
    { start: 18, end: 24, text: 'Kita tiba ketika siap menerima diri.' },
  ],
  'rindu-yang-tidak-selesai-penyangkalan': [
    { start: 0, end: 6, text: 'Demo: kata yang tertahan mencari udara.' },
    { start: 6, end: 12, text: 'Di kaca, bayangan mengajarkan kejujuran.' },
    { start: 12, end: 18, text: 'Mengaku sedih bukan berarti kalah.' },
    { start: 18, end: 24, text: 'Pelan-pelan, dada kembali punya ruang.' },
  ],
  'bahagia-yang-hilang-bahagia-lagi': [
    { start: 0, end: 6, text: 'Demo: tawa kecil tumbuh dari sela luka.' },
    { start: 6, end: 12, text: 'Hari baik tidak selalu datang dengan ramai.' },
    { start: 12, end: 18, text: 'Secangkir hangat pun cukup untuk memulai.' },
    { start: 18, end: 24, text: 'Bahagia boleh sederhana dan milik sendiri.' },
  ],
  'bahagia-yang-hilang-sadrah': [
    { start: 0, end: 6, text: 'Demo: kita menata ulang meja yang miring.' },
    { start: 6, end: 12, text: 'Tidak ada musim yang menetap selamanya.' },
    { start: 12, end: 18, text: 'Langkah kecil tetap membawa kita maju.' },
    { start: 18, end: 24, text: 'Besok, cahaya tahu harus jatuh di mana.' },
  ],
  'bahagia-yang-hilang-duka': [
    { start: 0, end: 6, text: 'Demo: duka menulis namanya di telapak tangan.' },
    { start: 6, end: 12, text: 'Kita membacanya tanpa memanggil kembali.' },
    { start: 12, end: 18, text: 'Air mata punya cara sendiri untuk reda.' },
    { start: 18, end: 24, text: 'Dari lembutnya sunyi, keberanian pulang.' },
  ],
  'bahagia-yang-hilang-diary-depresiku': [
    { start: 0, end: 6, text: 'Demo: halaman kosong tidak meminta sempurna.' },
    { start: 6, end: 12, text: 'Tuliskan satu alasan untuk bertahan hari ini.' },
    { start: 12, end: 18, text: 'Jika lelah, berhenti juga bagian perjalanan.' },
    { start: 18, end: 24, text: 'Namamu tetap layak disebut dengan lembut.' },
  ],
  'malam-paling-sepi-secukupnya': [
    { start: 0, end: 6, text: 'Demo: malam meminta kita cukup untuk malam ini.' },
    { start: 6, end: 12, text: 'Tidak perlu menjawab semua pertanyaan.' },
    { start: 12, end: 18, text: 'Napas yang kembali adalah kabar baik.' },
    { start: 18, end: 24, text: 'Besok masih menyimpan pintu yang terbuka.' },
  ],
  'malam-paling-sepi-runtuh': [
    { start: 0, end: 6, text: 'Demo: bila runtuh, biarkan tanah memeluk.' },
    { start: 6, end: 12, text: 'Akar tumbuh dalam gelap sebelum tampak.' },
    { start: 12, end: 18, text: 'Kita boleh rapuh tanpa kehilangan arah.' },
    { start: 18, end: 24, text: 'Pelukan pertama adalah pada diri sendiri.' },
  ],
  'malam-paling-sepi-bertaut': [
    { start: 0, end: 6, text: 'Demo: yang mengikat bukan jarak, melainkan makna.' },
    { start: 6, end: 12, text: 'Kenangan hangat tidak harus kembali.' },
    { start: 12, end: 18, text: 'Ia cukup menjadi cahaya saat ragu.' },
    { start: 18, end: 24, text: 'Kita berjalan dengan hati yang lebih luas.' },
  ],
  'malam-paling-sepi-hati-hati-di-jalan': [
    { start: 0, end: 6, text: 'Demo: pelankan langkah ketika jalan berkabut.' },
    { start: 6, end: 12, text: 'Arah terbaik kadang muncul setelah tersesat.' },
    { start: 12, end: 18, text: 'Jaga hati, tetapi jangan menguncinya.' },
    { start: 18, end: 24, text: 'Dunia masih punya tempat untuk lembutmu.' },
  ],
  'malam-paling-sepi-tak-segampang-itu': [
    { start: 0, end: 6, text: 'Demo: mudah berkata selesai, sulit menjalaninya.' },
    { start: 6, end: 12, text: 'Namun setiap pagi mengurangi satu beban.' },
    { start: 12, end: 18, text: 'Kita tidak harus cepat untuk tetap tumbuh.' },
    { start: 18, end: 24, text: 'Yang penting, langkah ini benar-benar milikmu.' },
  ],
  'malam-paling-sepi-usai': [
    { start: 0, end: 6, text: 'Demo: usai badai, warna langit lebih jujur.' },
    { start: 6, end: 12, text: 'Sisa air di daun memantulkan keberanian.' },
    { start: 12, end: 18, text: 'Tidak semua akhir perlu diberi penjelasan.' },
    { start: 18, end: 24, text: 'Cukup rasakan lega yang datang perlahan.' },
  ],
  'malam-paling-sepi-pesan-terakhir': [
    { start: 0, end: 6, text: 'Demo: pesan terakhir adalah doa untuk diri.' },
    { start: 6, end: 12, text: 'Semoga yang hilang tidak membuatmu hilang.' },
    { start: 12, end: 18, text: 'Semoga sunyi mengembalikan suaramu.' },
    { start: 18, end: 24, text: 'Semoga pulang selalu terasa mungkin.' },
  ],
  'malam-paling-sepi-mungkin-nanti': [
    { start: 0, end: 6, text: 'Demo: mungkin nanti, luka menjadi peta.' },
    { start: 6, end: 12, text: 'Kita mengenang tanpa kembali meminta.' },
    { start: 12, end: 18, text: 'Hari berubah ketika kita berani berubah.' },
    { start: 18, end: 24, text: 'Untuk sekarang, biarkan malam menemani.' },
  ],
  'malam-paling-sepi-cinta-dan-rahasia': [
    { start: 0, end: 6, text: 'Demo: beberapa rasa tumbuh di balik diam.' },
    { start: 6, end: 12, text: 'Rahasia paling lembut adalah memaafkan.' },
    { start: 12, end: 18, text: 'Cinta juga bisa berbentuk jarak yang sehat.' },
    { start: 18, end: 24, text: 'Kita saling baik, meski tidak lagi bersama.' },
  ],
}

export const demoLyricsBySongId: Record<string, LyricsDocument> = Object.fromEntries(
  Object.entries(lyricsBySong).map(([songId, lines]) => [
    songId,
    {
      id: `demo-${songId}`,
      songId: songId as SongId,
      source: 'demo' as const,
      offsetMs: 0,
      metadata: { note: 'Original placeholder lines; import an LRC file for real lyrics.' },
      lines,
    },
  ]),
) as Record<string, LyricsDocument>

export const demoLyrics: LyricsDocument = demoLyricsBySongId['rindu-yang-tidak-selesai-sesi-potret']

function parseTimestamp(minutes: string, seconds: string, fraction = ''): number {
  const fractionalSeconds = fraction.length === 1 ? Number(fraction) / 10 : fraction.length === 2 ? Number(fraction) / 100 : Number(fraction) / 1000
  return Number(minutes) * 60 + Number(seconds) + fractionalSeconds
}

function makeDocumentId(): string {
  return `lrc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Parse standard LRC timestamps, including lines with multiple timestamps. */
export function parseLrc(
  input: string,
  options: Partial<Pick<LyricsDocument, 'id' | 'songId' | 'title' | 'artist'>> = {},
): LrcImportResult {
  const warnings: string[] = []
  const metadata: Record<string, string> = {}
  let offsetMs = 0
  const parsed: Array<{ start: number; text: string; order: number }> = []
  const timestampPattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g

  input.split(/\r?\n/).forEach((rawLine, order) => {
    const line = rawLine.trim()
    if (!line) return

    const metadataMatch = line.match(/^\[([a-zA-Z]+):([^\]]*)\]$/)
    if (metadataMatch && !/^\d/.test(metadataMatch[1])) {
      const [, key, value] = metadataMatch
      if (key.toLowerCase() === 'offset') {
        const parsedOffset = Number(value)
        if (Number.isFinite(parsedOffset)) offsetMs = parsedOffset
        else warnings.push(`Offset LRC tidak valid: ${value}`)
      } else {
        metadata[key.toLowerCase()] = value.trim()
      }
      return
    }

    const timestamps = [...line.matchAll(timestampPattern)]
    if (timestamps.length === 0) {
      warnings.push(`Baris tanpa timestamp diabaikan: ${line}`)
      return
    }

    const text = line.replace(timestampPattern, '').trim()
    timestamps.forEach((match) => {
      const [, minutes, seconds, fraction = ''] = match
      parsed.push({ start: parseTimestamp(minutes, seconds, fraction), text, order })
    })
  })

  parsed.sort((a, b) => a.start - b.start || a.order - b.order)
  const lines: LyricsLine[] = parsed.map((line, index) => {
    const start = Math.max(0, line.start + offsetMs / 1000)
    const next = parsed[index + 1]
    const nextStart = next ? Math.max(0, next.start + offsetMs / 1000) : start + 5
    return { start, end: Math.max(start, nextStart), text: line.text }
  })

  if (lines.length === 0) warnings.push('Tidak ada baris lirik bertimestamp yang ditemukan.')

  const document: LyricsDocument = {
    id: options.id ?? makeDocumentId(),
    songId: options.songId,
    title: options.title ?? metadata.ti,
    artist: options.artist ?? metadata.ar,
    source: 'lrc-import',
    offsetMs,
    metadata,
    lines,
    importedAt: new Date().toISOString(),
  }

  return { document, warnings }
}

export const importLrc = parseLrc

export function getActiveLyricIndex(lines: LyricsLine[], seconds: number): number {
  if (!lines.length || !Number.isFinite(seconds)) return -1
  const index = lines.findIndex((line) => seconds >= line.start && seconds < line.end)
  if (index >= 0) return index
  return seconds >= lines[lines.length - 1].start ? lines.length - 1 : -1
}

export function formatLrcTimestamp(seconds: number): string {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds - minutes * 60
  return `[${minutes.toString().padStart(2, '0')}:${remainder.toFixed(2).padStart(5, '0')}]`
}
