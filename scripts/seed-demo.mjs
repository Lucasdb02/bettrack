/**
 * Seed demo data for lucasdebruin0608@gmail.com
 * Usage: node scripts/seed-demo.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dir, '../.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Voeg SUPABASE_SERVICE_ROLE_KEY toe aan .env.local');
  console.error('   Vind hem op: https://supabase.com/dashboard/project/ldyistwkhplfrtbnagxd/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TARGET_EMAIL = 'lucasdebruin0608@gmail.com';

// ── helpers ──────────────────────────────────────────────────────────────────

function rnd(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── static data ──────────────────────────────────────────────────────────────

const BOOKMAKERS = ['Unibet','Bet365','TOTO','BetCity','Betway'];

const SPORTEN = [
  { sport: 'Voetbal', wedstrijden: [
    'Ajax vs PSV','Feyenoord vs AZ','Liverpool vs Manchester City',
    'Real Madrid vs Barcelona','Bayern München vs Borussia Dortmund',
    'Manchester United vs Arsenal','Inter vs AC Milan','Juventus vs Napoli',
    'PSG vs Marseille','Atletico Madrid vs Sevilla','Ajax vs Feyenoord',
    'PSV vs AZ','Chelsea vs Tottenham','Porto vs Benfica','Celtic vs Rangers',
  ]},
  { sport: 'Tennis', wedstrijden: [
    'Sinner vs Alcaraz','Djokovic vs Nadal','Medvedev vs Zverev',
    'Swiatek vs Gauff','Rublev vs Tsitsipas','Fritz vs Tiafoe',
    'Hurkacz vs Ruud','Sinner vs Djokovic','Alcaraz vs Zverev',
  ]},
  { sport: 'Basketball', wedstrijden: [
    'Lakers vs Warriors','Celtics vs Heat','Nuggets vs Thunder',
    'Bucks vs 76ers','Suns vs Mavericks','Knicks vs Nets',
  ]},
  { sport: 'American Football', wedstrijden: [
    'Chiefs vs Eagles','Ravens vs 49ers','Cowboys vs Giants',
    'Bills vs Dolphins','Packers vs Bears',
  ]},
  { sport: 'Formule 1', wedstrijden: [
    'GP Monaco — Verstappen','GP Silverstone — Hamilton','GP Monza — Leclerc',
    'GP Abu Dhabi — Verstappen','GP Spa — Norris',
  ]},
];

const MARKTEN = {
  'Voetbal':          ['1X2','Beide teams scoren','Over/Under 2.5','Handicap','Eerste doelpuntenmaker','Correct score'],
  'Tennis':           ['Wedstrijdwinnaar','Set handicap','Over/Under sets','Eerste set winnaar'],
  'Basketball':       ['Wedstrijdwinnaar','Handicap','Over/Under punten','Kwart winnaar'],
  'American Football':['Wedstrijdwinnaar','Handicap','Over/Under punten','Eerste touchdown'],
  'Formule 1':        ['Racewinnaar','Podium finish','Snelste ronde','Top 6 finish'],
};

const SELECTIES = {
  '1X2':                    ['Thuis','Gelijkspel','Uit'],
  'Beide teams scoren':      ['Ja','Nee'],
  'Over/Under 2.5':          ['Over 2.5','Under 2.5'],
  'Handicap':                ['Thuis -1','Thuis +1','Uit -1','Uit +1'],
  'Eerste doelpuntenmaker':  ['Speler A','Speler B','Speler C'],
  'Correct score':           ['1-0','2-1','2-0','0-1','1-2'],
  'Wedstrijdwinnaar':        ['Favoriet','Underdog'],
  'Set handicap':            ['-1.5 sets','+1.5 sets'],
  'Over/Under sets':         ['Over 3.5','Under 3.5'],
  'Eerste set winnaar':      ['Speler 1','Speler 2'],
  'Over/Under punten':       ['Over','Under'],
  'Kwart winnaar':           ['Thuis 1e kwart','Uit 1e kwart'],
  'Eerste touchdown':        ['QB Run','WR Catch','RB Rush'],
  'Racewinnaar':             ['Max Verstappen','Lewis Hamilton','Charles Leclerc','Lando Norris'],
  'Podium finish':           ['Max Verstappen','Lewis Hamilton','Lando Norris'],
  'Snelste ronde':           ['Verstappen','Hamilton','Leclerc'],
  'Top 6 finish':            ['Verstappen','Hamilton','Norris','Sainz'],
};

// Outcome distribution — realistic: ~60% win, ~35% loss, ~5% push/lopend
function randomUitkomst(isRecent) {
  if (isRecent) return 'lopend';
  const r = Math.random();
  if (r < 0.60) return 'gewonnen';
  if (r < 0.92) return 'verloren';
  if (r < 0.96) return 'push';
  if (r < 0.98) return 'half_gewonnen';
  return 'half_verloren';
}

// ── generate bets ─────────────────────────────────────────────────────────────

function generateBets(userId) {
  const bets = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Spread ~160 bets over the last year
  for (let i = 0; i < 160; i++) {
    const daysAgo = Math.floor(rnd(0, 365));
    const datum = addDays(today, -daysAgo);
    const isRecent = daysAgo < 3;

    const sportData = pick(SPORTEN);
    const sport = sportData.sport;
    const wedstrijd = pick(sportData.wedstrijden);
    const markt = pick(MARKTEN[sport] || ['Wedstrijdwinnaar']);
    const sel = SELECTIES[markt] || ['Selectie'];
    const selectie = pick(sel);

    // Realistic odds: mostly 1.50–3.50, occasionally higher
    const oddsBase = rnd(1.4, 4.0);
    const odds = parseFloat(oddsBase.toFixed(2));

    // Stakes: mostly €10–€50
    const inzet = parseFloat((Math.round(rnd(5, 50) / 5) * 5).toFixed(2));

    const uitkomst = randomUitkomst(isRecent);
    const bookmaker = pick(BOOKMAKERS);

    bets.push({
      user_id: userId,
      datum,
      sport,
      wedstrijd,
      markt,
      selectie,
      odds,
      inzet,
      uitkomst,
      bookmaker,
      notities: '',
    });
  }

  // Sort by date descending
  bets.sort((a, b) => b.datum.localeCompare(a.datum));
  return bets;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍  Zoek gebruiker: ${TARGET_EMAIL}`);

  // Lookup user by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) { console.error('❌', listErr.message); process.exit(1); }

  const user = users.find(u => u.email === TARGET_EMAIL);
  if (!user) {
    console.error(`❌  Geen account gevonden voor ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const userId = user.id;
  console.log(`✅  Gevonden: ${userId}`);

  // Clear existing data
  console.log('🗑   Verwijder bestaande bets...');
  await supabase.from('bets').delete().eq('user_id', userId);
  await supabase.from('bookmakers').delete().eq('user_id', userId);

  // Insert bookmakers
  console.log('📚  Voeg bookmakers in...');
  const bookmakerRows = BOOKMAKERS.map(naam => ({
    user_id: userId,
    naam,
    saldo: parseFloat(rnd(50, 500).toFixed(2)),
    start_datum: addDays(new Date(), -Math.floor(rnd(180, 365))),
  }));
  const { error: bmErr } = await supabase.from('bookmakers').insert(bookmakerRows);
  if (bmErr) console.error('  ⚠️  Bookmakers:', bmErr.message);
  else console.log(`  ✅  ${bookmakerRows.length} bookmakers`);

  // Insert bets in batches
  console.log('🎰  Genereer en voeg bets in...');
  const bets = generateBets(userId);
  const BATCH = 50;
  for (let i = 0; i < bets.length; i += BATCH) {
    const chunk = bets.slice(i, i + BATCH);
    const { error } = await supabase.from('bets').insert(chunk);
    if (error) console.error(`  ⚠️  Batch ${i}:`, error.message);
    else console.log(`  ✅  ${Math.min(i + BATCH, bets.length)}/${bets.length} bets`);
  }

  // Summary
  const won  = bets.filter(b => b.uitkomst === 'gewonnen').length;
  const lost = bets.filter(b => b.uitkomst === 'verloren').length;
  const open = bets.filter(b => b.uitkomst === 'lopend').length;
  console.log(`\n🏁  Klaar!`);
  console.log(`   ${bets.length} bets: ${won} gewonnen, ${lost} verloren, ${open} lopend`);
  console.log(`   ${bookmakerRows.length} bookmakers: ${BOOKMAKERS.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
