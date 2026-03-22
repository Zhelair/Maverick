import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ playlists, activeView, onViewChange, onCreatePlaylist, onExport }) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenre, setNewGenre] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreatePlaylist({ name: newName.trim(), genre: newGenre.trim() || null });
    setNewName('');
    setNewGenre('');
    setCreating(false);
  };

  return (
    <div className="flex flex-col h-full py-4 overflow-y-auto"
      style={{ background: 'var(--color-sidebar)' }}>

      {/* Main nav */}
      <nav className="px-3 space-y-1">
        {[
          { key: 'all', label: t('library.all_tracks'), icon: '🎵' },
          { key: 'favorites', label: t('library.favorites'), icon: '❤️' },
        ].map(item => (
          <button key={item.key} onClick={() => onViewChange(item.key)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
            style={{
              background: activeView === item.key ? 'var(--color-accent)' : 'transparent',
              color: activeView === item.key ? '#fff' : 'var(--color-text-muted)',
            }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Playlists section */}
      <div className="mt-6 px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider px-3"
            style={{ color: 'var(--color-text-muted)' }}>
            {t('library.playlists')}
          </span>
        </div>

        <div className="space-y-1">
          {playlists.map(pl => (
            <button key={pl.id} onClick={() => onViewChange(`playlist:${pl.id}`)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: activeView === `playlist:${pl.id}` ? 'var(--color-surface)' : 'transparent',
                color: activeView === `playlist:${pl.id}` ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}>
              <span>🎵</span>
              <span className="truncate">{pl.name}</span>
            </button>
          ))}
        </div>

        {/* Create playlist */}
        {creating ? (
          <div className="mt-2 space-y-2">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={t('playlist.name_placeholder')}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                       color: 'var(--color-text)' }}
              autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <input value={newGenre} onChange={e => setNewGenre(e.target.value)}
              placeholder={t('playlist.genre_placeholder')}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                       color: 'var(--color-text)' }} />
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--color-accent)', color: '#fff' }}>
                {t('playlist.create')}
              </button>
              <button onClick={() => setCreating(false)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                         border: '1px solid var(--color-border)' }}>
                {t('playlist.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)}
            className="w-full px-3 py-2 text-sm text-left rounded-lg transition-all mt-1"
            style={{ color: 'var(--color-text-muted)' }}>
            {t('library.new_playlist')}
          </button>
        )}
      </div>

      {/* Export */}
      <div className="mt-auto px-3 pt-4">
        <button onClick={onExport}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--color-text-muted)' }}>
          <span>📤</span>
          <span>{t('library.export')}</span>
        </button>
      </div>
    </div>
  );
}
