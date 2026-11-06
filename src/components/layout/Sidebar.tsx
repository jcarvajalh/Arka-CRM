import { Globe, Building2, Trophy, CheckCircle2, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { supabase } from '../../lib/supabase/client';

const NAV_ITEMS = [
  { href: '/clientes/con-web', label: 'Clientes con sitio web', icon: Globe },
  { href: '/clientes/sin-web', label: 'Clientes sin sitio web', icon: Building2 },
  { href: '/clientes/ganados', label: 'Clientes Ganados', icon: Trophy },
  { href: '/clientes/finalizados', label: 'Clientes Finalizados', icon: CheckCircle2 },
];

interface Props {
  currentPath: string;
}

export default function Sidebar({ currentPath }: Props) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="px-6 py-6">
        <img src="/logo-white.png" alt="Arka" className="hidden h-6 w-auto dark:block" />
        <img src="/logo-black.png" alt="Arka" className="block h-6 w-auto dark:hidden" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p
          className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          CLIENTES
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${isActive
                ? 'border-[#006aff] bg-[#006aff]/5 font-medium'
                : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              <Icon size={16} className={isActive ? 'text-[#006aff]' : ''} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div
        className="flex flex-col gap-1 border-t px-3 py-3"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
