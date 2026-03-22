import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'crypto';
import Sidebar from './Sidebar.jsx';
import MetadataCard from './MetadataCard.jsx';
import TrackCard from './TrackCard.jsx';
import MiniPlayer from './MiniPlayer.jsx';
import ExportPopup from './ExportPopup.jsx';
import { fetchInfo, downloadTrack, fetchLibrary, saveLibrary } from '../utils/api.js';

const LANGS = ['en', 'ru', 'bg'];
const THEME_ICONS = { daylight: '☀️', nighttime: '🌙', neon: '⚡' };
const SORT_OPTIONS = ['sort_date', 'sort_name', 'sort_artist', 'sort_platform', 'sort_genre'];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function MainApp({ auth, onLogout, theme, onThemeChange, onLanguageChange }) {
  const { t, i18n } = useTranslation();
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeView, setActiveView] = useState('all');
  const [sortBy, setSortBy] = useState('sort_date');
  const [searchQuery, setSearchQuery] = useState('');
  const [preview, setPreview] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef(null);

  // Load library from Supabase
  useEffect(() => {
    fetchLibrary(auth.token, auth.passphrase)
      .then(data => {
        if (data.success !== false) {
          setTracks(data.tracks || []);
          setPlaylists(data.playlists || []);
        }
      })
      .catch(() => {});
  }, [auth]);

  // Save library to Supabase when tracks/playlists change
  const saveTimeout = useRef(null);
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveLibrary(auth.token, auth.passphrase, tracks, playlists).catch(() => {});
    }, 1500);
    return () => clearTimeout(saveTimeout.current);
  }, [tracks, playlists]);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setFetchingInfo(true);
    setInfoError('');
    setMetadata(null);

    try {
      const res = await fetchInfo(url.trim(), auth.token, auth.passphrase);
      if (res.success) {
        setMetadata({ ...res.metadata, sourceUrl: url.trim() });
      } else {
        setInfoError(res.error || t('download.error_url'));
      }
    } catch {
      setInfoError(t('errors.network'));
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata) return;
    setDownloading(true);
    setDownloadError('');

    try {
      await downloadTrack(metadata.sourceUrl, auth.token, auth.passphrase);
      const newTrack = { id: genId(), ...metadata, downloadedAt: new Date().toISOString(), favorite: false };
      setTracks(prev => [newTrack, ...prev]);
      setMetadata(null);
      setUrl('');
      inputRef.current?.focus();
    } catch (err) {
      setDownloadError(err.message || t('download.error_failed'));
    } finally {
      setDownloading(false);
    }
  };

  const handlePreviewStart = (blobUrl, meta) => {
    setPreview({ blobUrl, metadata: meta });
  };

  const handleToggleFavorite = (id) => {
    setTracks(prev => prev.map(tr => tr.id === id ? { ...tr, favorite: !tr.favorite } : tr));
  };

  const handleAddToPlaylist = (track) => {
    // Simple: add to first playlist or prompt
    if (playlists.length === 0) return;
    const pl = playlists[0];
    if (!pl.track_ids.includes(track.id)) {
      setPlaylists(prev => prev.map(p =>
        p.id === pl.id ? { ...p, track_ids: [...p.track_ids, track.id] } : p
      ));
    }
  };

  const handleCreatePlaylist = ({ name, genre }) => {
    const pl = { id: genId(), name, genre_tag: genre, track_ids: [], created_at: new Date().toISOString() };
    setPlaylists(prev => [...prev, pl]);
  };

  // Get visible tracks
  const getVisibleTracks = () => {
    let visible = [...tracks];

    if (activeView === 'favorites') visible = visible.filter(tr => tr.favorite);
    else if (activeView.startsWith('playlist:')) {
      const plId = activeView.split(':')[1];
      const pl = playlists.find(p => p.id === plId);
      if (pl) visible = visible.filter(tr => pl.track_ids.includes(tr.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      visible = visible.filter(tr =>
        tr.title?.toLowerCase().includes(q) ||
        tr.artist?.toLowerCase().includes(q) ||
        tr.genre?.toLowerCase().includes(q)
      );
    }

    visible.sort((a, b) => {
      if (sortBy === 'sort_name') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'sort_artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'sort_platform') return (a.platform || '').localeCompare(b.platform || '');
      if (sortBy === 'sort_genre') return (a.genre || '').localeCompare(b.genre || '');
      return new Date(b.downloadedAt) - new Date(a.downloadedAt);
    });

    return visible;
  };

  const visibleTracks = getVisibleTracks();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>

      {/* Sidebar - hidden on mobile, shown on md+ */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-56 transform transition-transform md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ borderRight: '1px solid var(--color-border)' }}>
        <Sidebar
          playlists={playlists}
          activeView={activeView}
          onViewChange={(v) => { setActiveView(v); setSidebarOpen(false); }}
          onCreatePlaylist={handleCreatePlaylist}
          onExport={() => setShowExport(true)}
        />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-sidebar)' }}>

          {/* Mobile menu */}
          <button className="md:hidden text-xl" style={{ color: 'var(--color-text-muted)' }}
            onClick={() => setSidebarOpen(true)}>☰</button>

          {/* Logo */}
          <span className="font-bold text-lg flex-shrink-0" style={{ color: 'var(--color-accent)' }}>
            ≋ {t('app.name')}
          </span>

          {/* URL input */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2 min-w-0">
            <input
              ref={inputRef}
              value={url}
              onChange={e => { setUrl(e.target.value); setMetadata(null); setInfoError(''); }}
              placeholder={t('download.placeholder')}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none min-w-0"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button type="submit" disabled={fetchingInfo || !url.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0"
              style={{ background: 'var(--color-accent)', color: '#fff', opacity: fetchingInfo ? 0.7 : 1 }}>
              {fetchingInfo ? '...' : '→'}
            </button>
          </form>

          {/* Language */}
          <div className="hidden sm:flex gap-1 flex-shrink-0">
            {LANGS.map(l => (
              <button key={l} onClick={() => { i18n.changeLanguage(l); onLanguageChange(l); }}
                className="px-2 py-1 text-xs rounded uppercase font-semibold"
                style={{
                  background: i18n.language === l ? 'var(--color-accent)' : 'transparent',
                  color: i18n.language === l ? '#fff' : 'var(--color-text-muted)'
                }}>
                {l}
              </button>
            ))}
          </div>

          {/* Theme */}
          <div className="hidden sm:flex gap-1 flex-shrink-0">
            {Object.entries(THEME_ICONS).map(([th, icon]) => (
              <button key={th} onClick={() => onThemeChange(th)}
                className="w-7 h-7 rounded flex items-center justify-center text-sm"
                style={{
                  background: theme === th ? 'var(--color-accent)' : 'transparent',
                  border: `1px solid ${theme === th ? 'var(--color-accent)' : 'var(--color-border)'}`
                }}>
                {icon}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button onClick={onLogout} className="flex-shrink-0 text-sm px-2 py-1 rounded"
            style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            {t('settings.logout')}
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: preview ? '80px' : '16px' }}>

          {/* Info state */}
          {fetchingInfo && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div className="spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              {t('download.fetching_info')}
            </div>
          )}

          {infoError && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#FF444422', color: '#FF4444' }}>
              {infoError}
            </div>
          )}

          {downloadError && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#FF444422', color: '#FF4444' }}>
              {downloadError}
            </div>
          )}

          {/* Metadata card */}
          {metadata && (
            <div className="mb-6 max-w-md">
              <MetadataCard
                metadata={metadata}
                auth={auth}
                onPreviewStart={handlePreviewStart}
                onDownload={handleDownload}
                downloading={downloading}
              />
            </div>
          )}

          {/* Library header */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('library.title')} ({visibleTracks.length})
            </h2>
            <div className="flex items-center gap-2">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('library.search_placeholder')}
                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                         color: 'var(--color-text)', width: '160px' }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                         color: 'var(--color-text)' }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{t(`library.${opt}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Track grid */}
          {visibleTracks.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <div className="text-4xl mb-3">🎵</div>
              <p>{t('library.empty')}</p>
            </div>
          ) : (
            <div className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {visibleTracks.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onPlay={tr => handlePreviewStart(null, tr)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mini Player */}
      {preview && (
        <MiniPlayer
          blobUrl={preview.blobUrl}
          metadata={preview.metadata}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Export popup */}
      {showExport && (
        <ExportPopup
          tracks={tracks}
          playlists={playlists}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
