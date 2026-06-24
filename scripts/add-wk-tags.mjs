// Run met: node --env-file=.env.local scripts/add-wk-tags.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten gezet zijn (run met --env-file=.env.local)');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'lucas@mybuqo.com';
const FROM  = '2026-06-11';
const TAG   = 'WK';

// 1. Zoek de user
const { data: { users }, error: uErr } = await admin.auth.admin.listUsers();
if (uErr) { console.error('Gebruikers ophalen mislukt:', uErr); process.exit(1); }

const user = users.find(u => u.email === EMAIL);
if (!user) { console.error('Gebruiker niet gevonden:', EMAIL); process.exit(1); }
console.log(`Gebruiker: ${user.email} (${user.id})`);

// 2. Haal voetbal bets op vanaf FROM (geen bovengrens)
const { data: bets, error: bErr } = await admin
  .from('bets')
  .select('id, datum, sport, wedstrijd, tags')
  .eq('user_id', user.id)
  .eq('sport', 'Voetbal')
  .gte('datum', FROM);

if (bErr) { console.error('Bets ophalen mislukt:', bErr); process.exit(1); }
console.log(`\nGevonden voetbal bets (vanaf ${FROM}): ${bets.length}`);

if (bets.length === 0) {
  console.log('Geen bets gevonden, klaar.');
  process.exit(0);
}

// 3. Update elke bet — voeg WK toe als die er nog niet in zit
let updated = 0;
for (const bet of bets) {
  const currentTags = Array.isArray(bet.tags) ? bet.tags : [];
  if (currentTags.includes(TAG)) {
    console.log(`  SKIP  ${bet.datum} — ${bet.wedstrijd} (tag al aanwezig)`);
    continue;
  }
  const newTags = [...currentTags, TAG];
  const { error: upErr } = await admin
    .from('bets')
    .update({ tags: newTags })
    .eq('id', bet.id);

  if (upErr) {
    console.error(`  FOUT  ${bet.datum} — ${bet.wedstrijd}:`, upErr.message);
  } else {
    console.log(`  OK    ${bet.datum} — ${bet.wedstrijd}  tags: [${newTags.join(', ')}]`);
    updated++;
  }
}

console.log(`\nKlaar — ${updated} van ${bets.length} bets geüpdatet met tag "${TAG}".`);
