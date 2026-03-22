import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ExportPopup({ tracks, playlists, onClose }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const genres = [...new Set(tracks.map(tr => tr.genre).filter(Boolean))];

  const filtered = filter === 'all'
    ? tracks
    : tracks.filter(tr => tr.genre === filter);

  const toText = () =>
    filtered.map((tr, i) => `${i + 1}. ${tr.artist} - ${tr.title} (${tr.duration})`).join('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(toText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTxt = () => {
    const blob = new Blob([toText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maverick-tracklist-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJson = () => {
    const data = JSON.stringify({ tracks, playlists }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maverick-library-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl fade-in"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {t('export.title')}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        {/* Filter */}
        <div className="p-4 flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: filter === 'all' ? 'var(--color-accent)' : 'var(--color-bg)',
              color: filter === 'all' ? '#fff' : 'var(--color-text-muted)',
            }}>
            {t('export.filter_all')} ({tracks.length})
          </button>
          {genres.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: filter === g ? 'var(--color-accent)' : 'var(--color-bg)',
                color: filter === g ? '#fff' : 'var(--color-text-muted)',
              }}>
              {g} ({tracks.filter(tr => tr.genre === g).length})
            </button>
          ))}
        </div>

        {/* Track list preview */}
        <div className="mx-4 mb-4 rounded-lg p-3 text-xs overflow-y-auto"
          style={{ background: 'var(--color-bg)', maxHeight: '200px',
                   color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          {filtered.length === 0
            ? 'No tracks'
            : filtered.slice(0, 50).map((tr, i) => (
                <div key={tr.id} className="py-0.5">
                  {i + 1}. {tr.artist} - {tr.title} ({tr.duration})
                </div>
              ))
          }
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0">
          <button onClick={handleCopy}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                     color: 'var(--color-text)' }}>
            {copied ? t('export.copied') : t('export.copy')}
          </button>
          <button onClick={handleTxt}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                     color: 'var(--color-text)' }}>
            {t('export.download_txt')}
          </button>
          <button onClick={handleJson}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--color-accent)', color: '#fff' }}>
            {t('export.export_json')}
          </button>
        </div>
      </div>
    </div>
  );
}
