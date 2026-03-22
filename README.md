# ≋ Maverick - Universal Audio Downloader

Download audio from YouTube, SoundCloud, TikTok & more in 320kbps MP3.

**Web app + Chrome extension. Private, open-source, no tracking.**

---

## Features

- Download from YouTube, SoundCloud, TikTok, Instagram, Twitter, VK, Bandcamp & more
- 320kbps MP3 quality
- 15-second audio preview before downloading
- Personal music library synced across all devices (via Supabase)
- Custom playlists with genre tags
- Export tracklist as TXT / JSON
- 3 themes: Daylight / Nighttime / Neon
- 3 languages: English / Russian / Bulgarian
- Passphrase auth with Free / Pro / Max tiers
- Chrome extension with auto-detect current tab URL
- Fully responsive (mobile, tablet, desktop)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Tailwind CSS + Vite |
| Backend | Node.js + Express |
| Audio | yt-dlp + FFmpeg |
| Database | Supabase (free tier) |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| Extension | Chrome Manifest v3 |

---

## Setup

### Prerequisites

- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed on your system
- A [Railway](https://railway.app) account (backend)
- A [Vercel](https://vercel.com) account (frontend)
- A [Supabase](https://supabase.com) project (database)

---

### 1. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run `supabase/schema.sql`
3. Copy your Project URL and Service Role Key

---

### 2. Backend Setup (Railway)

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your values
npm run dev
```

**Environment variables to set in Railway:**

```
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
FREE_PASSPHRASES=pass1,pass2
PRO_PASSPHRASES=pass3,pass4
MAX_PASSPHRASES=pass5,pass6
JWT_SECRET=your-random-64-char-string
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Make sure `yt-dlp` is available in Railway's PATH:
- Add a start command: `pip install yt-dlp && node index.js`
- Or use a Dockerfile with yt-dlp pre-installed (see `Dockerfile.example`)

---

### 3. Frontend Setup (Vercel)

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL to your Railway backend URL
npm run dev
```

**Environment variables in Vercel:**

```
VITE_API_URL=https://your-backend.railway.app
```

---

### 4. Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `chrome-extension/` folder
4. Update `chrome-extension/popup.js`:
   - Set `API` to your Railway backend URL
   - Set `WEBAPP` to your Vercel frontend URL

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth` | POST | Verify passphrase, get JWT |
| `/api/info` | POST | Fetch track metadata |
| `/api/preview` | POST | Stream 15-second preview |
| `/api/download` | POST | Download full 320kbps MP3 |
| `/api/library` | GET | Fetch user's library |
| `/api/library` | PUT | Save user's library |
| `/health` | GET | Health check |

---

## Legal

This tool is for **personal use only** — downloading content you own, public domain material, or content you have rights to. Users are responsible for respecting copyright and platform terms of service.

---

## Support Development

If you find this useful:

- GitHub Sponsors: *(link)*
- Ko-fi: *(link)*

---

## License

MIT — do whatever you want, no warranties.
