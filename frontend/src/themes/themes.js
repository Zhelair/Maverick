export const THEMES = {
  daylight: {
    '--color-bg': '#F7F7F7',
    '--color-surface': '#FFFFFF',
    '--color-sidebar': '#EFEFEF',
    '--color-player': '#E8E8E8',
    '--color-accent': '#FF5500',
    '--color-accent-2': '#FF7733',
    '--color-text': '#111111',
    '--color-text-muted': '#666666',
    '--color-border': '#DDDDDD',
  },
  nighttime: {
    '--color-bg': '#121212',
    '--color-surface': '#1E1E1E',
    '--color-sidebar': '#181818',
    '--color-player': '#282828',
    '--color-accent': '#FF5500',
    '--color-accent-2': '#FF7733',
    '--color-text': '#FFFFFF',
    '--color-text-muted': '#AAAAAA',
    '--color-border': '#333333',
  },
  neon: {
    '--color-bg': '#0A0A14',
    '--color-surface': '#12122A',
    '--color-sidebar': '#0D0D20',
    '--color-player': '#1A1A35',
    '--color-accent': '#00F5FF',
    '--color-accent-2': '#FF00CC',
    '--color-text': '#E0E0FF',
    '--color-text-muted': '#8888AA',
    '--color-border': '#2A2A50',
  },
};

export function applyTheme(themeName) {
  const vars = THEMES[themeName] || THEMES.nighttime;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
}
