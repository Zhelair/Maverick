import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';

function sanitizeArg(arg) {
  return arg.replace(/['"\\]/g, '');
}

export async function getMetadata(url) {
  const safeUrl = sanitizeArg(url);
  const { stdout } = await execAsync(
    `${YTDLP} --dump-json --no-playlist "${safeUrl}"`,
    { maxBuffer: 5 * 1024 * 1024, timeout: 30000 }
  );

  const data = JSON.parse(stdout);

  return {
    title: data.title || 'Unknown Title',
    artist: data.uploader || data.artist || data.channel || 'Unknown Artist',
    duration: formatDuration(data.duration),
    thumbnail: data.thumbnail || null,
    platform: detectPlatform(data.webpage_url || url),
    sourceUrl: url,
    bitrate: '320kbps',
  };
}

export async function downloadAudio(url, outputDir) {
  const safeUrl = sanitizeArg(url);
  await fs.mkdir(outputDir, { recursive: true });

  const { stderr } = await execAsync(
    `${YTDLP} -f bestaudio --no-playlist -o "${outputDir}/audio.%(ext)s" "${safeUrl}"`,
    { maxBuffer: 10 * 1024 * 1024, timeout: 300000 }
  );

  if (stderr && stderr.includes('ERROR')) {
    throw new Error(stderr);
  }

  const files = await fs.readdir(outputDir);
  const audio = files.find(f => f.startsWith('audio.'));
  if (!audio) throw new Error('Download failed - no output file');

  return `${outputDir}/${audio}`;
}

export async function downloadPreview(url, outputDir) {
  const safeUrl = sanitizeArg(url);
  await fs.mkdir(outputDir, { recursive: true });

  await execAsync(
    `${YTDLP} -f bestaudio --no-playlist --download-sections "*30-45" -o "${outputDir}/preview.%(ext)s" "${safeUrl}"`,
    { maxBuffer: 10 * 1024 * 1024, timeout: 60000 }
  );

  const files = await fs.readdir(outputDir);
  const preview = files.find(f => f.startsWith('preview.'));
  if (!preview) throw new Error('Preview extraction failed');

  return `${outputDir}/${preview}`;
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('vk.com')) return 'vk';
  if (url.includes('bandcamp.com')) return 'bandcamp';
  return 'other';
}
