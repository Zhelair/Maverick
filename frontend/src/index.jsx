import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from './pages/App.jsx';
import './styles/globals.css';
import en from './i18n/en.json';
import ru from './i18n/ru.json';
import bg from './i18n/bg.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru }, bg: { translation: bg } },
  lng: localStorage.getItem('maverick_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
