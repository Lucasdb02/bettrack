/* Inhoud van de functie-artikelen op /functies/[slug].
   Elke sectie: { h2, p: [alinea's], ul?: [opsommingen] } */

export const FEATURES = [
  {
    slug: 'bets-importeren-met-ai',
    name: 'AI screenshot import',
    title: 'Bets importeren met AI: van screenshot naar bet tracker',
    metaTitle: 'Bets importeren met AI via een screenshot',
    description:
      'Upload een screenshot van je betslip of bethistorie en TrackMijnBets herkent automatisch wedstrijd, markt, odds, inzet en uitkomst. Nooit meer handmatig overtypen.',
    plan: 'Pro',
    intro:
      'Het grootste nadeel van bets bijhouden is het overtypen. Na een avond voetbal heb je al snel tien weddenschappen die je stuk voor stuk moet invullen. Met de AI screenshot import van TrackMijnBets maak je een screenshot van je bethistorie, sleep je die in de app en staan je bets binnen enkele seconden klaar om op te slaan.',
    sections: [
      {
        h2: 'Hoe werkt de AI screenshot import?',
        p: [
          'Je uploadt een screenshot vanaf je telefoon of computer via Bet Invoeren. Onze AI leest de afbeelding en herkent per bet de wedstrijd, de sport, de markt, je selectie, de odds, de inzet en, als die al bekend is, de uitkomst.',
          'Voordat er iets wordt opgeslagen, zie je een overzicht van alle herkende bets. Klopt er iets niet, dan pas je het direct aan. Pas als jij op opslaan klikt, komen de bets in je overzicht en tellen ze mee in je statistieken.',
        ],
        ul: [
          'Werkt met screenshots van je betslip én van je bethistorie',
          'Herkent enkelvoudige bets, combinaties (multi bets) en betbuilders',
          'Meerdere bets in één screenshot worden allemaal meegenomen',
          'Je controleert en bewerkt alles voordat het wordt opgeslagen',
        ],
      },
      {
        h2: 'Welke bookmakers worden ondersteund?',
        p: [
          'Omdat de AI naar de afbeelding kijkt en niet afhankelijk is van een koppeling, werkt de import met screenshots van vrijwel elke bookmaker. Denk aan TOTO, Unibet, bet365, BetCity, Jack\'s, BetMGM, Circus en andere Nederlandse aanbieders.',
          'Hoe duidelijker de screenshot, hoe beter het resultaat. Zorg dat odds, inzet en de naam van de wedstrijd goed leesbaar zijn en snijd overbodige delen van het scherm eventueel weg.',
        ],
      },
      {
        h2: 'Tips voor de beste resultaten',
        p: ['Een paar kleine gewoontes zorgen ervoor dat je import vrijwel altijd in één keer goed gaat:'],
        ul: [
          'Maak één screenshot per scherm met bets, in plaats van één lange afbeelding',
          'Importeer dezelfde bets niet twee keer: controleer bij twijfel eerst je Bets Overzicht',
          'Voeg na het importeren tags toe (bijvoorbeeld "value" of "live") zodat je later per strategie kunt analyseren',
          'Werk de uitkomst later bij in het Bets Overzicht als je bets importeert voordat de wedstrijd is gespeeld',
        ],
      },
      {
        h2: 'Waarom automatisch bets bijhouden loont',
        p: [
          'Wie zijn bets consequent bijhoudt, ziet pas echt waar de winst en het verlies vandaan komen. Dat lukt alleen als het bijhouden weinig moeite kost. Door de AI import houd je je administratie actueel zonder dat het tijd kost, en zijn je statistieken en je maandoverzicht altijd compleet.',
        ],
      },
    ],
    faq: [
      { q: 'Is de AI screenshot import gratis?', a: 'De AI betslip herkenning is onderdeel van het Pro-abonnement. Je kunt Pro 7 dagen gratis proberen.' },
      { q: 'Wat gebeurt er met mijn screenshot?', a: 'De screenshot wordt alleen gebruikt om je bets uit te lezen. Je bets worden opgeslagen in je eigen account; de afbeelding zelf bewaren we niet in je bets-overzicht.' },
      { q: 'Wat als de AI een bet verkeerd leest?', a: 'Je ziet alle herkende bets eerst in een overzicht en kunt elk veld aanpassen of een bet verwijderen voordat je opslaat.' },
    ],
    related: ['bets-bijhouden', 'statistieken', 'bookmakers-beheren'],
  },
  {
    slug: 'bets-bijhouden',
    name: 'Bet tracker',
    title: 'Bets bijhouden: al je sportweddenschappen op één plek',
    metaTitle: 'Bets bijhouden met een online bet tracker',
    description:
      'Houd al je sportweddenschappen overzichtelijk bij: datum, sport, markt, odds, inzet, bookmaker en uitkomst. Filter, bewerk en zie direct je winst of verlies.',
    plan: 'Gratis',
    intro:
      'Een bet tracker is voor een sportwedder wat een boekhouding is voor een ondernemer. Zonder overzicht weet je niet of je echt winst maakt, bij welke bookmaker het goed gaat of welke markten je geld kosten. Met TrackMijnBets houd je al je bets bij in één overzichtelijk account, op je telefoon en op je computer.',
    sections: [
      {
        h2: 'Een bet invoeren in een paar seconden',
        p: [
          'Via Bet Invoeren vul je de gegevens van je weddenschap in: datum, sport, type bet, wedstrijd, markt, selectie, odds, inzet, bookmaker en uitkomst. Optioneel voeg je tags en notities toe.',
          'Ook speciale bet-types worden ondersteund. Bij een Each Way bet vul je de win- en place-odds en de EW-fractie in, en TrackMijnBets splitst de bet automatisch in een win- en een place-deel zodat je resultaat klopt. Freebets markeer je apart, zodat ze je inzet en rendement niet vertekenen.',
        ],
        ul: [
          'Enkele bets, multi bets, betbuilders en Each Way bets',
          'Freebets apart markeren',
          'Tags en notities voor je eigen strategieën',
          'Of importeer bets automatisch met een screenshot',
        ],
      },
      {
        h2: 'Bets Overzicht: filteren, zoeken en bewerken',
        p: [
          'In het Bets Overzicht staan al je weddenschappen in één tabel. Je filtert op uitkomst, sport, bookmaker of periode en ziet direct je totalen. Een bet aanpassen doe je met een dubbelklik, bijvoorbeeld om de uitkomst bij te werken als de wedstrijd is afgelopen.',
        ],
      },
      {
        h2: 'Waarom je je bets zou moeten bijhouden',
        p: [
          'Veel wedders denken dat ze ongeveer quitte spelen, tot ze hun bets echt gaan bijhouden. Een tracker laat zien wat je gevoel niet laat zien: je werkelijke winst of verlies, je gemiddelde odds, je win rate en hoe die zich ontwikkelen over tijd.',
          'Daarnaast helpt bijhouden bij verantwoord spelen. Je ziet precies hoeveel je inzet per week of maand, en kunt op tijd bijsturen als dat meer is dan je van plan was.',
        ],
      },
      {
        h2: 'Gratis beginnen',
        p: [
          'Met het gratis plan houd je tot 30 bets per maand bij, met één bookmaker en de basisstatistieken zoals P&L en win rate. Wie meer bets plaatst of meerdere bookmakers gebruikt, kan upgraden naar Pro voor onbeperkte bets en bookmakers.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik bets bijhouden op mijn telefoon?', a: 'Ja. TrackMijnBets werkt in de browser op je telefoon, tablet en computer. Je bets worden gesynchroniseerd via je account.' },
      { q: 'Hoeveel bets kan ik gratis bijhouden?', a: 'Met het gratis plan houd je tot 30 bets per maand bij. Met Pro is dat onbeperkt.' },
      { q: 'Kan ik mijn bets exporteren?', a: 'Ja, met Pro exporteer je al je bets als CSV of JSON via Mijn Account.' },
    ],
    related: ['bets-importeren-met-ai', 'dashboard', 'units-en-export'],
  },
  {
    slug: 'dashboard',
    name: 'Dashboard',
    title: 'Het dashboard: je winst, verlies en win rate in één oogopslag',
    metaTitle: 'Betting dashboard met P&L en win rate',
    description:
      'Zie direct je totale winst of verlies, win rate, record, gemiddelde odds en inzet. Filter op periode, sport en bookmaker en volg je resultaat in een grafiek.',
    plan: 'Gratis',
    intro:
      'Het dashboard is het startpunt van TrackMijnBets. Zodra je inlogt, zie je hoe je ervoor staat: je totale P&L, je win rate, je record en hoe je resultaat zich over tijd ontwikkelt.',
    sections: [
      {
        h2: 'De belangrijkste cijfers bovenaan',
        p: ['Bovenaan het dashboard staan de kerncijfers van je weddenschappen:'],
        ul: [
          'Totale P&L: je netto winst of verlies in euro\'s',
          'Win rate: het percentage gewonnen bets',
          'Record: het aantal gewonnen, verloren en overige bets',
          'Gemiddelde odds en gemiddelde inzet',
        ],
      },
      {
        h2: 'Filter op periode, sport en bookmaker',
        p: [
          'Met de periodekiezer bekijk je je resultaat van vandaag, gisteren, de afgelopen 7 of 28 dagen, deze of vorige maand, dit jaar of een eigen periode. Combineer dat met een filter op sport of bookmaker, en je ziet bijvoorbeeld in één klik hoe je voetbalbets bij TOTO het afgelopen kwartaal hebben gedaan.',
        ],
      },
      {
        h2: 'Je resultaat in een grafiek',
        p: [
          'De winstgrafiek laat zien hoe je bankroll zich ontwikkelt. Zo zie je niet alleen óf je winst maakt, maar ook hoe stabiel die winst is. Een lijn die gestaag stijgt, vertelt een ander verhaal dan een lijn met grote pieken en dalen.',
        ],
      },
      {
        h2: 'Correcties en bookmaker-saldo\'s',
        p: [
          'Correcties die je bij een bookmaker invoert, bijvoorbeeld een bonus of een verrekening, tellen mee in je P&L. Zo sluit het resultaat op je dashboard aan op wat er werkelijk op je bookmaker-accounts staat.',
        ],
      },
    ],
    faq: [
      { q: 'Is het dashboard gratis?', a: 'Ja, het dashboard met de basisstatistieken is onderdeel van het gratis plan.' },
      { q: 'Kan ik het dashboard filteren per bookmaker?', a: 'Ja, je filtert op bookmaker, sport en periode, ook in combinatie.' },
    ],
    related: ['statistieken', 'maandoverzicht', 'bets-bijhouden'],
  },
  {
    slug: 'statistieken',
    name: 'Statistieken',
    title: 'Statistieken: ontdek waar je winst en verlies vandaan komen',
    metaTitle: 'Uitgebreide betting statistieken per sport, markt en bookmaker',
    description:
      'Analyseer je bets per sport, bookmaker, markt en tag. Bekijk je gemiddelde odds, max drawdown, winst- en verliesreeksen en ontdek welke strategie echt werkt.',
    plan: 'Pro',
    intro:
      'Je totale winst vertelt of je goed bezig bent, maar niet waarom. De statistiekenpagina van TrackMijnBets splitst je resultaten op, zodat je precies ziet welke sporten, markten en bookmakers je winst opleveren en waar je geld lekt.',
    sections: [
      {
        h2: 'Analyse per sport, bookmaker, markt en tag',
        p: [
          'Voor elke sport, bookmaker, markt en tag zie je het aantal bets, de inzet, de winst of het verlies en het rendement. Misschien ben je winstgevend op Over/Under maar verlies je structureel op betbuilders. Of doe je het goed bij de ene bookmaker en minder bij de andere. Dat soort inzichten zie je hier direct.',
        ],
        ul: [
          'Analyse per sport',
          'Analyse per bookmaker',
          'Analyse per markt (1X2, Over/Under, BTTS, handicap, multi bets…)',
          'Analyse per tag, voor je eigen strategieën',
        ],
      },
      {
        h2: 'Geavanceerde kerncijfers',
        p: ['Naast winst en win rate toont TrackMijnBets de cijfers die serieuze wedders gebruiken om hun prestaties te beoordelen:'],
        ul: [
          'Gemiddelde odds en gemiddelde inzet',
          'Max drawdown: de grootste daling van je bankroll vanaf een piek',
          'Langste winstreeks en verliesreeks',
          'Je huidige reeks',
        ],
      },
      {
        h2: 'Waarom drawdown en reeksen belangrijk zijn',
        p: [
          'Ook met een winstgevende strategie krijg je verliesreeksen. De max drawdown laat zien hoe diep zo\'n dal kan zijn, zodat je je inzet daarop kunt afstemmen. Is je drawdown groot ten opzichte van je bankroll, dan is je inzet per bet waarschijnlijk te hoog.',
        ],
      },
      {
        h2: 'Tags gebruiken voor je strategie',
        p: [
          'Geef je bets tags zoals "value", "live", "boost" of de naam van een tipster. Op de statistiekenpagina zie je daarna per tag of die aanpak winstgevend is. Zo test je strategieën op basis van je eigen data in plaats van op gevoel.',
        ],
      },
    ],
    faq: [
      { q: 'Zijn de uitgebreide statistieken gratis?', a: 'De basisstatistieken staan op het gratis dashboard. De uitgebreide statistiekenpagina is onderdeel van Pro.' },
      { q: 'Wat is max drawdown?', a: 'De max drawdown is de grootste daling van je resultaat vanaf een eerder hoogtepunt. Het geeft aan hoe groot een verliesperiode is geweest.' },
    ],
    related: ['dashboard', 'maandoverzicht', 'units-en-export'],
  },
  {
    slug: 'maandoverzicht',
    name: 'Maandoverzicht',
    title: 'Maandoverzicht: je betting resultaten per dag in een kalender',
    metaTitle: 'Maandoverzicht en kalender voor je bets',
    description:
      'Bekijk je resultaten per dag in een maandkalender. Zie in één oogopslag je winnende en verliezende dagen en je totaal per maand.',
    plan: 'Pro',
    intro:
      'Het maandoverzicht toont je resultaten als kalender. Elke dag krijgt een kleur op basis van je winst of verlies, zodat je in één oogopslag ziet hoe je maand verloopt.',
    sections: [
      {
        h2: 'Elke dag in één oogopslag',
        p: [
          'Groene dagen zijn winstgevend, rode dagen kosten geld. Per dag zie je je resultaat in euro\'s, en bovenaan staan de totalen van de maand: P&L, aantal bets, win rate, inzet en het aantal winnende en verliezende dagen.',
        ],
      },
      {
        h2: 'Patronen ontdekken',
        p: [
          'Een kalender maakt patronen zichtbaar die je in een tabel mist. Verlies je vooral in het weekend, als je meer wedstrijden speelt? Gaat het mis op dagen dat je veel bets plaatst? Het maandoverzicht helpt je die patronen te herkennen en je gedrag bij te sturen.',
        ],
      },
      {
        h2: 'Correcties tellen mee',
        p: [
          'Correcties die je bij je bookmakers invoert, tellen mee in het dagresultaat. Zo sluit je maandoverzicht aan op je werkelijke saldo.',
        ],
      },
    ],
    faq: [
      { q: 'Kan ik eerdere maanden bekijken?', a: 'Ja, je bladert eenvoudig terug naar eerdere maanden.' },
      { q: 'Is het maandoverzicht gratis?', a: 'Het maandoverzicht is onderdeel van Pro, dat je 7 dagen gratis kunt proberen.' },
    ],
    related: ['dashboard', 'statistieken', 'bookmakers-beheren'],
  },
  {
    slug: 'bookmakers-beheren',
    name: 'Bookmakers',
    title: 'Bookmakers beheren: je saldo, stortingen en opnames per bookmaker',
    metaTitle: 'Bookmaker saldo, stortingen en opnames bijhouden',
    description:
      'Houd per bookmaker je saldo, stortingen, opnames en correcties bij. Zie precies hoeveel geld je waar hebt staan en wat je per bookmaker verdient.',
    plan: 'Gratis',
    intro:
      'Wie bij meerdere bookmakers wedt, raakt snel het overzicht kwijt: waar staat hoeveel, hoeveel heb je gestort en wat heb je eruit gehaald? Met de bookmakerpagina van TrackMijnBets houd je dat per bookmaker bij.',
    sections: [
      {
        h2: 'Saldo per bookmaker',
        p: [
          'Voeg je bookmakers toe met hun startsaldo en startdatum. TrackMijnBets berekent daarna je actuele saldo op basis van je bets en transacties. Zo zie je in één overzicht hoeveel geld je bij TOTO, Unibet, BetCity of andere bookmakers hebt staan.',
        ],
      },
      {
        h2: 'Stortingen, opnames en correcties',
        p: ['Per bookmaker registreer je drie soorten transacties:'],
        ul: [
          'Storting: geld dat je naar je bookmaker-account overmaakt',
          'Opname: geld dat je van je account opneemt',
          'Correctie: een aanpassing zoals een bonus, cashback of verrekening',
        ],
      },
      {
        h2: 'Je echte rendement per bookmaker',
        p: [
          'Door bets en transacties te combineren, zie je wat een bookmaker je netto heeft opgeleverd. Dat helpt bij de keuze waar je je bankroll het beste kunt aanhouden, en voorkomt dat je geld vergeet dat nog bij een bookmaker staat.',
        ],
      },
    ],
    faq: [
      { q: 'Hoeveel bookmakers kan ik toevoegen?', a: 'Met het gratis plan één bookmaker, met Pro onbeperkt.' },
      { q: 'Koppelt TrackMijnBets met mijn bookmaker-account?', a: 'Nee. Je voert je bookmakers en transacties zelf in; we vragen nooit om je inloggegevens van een bookmaker.' },
    ],
    related: ['dashboard', 'bets-bijhouden', 'maandoverzicht'],
  },
  {
    slug: 'odds-vergelijker',
    name: 'Odds Vergelijker',
    title: 'Odds vergelijken: vind de beste quotering voor elke wedstrijd',
    metaTitle: 'Odds vergelijker voor Nederlandse bookmakers',
    description:
      'Vergelijk live en aankomende odds van grote bookmakers per wedstrijd en competitie. Zie direct waar je de hoogste quotering krijgt.',
    plan: 'Pro',
    intro:
      'Dezelfde weddenschap kan bij de ene bookmaker 1.85 opleveren en bij de andere 1.95. Dat lijkt een klein verschil, maar over honderden bets bepaalt het of je winst of verlies maakt. De Odds Vergelijker laat per wedstrijd zien waar je de beste odds krijgt.',
    sections: [
      {
        h2: 'Live en aankomende wedstrijden',
        p: [
          'Kies een competitie en bekijk de odds voor aankomende en live wedstrijden naast elkaar. De hoogste quotering springt eruit, zodat je in een paar seconden ziet waar je je bet het beste kunt plaatsen.',
        ],
      },
      {
        h2: 'Waarom odds vergelijken zoveel uitmaakt',
        p: [
          'Stel: je plaatst 500 bets van €10 (€5.000 inzet) met een win rate van 55%. Tegen gemiddelde odds van 1.85 levert dat €87,50 winst op. Pak je telkens de beste lijn en kom je gemiddeld op 1.95 uit, dan wordt dat €362,50: ruim vier keer zoveel, met precies dezelfde bets.',
          'Line shopping, zoals dit heet, is een van de eenvoudigste manieren om als sportwedder beter te presteren.',
        ],
      },
      {
        h2: 'Combineren met de calculators',
        p: [
          'Zie je een groot verschil tussen bookmakers? Met de arbitrage calculator reken je uit of je daar een surebet mee kunt maken, en met de Expected Value calculator of een bet op lange termijn winstgevend is.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe actueel zijn de odds?', a: 'De odds worden regelmatig ververst. Controleer de quotering altijd bij de bookmaker voordat je je bet plaatst, want odds kunnen snel veranderen.' },
      { q: 'Is de Odds Vergelijker gratis?', a: 'De Odds Vergelijker is onderdeel van Pro.' },
    ],
    related: ['calculators', 'asian-handicap-uitleg', 'statistieken'],
  },
  {
    slug: 'calculators',
    name: 'Calculators',
    title: 'Betting calculators: arbitrage, Kelly, EV, vig, dutching en odds omrekenen',
    metaTitle: 'Arbitrage, Kelly, EV en dutching calculators voor sportwedden',
    description:
      'Zes betting calculators in één: arbitrage (surebets), Kelly criterion, vig/marge, expected value, odds converter en dutching. Reken je inzet slim uit.',
    plan: 'Pro',
    intro:
      'Goede sportwedders rekenen voordat ze inzetten. TrackMijnBets heeft zes calculators ingebouwd die je helpen de juiste inzet te bepalen, surebets te vinden en te zien of een bet op lange termijn waarde heeft.',
    sections: [
      {
        h2: 'Arbitrage calculator (surebets)',
        p: [
          'Bij arbitrage zet je in op alle uitkomsten van een wedstrijd, verspreid over verschillende bookmakers, zodat je altijd winst maakt. Dat kan alleen als de odds bij elkaar opgeteld gunstig genoeg zijn. De arbitrage calculator rekent uit of er een surebet is en hoeveel je per uitkomst moet inzetten.',
        ],
      },
      {
        h2: 'Kelly criterion calculator',
        p: [
          'Het Kelly criterion berekent welk deel van je bankroll je op een bet zou moeten zetten, op basis van de odds en jouw eigen inschatting van de winkans. Veel wedders gebruiken een fractie van Kelly om de schommelingen te beperken; in de calculator kies je zelf de Kelly-fractie.',
        ],
      },
      {
        h2: 'Vig calculator (bookmakermarge)',
        p: [
          'De vig, of marge, is het deel dat een bookmaker in de odds verwerkt. Met de vig calculator zie je hoe groot die marge is op een markt en wat de "eerlijke" kansen zijn zonder marge. Lage marges betekenen betere odds voor jou.',
        ],
      },
      {
        h2: 'Expected Value (EV) calculator',
        p: [
          'De expected value laat zien wat een bet je gemiddeld oplevert als je hem heel vaak zou plaatsen. Een positieve EV betekent dat de odds hoger zijn dan de werkelijke kans rechtvaardigt: een value bet. De EV calculator rekent dat voor je uit.',
        ],
      },
      {
        h2: 'Odds converter',
        p: [
          'Reken odds om tussen decimale odds (zoals 2.50), fractionele odds (3/2), Amerikaanse odds (+150) en de bijbehorende impliciete kans. Handig als je internationale bronnen of tipsters volgt.',
        ],
      },
      {
        h2: 'Dutching calculator',
        p: [
          'Bij dutching verdeel je je inzet over meerdere selecties in dezelfde markt, zodat je bij elke winnende selectie dezelfde winst maakt. De dutching calculator berekent de inzet per selectie op basis van je totale inzet.',
        ],
      },
    ],
    faq: [
      { q: 'Zijn surebets legaal?', a: 'Arbitragebetting is niet verboden, maar bookmakers kunnen de inzetlimieten beperken van spelers die structureel surebets plaatsen.' },
      { q: 'Moet ik de volledige Kelly-inzet gebruiken?', a: 'Dat is riskant, omdat de uitkomst sterk afhangt van hoe goed je eigen kansinschatting is. Veel wedders kiezen daarom een halve of kwart Kelly.' },
    ],
    related: ['odds-vergelijker', 'asian-handicap-uitleg', 'units-en-export'],
  },
  {
    slug: 'asian-handicap-uitleg',
    name: 'Asian Lines',
    title: 'Asian handicap uitgelegd: kwartlijnen, halve winst en inzet terug',
    metaTitle: 'Asian handicap en kwartlijnen uitgelegd met voorbeelden',
    description:
      'Leer hoe Asian handicap werkt, van -0.5 en 0.0 tot kwartlijnen zoals -0.25 en +0.75. Met interactieve voorbeelden: winst, halve winst, inzet terug, half verlies en verlies.',
    plan: 'Pro',
    intro:
      'Asian handicap is een van de populairste markten bij sportwedden, maar de kwartlijnen zorgen vaak voor verwarring. Wat betekent -0.25? Wanneer krijg je je inzet terug? De Asian Lines pagina van TrackMijnBets legt het uit met interactieve rekenvoorbeelden.',
    sections: [
      {
        h2: 'Wat is Asian handicap?',
        p: [
          'Bij Asian handicap krijgt een team een virtuele voor- of achterstand in doelpunten. Daardoor verdwijnt het gelijkspel als uitkomst, of wordt het een uitkomst waarbij je je inzet terugkrijgt. Zo ontstaan markten met ongeveer even grote kansen aan beide kanten.',
        ],
      },
      {
        h2: 'De vijf mogelijke uitkomsten',
        p: ['Afhankelijk van de lijn en de uitslag kent een Asian handicap bet vijf uitkomsten:'],
        ul: [
          'Winst: je volledige inzet wint tegen de odds',
          'Halve winst: de helft van je inzet wint, de andere helft krijg je terug',
          'Inzet terug (push): je krijgt je volledige inzet terug',
          'Half verlies: de helft van je inzet verlies je, de andere helft krijg je terug',
          'Verlies: je verliest je volledige inzet',
        ],
      },
      {
        h2: 'Halve lijnen, hele lijnen en kwartlijnen',
        p: [
          'Bij halve lijnen (zoals -0.5 of +1.5) is er altijd een winnaar: geen push mogelijk. Bij hele lijnen (0.0, -1.0) krijg je je inzet terug als het verschil precies gelijk is aan de handicap.',
          'Kwartlijnen (zoals -0.25 of -0.75) zijn een combinatie van twee lijnen. Je inzet wordt gesplitst: bij -0.25 zet je de helft in op 0.0 en de helft op -0.5. Daardoor ontstaan de uitkomsten halve winst en half verlies.',
        ],
      },
      {
        h2: 'Voorbeeld: -0.75 op de favoriet',
        p: [
          'Je zet €10 in op Team A -0.75 tegen odds 2.00. Je inzet wordt verdeeld over -0.5 en -1.0. Wint Team A met twee doelpunten verschil, dan winnen beide helften: +€10. Wint Team A met één doelpunt, dan wint de -0.5 helft (+€5) en krijg je de -1.0 helft terug: +€5. Speelt het gelijk of verliest Team A, dan verlies je €10.',
        ],
      },
      {
        h2: 'Asian handicap bets bijhouden',
        p: [
          'In TrackMijnBets kies je bij het invoeren van een bet de markt Handicap en vul je de uitkomst in, inclusief halve winst of half verlies. Zo kloppen je statistieken ook bij Asian lines.',
        ],
      },
    ],
    faq: [
      { q: 'Wat betekent Asian handicap 0.0?', a: 'Bij 0.0 (draw no bet) krijg je je inzet terug als de wedstrijd gelijk eindigt. Wint jouw team, dan win je de bet.' },
      { q: 'Wat is het verschil tussen -0.25 en -0.5?', a: 'Bij -0.5 moet je team winnen. Bij -0.25 krijg je bij een gelijkspel de helft van je inzet terug (half verlies).' },
    ],
    related: ['calculators', 'odds-vergelijker', 'bets-bijhouden'],
  },
  {
    slug: 'units-en-export',
    name: 'Units & export',
    title: 'Units en export: je resultaten in units en je data altijd bij de hand',
    metaTitle: 'Bets bijhouden in units en exporteren naar CSV of JSON',
    description:
      'Stel je unit-grootte in en zie je resultaten in units in plaats van euro\'s. Exporteer al je bets naar CSV of JSON voor Excel, Google Sheets of je eigen analyses.',
    plan: 'Pro',
    intro:
      'Professionele wedders praten niet in euro\'s maar in units. Zo kun je resultaten vergelijken, ongeacht of iemand €5 of €500 per bet inzet. In TrackMijnBets stel je je eigen unit-grootte in en exporteer je je data wanneer je wilt.',
    sections: [
      {
        h2: 'Wat is een unit?',
        p: [
          'Een unit is je standaard inzet, meestal 1 tot 2 procent van je bankroll. Zet je normaal €10 in, dan is 1 unit €10. Een bet van €20 is dan 2 units, en €50 winst is +5 units.',
          'Door in units te rekenen, blijf je gedisciplineerd met je inzet en kun je je resultaten eerlijk vergelijken, ook als je bankroll groeit of krimpt.',
        ],
      },
      {
        h2: 'Units instellen in TrackMijnBets',
        p: [
          'Via Mijn Account → Voorkeuren stel je je unit-grootte in. Op je accountoverzicht zie je daarna naast je totale P&L ook het aantal gewonnen units.',
        ],
      },
      {
        h2: 'Exporteren naar CSV of JSON',
        p: [
          'Je data is van jou. Met Pro exporteer je al je bets als CSV-bestand, te openen in Excel, Numbers of Google Sheets, of als JSON voor je eigen analyses en scripts.',
        ],
      },
    ],
    faq: [
      { q: 'Hoe groot moet mijn unit zijn?', a: 'Een veelgebruikte richtlijn is 1 tot 2 procent van je totale bankroll per unit.' },
      { q: 'Kan ik mijn account en data verwijderen?', a: 'Ja, je kunt je account en gegevens op elk moment laten verwijderen.' },
    ],
    related: ['statistieken', 'bets-bijhouden', 'calculators'],
  },
];

export const getFeature = (slug) => FEATURES.find(f => f.slug === slug);
