// Apenas variáveis públicas aqui — nunca uma secret key.
// No Vite, só variáveis prefixadas com VITE_ chegam ao bundle do navegador.
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  apiUrl: (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000',
};
