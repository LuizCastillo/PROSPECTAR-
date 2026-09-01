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
        className="w-full max-w-sm rounded-xl border border-ink-800 bg-ink-900 p-8 shadow-card"
      >
        <h1 className="mb-1 text-xl font-semibold text-white">LeadForge</h1>
        <p className="mb-6 text-sm text-ink-500">Entre para acessar sua prospecção.</p>

        <label className="mb-1 block text-xs font-medium text-ink-500">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
        />

        <label className="mb-1 block text-xs font-medium text-ink-500">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
        />

        {error && <p className="mb-4 text-sm text-hot">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent-500 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
