import { createBrowserClient } from '@supabase/ssr';

let _client = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Server-side: always fresh (geen window)
  if (typeof window === 'undefined') {
    return createBrowserClient(url, key, { global: { headers: { apikey: key } } });
  }

  // Browser: singleton zodat er maar één auth-listener actief is
  if (!_client) {
    _client = createBrowserClient(url, key, { global: { headers: { apikey: key } } });
  }
  return _client;
}
