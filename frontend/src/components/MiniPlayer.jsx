import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function MiniPlayer({ blobUrl, metadata, onClose }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!blobUrl) return;
    const audio = audioRef.current;
    if (audio) {
      audio.src = blobUrl;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
    return () => {
      if (audio) audio.pause();
    };
  }, [blobUrl]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
  };

  const handleEnded = () => { setPlaying(false); setProgress(100); };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!blobUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 px-4 py-3"
      style={{ background: 'var(--color-player)', borderTop: '1px solid var(--color-border)' }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />

      {/* Play/pause */}
      <button onClick={togglePlay}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'var(--color-accent)', color: '#fff' }}>
        {playing ? '⏸' : '▶'}
      </button>

      {/* Info */}
      <div className="flex-shrink-0 min-w-0 hidden sm:block" style={{ width: '160px' }}>
        <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {metadata?.title || t('player.now_previewing')}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t('player.preview_label')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {fmt(currentTime)}
        </span>
        <div className="flex-1 h-1 rounded-full cursor-pointer relative"
          style={{ background: 'var(--color-border)' }}
          onClick={handleSeek}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--color-accent)' }} />
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {fmt(duration)}
        </span>
      </div>

      {/* Close */}
      <button onClick={onClose} className="flex-shrink-0 text-lg"
        style={{ color: 'var(--color-text-muted)' }}>✕</button>
    </div>
  );
}
