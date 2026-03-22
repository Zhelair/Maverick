import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validateURL } from '../utils/validation.js';
import { getMetadata } from '../utils/ytdlp.js';

const router = express.Router();

router.post('/info', verifyToken, async (req, res) => {
  const { url } = req.body;

  const validation = validateURL(url);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  try {
    const metadata = await getMetadata(url);
    return res.json({ success: true, metadata });
  } catch (err) {
    console.error('Info error:', err.message);
    return res.status(500).json({ success: false, error: 'Could not fetch track info' });
  }
});

export default router;
