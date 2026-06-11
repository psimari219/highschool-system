import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
const STORAGE_KEY = 'educore_theme_v1';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch { return 'dark'; }
  });

  useEffect(() => {
    document.body.classList.remove('theme-light','theme-ocean','theme-sunset','theme-dark');
    if (theme === 'dark') {
      // default global variables in :root already reflect dark
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add(`theme-${theme}`);
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
