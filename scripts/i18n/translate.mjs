/* Vertaalt de geëxtraheerde teksten naar het Engels met Claude.
   Gebruik: node --env-file=.env.local scripts/i18n/translate.mjs
   Vertaalt alleen wat nog niet in lib/i18n/en.json staat. */
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

const SRC = 'scripts/i18n/strings.json';
const OUT = 'lib/i18n/en.json';
const client = new Anthropic();

const SYSTEM = `You translate the Dutch user interface and marketing copy of TrackMijnBets, a bet tracking and analytics web app for sports bettors, into natural, concise English (British spelling).

Rules:
- Return exactly one translation per input string, in the same order.
- Keep placeholders like {0}, {1} exactly as they are, in a sensible position.
- Keep brand and product names unchanged: TrackMijnBets, Pro, Elite, TOTO, BetCity, bet365, Unibet, Jack's, BetMGM, Circus, LeoVegas, Holland Casino Online, Bingoal, Vbet, 711, ZEbet, One Casino, Tonybet, Starcasino, 888, 888sport, Betnation, ComeOn, Hommerson, OranjePalace, Stripe, Klarna, Supabase, Vercel, Anthropic, Resend, Excel, Google Sheets, Chrome, NBA, NFL, MLB, NHL, EuroLeague, Eredivisie, Premier League.
- Keep person names, company names (Mybuqo B.V.), addresses, URLs, e-mail addresses, numbers and formulas as they are. Convert Dutch decimal commas in amounts to dots only when the text is clearly a number (€3,73 → €3.73).
- If a string is already English, a code, an abbreviation or a proper noun, return it unchanged.
- Use standard betting terminology: inzet = stake, uitkomst = outcome, wedstrijd = match, markt = market, selectie = selection, quotering/odds = odds, weddenschap/bet = bet, gewonnen = won, verloren = lost, half gewonnen = half won, half verloren = half lost, lopend = pending, voetbal = football, bookmaker = bookmaker, combinatie = accumulator, betbuilder = bet builder, storting = deposit, opname = withdrawal, correctie = adjustment, maandoverzicht = monthly overview, Bet Invoeren = Add Bet, Bets Overzicht = Bets Overview, Statistieken = Statistics, Mijn Account = My Account, Abonnement = Subscription, Lichte modus = Light mode, Donkere modus = Dark mode, Gratis = Free, proefperiode = free trial, Kansspelautoriteit = the Dutch Gambling Authority (Kansspelautoriteit).
- Match the tone: short labels stay short, UI capitalisation is preserved (Title Case stays Title Case, all caps stays all caps).`;

const SCHEMA = {
  type: 'object',
  properties: { translations: { type: 'array', items: { type: 'string' } } },
  required: ['translations'],
  additionalProperties: false,
};

async function translateBatch(items) {
  const res = await client.beta.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: `Translate these ${items.length} strings:\n\n${JSON.stringify(items)}` }],
  }).finalMessage();
  if (res.stop_reason === 'refusal') throw new Error('refusal');
  if (res.stop_reason === 'max_tokens') throw new Error('max_tokens');
  const text = res.content.find(b => b.type === 'text')?.text;
  const { translations } = JSON.parse(text);
  if (translations.length !== items.length) throw new Error(`count mismatch ${translations.length}/${items.length}`);
  return { translations, usage: res.usage };
}

function batches(list, maxChars = 7000, maxItems = 120) {
  const out = []; let cur = []; let n = 0;
  for (const s of list) {
    if (cur.length && (n + s.length > maxChars || cur.length >= maxItems)) { out.push(cur); cur = []; n = 0; }
    cur.push(s); n += s.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const dict = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { exact: {}, patterns: {} };

let inTok = 0, outTok = 0;
for (const kind of ['exact', 'patterns']) {
  const todo = src[kind].filter(s => !(s in dict[kind]));
  const bs = batches(todo);
  console.log(`${kind}: ${todo.length} te vertalen in ${bs.length} batches`);
  const CONC = 4;
  for (let i = 0; i < bs.length; i += CONC) {
    await Promise.all(bs.slice(i, i + CONC).map(async (b, j) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { translations, usage } = await translateBatch(b);
          b.forEach((s, k) => { dict[kind][s] = translations[k]; });
          inTok += usage.input_tokens; outTok += usage.output_tokens;
          console.log(`  batch ${i + j + 1}/${bs.length} ok (${b.length})`);
          return;
        } catch (e) {
          console.log(`  batch ${i + j + 1} poging ${attempt} mislukt: ${e.message}`);
        }
      }
    }));
    fs.writeFileSync(OUT, JSON.stringify(dict, null, 1));
  }
}
console.log(`klaar. tokens in ${inTok}, uit ${outTok}, geschat $${((inTok * 5 + outTok * 25) / 1e6).toFixed(2)}`);
