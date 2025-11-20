import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle dark mode"
    >
      <Sun className={`h-5 w-5 transition-transform ${theme === 'dark' ? 'scale-0' : 'scale-100'}`} />
      <Moon className={`absolute h-5 w-5 transition-transform ${theme === 'dark' ? 'scale-100' : 'scale-0'}`} />
    </button>
  );
}
