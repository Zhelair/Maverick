import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoginScreen from '../components/LoginScreen.jsx';
import MainApp from '../components/MainApp.jsx';
import { applyTheme } from '../themes/themes.js';

export default function App() {
  const { i18n } = useTranslation();
  const [auth, setAuth] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('maverick_theme') || 'nighttime');

  useEffect(() => {
    const saved = localStorage.getItem('maverick_auth');
    if (saved) {
      try { setAuth(JSON.parse(saved)); } catch { localStorage.removeItem('maverick_auth'); }
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('maverick_theme', theme);
  }, [theme]);

  const handleLogin = (token, tier, passphrase) => {
    const authData = { token, tier, passphrase };
    setAuth(authData);
    localStorage.setItem('maverick_auth', JSON.stringify(authData));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('maverick_auth');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('maverick_lang', lang);
  };

  if (!auth) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        theme={theme}
        onThemeChange={setTheme}
        onLanguageChange={changeLanguage}
      />
    );
  }

  return (
    <MainApp
      auth={auth}
      onLogout={handleLogout}
      theme={theme}
      onThemeChange={setTheme}
      onLanguageChange={changeLanguage}
    />
  );
}
