import { createClient } from '@supabase/supabase-js';
import { env } from '@shared/utils/env.js';

// Cliente com service role — bypassa RLS. Uso exclusivo no backend,
// nunca deve ser exposto ao frontend. O frontend usa SUPABASE_ANON_KEY
// diretamente com o usuário autenticado, respeitando RLS.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
