// src/lib/api.ts
export const FUNCTION_BASE = `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1`;

export const HEADERS = {
  'Content-Type': 'application/json',
  apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
};

export async function callFunction(path: string, opts: RequestInit = {}) {
  const url = `${FUNCTION_BASE}/${path}`;
  const headers = { ...(opts.headers || {}), ...HEADERS };
  return fetch(url, { ...opts, headers });
}
