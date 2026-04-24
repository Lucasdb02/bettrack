import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SCHEMA_FIELDS = ['datum', 'sport', 'wedstrijd', 'markt', 'selectie', 'odds', 'inzet', 'uitkomst', 'bookmaker', 'notities', 'tags'];

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Geen token opgegeven' }, { status: 401, headers: CORS });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Ongeldig of verlopen token' }, { status: 401, headers: CORS });

    const body = await request.json();
    const bets = body?.bets;
    if (!Array.isArray(bets) || bets.length === 0) {
      return NextResponse.json({ error: 'Geen bets meegestuurd' }, { status: 400, headers: CORS });
    }

    const rows = bets.map(bet => {
      const row = { user_id: user.id };
      for (const field of SCHEMA_FIELDS) {
        if (bet[field] !== undefined) row[field] = bet[field];
      }
      return row;
    });

    const { data, error } = await supabase.from('bets').insert(rows).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });

    return NextResponse.json({ saved: data.length, ids: data.map(r => r.id) }, { headers: CORS });
  } catch (e) {
    console.error('[extension/import]', e);
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS });
  }
}
