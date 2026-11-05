import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, ThemeColors } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@mechfind_theme_preference';

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: 'light',
  isDark: false,
  setMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light'); // Light mode is default per requirements

  useEffect(() => {
    // Inject smooth transition style for web theme switching animation
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'mechfind-theme-transition';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root, div, span, applet, object, iframe,
          h1, h2, h3, h4, h5, h6, p, blockquote, pre,
          a, abbr, acronym, address, big, cite, code,
          del, dfn, em, img, ins, kbd, q, s, samp,
          small, strike, strong, sub, sup, tt, var,
          b, u, i, center, dl, dt, dd, ol, ul, li,
          fieldset, form, label, legend, table, caption,
          tbody, tfoot, thead, tr, th, td {
            transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        color 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Load stored preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    }).catch(() => {
      // Graceful fallback to light mode
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const isDark = mode === 'dark' ? true : mode === 'system' ? deviceColorScheme === 'dark' : false;
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

