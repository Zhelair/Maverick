import { useTranslation } from 'react-i18next';

const PLATFORM_COLORS = {
  youtube: '#FF0000', soundcloud: '#FF5500', tiktok: '#00F2EA',
  instagram: '#E1306C', twitter: '#1DA1F2', vk: '#4A76A8',
  bandcamp: '#1DA0C3', other: '#888888',
};

export default function TrackCard({ track, onPlay, onToggleFavorite, onAddToPlaylist }) {
  const { t } = useTranslation();
  const color = PLATFORM_COLORS[track.platform] || PLATFORM_COLORS.other;

  return (
    <div className="group rounded-xl p-3 transition-all cursor-pointer"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      onClick={() => onPlay(track)}>

      {/* Thumbnail */}
      <div className="relative mb-3 rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
        {track.thumbnail ? (
          <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}>
            <span className="text-3xl">🎵</span>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}>
            <span className="text-white">▶</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
        {track.title}
      </p>
      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
        {track.artist}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs px-1.5 py-0.5 rounded"
          style={{ background: color + '22', color }}>
          {t(`platform.${track.platform}`)}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {track.duration}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}>
        <button onClick={() => onToggleFavorite(track.id)}
          className="flex-1 py-1 rounded text-xs"
          style={{ background: 'var(--color-bg)', color: track.favorite ? '#FF5500' : 'var(--color-text-muted)' }}>
          {track.favorite ? '❤️' : '🤍'}
        </button>
        <button onClick={() => onAddToPlaylist(track)}
          className="flex-1 py-1 rounded text-xs"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
          + {t('download.add_to_playlist')}
        </button>
      </div>
    </div>
  );
}
