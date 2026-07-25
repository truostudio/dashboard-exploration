import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Keep in sync with the no-flash bootstrap script in index.html. */
const STORAGE_KEY = 'ub-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

/** The user's explicit choice, or null while they're still following the OS. */
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Track the OS only until the user picks a side.
  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    if (!mq) return;
    const onChange = () => {
      if (!storedTheme()) setTheme(systemTheme());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode or storage disabled. The theme still applies for this session.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
