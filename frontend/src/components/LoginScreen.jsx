import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticate } from '../utils/api.js';

const LANGS = ['en', 'ru', 'bg'];
const THEMES = ['daylight', 'nighttime', 'neon'];
const THEME_ICONS = { daylight: '☀️', nighttime: '🌙', neon: '⚡' };

export default function LoginScreen({ onLogin, theme, onThemeChange, onLanguageChange }) {
  const { t, i18n } = useTranslation();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passphrase.trim()) { setError(t('login.error_required')); return; }
    setLoading(true);
    setError('');

    try {
      const res = await authenticate(passphrase.trim());
      if (res.success) {
        onLogin(res.token, res.tier, passphrase.trim());
      } else {
        setError(t('login.error_invalid'));
      }
    } catch {
      setError(t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
         style={{ background: 'var(--color-bg)' }}>

      {/* Language + Theme bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button key={l} onClick={() => onLanguageChange(l)}
              className="px-2 py-1 text-xs rounded uppercase font-semibold transition-all"
              style={{
                background: i18n.language === l ? 'var(--color-accent)' : 'var(--color-surface)',
                color: i18n.language === l ? '#fff' : 'var(--color-text-muted)'
              }}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {THEMES.map(t => (
            <button key={t} onClick={() => onThemeChange(t)}
              className="w-8 h-8 rounded flex items-center justify-center text-sm transition-all"
              style={{
                background: theme === t ? 'var(--color-accent)' : 'var(--color-surface)',
                border: `1px solid ${theme === t ? 'var(--color-accent)' : 'var(--color-border)'}`
              }}>
              {THEME_ICONS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm fade-in" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '40px 32px'
      }}>
        {/* Waveform logo */}
        <div className="flex items-end justify-center gap-1 mb-6" style={{ height: '40px' }}>
          {[3, 6, 9, 7, 5, 8, 4, 7, 6, 3].map((h, i) => (
            <div key={i} className="wave-bar rounded-full"
              style={{ width: '4px', height: `${h * 4}px`, background: 'var(--color-accent)' }} />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--color-text)' }}>
          {t('app.name')}
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          {t('app.tagline')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder={t('login.enter_passphrase')}
            disabled={loading}
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all"
            style={{ background: 'var(--color-accent)', color: '#fff', opacity: loading ? 0.7 : 1 }}>
            {loading ? t('login.verifying') : t('login.access')}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-center" style={{ color: '#FF4444' }}>{error}</p>
        )}
      </div>
    </div>
  );
}
