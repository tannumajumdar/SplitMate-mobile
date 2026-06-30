import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });

const STORAGE_KEY = 'splitmate-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setColorScheme(saved);
        setIsDark(saved === 'dark');
      }
    });
  }, []);

  // Keep local state in sync when colorScheme changes externally
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setColorScheme(next);
    setIsDark(next === 'dark');
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
