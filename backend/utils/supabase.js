import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let _client = null;

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _client;
}

export function hashPassphrase(passphrase) {
  return crypto.createHash('sha256').update(passphrase + 'maverick-salt').digest('hex');
}

export async function getLibrary(passphraseHash) {
  const { data, error } = await getClient()
    .from('library')
    .select('tracks, playlists, updated_at')
    .eq('passphrase_hash', passphraseHash)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || { tracks: [], playlists: [] };
}

export async function upsertLibrary(passphraseHash, tracks, playlists) {
  const { error } = await getClient()
    .from('library')
    .upsert({
      passphrase_hash: passphraseHash,
      tracks,
      playlists,
      updated_at: new Date().toISOString()
    }, { onConflict: 'passphrase_hash' });

  if (error) throw error;
}

export async function addTrack(passphraseHash, track) {
  const library = await getLibrary(passphraseHash);
  const tracks = [track, ...library.tracks].slice(0, 500);
  await upsertLibrary(passphraseHash, tracks, library.playlists);
  return tracks;
}
