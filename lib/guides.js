/* Gidsen op /gidsen/[slug]: calculator-uitleg en algemene betting-gidsen.
   Sectie: { h2, p?: [..], ul?: [..], after?: [..] }
   relatedFeatures: slugs uit lib/features.js, relatedGuides: slugs uit deze lijst */

export const GUIDES = [
  /* ── Calculators ─────────────────────────────────────────── */
  {
    slug: 'arbitrage-calculator',
    category: 'Calculator',
    tool: 'arbitrage',
    name: 'Arbitrage calculator',
    title: 'Arbitrage calculator: zo vind en bereken je een surebet',
    metaTitle: 'Arbitrage calculator: surebets berekenen',
    description:
      'Wat is arbitrage betting en hoe bereken je een surebet? Uitleg met formule en rekenvoorbeeld, plus hoe je met de arbitrage calculator je inzet per uitkomst verdeelt.',
    intro:
      'Bij arbitrage betting, ook wel surebetting genoemd, zet je in op alle mogelijke uitkomsten van een wedstrijd bij verschillende bookmakers. Zijn de odds gunstig genoeg, dan maak je winst ongeacht de uitslag. In deze gids lees je hoe je een surebet herkent en hoe je je inzet verdeelt.',
    sections: [
      {
        h2: 'Hoe herken je een surebet?',
        p: [
          'Tel voor elke uitkomst de impliciete kans op: 1 gedeeld door de odds. Bookmakers bouwen een marge in, waardoor die som normaal boven de 100% ligt. Vind je bij verschillende bookmakers odds waarbij de som onder de 100% uitkomt, dan heb je een surebet.',
        ],
        ul: ['Impliciete kans = 1 / odds', 'Som van alle impliciete kansen < 1 → surebet', 'Winstpercentage = (1 / som) − 1'],
      },
      {
        h2: 'Rekenvoorbeeld',
        p: [
          'Een tenniswedstrijd heeft twee uitkomsten. Bookmaker A biedt 2.10 op speler 1, bookmaker B biedt 2.05 op speler 2.',
        ],
        ul: [
          'Speler 1: 1 / 2.10 = 0,4762',
          'Speler 2: 1 / 2.05 = 0,4878',
          'Som: 0,9640, dus onder de 1: een surebet van ongeveer 3,7%',
        ],
        after: [
          'Met een totale inzet van €100 verdeel je de inzet naar verhouding van de impliciete kansen: €49,40 op speler 1 en €50,60 op speler 2. Wint speler 1, dan krijg je €103,74 terug. Wint speler 2, dan €103,73. In beide gevallen maak je ongeveer €3,73 winst.',
        ],
      },
      {
        h2: 'Inzet per uitkomst berekenen',
        p: [
          'De formule voor de inzet op elke uitkomst is: totale inzet × (1 / odds van die uitkomst) / som van de impliciete kansen. De arbitrage calculator bovenaan deze pagina doet dit voor je: je vult de odds en je totale inzet in en ziet direct de inzet per uitkomst en je gegarandeerde winst.',
        ],
      },
      {
        h2: 'Risico\'s van arbitrage betting',
        ul: [
          'Odds veranderen snel: plaats beide bets zo kort mogelijk na elkaar',
          'Een bookmaker kan een bet annuleren bij een duidelijke fout in de odds',
          'Bookmakers kunnen de limieten verlagen van spelers die vaak surebets plaatsen',
          'Verschillende regels (bijvoorbeeld bij een opgave in tennis) kunnen je dekking tenietdoen',
        ],
      },
    ],
    faq: [
      { q: 'Is arbitrage betting legaal in Nederland?', a: 'Ja, het is niet verboden. Bookmakers mogen wel de inzetlimieten beperken van spelers die structureel surebets plaatsen.' },
      { q: 'Hoeveel winst levert een surebet op?', a: 'Meestal tussen de 1% en 5% van je totale inzet. Het is een manier om kleine, relatief zekere winsten te maken.' },
    ],
    relatedFeatures: ['odds-vergelijker', 'calculators'],
    relatedGuides: ['dutching-calculator', 'bookmaker-marge-berekenen'],
  },
  {
    slug: 'kelly-criterion-calculator',
    category: 'Calculator',
    tool: 'kelly',
    name: 'Kelly criterion',
    title: 'Kelly criterion: hoeveel moet je inzetten op een bet?',
    metaTitle: 'Kelly criterion: optimale inzet berekenen',
    description:
      'Het Kelly criterion berekent welk deel van je bankroll je op een bet zet, op basis van odds en winkans. Uitleg van de formule, een rekenvoorbeeld en waarom veel wedders een halve Kelly gebruiken.',
    intro:
      'Hoeveel zet je in op een bet? Te weinig en je haalt te weinig uit je voorsprong, te veel en een verliesreeks veegt je bankroll leeg. Het Kelly criterion geeft een wiskundig onderbouwd antwoord.',
    sections: [
      {
        h2: 'De Kelly-formule',
        p: ['De formule berekent het percentage van je bankroll dat je inzet:'],
        ul: [
          'f = (b × p − q) / b',
          'b = decimale odds − 1',
          'p = jouw ingeschatte winkans',
          'q = 1 − p (de kans op verlies)',
        ],
        after: ['Komt er een negatief getal uit, dan heeft de bet geen waarde en zet je niets in.'],
      },
      {
        h2: 'Rekenvoorbeeld',
        p: [
          'Je schat de kans dat een team wint op 50%, en de bookmaker biedt odds van 2.20. Dan is b = 1,2, p = 0,5 en q = 0,5.',
          'f = (1,2 × 0,5 − 0,5) / 1,2 = 0,0833. Volgens Kelly zet je 8,33% van je bankroll in. Bij een bankroll van €1.000 is dat €83,33.',
        ],
      },
      {
        h2: 'Waarom een halve of kwart Kelly?',
        p: [
          'De volledige Kelly-inzet gaat ervan uit dat je winkans precies klopt. In de praktijk schat je die nooit perfect in, en overschatten kost bij Kelly veel geld. Daarom kiezen veel wedders een fractie: een halve Kelly (in het voorbeeld €41,67) of een kwart Kelly (€20,83). Je groeit iets langzamer, maar met veel minder schommelingen.',
          'In de calculator bovenaan deze pagina kies je zelf de Kelly-fractie.',
        ],
      },
    ],
    faq: [
      { q: 'Werkt Kelly ook als ik mijn winkans niet precies weet?', a: 'Kelly is zo goed als je kansinschatting. Gebruik bij twijfel een kleinere fractie, zoals een kwart Kelly.' },
      { q: 'Wat als Kelly een negatief getal geeft?', a: 'Dan is de bet volgens jouw inschatting niet winstgevend op lange termijn, en zet je niet in.' },
    ],
    relatedFeatures: ['calculators', 'units-en-export'],
    relatedGuides: ['bankroll-management', 'expected-value-berekenen'],
  },
  {
    slug: 'expected-value-berekenen',
    category: 'Calculator',
    tool: 'ev',
    name: 'Expected value (EV)',
    title: 'Expected value berekenen: is jouw bet een value bet?',
    metaTitle: 'Expected value calculator voor sportwedden',
    description:
      'Met expected value (EV) bereken je wat een bet gemiddeld oplevert. Uitleg van de EV-formule, een rekenvoorbeeld en hoe je positieve EV bets herkent.',
    intro:
      'Een bet winnen betekent niet dat het een goede bet was, en een bet verliezen niet dat het een slechte was. Wat telt is de expected value: wat een bet je gemiddeld oplevert als je hem heel vaak zou plaatsen.',
    sections: [
      {
        h2: 'De EV-formule',
        ul: [
          'EV = (winkans × winst bij winst) − (verlieskans × inzet)',
          'Of als percentage: EV% = (winkans × decimale odds) − 1',
        ],
      },
      {
        h2: 'Rekenvoorbeeld',
        p: [
          'Je zet €10 in tegen odds van 2.20 en schat de winkans op 50%. Bij winst verdien je €12, bij verlies ben je €10 kwijt.',
          'EV = 0,5 × €12 − 0,5 × €10 = +€1. Deze bet levert je gemiddeld €1 per €10 inzet op, een EV van +10%.',
        ],
      },
      {
        h2: 'Positieve en negatieve EV',
        p: [
          'Is de EV positief, dan bieden de odds meer dan de werkelijke kans rechtvaardigt: een value bet. Is de EV negatief, dan verlies je op lange termijn geld, ook al win je die ene bet misschien.',
          'Omdat bookmakers een marge in hun odds verwerken, is de EV van een willekeurige bet meestal licht negatief. Winstgevende wedders zoeken structureel naar bets met positieve EV.',
        ],
      },
      {
        h2: 'EV en je eigen resultaten',
        p: [
          'Houd je je bets bij in TrackMijnBets, dan zie je in de statistieken of je rendement op lange termijn aansluit bij de EV die je verwachtte. Gebruik tags zoals "value" om je value bets apart te analyseren.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe weet ik de echte winkans?', a: 'Dat weet je nooit zeker. Veel wedders gebruiken de odds van scherpe bookmakers zonder marge als benadering van de echte kans.' },
      { q: 'Is een hoge EV altijd goed?', a: 'Een hoge EV met een lage winkans betekent grote schommelingen. Combineer EV met verstandig bankroll management.' },
    ],
    relatedFeatures: ['calculators', 'statistieken'],
    relatedGuides: ['value-betting', 'kelly-criterion-calculator'],
  },
  {
    slug: 'bookmaker-marge-berekenen',
    category: 'Calculator',
    tool: 'vig',
    name: 'Vig / bookmakermarge',
    title: 'Bookmakermarge (vig) berekenen en eerlijke odds bepalen',
    metaTitle: 'Bookmakermarge (vig) calculator',
    description:
      'Bereken hoeveel marge een bookmaker op een markt pakt en wat de eerlijke odds zonder marge zijn. Met formule en rekenvoorbeeld voor een 1X2-markt.',
    intro:
      'Elke bookmaker verwerkt een marge in zijn odds, ook wel vig, juice of overround genoemd. Hoe lager die marge, hoe beter de odds voor jou. Zo reken je hem uit.',
    sections: [
      {
        h2: 'Zo bereken je de marge',
        ul: [
          'Tel de impliciete kansen (1 / odds) van alle uitkomsten op',
          'Overround = som − 1',
          'Marge van de bookmaker = 1 − (1 / som)',
        ],
      },
      {
        h2: 'Rekenvoorbeeld: een 1X2-markt',
        p: ['Een voetbalwedstrijd heeft odds van 2.40 (thuis), 3.30 (gelijk) en 3.00 (uit).'],
        ul: [
          'Thuis: 1 / 2.40 = 0,4167',
          'Gelijk: 1 / 3.30 = 0,3030',
          'Uit: 1 / 3.00 = 0,3333',
          'Som: 1,0530, een overround van 5,3% en een marge van ongeveer 5,0%',
        ],
      },
      {
        h2: 'Eerlijke odds zonder marge',
        p: [
          'Deel elke impliciete kans door de som om de eerlijke kans te krijgen. In het voorbeeld is dat 39,6% thuis, 28,8% gelijk en 31,7% uit. De eerlijke odds zijn dan ongeveer 2.53, 3.47 en 3.16.',
          'Zie je bij een andere bookmaker odds die hoger liggen dan deze eerlijke odds, dan kan dat een value bet zijn.',
        ],
      },
      {
        h2: 'Waarom de marge ertoe doet',
        p: [
          'Een marge van 5% betekent dat je gemiddeld 5% van je inzet inlevert. Door te wedden op markten en bij bookmakers met lage marges, en door odds te vergelijken, houd je meer over.',
        ],
      },
    ],
    faq: [
      { q: 'Wat is een normale bookmakermarge?', a: 'Bij populaire voetbalmarkten ligt de marge vaak tussen de 3% en 8%. Bij minder populaire markten en live wedden kan die hoger zijn.' },
    ],
    relatedFeatures: ['calculators', 'odds-vergelijker'],
    relatedGuides: ['value-betting', 'arbitrage-calculator'],
  },
  {
    slug: 'odds-omrekenen',
    category: 'Calculator',
    tool: 'odds',
    name: 'Odds omrekenen',
    title: 'Odds omrekenen: decimaal, fractioneel, Amerikaans en kans',
    metaTitle: 'Odds converter: odds omrekenen',
    description:
      'Reken odds om tussen decimale odds, fractionele odds, Amerikaanse odds en impliciete kans. Met formules en voorbeelden.',
    intro:
      'In Nederland gebruiken bookmakers decimale odds, maar Britse en Amerikaanse bronnen gebruiken andere notaties. Zo reken je ze om.',
    sections: [
      {
        h2: 'De drie notaties',
        ul: [
          'Decimaal (2.50): je totale uitbetaling per €1 inzet, inclusief inzet',
          'Fractioneel (3/2): je winst ten opzichte van je inzet',
          'Amerikaans (+150 of −200): winst op $100 inzet (+), of benodigde inzet voor $100 winst (−)',
        ],
      },
      {
        h2: 'Formules',
        ul: [
          'Decimaal naar fractioneel: decimaal − 1 (2.50 → 1,5 → 3/2)',
          'Decimaal ≥ 2.00 naar Amerikaans: (decimaal − 1) × 100 (2.50 → +150)',
          'Decimaal < 2.00 naar Amerikaans: −100 / (decimaal − 1) (1.50 → −200)',
          'Impliciete kans: 1 / decimaal (2.50 → 40%)',
        ],
      },
      {
        h2: 'Voorbeelden',
        ul: [
          '2.50 = 3/2 = +150 = 40% kans',
          '1.50 = 1/2 = −200 = 66,7% kans',
          '3.00 = 2/1 = +200 = 33,3% kans',
          '2.00 = 1/1 (evens) = +100 = 50% kans',
        ],
        after: ['Met de odds converter bovenaan deze pagina vul je één notatie in en zie je direct de andere drie.'],
      },
    ],
    faq: [
      { q: 'Wat betekent "evens"?', a: 'Evens is 1/1 in fractionele odds, 2.00 in decimale odds en +100 in Amerikaanse odds: je wint evenveel als je inzet.' },
    ],
    relatedFeatures: ['calculators'],
    relatedGuides: ['expected-value-berekenen', 'bookmaker-marge-berekenen'],
  },
  {
    slug: 'dutching-calculator',
    category: 'Calculator',
    tool: 'dutching',
    name: 'Dutching calculator',
    title: 'Dutching: je inzet verdelen over meerdere selecties',
    metaTitle: 'Dutching calculator: inzet verdelen',
    description:
      'Met dutching verdeel je je inzet over meerdere selecties, zodat je bij elke winnende selectie dezelfde winst maakt. Uitleg, formule en rekenvoorbeeld.',
    intro:
      'Denk je dat één van drie paarden gaat winnen, maar weet je niet welke? Of dat een wedstrijd eindigt in een van een paar correcte scores? Met dutching zet je op alle selecties in en maak je dezelfde winst, welke van de selecties ook wint.',
    sections: [
      {
        h2: 'De formule',
        ul: [
          'Tel de impliciete kansen (1 / odds) van je selecties op',
          'Inzet per selectie = totale inzet × (1 / odds) / som',
          'Is de som lager dan 1, dan maak je winst als een van je selecties wint',
        ],
      },
      {
        h2: 'Rekenvoorbeeld',
        p: ['Je dutcht €50 over drie paarden met odds 4.00, 5.00 en 8.00. De som van de impliciete kansen is 0,25 + 0,20 + 0,125 = 0,575.'],
        ul: [
          'Paard 1 (4.00): €50 × 0,25 / 0,575 = €21,74',
          'Paard 2 (5.00): €50 × 0,20 / 0,575 = €17,39',
          'Paard 3 (8.00): €50 × 0,125 / 0,575 = €10,87',
        ],
        after: ['Wint een van de drie paarden, dan krijg je in alle gevallen €86,96 terug: €36,96 winst. Wint een ander paard, dan verlies je je €50.'],
      },
      {
        h2: 'Wanneer is dutching zinvol?',
        p: [
          'Dutching werkt goed bij markten met veel uitkomsten, zoals paardenraces, correcte score of de eerste doelpuntenmaker. Het blijft wel een gewone bet: als geen van je selecties wint, verlies je je volledige inzet.',
        ],
      },
    ],
    faq: [
      { q: 'Wat is het verschil tussen dutching en arbitrage?', a: 'Bij arbitrage dek je alle uitkomsten af, zodat je altijd wint. Bij dutching dek je alleen een deel af en kun je dus nog verliezen.' },
    ],
    relatedFeatures: ['calculators'],
    relatedGuides: ['arbitrage-calculator', 'expected-value-berekenen'],
  },

  /* ── Gidsen ─────────────────────────────────────────────── */
  {
    slug: 'hoe-houd-je-je-bets-bij',
    category: 'Gids',
    name: 'Bets bijhouden: de complete gids',
    title: 'Hoe houd je je bets bij? De complete gids voor sportwedders',
    metaTitle: 'Hoe houd je je bets bij? Complete gids',
    description:
      'Waarom en hoe je je sportweddenschappen bijhoudt: welke gegevens je noteert, Excel versus een bet tracker, en welke cijfers je moet volgen om beter te wedden.',
    intro:
      'Bijna elke succesvolle sportwedder houdt zijn bets bij. Niet omdat het leuk is, maar omdat je zonder cijfers niet weet of je strategie werkt. In deze gids lees je wat je moet bijhouden, hoe je dat doet en welke cijfers ertoe doen.',
    sections: [
      {
        h2: 'Waarom je je bets moet bijhouden',
        ul: [
          'Je ziet je echte winst of verlies, in plaats van wat je denkt',
          'Je ontdekt welke sporten, markten en bookmakers je geld opleveren',
          'Je houdt je inzet onder controle en wedt verantwoorder',
          'Je kunt strategieën eerlijk testen op basis van data',
        ],
      },
      {
        h2: 'Welke gegevens noteer je per bet?',
        ul: [
          'Datum',
          'Sport en competitie',
          'Wedstrijd',
          'Markt (1X2, Over/Under, handicap…) en selectie',
          'Odds en inzet',
          'Bookmaker',
          'Uitkomst (gewonnen, verloren, push, half gewonnen…)',
          'Optioneel: tags voor je strategie en notities',
        ],
      },
      {
        h2: 'Excel of een bet tracker?',
        p: [
          'Veel wedders beginnen met een spreadsheet. Dat werkt, maar kost tijd: je moet alles overtypen, formules bijhouden en zelf grafieken maken. Een bet tracker zoals TrackMijnBets berekent je statistieken automatisch en laat je bets importeren via een screenshot, zodat je er nauwelijks tijd aan kwijt bent.',
        ],
      },
      {
        h2: 'Welke cijfers moet je volgen?',
        ul: [
          'Winst of verlies (P&L) in euro\'s en in units',
          'ROI: je winst gedeeld door je totale inzet',
          'Win rate en gemiddelde odds (samen zeggen ze meer dan los)',
          'Max drawdown: je grootste daling vanaf een piek',
          'Resultaten per sport, markt en bookmaker',
        ],
      },
      {
        h2: 'Tips om het vol te houden',
        ul: [
          'Voer je bets direct in, of importeer ze aan het eind van de dag met een screenshot',
          'Houd ook je stortingen en opnames per bookmaker bij',
          'Bekijk één keer per maand je maandoverzicht en statistieken',
        ],
      },
    ],
    faq: [
      { q: 'Wat is een goede ROI bij sportwedden?', a: 'Op lange termijn is een ROI van een paar procent al goed. De meeste wedders hebben een negatieve ROI door de marge van de bookmaker.' },
    ],
    relatedFeatures: ['bets-bijhouden', 'bets-importeren-met-ai', 'statistieken'],
    relatedGuides: ['bankroll-management', 'value-betting'],
  },
  {
    slug: 'value-betting',
    category: 'Gids',
    name: 'Value betting',
    title: 'Value betting uitgelegd: wedden op odds die te hoog zijn',
    metaTitle: 'Wat is value betting? Uitleg met voorbeelden',
    description:
      'Value betting betekent inzetten wanneer de odds hoger zijn dan de werkelijke kans rechtvaardigt. Lees hoe je value herkent, rekent en bijhoudt.',
    intro:
      'Winnende sportwedders proberen niet te voorspellen wie er wint. Ze zoeken naar odds die hoger zijn dan ze zouden moeten zijn. Dat heet value betting, en het is de basis van winstgevend wedden op lange termijn.',
    sections: [
      {
        h2: 'Wat is een value bet?',
        p: [
          'Een bet heeft value als de kans op winst groter is dan de impliciete kans in de odds. Bieden de odds 2.20 (impliciete kans 45,5%) terwijl jij de kans op 50% schat, dan is dat een value bet.',
        ],
      },
      {
        h2: 'Zo reken je value uit',
        ul: [
          'Value = (jouw kans × decimale odds) − 1',
          'Voorbeeld: 0,50 × 2,20 − 1 = +0,10, oftewel 10% value',
          'Is de uitkomst positief, dan heeft de bet value',
        ],
      },
      {
        h2: 'Hoe vind je value?',
        ul: [
          'Vergelijk odds tussen bookmakers: een uitschieter kan value zijn',
          'Reken de eerlijke odds uit door de bookmakermarge eruit te halen',
          'Volg nieuws (blessures, opstellingen) sneller dan de markt',
          'Specialiseer je in een competitie of markt die je goed kent',
        ],
      },
      {
        h2: 'Value betting vraagt geduld',
        p: [
          'Ook met value verlies je regelmatig. Pas over honderden bets zie je of je echt value vindt. Houd je value bets daarom bij met een eigen tag, en bekijk in je statistieken of je rendement op lange termijn positief is.',
        ],
      },
    ],
    faq: [
      { q: 'Is value betting hetzelfde als arbitrage?', a: 'Nee. Bij arbitrage dek je alle uitkomsten af voor gegarandeerde winst. Bij value betting zet je op één uitkomst in en kun je die bet gewoon verliezen.' },
    ],
    relatedFeatures: ['odds-vergelijker', 'statistieken', 'calculators'],
    relatedGuides: ['expected-value-berekenen', 'bookmaker-marge-berekenen'],
  },
  {
    slug: 'bankroll-management',
    category: 'Gids',
    name: 'Bankroll management',
    title: 'Bankroll management: zo bepaal je je inzet bij sportwedden',
    metaTitle: 'Bankroll management bij sportwedden',
    description:
      'Met goed bankroll management voorkom je dat een verliesreeks je hele budget kost. Lees hoe je een bankroll bepaalt, werkt met units en je inzet kiest.',
    intro:
      'Zelfs de beste wedders krijgen verliesreeksen. Het verschil tussen wie het volhoudt en wie alles verliest, is bankroll management: vooraf bepalen hoeveel je in totaal en per bet inzet.',
    sections: [
      {
        h2: 'Stap 1: bepaal je bankroll',
        p: [
          'Je bankroll is het bedrag dat je apart zet om mee te wedden. Kies een bedrag dat je volledig kunt missen, zonder dat het invloed heeft op je vaste lasten of spaargeld. Dit geld gebruik je alleen om te wedden, en je vult het niet aan na een verliesperiode.',
        ],
      },
      {
        h2: 'Stap 2: werk met units',
        p: [
          'Een unit is je standaard inzet, meestal 1 tot 2% van je bankroll. Bij een bankroll van €500 is één unit dus €5 tot €10. Op een bet waar je extra vertrouwen in hebt, zet je bijvoorbeeld 2 units in, maar nooit veel meer.',
        ],
      },
      {
        h2: 'Stap 3: kies een inzetmethode',
        ul: [
          'Vaste inzet (flat betting): elke bet 1 unit. Eenvoudig en stabiel.',
          'Percentage: elke bet een vast percentage van je actuele bankroll. De inzet groeit mee.',
          'Kelly criterion: inzet op basis van je voorsprong. Gebruik bij voorkeur een halve of kwart Kelly.',
        ],
      },
      {
        h2: 'Veelgemaakte fouten',
        ul: [
          'Verliezen najagen door je inzet te verhogen',
          'Te hoge inzetten na een paar winnende bets',
          'Je bankroll niet scheiden van ander geld',
          'Niet bijhouden hoeveel je werkelijk inzet',
        ],
      },
      {
        h2: 'Wed verantwoord',
        p: [
          'Bankroll management helpt je om binnen je grenzen te blijven. Merk je dat wedden je geld of plezier kost? Neem dan een pauze en kijk op loketkansspel.nl voor hulp.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe groot moet mijn bankroll zijn?', a: 'Er is geen vast bedrag. Belangrijk is dat je het volledig kunt missen en dat één unit (1 tot 2%) een inzet is waar je je prettig bij voelt.' },
    ],
    relatedFeatures: ['units-en-export', 'bookmakers-beheren', 'dashboard'],
    relatedGuides: ['kelly-criterion-calculator', 'hoe-houd-je-je-bets-bij'],
  },
];

export const getGuide = (slug) => GUIDES.find(g => g.slug === slug);

/* Calculators staan als werkende tool op /tools, gidsen op /gidsen */
export const guideHref = (g) => g.category === 'Calculator' ? `/tools/${g.slug}` : `/gidsen/${g.slug}`;
export const TOOLS = GUIDES.filter(g => g.category === 'Calculator');
export const ARTICLES = GUIDES.filter(g => g.category === 'Gids');
