// Seed fictive bets for February 2026 for lucasdebruin0608@gmail.com
// Run: node --env-file=.env.local scripts/seed-feb-2026.js

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten gezet zijn (run met --env-file=.env.local)');
  process.exit(1);
}
const TARGET_EMAIL = 'lucasdebruin0608@gmail.com';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

// ── Data pools ───────────────────────────────────────────────
const bookmakers = ['Unibet', 'bet365', 'TOTO', 'BetCity', "Jack's", 'Circus', 'Bingoal', '888sport'];

const wedstrijden = [
  // Voetbal
  { sport: 'Voetbal', wedstrijd: 'Ajax – PSV',               markten: ['1X2', 'Both Teams to Score', 'Over 2.5 goals'] },
  { sport: 'Voetbal', wedstrijd: 'Feyenoord – AZ',           markten: ['1X2', 'Asian Handicap', 'Over 2.5 goals'] },
  { sport: 'Voetbal', wedstrijd: 'Manchester City – Arsenal', markten: ['1X2', 'Both Teams to Score', 'Asian Handicap'] },
  { sport: 'Voetbal', wedstrijd: 'Liverpool – Chelsea',       markten: ['1X2', 'Over 2.5 goals', 'Both Teams to Score'] },
  { sport: 'Voetbal', wedstrijd: 'Real Madrid – Barcelona',   markten: ['1X2', 'Asian Handicap', 'Over 2.5 goals'] },
  { sport: 'Voetbal', wedstrijd: 'Bayern – Dortmund',         markten: ['1X2', 'Over 2.5 goals', 'Asian Handicap'] },
  { sport: 'Voetbal', wedstrijd: 'PSV – Feyenoord',           markten: ['1X2', 'Both Teams to Score', 'Over 2.5 goals'] },
  { sport: 'Voetbal', wedstrijd: 'Inter – AC Milan',          markten: ['1X2', 'Under 2.5 goals', 'Asian Handicap'] },
  { sport: 'Voetbal', wedstrijd: 'AZ – Utrecht',              markten: ['1X2', 'Over 2.5 goals'] },
  { sport: 'Voetbal', wedstrijd: 'Atletico – Sevilla',        markten: ['1X2', 'Under 2.5 goals', 'Asian Handicap'] },
  // Tennis
  { sport: 'Tennis', wedstrijd: 'Djokovic – Alcaraz',         markten: ['Wedstrijd winnaar', 'Set handicap'] },
  { sport: 'Tennis', wedstrijd: 'Sinner – Medvedev',          markten: ['Wedstrijd winnaar', 'Over 3.5 sets'] },
  { sport: 'Tennis', wedstrijd: 'Swiatek – Sabalenka',        markten: ['Wedstrijd winnaar'] },
  { sport: 'Tennis', wedstrijd: 'Griekspoor – Ruud',          markten: ['Wedstrijd winnaar', 'Set handicap'] },
  // Basketbal
  { sport: 'Basketbal', wedstrijd: 'Lakers – Celtics',        markten: ['Wedstrijd winnaar', 'Over/Under 220.5', 'Handicap'] },
  { sport: 'Basketbal', wedstrijd: 'Warriors – Bulls',        markten: ['Wedstrijd winnaar', 'Over/Under 215.5'] },
  { sport: 'Basketbal', wedstrijd: 'Heat – Bucks',            markten: ['Wedstrijd winnaar', 'Handicap'] },
  // Ijshockey
  { sport: 'IJshockey', wedstrijd: 'Oilers – Maple Leafs',   markten: ['Wedstrijd winnaar', 'Over 5.5 goals'] },
  { sport: 'IJshockey', wedstrijd: 'Rangers – Bruins',        markten: ['Wedstrijd winnaar', 'Under 5.5 goals'] },
  // Formule 1
  { sport: 'Formule 1', wedstrijd: 'GP Bahrein 2026',         markten: ['Race winnaar', 'Podium finish'] },
];

const selecties = {
  '1X2': ['Thuis wint', 'Gelijkspel', 'Uit wint'],
  'Both Teams to Score': ['Ja', 'Nee'],
  'Over 2.5 goals': ['Over 2.5'],
  'Under 2.5 goals': ['Under 2.5'],
  'Asian Handicap': ['-0.5', '-1', '+0.5', '+1'],
  'Over 3.5 sets': ['Over 3.5'],
  'Set handicap': ['-1.5 sets', '+1.5 sets'],
  'Wedstrijd winnaar': ['Speler 1', 'Speler 2'],
  'Over/Under 220.5': ['Over 220.5', 'Under 220.5'],
  'Over/Under 215.5': ['Over 215.5', 'Under 215.5'],
  'Handicap': ['-3.5', '+3.5'],
  'Over 5.5 goals': ['Over 5.5'],
  'Under 5.5 goals': ['Under 5.5'],
  'Race winnaar': ['Verstappen', 'Norris', 'Leclerc'],
  'Podium finish': ['Verstappen podium', 'Norris podium'],
};

const uitkomsten = ['gewonnen', 'verloren', 'gewonnen', 'verloren', 'gewonnen', 'push', 'verloren', 'gewonnen'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max, dec = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}

function generateBetsForDay(datum, userId) {
  const count = Math.floor(Math.random() * 3) + 2; // 2–4 bets per dag
  const bets = [];
  for (let i = 0; i < count; i++) {
    const match = pick(wedstrijden);
    const markt = pick(match.markten);
    const selPool = selecties[markt] || ['Ja'];
    const selectie = pick(selPool);
    const odds = rand(1.35, 3.80, 2);
    const inzet = pick([5, 10, 10, 15, 20, 20, 25, 30, 50]);
    const uitkomst = pick(uitkomsten);

    bets.push({
      user_id:   userId,
      datum,
      sport:     match.sport,
      wedstrijd: match.wedstrijd,
      markt,
      selectie,
      odds,
      inzet,
      uitkomst,
      bookmaker: pick(bookmakers),
      notities:  null,
      tags:      [],
    });
  }
  return bets;
}

async function getUserId(email) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?per_page=200`,
    { headers }
  );
  const json = await res.json();
  const users = json.users || [];
  const user = users.find(u => u.email === email);
  if (!user) throw new Error(`Gebruiker ${email} niet gevonden`);
  return user.id;
}

async function insertBets(bets) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bets`,
    {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(bets),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert mislukt: ${err}`);
  }
}

async function main() {
  console.log(`Gebruiker ophalen voor ${TARGET_EMAIL}...`);
  const userId = await getUserId(TARGET_EMAIL);
  console.log(`User ID: ${userId}`);

  // Alle dagen in februari 2026 (1 t/m 28)
  const allBets = [];
  for (let day = 1; day <= 28; day++) {
    const datum = `2026-02-${String(day).padStart(2, '0')}`;
    const dayBets = generateBetsForDay(datum, userId);
    allBets.push(...dayBets);
    console.log(`  ${datum}: ${dayBets.length} bets`);
  }

  console.log(`\nTotaal ${allBets.length} bets invoegen...`);
  // Stuur in batches van 50
  for (let i = 0; i < allBets.length; i += 50) {
    const batch = allBets.slice(i, i + 50);
    await insertBets(batch);
    console.log(`  Batch ${Math.floor(i/50)+1}: ${batch.length} ingevoegd`);
  }

  console.log('\nKlaar!');
}

main().catch(e => { console.error(e); process.exit(1); });
