import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('arka-theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      style={{ color: 'var(--text-secondary)' }}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      {isDark ? 'Modo oscuro' : 'Modo claro'}
    </button>
  );
}
