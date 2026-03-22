import express from 'express';
import { v4 as uuid } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { validateURL } from '../utils/validation.js';
import { downloadAudio, getMetadata } from '../utils/ytdlp.js';
import { encodeMP3 } from '../utils/ffmpeg.js';
import { cleanup } from '../utils/cleanup.js';
import { addTrack, hashPassphrase } from '../utils/supabase.js';

const router = express.Router();

function sanitizeFilename(name) {
  return name.replace(/[^\w\s\-().]/g, '').trim().slice(0, 200) || 'audio';
}

router.post('/download', verifyToken, async (req, res) => {
  const { url } = req.body;

  const validation = validateURL(url);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const jobId = uuid();
  const tempDir = `/tmp/maverick-dl-${jobId}`;

  try {
    const [metadata, rawPath] = await Promise.all([
      getMetadata(url),
      downloadAudio(url, tempDir)
    ]);

    const mp3Path = `${tempDir}/output.mp3`;
    await encodeMP3(rawPath, mp3Path, '320');

    const filename = sanitizeFilename(`${metadata.artist} - ${metadata.title}`) + '.mp3';

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const { createReadStream } = await import('fs');
    const stream = createReadStream(mp3Path);
    stream.pipe(res);
    stream.on('end', async () => {
      await cleanup(tempDir);

      // Save to library
      try {
        const passphrase = req.headers['x-passphrase'];
        if (passphrase) {
          const hash = hashPassphrase(passphrase);
          await addTrack(hash, {
            id: uuid(),
            ...metadata,
            downloadedAt: new Date().toISOString(),
          });
        }
      } catch (libErr) {
        console.error('Library save error:', libErr.message);
      }
    });
    stream.on('error', () => cleanup(tempDir));
  } catch (err) {
    await cleanup(tempDir);
    console.error('Download error:', err.message);
    return res.status(500).json({ success: false, error: 'Download failed: ' + err.message });
  }
});

export default router;
