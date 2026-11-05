# RUANG SETELAH HUJAN

> Untuk hati yang belum selesai.

RUANG SETELAH HUJAN adalah pengalaman musik audiovisual cinematic: scene malam, hujan, kabut,
film grain, kata-kata original, lyric timeline, dan pemutar YouTube resmi dalam satu ruang yang
bisa dipakai untuk mendengarkan maupun merekam komposisi vertikal.

## Fitur yang tersedia

- 12 scene cinematic original (JPG + WebP), crossfade saat berganti.
- Scene drawer: search, random scene, favorite scene, upload JPG/PNG/WebP/MP4/WebM lokal.
- Atmospheric controls: rain, intensity, speed, fog, dust/fireflies, glow, grain, parallax.
- Low Performance Mode dan reduced-motion support.
- Music Library dengan 18 video YouTube resmi/terverifikasi, search, favorite, recently played,
  shuffle, repeat, previous, next, dan fallback buka YouTube.
- YouTube IFrame API: playback hanya mulai setelah interaksi pengguna; tidak ada autoplay halaman.
- Timestamped lyrics dari demo original non-lirik lagu berhak cipta; import LRC/JSON milik pengguna.
- Lyrics aktif mengikuti `currentTime` yang dibaca dari YouTube API; seek langsung menyesuaikan.
- 156 kata-kata aesthetic original Indonesia dalam 12 kategori.
- Mood presets tanpa mengganti lagu.
- Cinematic Record Mode: menyembunyikan UI, mencoba Fullscreen API, shortcut `H` / `F` / `Space`.
- Komposisi `9:16`, `16:9`, dan `1:1`; default `9:16` untuk Reels/TikTok.
- Pengaturan lokal via `localStorage`; file background pengguna tidak diunggah ke server.

> Demo lyric lines sengaja original dan diberi label demo. Jangan mengklaim lirik tersinkron bila
> timestamp lirik lagu belum diverifikasi atau belum diimpor oleh pengguna.

## Local development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## Generate scene artwork

Scene artwork dibuat prosedural dari bentuk, gradient, glow, hujan, dan grain; tidak menyalin
gambar anime atau foto berhak cipta.

```bash
python3 -m pip install pillow
python3 scripts/generate-scenes.py
```

Script menghasilkan `public/scenes/scene-01..12.jpg` dan `.webp`.

## Deployment

`netlify.toml` memakai:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback `/* → /index.html`

GitHub Actions di `.github/workflows/deploy.yml` menjalankan lint, test, build, lalu deploy
production jika secret berikut tersedia:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Credential tidak disimpan di source code.

## Struktur penting

```text
src/
  App.tsx                 # cinematic stage + drawers + record mode
  data/scenes.ts          # 12 scene preset
  data/songs.ts           # verified YouTube songs
  data/lyrics.ts          # demo timeline + LRC parser
  data/quotes.ts          # 156 original quotes
  lib/storage.ts          # safe namespaced localStorage
scripts/
  generate-scenes.py      # procedural scene artwork
public/scenes/            # generated scene images
```
