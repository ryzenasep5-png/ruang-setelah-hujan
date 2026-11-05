import type { Song } from '../types'

function youtube(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

function search(title: string, artist: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} Official`)}`
}

const sourceSongs: Array<[
  title: string,
  artist: string,
  playlist: string,
  videoId: string,
]> = [
  ['Sesi Potret', 'eńau feat. Ari Lesmana', 'Rindu yang Tidak Selesai', 'Nskf70DMR60'],
  ['Serana', 'For Revenge', 'Rindu yang Tidak Selesai', 'nwNs_xzenFk'],
  ['Museum Duka', 'For Revenge', 'Rindu yang Tidak Selesai', '9oItuvvo8H0'],
  ['Jakarta Hari Ini', 'For Revenge', 'Rindu yang Tidak Selesai', 'QgiZVuQUoHo'],
  ['Penyangkalan', 'For Revenge', 'Rindu yang Tidak Selesai', 'yd1bQpQLcoY'],
  ['Bahagia Lagi', 'Bahagia Lagi', 'Bahagia yang Hilang', 'liVmYVkSV1M'],
  ['Sadrah', 'For Revenge', 'Bahagia yang Hilang', '3vC3n7Wvnwc'],
  ['Duka', 'Last Child', 'Bahagia yang Hilang', '8zwz2fVgfVM'],
  ['Diary Depresiku', 'Last Child', 'Bahagia yang Hilang', 'aGXVzK3byIM'],
  ['Secukupnya', 'Hindia', 'Malam Paling Sepi', 'wnAKxtEi78c'],
  ['Runtuh', 'Feby Putri feat. Fiersa Besari', 'Malam Paling Sepi', 'FXfqLUuVBis'],
  ['Bertaut', 'Nadin Amizah', 'Malam Paling Sepi', 'HyhLsy6b0XI'],
  ['Hati-Hati di Jalan', 'Tulus', 'Malam Paling Sepi', '9II3OGZETo4'],
  ['Tak Segampang Itu', 'Anggi Marito', 'Malam Paling Sepi', '6NsiA6GFAbU'],
  ['Usai', 'Tiara Andini', 'Malam Paling Sepi', '83ntBBDC8Xs'],
  ['Pesan Terakhir', 'Lyodra', 'Malam Paling Sepi', 'oaFj0lRi3gw'],
  ['Mungkin Nanti', 'Peterpan', 'Malam Paling Sepi', 'SWcMwUySDvI'],
  ['Cinta dan Rahasia', 'Yura Yunita feat. Glenn Fredly', 'Malam Paling Sepi', 'qhn0Hi97CoA'],
]

export const songs: Song[] = sourceSongs.map(([title, artist, playlist, videoId]) => ({
  id: `${playlist}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  artist,
  playlist,
  videoId,
  searchLink: search(title, artist),
  youtubeUrl: youtube(videoId),
  thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  verified: true,
}))

export const SONGS = songs

export function getSongById(id: string): Song | undefined {
  return songs.find((song) => song.id === id)
}

export function getSongsByPlaylist(playlist: string): Song[] {
  return songs.filter((song) => song.playlist === playlist)
}
