import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRouter from './api/auth.js';
import infoRouter from './api/info.js';
import previewRouter from './api/preview.js';
import downloadRouter from './api/download.js';
import libraryRouter from './routes/library.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded. Try again later.' }
});

app.use('/api', limiter);
app.use('/api', authRouter);
app.use('/api', infoRouter);
app.use('/api', previewRouter);
app.use('/api', downloadRouter);
app.use('/api/library', libraryRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Maverick' }));

app.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));

app.listen(PORT, () => console.log(`Maverick backend running on port ${PORT}`));
