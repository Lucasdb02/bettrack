import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SCHEMA_FIELDS = ['datum', 'sport', 'wedstrijd', 'markt', 'selectie', 'odds', 'inzet', 'uitkomst', 'bookmaker', 'notities', 'tags', 'is_freebet'];

export async function POST(request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Niet ingelogd — sessie verlopen' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 });
  }

  const { bets } = body;
  if (!Array.isArray(bets) || bets.length === 0) {
    return NextResponse.json({ error: 'Geen bets ontvangen' }, { status: 400 });
  }

  const rows = bets.map(bet => {
    const row = { user_id: user.id };
    for (const field of SCHEMA_FIELDS) {
      if (bet[field] !== undefined) row[field] = bet[field];
    }
    return row;
  });

  const { data, error } = await supabase.from('bets').insert(rows).select();
  if (error) {
    console.error('[save-bets] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bets: data });
}
