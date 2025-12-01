import { getFromLocalStorage, setInLocalStorage, STORAGE_KEYS } from '@/lib/storage';
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  colorScheme: 'light' | 'dark' | null;
  themeMode: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeMode] = useState<ColorScheme>(() => {
    const savedScheme = getFromLocalStorage<ColorScheme>(STORAGE_KEYS.THEME);
    return savedScheme || 'light';
  });

  const activeColorScheme = themeMode === 'system' ? systemColorScheme : themeMode;

  const setColorScheme = (scheme: ColorScheme) => {
    setThemeMode(scheme);
    setInLocalStorage(STORAGE_KEYS.THEME, scheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme: activeColorScheme ?? null, themeMode, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
