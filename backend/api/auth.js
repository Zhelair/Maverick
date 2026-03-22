import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

function getTier(passphrase) {
  const free = (process.env.FREE_PASSPHRASES || '').split(',').map(p => p.trim());
  const pro = (process.env.PRO_PASSPHRASES || '').split(',').map(p => p.trim());
  const max = (process.env.MAX_PASSPHRASES || '').split(',').map(p => p.trim());

  if (max.includes(passphrase)) return 'max';
  if (pro.includes(passphrase)) return 'pro';
  if (free.includes(passphrase)) return 'free';
  return null;
}

router.post('/auth', (req, res) => {
  const { passphrase } = req.body;

  if (!passphrase) {
    return res.status(400).json({ success: false, error: 'Passphrase required' });
  }

  const tier = getTier(passphrase);

  if (!tier) {
    return res.status(401).json({ success: false, error: 'Invalid passphrase' });
  }

  const token = jwt.sign(
    { tier, iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ success: true, token, tier, expiresIn: 604800 });
});

export default router;
