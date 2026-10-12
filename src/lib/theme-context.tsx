import { getFromLocalStorage, setInLocalStorage, STORAGE_KEYS } from '@/lib/storage';
import React, { createContext, use, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';

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
    const savedScheme = getFromLocalStorage<ColorScheme>(STORAGE_KEYS.THEME) || 'light';
    Uniwind.setTheme(savedScheme);
    return savedScheme;
  });

  const resolvedSystemScheme =
    systemColorScheme === 'light' || systemColorScheme === 'dark' ? systemColorScheme : null;
  const activeColorScheme = themeMode === 'system' ? resolvedSystemScheme : themeMode;

  const setColorScheme = (scheme: ColorScheme) => {
    setThemeMode(scheme);
    setInLocalStorage(STORAGE_KEYS.THEME, scheme);
    Uniwind.setTheme(scheme);
  };

  return (
    <ThemeContext value={{ colorScheme: activeColorScheme ?? null, themeMode, setColorScheme }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
