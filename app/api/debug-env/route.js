import { NextResponse } from 'next/server';

export async function GET() {
  const keys = [
    'API_FOOTBALL_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const result = {};
  for (const k of keys) {
    const val = process.env[k];
    result[k] = val
      ? `✅ aanwezig (${val.length} tekens, begint met: ${val.slice(0, 6)}...)`
      : '❌ ONTBREEKT';
  }

  return NextResponse.json(result, { status: 200 });
}
