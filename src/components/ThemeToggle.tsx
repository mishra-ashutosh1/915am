import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: ThemeMode) => {
      const isDark =
        currentTheme === 'dark' ||
        (currentTheme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light theme"
        aria-label="Light theme"
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-xs font-medium'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark theme"
        aria-label="Dark theme"
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-blue-400 shadow-xs font-medium'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System theme"
        aria-label="System theme"
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-medium'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
