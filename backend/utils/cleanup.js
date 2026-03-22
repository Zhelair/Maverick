import { promises as fs } from 'fs';

export async function cleanup(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
}

export function cleanupAfterDelay(dir, delayMs = 600000) {
  setTimeout(() => cleanup(dir), delayMs);
}
