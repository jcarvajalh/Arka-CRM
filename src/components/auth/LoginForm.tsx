import { useState, type SubmitEvent } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    window.location.href = '/';
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-8"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="mb-8 flex flex-col items-center gap-4">
        <img src="/logo-white.png" alt="Arka" className="hidden h-8 w-auto dark:block" />
        <img src="/logo-black.png" alt="Arka" className="block h-8 w-auto dark:hidden" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Inicia sesión en tu CRM
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@arka.com"
            className="rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#006aff]"
            style={{ borderColor: 'var(--border-subtle)' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#006aff]"
            style={{ borderColor: 'var(--border-subtle)' }}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-[#006aff] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
