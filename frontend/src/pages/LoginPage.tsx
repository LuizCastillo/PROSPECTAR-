import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-900 p-8 shadow-card"
      >
        <div className="mb-1 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 20 L12 4 L20 20 L14 20 L12 14 L10 20 Z" fill="#E8703A" />
          </svg>
          <h1 className="font-display text-xl font-semibold text-paper">LeadForge</h1>
        </div>
        <p className="mb-6 text-sm text-ink-400">Entre para acessar sua prospecção.</p>

        <label className="mb-1 block text-xs font-medium text-ink-400">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-paper outline-none focus:border-ember-500"
        />

        <label className="mb-1 block text-xs font-medium text-ink-400">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-paper outline-none focus:border-ember-500"
        />

        {error && <p className="mb-4 text-sm text-hot">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ember-500 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
