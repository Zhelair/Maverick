const API = 'https://your-railway-backend.railway.app'; // Update after deploy
const WEBAPP = 'https://your-app.vercel.app'; // Update after deploy

// --- State ---
let authToken = null;
let authPassphrase = null;
let currentMetadata = null;

// --- Elements ---
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const passphraseInput = document.getElementById('passphrase-input');
const loginBtn = document.getElementById('login-btn');
const loginStatus = document.getElementById('login-status');
const urlInput = document.getElementById('url-input');
const useTabBtn = document.getElementById('use-tab-btn');
const metadataArea = document.getElementById('metadata-area');
const downloadStatus = document.getElementById('download-status');
const getInfoBtn = document.getElementById('get-info-btn');
const downloadBtn = document.getElementById('download-btn');
const openWebapp = document.getElementById('open-webapp');
const logoutBtn = document.getElementById('logout-btn');
const tierDisplay = document.getElementById('tier-display');
const tierLabel = document.getElementById('tier-label');

// --- Init ---
chrome.storage.local.get(['maverick_token', 'maverick_passphrase', 'maverick_tier'], (data) => {
  if (data.maverick_token) {
    authToken = data.maverick_token;
    authPassphrase = data.maverick_passphrase;
    showApp(data.maverick_tier);
  } else {
    showLogin();
  }
});

// --- Login ---
loginBtn.addEventListener('click', doLogin);
passphraseInput.addEventListener('keydown', e => e.key === 'Enter' && doLogin());

async function doLogin() {
  const pass = passphraseInput.value.trim();
  if (!pass) { setStatus(loginStatus, 'Enter a passphrase', 'error'); return; }

  loginBtn.disabled = true;
  setStatus(loginStatus, 'Verifying...', 'info');

  try {
    const res = await fetch(`${API}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase: pass })
    });
    const data = await res.json();

    if (data.success) {
      authToken = data.token;
      authPassphrase = pass;
      chrome.storage.local.set({
        maverick_token: data.token,
        maverick_passphrase: pass,
        maverick_tier: data.tier
      });
      showApp(data.tier);
    } else {
      setStatus(loginStatus, 'Invalid passphrase', 'error');
    }
  } catch {
    setStatus(loginStatus, 'Connection error. Check backend URL.', 'error');
  } finally {
    loginBtn.disabled = false;
  }
}

// --- App ---
useTabBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      urlInput.value = tabs[0].url;
      metadataArea.innerHTML = '';
      downloadBtn.style.display = 'none';
      getInfoBtn.style.display = 'block';
    }
  });
});

getInfoBtn.addEventListener('click', doGetInfo);
urlInput.addEventListener('keydown', e => e.key === 'Enter' && doGetInfo());

async function doGetInfo() {
  const url = urlInput.value.trim();
  if (!url) { setStatus(downloadStatus, 'Enter a URL', 'error'); return; }

  getInfoBtn.disabled = true;
  getInfoBtn.textContent = 'Fetching...';
  metadataArea.innerHTML = '';
  downloadBtn.style.display = 'none';
  clearStatus(downloadStatus);

  try {
    const res = await fetch(`${API}/api/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Passphrase': authPassphrase
      },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (data.success) {
      currentMetadata = { ...data.metadata, sourceUrl: url };
      renderMetadata(data.metadata);
      downloadBtn.style.display = 'block';
    } else {
      setStatus(downloadStatus, data.error || 'Failed to fetch info', 'error');
    }
  } catch {
    setStatus(downloadStatus, 'Network error', 'error');
  } finally {
    getInfoBtn.disabled = false;
    getInfoBtn.textContent = 'Get Track Info';
  }
}

downloadBtn.addEventListener('click', doDownload);

async function doDownload() {
  if (!currentMetadata) return;
  downloadBtn.disabled = true;
  downloadBtn.textContent = '⏳ Downloading...';
  clearStatus(downloadStatus);

  try {
    const res = await fetch(`${API}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Passphrase': authPassphrase
      },
      body: JSON.stringify({ url: currentMetadata.sourceUrl })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Download failed');
    }

    const blob = await res.blob();
    const cd = res.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename="(.+?)"/);
    const filename = match ? match[1] : 'audio.mp3';

    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objUrl);

    setStatus(downloadStatus, '✓ Download started!', 'success');
    downloadBtn.textContent = '✓ Done';
    setTimeout(() => {
      downloadBtn.textContent = '⬇ Download MP3';
      downloadBtn.disabled = false;
    }, 2000);
  } catch (err) {
    setStatus(downloadStatus, err.message, 'error');
    downloadBtn.disabled = false;
    downloadBtn.textContent = '⬇ Download MP3';
  }
}

// --- Helpers ---
function showLogin() {
  loginSection.style.display = 'block';
  appSection.style.display = 'none';
  logoutBtn.style.display = 'none';
  tierDisplay.style.display = 'none';
}

function showApp(tier) {
  loginSection.style.display = 'none';
  appSection.style.display = 'block';
  logoutBtn.style.display = 'block';
  if (tier) {
    tierDisplay.style.display = 'block';
    tierLabel.textContent = tier;
  }

  // Auto-fill current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    if (url && isSupportedUrl(url)) {
      urlInput.value = url;
    }
  });
}

function isSupportedUrl(url) {
  const supported = ['youtube.com', 'youtu.be', 'soundcloud.com', 'tiktok.com',
                     'instagram.com', 'twitter.com', 'x.com', 'vk.com', 'bandcamp.com'];
  return supported.some(h => url.includes(h));
}

function renderMetadata(meta) {
  const platformColors = {
    youtube: '#FF0000', soundcloud: '#FF5500', tiktok: '#00F2EA',
    instagram: '#E1306C', twitter: '#1DA1F2', vk: '#4A76A8', other: '#888'
  };
  const color = platformColors[meta.platform] || '#888';

  metadataArea.innerHTML = `
    <div class="metadata-card">
      ${meta.thumbnail
        ? `<img class="thumb" src="${meta.thumbnail}" alt="${meta.title}" />`
        : `<div class="thumb-placeholder">🎵</div>`}
      <div class="meta-info">
        <div class="meta-title">${escapeHtml(meta.title)}</div>
        <div class="meta-artist">${escapeHtml(meta.artist)}</div>
        <div class="meta-badges">
          <span class="badge" style="background:${color}22;color:${color}">${escapeHtml(meta.platform)}</span>
          <span class="badge" style="background:#ffffff11;color:#aaa">${escapeHtml(meta.duration)}</span>
          <span class="badge" style="background:#ffffff11;color:#aaa">320kbps</span>
        </div>
      </div>
    </div>
  `;
}

function setStatus(el, msg, type) {
  el.innerHTML = `<div class="status ${type}">${escapeHtml(msg)}</div>`;
}

function clearStatus(el) { el.innerHTML = ''; }

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['maverick_token', 'maverick_passphrase', 'maverick_tier']);
  authToken = null;
  authPassphrase = null;
  showLogin();
});

openWebapp.addEventListener('click', () => {
  chrome.tabs.create({ url: WEBAPP });
});
