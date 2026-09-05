import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // O Supabase Auth já cuida do hash seguro da senha (bcrypt) e do
    // armazenamento — não lidamos com a senha em texto puro em nenhum
    // outro lugar além deste POST direto para o Supabase.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/dashboard');
    } else {
      // Projeto com confirmação de e-mail ativada — sem sessão imediata.
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-ink-950">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card-light dark:border-ink-700 dark:bg-ink-900 dark:shadow-card">
          <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-paper">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-ink-400">
            Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar, você já pode entrar.
          </p>
          <Link to="/login" className="mt-5 inline-block text-sm font-medium text-iris-500 hover:underline dark:text-iris-400">
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-ink-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card-light dark:border-ink-700 dark:bg-ink-900 dark:shadow-card">
        <div className="mb-1 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 20 L12 4 L20 20 L14 20 L12 14 L10 20 Z" fill="#6E67E8" />
          </svg>
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-paper">LeadForge</h1>
        </div>
        <p className="mb-6 text-sm text-slate-500 dark:text-ink-400">Crie sua conta para começar a prospectar.</p>

        <OAuthButtons />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-ink-700" />
          <span className="text-xs text-slate-400 dark:text-ink-500">ou com e-mail</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-ink-700" />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-ink-400">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none focus:border-iris-500 dark:border-ink-700 dark:bg-ink-800 dark:text-paper"
          />

          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-ink-400">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none focus:border-iris-500 dark:border-ink-700 dark:bg-ink-800 dark:text-paper"
          />

          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-ink-400">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mb-6 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none focus:border-iris-500 dark:border-ink-700 dark:bg-ink-800 dark:text-paper"
          />

          {error && <p className="mb-4 text-sm text-hot">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-iris-500 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-ink-400">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-iris-500 hover:underline dark:text-iris-400">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
