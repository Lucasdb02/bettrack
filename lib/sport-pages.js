/* Bet tracker per sport: /bet-tracker/[slug] */

export const SPORT_PAGES = [
  {
    slug: 'voetbal',
    sport: 'Voetbal',
    name: 'Voetbal bet tracker',
    title: 'Voetbal bet tracker: houd je voetbalweddenschappen bij',
    metaTitle: 'Voetbal bet tracker: voetbalbets bijhouden',
    description:
      'Houd je voetbalbets bij en zie per competitie en markt waar je winst maakt: 1X2, Over/Under, BTTS, Asian handicap, betbuilders en combinaties.',
    intro:
      'Voetbal is veruit de populairste sport om op te wedden, met elke week honderden wedstrijden en tientallen markten per wedstrijd. Juist daardoor verlies je snel het overzicht. Met de voetbal bet tracker van TrackMijnBets zie je precies op welke competities en markten je winst maakt.',
    sections: [
      {
        h2: 'Populaire voetbalmarkten om bij te houden',
        ul: [
          '1X2: thuis, gelijk of uit',
          'Over/Under: het aantal doelpunten, zoals Over 2.5',
          'Beide teams scoren (BTTS): ja of nee',
          'Asian handicap: inclusief kwartlijnen met halve winst of half verlies',
          'Dubbele kans en draw no bet',
          'Betbuilders (same game multi) en combinaties van meerdere wedstrijden',
          'Correcte score en doelpuntenmakers',
        ],
      },
      {
        h2: 'Wat je leert van je voetbalstatistieken',
        p: [
          'In de statistieken van TrackMijnBets zie je je resultaat per markt en per tag. Veel wedders ontdekken dat ze winstgevend zijn op enkele bets, maar structureel verliezen op betbuilders en lange combinaties door de hogere marge die bookmakers daarop rekenen.',
          'Gebruik tags voor competities, zoals "Eredivisie" of "Premier League", om te zien in welke competities je de meeste kennis omzet in winst.',
        ],
      },
      {
        h2: 'Tips voor voetbalwedders',
        ul: [
          'Specialiseer je in een paar competities in plaats van overal op te wedden',
          'Houd combinaties apart bij: ze voelen als winst, maar kosten vaak geld',
          'Vergelijk odds tussen bookmakers, vooral op populaire wedstrijden',
          'Importeer je bets met een screenshot, zodat je elke bet vastlegt',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik betbuilders en combinaties bijhouden?', a: 'Ja. Je kiest de markt Same Game Multi Bet of Multi Bet en vult de totale odds in. De AI screenshot import herkent ze ook.' },
      { q: 'Hoe houd ik Asian handicap bets bij?', a: 'Kies de markt Handicap en vul de uitkomst in, inclusief half gewonnen, push of half verloren.' },
    ],
    related: ['asian-handicap-uitleg', 'statistieken', 'bets-importeren-met-ai'],
  },
  {
    slug: 'tennis',
    sport: 'Tennis',
    name: 'Tennis bet tracker',
    title: 'Tennis bet tracker: je tennisweddenschappen bijhouden',
    metaTitle: 'Tennis bet tracker: tennisbets bijhouden',
    description:
      'Houd je tennisbets bij: winnaar, handicap games, set betting en totaal aantal games. Zie per toernooi en ondergrond hoe je presteert.',
    intro:
      'Tennis is populair bij wedders omdat er het hele jaar door wordt gespeeld en er maar twee uitkomsten per wedstrijd zijn. Met de tennis bet tracker van TrackMijnBets zie je welke markten en toernooien je winst opleveren.',
    sections: [
      {
        h2: 'Tennismarkten om bij te houden',
        ul: [
          'Winnaar van de wedstrijd (moneyline)',
          'Handicap games of sets',
          'Totaal aantal games (Over/Under)',
          'Set betting: de exacte uitslag in sets',
          'Live bets tijdens de wedstrijd',
        ],
      },
      {
        h2: 'Slimmer wedden op tennis',
        p: [
          'Resultaten verschillen sterk per ondergrond en per type toernooi. Tag je bets met de ondergrond (gravel, gras, hardcourt) of het toernooiniveau, en je ziet in je statistieken waar je voorsprong zit.',
          'Let bij tennis ook op de regels van je bookmaker bij een opgave: bij de ene bookmaker wordt een bet dan ongeldig, bij de andere niet. Registreer zo\'n bet als void, zodat je statistieken kloppen.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe registreer ik een bet bij een opgave?', a: 'Wordt de bet door de bookmaker ongeldig verklaard, kies dan de uitkomst Void. Je inzet telt dan niet mee in je winst of verlies.' },
    ],
    related: ['statistieken', 'bets-bijhouden', 'odds-vergelijker'],
  },
  {
    slug: 'basketbal',
    sport: 'Basketbal',
    name: 'Basketbal bet tracker',
    title: 'Basketbal bet tracker: NBA en Europese basketbalbets bijhouden',
    metaTitle: 'Basketbal bet tracker: NBA bets bijhouden',
    description:
      'Houd je basketbalbets bij, van NBA tot EuroLeague: moneyline, point spread, totals en player props. Zie per markt je rendement.',
    intro:
      'Bij basketbal draait het vaak om spreads en totals, met odds rond de 1.90 aan beide kanten. Kleine verschillen in odds en lijnen maken daardoor een groot verschil. Met de basketbal bet tracker zie je of jouw aanpak op lange termijn werkt.',
    sections: [
      {
        h2: 'Basketbalmarkten om bij te houden',
        ul: [
          'Moneyline: welk team wint (inclusief verlenging)',
          'Point spread (handicap): winnen met een bepaald aantal punten verschil',
          'Totals: Over/Under op het totaal aantal punten',
          'Player props: punten, rebounds of assists van een speler',
          'Kwart- en helftmarkten',
        ],
      },
      {
        h2: 'Waarom bijhouden bij basketbal extra belangrijk is',
        p: [
          'Bij markten met odds rond de 1.90 heb je een win rate van ruim 52,6% nodig om quitte te spelen. Pas als je je bets bijhoudt, zie je of je daar structureel boven zit. Kijk in je statistieken naar je win rate per markt en vergelijk die met je gemiddelde odds.',
        ],
      },
    ],
    faq: [
      { q: 'Telt de verlenging mee?', a: 'Bij de meeste basketbalmarkten wel, maar controleer de regels van je bookmaker. Voer in TrackMijnBets gewoon de uitkomst in zoals de bookmaker die afrekent.' },
    ],
    related: ['statistieken', 'odds-vergelijker', 'calculators'],
  },
  {
    slug: 'darts',
    sport: 'Darts',
    name: 'Darts bet tracker',
    title: 'Darts bet tracker: je dartsweddenschappen bijhouden',
    metaTitle: 'Darts bet tracker: dartsbets bijhouden',
    description:
      'Houd je dartsbets bij: winnaar, handicap legs, totaal aantal 180\'s en hoogste finish. Zie per toernooi en markt hoe je ervoor staat.',
    intro:
      'Darts is in Nederland razend populair, van de Premier League tot het WK. Er zijn veel wedstrijden en veel specifieke markten. Met de darts bet tracker houd je al je dartsbets overzichtelijk bij.',
    sections: [
      {
        h2: 'Dartsmarkten om bij te houden',
        ul: [
          'Winnaar van de wedstrijd',
          'Handicap legs of sets',
          'Totaal aantal legs (Over/Under)',
          'Aantal 180\'s',
          'Hoogste finish en checkout-markten',
          'Correcte score in legs of sets',
        ],
      },
      {
        h2: 'Tips voor dartswedders',
        p: [
          'Het format verschilt sterk per toernooi: een wedstrijd over een korte afstand is veel onvoorspelbaarder dan een lange wedstrijd in sets. Tag je bets met het toernooi of het format om te zien waar je het beste presteert.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik 180\'s-bets bijhouden?', a: 'Ja. Kies de sport Darts, vul bij de markt bijvoorbeeld "180\'s" in en je selectie, zoals "Over 6.5".' },
    ],
    related: ['bets-bijhouden', 'statistieken', 'bets-importeren-met-ai'],
  },
  {
    slug: 'formule-1',
    sport: 'Formule 1',
    name: 'Formule 1 bet tracker',
    title: 'Formule 1 bet tracker: je F1-weddenschappen bijhouden',
    metaTitle: 'Formule 1 bet tracker: F1 bets bijhouden',
    description:
      'Houd je Formule 1 bets bij: racewinnaar, podium, poleposition, head-to-heads en kampioenschap. Zie per markt of je winst maakt.',
    intro:
      'Formule 1 heeft zo\'n twintig races per seizoen, met markten van de racewinnaar tot onderlinge duels tussen teamgenoten. Omdat er minder evenementen zijn dan bij voetbal, is elke bet relatief belangrijk. Met de Formule 1 bet tracker zie je hoe je ervoor staat.',
    sections: [
      {
        h2: 'F1-markten om bij te houden',
        ul: [
          'Racewinnaar',
          'Podiumplaats of top 6 / top 10',
          'Poleposition (kwalificatie)',
          'Head-to-head tussen twee coureurs',
          'Snelste ronde en safety car',
          'Wereldkampioen coureurs of constructeurs (lange termijn)',
        ],
      },
      {
        h2: 'Lange-termijnbets bijhouden',
        p: [
          'Een bet op de wereldkampioen wordt pas aan het eind van het seizoen afgerekend. Registreer zo\'n bet met de uitkomst Lopend en werk hem bij als het kampioenschap beslist is. Zo blijft je inzet zichtbaar in je overzicht.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe houd ik een outright bet bij?', a: 'Voer de bet in met de uitkomst Lopend. Pas de uitkomst aan in je Bets Overzicht zodra de bet is afgerekend.' },
    ],
    related: ['bets-bijhouden', 'dashboard', 'statistieken'],
  },
  {
    slug: 'wielrennen',
    sport: 'Wielrennen',
    name: 'Wielrennen bet tracker',
    title: 'Wielrennen bet tracker: je wielerweddenschappen bijhouden',
    metaTitle: 'Wielrennen bet tracker: wielerbets bijhouden',
    description:
      'Houd je wielerbets bij: ritwinnaar, eindklassement, head-to-heads en top 10. Van klassiekers tot de Tour de France.',
    intro:
      'Van de voorjaarsklassiekers tot de grote rondes: wielrennen biedt veel wedmogelijkheden, vaak met hoge odds. Met de wielrennen bet tracker zie je welke koersen en markten je winst opleveren.',
    sections: [
      {
        h2: 'Wielermarkten om bij te houden',
        ul: [
          'Ritwinnaar of winnaar van een eendagskoers',
          'Eindklassement en nevenklassementen',
          'Top 3 of top 10',
          'Head-to-head tussen twee renners',
        ],
      },
      {
        h2: 'Hoge odds, grote schommelingen',
        p: [
          'Bets op een ritwinnaar hebben vaak hoge odds en dus een lage winkans. Je kunt lange tijd verliezen en dan met één winnende bet alles terugwinnen. Kijk daarom niet alleen naar je winst, maar ook naar je max drawdown in de statistieken, en houd je inzet per bet klein.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik bets op het eindklassement bijhouden?', a: 'Ja. Voer ze in met de uitkomst Lopend en werk ze bij na de laatste etappe.' },
    ],
    related: ['statistieken', 'units-en-export', 'bets-bijhouden'],
  },
  {
    slug: 'hockey',
    sport: 'Hockey',
    name: 'Hockey bet tracker',
    title: 'Hockey bet tracker: je (ijs)hockeyweddenschappen bijhouden',
    metaTitle: 'Hockey bet tracker: hockeybets bijhouden',
    description:
      'Houd je hockeybets bij, van ijshockey (NHL) tot veldhockey: winnaar, handicap (puck line), totaal aantal goals en periodes. Zie per markt je rendement.',
    intro:
      'Hockey is een snelle sport met relatief weinig doelpunten, waardoor kleine verschillen in odds en lijnen veel uitmaken. Of je nu op ijshockey of veldhockey wedt: met de hockey bet tracker zie je welke markten je winst opleveren.',
    sections: [
      {
        h2: 'Hockeymarkten om bij te houden',
        ul: [
          'Winnaar in de reguliere speeltijd (1X2) of inclusief verlenging en shoot-outs',
          'Handicap, bij ijshockey vaak puck line genoemd (bijvoorbeeld -1.5)',
          'Totaal aantal goals (Over/Under)',
          'Markten per periode of kwart',
          'Beide teams scoren',
        ],
      },
      {
        h2: 'Let op: met of zonder verlenging',
        p: [
          'Bij ijshockey maakt het veel uit of een markt wordt afgerekend op de reguliere speeltijd of inclusief verlenging en shoot-outs. Vermeld dat in je markt of met een tag, zodat je in je statistieken ziet welke variant voor jou beter werkt.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe houd ik een 1X2-bet op ijshockey bij?', a: 'Kies de sport Hockey en de markt 1X2. Vermeld in de selectie of notitie of het om de reguliere speeltijd gaat.' },
    ],
    related: ['statistieken', 'bets-bijhouden', 'odds-vergelijker'],
  },
  {
    slug: 'snooker',
    sport: 'Snooker',
    name: 'Snooker bet tracker',
    title: 'Snooker bet tracker: je snookerweddenschappen bijhouden',
    metaTitle: 'Snooker bet tracker: snookerbets bijhouden',
    description:
      'Houd je snookerbets bij: winnaar, frame handicap, totaal aantal frames, correcte score en century breaks. Zie per toernooi hoe je presteert.',
    intro:
      'Snooker kent lange toernooien met veel wedstrijden, van korte partijen tot finales over vele frames. Met de snooker bet tracker houd je al je snookerbets bij en zie je waar je voorsprong zit.',
    sections: [
      {
        h2: 'Snookermarkten om bij te houden',
        ul: [
          'Winnaar van de wedstrijd',
          'Frame handicap',
          'Totaal aantal frames (Over/Under)',
          'Correcte score in frames',
          'Century breaks en hoogste break',
        ],
      },
      {
        h2: 'Korte en lange partijen',
        p: [
          'Hoe korter de partij, hoe groter de kans op een verrassing. Tag je bets met de lengte van de wedstrijd (bijvoorbeeld "best of 7" of "best of 19") en zie in je statistieken bij welke formats je het beste presteert.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik bets op century breaks bijhouden?', a: 'Ja. Kies de sport Snooker, vul bij de markt "Century breaks" in en je selectie, bijvoorbeeld "Over 2.5".' },
    ],
    related: ['bets-bijhouden', 'statistieken', 'bets-importeren-met-ai'],
  },
  {
    slug: 'american-football',
    sport: 'American Football',
    name: 'American football bet tracker',
    title: 'American football bet tracker: NFL-bets bijhouden',
    metaTitle: 'NFL bet tracker: American football bets bijhouden',
    description:
      'Houd je American football bets bij: moneyline, point spread, totals en player props. Van NFL tot college football, met je rendement per markt.',
    intro:
      'Ook in Nederland wordt steeds meer op de NFL gewed. De markten draaien vooral om spreads en totals, met odds rond de 1.90. Met de American football bet tracker zie je of jouw bets op lange termijn winst opleveren.',
    sections: [
      {
        h2: 'American football-markten om bij te houden',
        ul: [
          'Moneyline: welk team wint',
          'Point spread (handicap), zoals -3.5',
          'Totals: Over/Under op het totaal aantal punten',
          'Player props: yards, touchdowns of receptions van een speler',
          'Markten per helft of kwart',
        ],
      },
      {
        h2: 'Kleine marges, grote verschillen',
        p: [
          'Bij odds van 1.90 heb je een win rate van ruim 52,6% nodig om quitte te spelen. Een halve punt verschil in de spread kan het verschil maken tussen winst en verlies. Vergelijk daarom lijnen tussen bookmakers en houd bij welke spreads je pakt.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik player props bijhouden?', a: 'Ja. Vul bij de markt het type prop in, zoals "Passing yards", en je selectie, bijvoorbeeld "Over 249.5".' },
    ],
    related: ['odds-vergelijker', 'statistieken', 'calculators'],
  },
  {
    slug: 'baseball',
    sport: 'Baseball',
    name: 'Baseball bet tracker',
    title: 'Baseball bet tracker: MLB-bets bijhouden',
    metaTitle: 'Baseball bet tracker: MLB bets bijhouden',
    description:
      'Houd je baseballbets bij: moneyline, run line, totals en first five innings. Zie per markt of je winst maakt op de MLB.',
    intro:
      'Met een lang seizoen en bijna elke dag wedstrijden is baseball een sport waarin je veel bets plaatst. Juist dan is bijhouden belangrijk. Met de baseball bet tracker zie je per markt waar je winst of verlies maakt.',
    sections: [
      {
        h2: 'Baseballmarkten om bij te houden',
        ul: [
          'Moneyline: welk team wint',
          'Run line (handicap), meestal -1.5 of +1.5',
          'Totals: Over/Under op het aantal runs',
          'First five innings (F5)',
          'Player props, zoals strikeouts van de pitcher',
        ],
      },
      {
        h2: 'Tips voor baseballwedders',
        p: [
          'De startende pitcher heeft veel invloed op de odds. Tag je bets bijvoorbeeld met "F5" of met je eigen strategie, zodat je in je statistieken ziet welke aanpak werkt.',
        ],
      },
    ],
    faq: [
      { q: 'Wat gebeurt er als een wedstrijd wordt uitgesteld?', a: 'Wordt de bet door de bookmaker ongeldig verklaard, kies dan de uitkomst Void. Je inzet telt dan niet mee in je resultaat.' },
    ],
    related: ['statistieken', 'bets-bijhouden', 'odds-vergelijker'],
  },
];

export const getSportPage = (slug) => SPORT_PAGES.find(s => s.slug === slug);
