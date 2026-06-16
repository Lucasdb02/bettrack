import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return Response.json({ error: 'Geen afbeelding ontvangen' }, { status: 400, headers: CORS });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = file.type || 'image/png';

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Dit is een screenshot van een bookmaker website of bet-tracker met sportweddenschappen.
Analyseer de afbeelding en extraheer ALLE bets die zichtbaar zijn.

Geef de bets terug als een JSON array. Elk bet-object moet de volgende velden hebben (gebruik null als het niet zichtbaar is):
- datum: datum in YYYY-MM-DD formaat als die zichtbaar is op de screenshot, anders null. Het huidige jaar is ${new Date().getFullYear()}. Als alleen dag en maand zichtbaar zijn zonder jaar, gebruik dan altijd ${new Date().getFullYear()} als jaar.
- wedstrijd: naam van de wedstrijd/het evenement (bv. "Ajax vs PSV")
- selectie: de geselecteerde uitkomst (bv. "Ajax wint", "Over 2.5")
- markt: het type markt. Gebruik de exacte naam uit deze lijst: "1X2", "Over/Under", "Asian Handicap", "BTTS", "Wedstrijd Winnaar", "Handicap", "Totaal Punten", "Race Winnaar", "Eerste Doelpuntenmaker", "Lay Bet", "Bonus Bet (SNR)", "Bonus Bet (SR)", "Multi Bet", "Same Game Multi Bet", "Future/Outright Bet", "Match Total Bet", "Player Prop Bet", "Line Bet", "Tote Bet", "Exotic Bet", "Each Way Bet (Win)", "Each Way Bet (Place)", "Yankee", "Patent", "Lucky 15", "Lucky 31", "Lucky 63", "Trixie", "Heinz", "Super Heinz", "Goliath", "Overig"
- odds: decimale odds als getal (bv. 2.10)
- inzet: ingezet bedrag als getal (bv. 10.00)
- uitkomst: een van: "gewonnen", "verloren", "lopend", "push", "void", "half_gewonnen", "half_verloren", "onbeslist"
- bookmaker: gebruik EXACT één van deze namen (hoofdlettergevoelig): "bet365", "BetCity", "Unibet", "LeoVegas", "Holland Casino Online", "TOTO", "Jack's", "Bingoal", "Circus", "BetMGM", "Vbet", "711", "ZEbet", "One Casino", "Tonybet", "Starcasino", "888", "Betnation", "ComeOn", "Hommerson", "OranjePalace", "Overig". Gebruik "Overig" als de bookmaker niet in de lijst staat.
- sport: een van: "Voetbal", "Tennis", "Basketbal", "Hockey", "Formule 1", "Wielrennen", "Darts", "Snooker", "American Football", "Baseball", "Overig"

Belangrijke regels:
- Gebruik voor het "wedstrijd" veld altijd korte teamafkortingen zoals op de afbeelding zichtbaar (bv. "NEC - FEY", "CHE - MCI", "MAN - PSG"). Schrijf GEEN volledige teamnamen uit tenzij er geen afkorting beschikbaar is.
- Een "Double", "Treble", "Accumulator", "Acca", "Bet Builder", "Same Game Multi" of vergelijkbaar type is altijd 1 bet. Splits de losse onderdelen (legs) NIET op in aparte bets.
- Als een parlay/double/multi 3 of meer verschillende wedstrijden/teams bevat, gebruik dan "MULTI" als waarde voor het "wedstrijd" veld.
- Als een parlay/double slechts 2 teams/wedstrijden bevat, noteer dan de afkortingen van beide (bv. "AJX - PSV").
- Zet bij een parlay/multi alle legomschrijvingen samengevoegd in het "selectie" veld, gebruik de totale gecombineerde odds en de totale inzet.
- "Returned" of "Return" als status betekent dat de inzet is teruggestort = uitkomst "push".
- "Void" of "Geannuleerd" = uitkomst "void".
- Als een bet nog open/lopend is = uitkomst "lopend".

Systeem bets (Yankee, Patent, Lucky 15, etc.):
Een systeem bet is een combinatie van meerdere selecties die automatisch alle mogelijke sub-bets genereert. Behandel elke systeem bet als 1 bet entry.
Bekende systeem bets en hun structuur:
  - Trixie:     3 selecties →  4 bets (3 doubles + 1 treble)
  - Patent:     3 selecties →  7 bets (3 singles + 3 doubles + 1 treble)
  - Yankee:     4 selecties → 11 bets (6 doubles + 4 trebles + 1 fourfold)
  - Lucky 15:   4 selecties → 15 bets (4 singles + 6 doubles + 4 trebles + 1 fourfold)
  - Lucky 31:   5 selecties → 31 bets (5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold)
  - Lucky 63:   6 selecties → 63 bets
  - Heinz:      6 selecties → 57 bets
  - Super Heinz:7 selecties → 120 bets
  - Goliath:    8 selecties → 247 bets
Regels voor systeem bets:
  - Gebruik de naam van het systeem bet als waarde voor het "markt" veld (bv. "Yankee", "Lucky 15").
  - De "inzet" is de TOTALE inzet (eenheidsinzet × aantal sub-bets, bv. bij een Yankee van 11×€1 = €11).
  - Bereken "odds" als: totale mogelijke uitbetaling / totale inzet (bv. €4894.50 / €11 = 445.0). Gebruik de "To Return" of "Mogelijke uitbetaling" waarde. Als die niet zichtbaar is, gebruik dan 1.0.
  - Zet alle selecties in het "selectie" veld, gescheiden door " | " (bv. "Valverde Top Scorer Uruguay | Promise David Top Scorer Canada | Demirovic Top Scorer Bosnië | Sabitzer Top Scorer Oostenrijk").
  - Gebruik "MULTI" als waarde voor het "wedstrijd" veld bij een systeem bet met 3+ selecties.
  - Het formaat "N × €X.XX BetType" op bet365 (bv. "11 x €1.00 Yankee") betekent: N sub-bets, €X eenheidsinzet, BetType = het systeem.

Geef ALLEEN de JSON array terug, zonder uitleg of markdown code blocks. Begin direct met [ en eindig met ].
Als er geen bets zichtbaar zijn, geef een lege array terug: []`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].text.trim();

    // Strip markdown code blocks if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let bets;
    try {
      bets = JSON.parse(jsonText);
    } catch {
      return Response.json({ error: 'AI kon de bets niet correct verwerken. Probeer een duidelijkere screenshot.' }, { status: 422, headers: CORS });
    }

    if (!Array.isArray(bets)) {
      return Response.json({ error: 'Onverwacht formaat ontvangen van AI.' }, { status: 422, headers: CORS });
    }

    // Sanitise each bet
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentYear = now.getFullYear();

    const fixYear = (datum) => {
      if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return null;
      const d = new Date(datum);
      if (isNaN(d.getTime())) return null;
      // If the date is more than ~6 months in the past AND the year is not the current year,
      // the AI likely guessed a wrong year (e.g. training year) — correct it to current year
      if (d.getFullYear() < currentYear) {
        const corrected = new Date(datum);
        corrected.setFullYear(currentYear);
        // Only apply if the corrected date is not in the far future (> 1 year ahead)
        if (corrected <= new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000)) {
          return corrected.toISOString().split('T')[0];
        }
      }
      return datum;
    };
    const VALID_UITKOMSTEN = ['gewonnen','verloren','lopend','push','void','half_gewonnen','half_verloren','onbeslist'];
    const VALID_SPORTEN = ['Voetbal','Tennis','Basketbal','Hockey','Formule 1','Wielrennen','Darts','Snooker','American Football','Baseball','Overig'];
    const SPORT_ALIASES = { 'Basketball': 'Basketbal', 'basketball': 'Basketbal' };

    // Canonical bookmaker names as stored in the database
    const VALID_BOOKMAKERS = ['bet365','BetCity','Unibet','LeoVegas','Holland Casino Online','TOTO',"Jack's",'Bingoal','Circus','BetMGM','Vbet','711','ZEbet','One Casino','Tonybet','Starcasino','888','Betnation','ComeOn','Hommerson','OranjePalace','Overig'];

    // Case-insensitive alias map → canonical name
    const BOOKMAKER_ALIASES = {
      'bet365': 'bet365', 'bet 365': 'bet365',
      'betcity': 'BetCity', 'bet city': 'BetCity',
      'unibet': 'Unibet',
      'leovegas': 'LeoVegas', 'leo vegas': 'LeoVegas',
      'holland casino online': 'Holland Casino Online', 'holland casino': 'Holland Casino Online', 'hollandcasino': 'Holland Casino Online',
      'toto': 'TOTO',
      "jack's": "Jack's", 'jacks': "Jack's", "jack's casino": "Jack's", 'jacks casino': "Jack's",
      'bingoal': 'Bingoal',
      'circus': 'Circus',
      'betmgm': 'BetMGM', 'bet mgm': 'BetMGM',
      'vbet': 'Vbet',
      '711': '711', '7.11': '711',
      'zebet': 'ZEbet',
      'one casino': 'One Casino', 'onecasino': 'One Casino',
      'tonybet': 'Tonybet', 'tony bet': 'Tonybet',
      'starcasino': 'Starcasino', 'star casino': 'Starcasino',
      '888': '888', '888sport': '888', '888 sport': '888',
      'betnation': 'Betnation', 'bet nation': 'Betnation',
      'comeon': 'ComeOn', 'come on': 'ComeOn',
      'hommerson': 'Hommerson', 'hommerson.nl': 'Hommerson',
      'oranjepalace': 'OranjePalace', 'oranje palace': 'OranjePalace', 'oranjepalace.com': 'OranjePalace',
    };

    const normaliseBookmaker = (raw) => {
      if (!raw) return 'Overig';
      if (VALID_BOOKMAKERS.includes(raw)) return raw;
      return BOOKMAKER_ALIASES[raw.toLowerCase().trim()] || 'Overig';
    };

    const sanitised = bets.map(b => {
      const sport = SPORT_ALIASES[b.sport] || (VALID_SPORTEN.includes(b.sport) ? b.sport : 'Overig');
      return {
        datum:     fixYear(b.datum) ?? today,
        wedstrijd: b.wedstrijd || '',
        selectie:  b.selectie  || '',
        markt:     b.markt     || 'Overig',
        odds:      parseFloat(b.odds)  || 1,
        inzet:     parseFloat(b.inzet) || 0,
        uitkomst:  VALID_UITKOMSTEN.includes(b.uitkomst) ? b.uitkomst : 'lopend',
        bookmaker: normaliseBookmaker(b.bookmaker),
        sport,
        notities:  '',
        tags:      [],
        _source:   'screenshot-import',
      };
    });

    return Response.json({ bets: sanitised }, { headers: CORS });
  } catch (err) {
    console.error('parse-screenshot error:', err);
    return Response.json(
      { error: err.message || 'Er is een onverwachte fout opgetreden.' },
      { status: 500, headers: CORS }
    );
  }
}
