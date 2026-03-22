import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPreviewBlob } from '../utils/api.js';

const PLATFORM_COLORS = {
  youtube: '#FF0000',
  soundcloud: '#FF5500',
  tiktok: '#00F2EA',
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  vk: '#4A76A8',
  bandcamp: '#1DA0C3',
  other: '#888888',
};

export default function MetadataCard({ metadata, auth, onPreviewStart, onDownload, downloading }) {
  const { t } = useTranslation();
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const handlePreview = async () => {
    setLoadingPreview(true);
    setPreviewError('');
    try {
      const blobUrl = await fetchPreviewBlob(metadata.sourceUrl, auth.token, auth.passphrase);
      onPreviewStart(blobUrl, metadata);
    } catch {
      setPreviewError(t('download.error_preview'));
    } finally {
      setLoadingPreview(false);
    }
  };

  const platformColor = PLATFORM_COLORS[metadata.platform] || PLATFORM_COLORS.other;

  return (
    <div className="fade-in rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 relative" style={{ width: '80px', height: '80px' }}>
          {metadata.thumbnail ? (
            <img src={metadata.thumbnail} alt={metadata.title}
              className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-bg)' }}>
              <span className="text-2xl">🎵</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
            {metadata.title}
          </h3>
          <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
            {metadata.artist}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: platformColor + '22', color: platformColor }}>
              {t(`platform.${metadata.platform}`)}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {metadata.duration}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              320kbps
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={handlePreview} disabled={loadingPreview || downloading}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            opacity: loadingPreview ? 0.7 : 1
          }}>
          {loadingPreview ? t('download.previewing') : `▶ ${t('download.preview')}`}
        </button>

        <button onClick={onDownload} disabled={downloading || loadingPreview}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            opacity: downloading ? 0.7 : 1
          }}>
          {downloading ? t('download.downloading') : `⬇ ${t('download.download_mp3')}`}
        </button>
      </div>

      {previewError && (
        <p className="px-4 pb-3 text-xs" style={{ color: '#FF4444' }}>{previewError}</p>
      )}
    </div>
  );
}
