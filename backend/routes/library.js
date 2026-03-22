import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getLibrary, upsertLibrary, hashPassphrase } from '../utils/supabase.js';

const router = express.Router();

function getHash(req) {
  const passphrase = req.headers['x-passphrase'];
  if (!passphrase) throw new Error('No passphrase header');
  return hashPassphrase(passphrase);
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const hash = getHash(req);
    const library = await getLibrary(hash);
    return res.json({ success: true, ...library });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const hash = getHash(req);
    const { tracks, playlists } = req.body;
    await upsertLibrary(hash, tracks, playlists);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
