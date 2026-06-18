import { useTheme } from 'next-themes';
import { useCallback } from 'react';

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
