const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getHeaders(token, passphrase) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (passphrase) h['X-Passphrase'] = passphrase;
  return h;
}

export async function authenticate(passphrase) {
  const res = await fetch(`${API}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passphrase }),
  });
  return res.json();
}

export async function fetchInfo(url, token, passphrase) {
  const res = await fetch(`${API}/api/info`, {
    method: 'POST',
    headers: getHeaders(token, passphrase),
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function downloadTrack(url, token, passphrase) {
  const res = await fetch(`${API}/api/download`, {
    method: 'POST',
    headers: getHeaders(token, passphrase),
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(err.error);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition') || '';
  const match = contentDisposition.match(/filename="(.+?)"/);
  const filename = match ? match[1] : 'audio.mp3';

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export function getPreviewUrl(url, token, passphrase) {
  const params = new URLSearchParams({ url });
  return `${API}/api/preview?${params}&token=${encodeURIComponent(token)}&passphrase=${encodeURIComponent(passphrase)}`;
}

export async function fetchPreviewBlob(url, token, passphrase) {
  const res = await fetch(`${API}/api/preview`, {
    method: 'POST',
    headers: getHeaders(token, passphrase),
    body: JSON.stringify({ url }),
  });

  if (!res.ok) throw new Error('Preview failed');
  return URL.createObjectURL(await res.blob());
}

export async function fetchLibrary(token, passphrase) {
  const res = await fetch(`${API}/api/library`, {
    headers: getHeaders(token, passphrase),
  });
  return res.json();
}

export async function saveLibrary(token, passphrase, tracks, playlists) {
  const res = await fetch(`${API}/api/library`, {
    method: 'PUT',
    headers: getHeaders(token, passphrase),
    body: JSON.stringify({ tracks, playlists }),
  });
  return res.json();
}
