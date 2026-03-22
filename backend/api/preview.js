import express from 'express';
import { v4 as uuid } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { validateURL } from '../utils/validation.js';
import { downloadPreview } from '../utils/ytdlp.js';
import { encodePreviewMP3 } from '../utils/ffmpeg.js';
import { cleanup, cleanupAfterDelay } from '../utils/cleanup.js';

const router = express.Router();

router.post('/preview', verifyToken, async (req, res) => {
  const { url } = req.body;

  const validation = validateURL(url);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const jobId = uuid();
  const tempDir = `/tmp/maverick-preview-${jobId}`;

  try {
    const rawPath = await downloadPreview(url, tempDir);
    const mp3Path = `${tempDir}/preview.mp3`;
    await encodePreviewMP3(rawPath, mp3Path);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="preview.mp3"');
    res.setHeader('Cache-Control', 'no-store');

    const { createReadStream } = await import('fs');
    const stream = createReadStream(mp3Path);
    stream.pipe(res);
    stream.on('end', () => cleanup(tempDir));
    stream.on('error', () => cleanup(tempDir));
  } catch (err) {
    await cleanup(tempDir);
    console.error('Preview error:', err.message);
    return res.status(500).json({ success: false, error: 'Preview failed' });
  }
});

export default router;
