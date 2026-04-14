'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') || '/dashboard';

      // Controleer eerst de URL hash op access_token (password recovery flow)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[auth/callback] setSession error:', error.message);
            router.replace('/login?error=auth_callback_failed');
          } else {
            router.replace('/reset-password');
          }
          return;
        }
      }

      // Normale OAuth/magic-link flow via code
      if (!code) {
        router.replace('/login?error=missing_code');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
        router.replace('/login?error=auth_callback_failed');
      } else {
        router.replace(next);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Inloggen...</p>
    </div>
  );
}
