
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

type ThemeColors = {
  '--wallpaper-url': string;
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-accent': string;
  '--color-accent-dark': string;
  '--color-accent-hover': string;
  '--color-accent-danger': string;
  '--color-border': string;
};

interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
}

export const themes: Record<string, Theme> = {
  kali: {
    id: 'kali',
    name: 'Kali Dragon',
    colors: {
        '--wallpaper-url': "url('https://www.kali.org/images/wallpapers/kali-dragon-1920x1080.png')",
        '--color-bg-primary': 'rgba(0, 0, 0, 0.7)',
        '--color-bg-secondary': 'rgba(23, 23, 23, 0.8)',
        '--color-text-primary': '#e5e7eb',
        '--color-text-secondary': '#9ca3af',
        '--color-accent': '#4ade80',
        '--color-accent-dark': '#166534',
        '--color-accent-hover': '#15803d',
        '--color-accent-danger': '#ef4444',
        '--color-border': '#4b5563',
    },
  },
  arc: {
    id: 'arc',
    name: 'Arc Dark',
    colors: {
      '--wallpaper-url': "url('https://i.redd.it/go5got0t83b51.png')",
      '--color-bg-primary': 'rgba(38, 43, 50, 0.7)',
      '--color-bg-secondary': 'rgba(29, 32, 38, 0.8)',
      '--color-text-primary': '#d8dee9',
      '--color-text-secondary': '#abb2bf',
      '--color-accent': '#81a1c1',
      '--color-accent-dark': '#5e81ac',
      '--color-accent-hover': '#6a92b7',
      '--color-accent-danger': '#bf616a',
      '--color-border': '#4c566a',
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    colors: {
      '--wallpaper-url': "url('https://wallpapercave.com/wp/wp6959257.jpg')",
      '--color-bg-primary': 'rgba(0, 0, 0, 0.8)',
      '--color-bg-secondary': 'rgba(5, 5, 5, 0.9)',
      '--color-text-primary': '#00ff41',
      '--color-text-secondary': '#00b32d',
      '--color-accent': '#00ff41',
      '--color-accent-dark': '#008f26',
      '--color-accent-hover': '#00b32d',
      '--color-accent-danger': '#ff0000',
      '--color-border': '#008f26',
    },
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized',
    colors: {
      '--wallpaper-url': "url('https://camo.githubusercontent.com/4a03a8863b7337a77b8352636a00b955f13f1b40974b2165761376829e001dd9/68747470733a2f2f692e696d6775722e636f6d2f704b6d4e466e332e706e67')",
      '--color-bg-primary': 'rgba(0, 43, 54, 0.8)',
      '--color-bg-secondary': 'rgba(7, 54, 66, 0.9)',
      '--color-text-primary': '#93a1a1',
      '--color-text-secondary': '#839496',
      '--color-accent': '#2aa198',
      '--color-accent-dark': '#2aa198',
      '--color-accent-hover': '#35c7bb',
      '--color-accent-danger': '#dc322f',
      '--color-border': '#586e75',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
        return localStorage.getItem('themeId') || 'kali';
    } catch (e) {
        return 'kali';
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('themeId', themeId);
        const root = document.documentElement;
        root.classList.remove(...Object.keys(themes).map(id => `theme-${id}`));
        root.classList.add(`theme-${themeId}`);
    } catch(e) {
        console.error("Failed to save theme:", e);
    }
  }, [themeId]);

  const value = useMemo(() => ({
    theme: themes[themeId],
    setTheme: setThemeId,
  }), [themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
