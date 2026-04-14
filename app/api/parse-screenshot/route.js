import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return Response.json({ error: 'Geen afbeelding ontvangen' }, { status: 400 });
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
- datum: datum in YYYY-MM-DD formaat als die zichtbaar is op de screenshot, anders null
- wedstrijd: naam van de wedstrijd/het evenement (bv. "Ajax vs PSV")
- selectie: de geselecteerde uitkomst (bv. "Ajax wint", "Over 2.5")
- markt: het type markt (bv. "1X2", "Over/Under", "Asian Handicap", "BTTS", "Overig")
- odds: decimale odds als getal (bv. 2.10)
- inzet: ingezet bedrag als getal (bv. 10.00)
- uitkomst: een van: "gewonnen", "verloren", "lopend", "push", "void", "half_gewonnen", "half_verloren", "onbeslist"
- bookmaker: naam van de bookmaker (bv. "bet365", "BetCity") of "Overig"
- sport: een van: "Voetbal", "Tennis", "Basketball", "Hockey", "Formule 1", "Wielrennen", "Darts", "Snooker", "American Football", "Overig"

Belangrijke regels:
- Gebruik voor het "wedstrijd" veld altijd korte teamafkortingen zoals op de afbeelding zichtbaar (bv. "NEC - FEY", "CHE - MCI", "MAN - PSG"). Schrijf GEEN volledige teamnamen uit tenzij er geen afkorting beschikbaar is.
- Een "Double", "Treble", "Accumulator", "Acca", "Bet Builder", "Same Game Multi" of vergelijkbaar type is altijd 1 bet. Splits de losse onderdelen (legs) NIET op in aparte bets.
- Als een parlay/double/multi 3 of meer verschillende wedstrijden/teams bevat, gebruik dan "MULTI" als waarde voor het "wedstrijd" veld.
- Als een parlay/double slechts 2 teams/wedstrijden bevat, noteer dan de afkortingen van beide (bv. "AJX - PSV").
- Zet bij een parlay/multi alle legomschrijvingen samengevoegd in het "selectie" veld, gebruik de totale gecombineerde odds en de totale inzet.
- "Returned" of "Return" als status betekent dat de inzet is teruggestort = uitkomst "push".
- "Void" of "Geannuleerd" = uitkomst "void".
- Als een bet nog open/lopend is = uitkomst "lopend".

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
      return Response.json({ error: 'AI kon de bets niet correct verwerken. Probeer een duidelijkere screenshot.' }, { status: 422 });
    }

    if (!Array.isArray(bets)) {
      return Response.json({ error: 'Onverwacht formaat ontvangen van AI.' }, { status: 422 });
    }

    // Sanitise each bet
    const today = new Date().toISOString().split('T')[0];
    const VALID_UITKOMSTEN = ['gewonnen','verloren','lopend','push','void','half_gewonnen','half_verloren','onbeslist'];
    const VALID_SPORTEN = ['Voetbal','Tennis','Basketball','Hockey','Formule 1','Wielrennen','Darts','Snooker','American Football','Overig'];

    const sanitised = bets.map(b => ({
      datum:     (b.datum && /^\d{4}-\d{2}-\d{2}$/.test(b.datum)) ? b.datum : today,
      wedstrijd: b.wedstrijd || '',
      selectie:  b.selectie  || '',
      markt:     b.markt     || 'Overig',
      odds:      parseFloat(b.odds)  || 1,
      inzet:     parseFloat(b.inzet) || 0,
      uitkomst:  VALID_UITKOMSTEN.includes(b.uitkomst) ? b.uitkomst : 'lopend',
      bookmaker: b.bookmaker || 'Overig',
      sport:     VALID_SPORTEN.includes(b.sport) ? b.sport : 'Overig',
      notities:  '',
      tags:      [],
      _source:   'screenshot-import',
    }));

    return Response.json({ bets: sanitised });
  } catch (err) {
    console.error('parse-screenshot error:', err);
    return Response.json(
      { error: err.message || 'Er is een onverwachte fout opgetreden.' },
      { status: 500 }
    );
  }
}
