/* Bookmaker-pagina's: /bookmaker/[slug]
   Bewust neutraal: alleen algemeen bekende feiten, de rest gaat over bijhouden. */

const BOOKMAKERS = [
  { slug: 'toto', name: 'TOTO', logo: '/logos/toto.svg', about: 'TOTO is het sportwedmerk van Nederlandse Loterij en een van de bekendste bookmakers van Nederland. Veel Nederlandse wedders plaatsen er hun bets op voetbal, tennis en darts.' },
  { slug: 'betcity', name: 'BetCity', logo: '/logos/betcity.svg', about: 'BetCity is een van de bekendste online bookmakers in Nederland, met een breed aanbod aan sporten en live wedden.' },
  { slug: 'bet365', name: 'bet365', logo: '/logos/bet365.svg', about: 'bet365 is een van de grootste online bookmakers ter wereld, met een zeer breed aanbod aan sporten, markten en live wedden.' },
  { slug: 'unibet', name: 'Unibet', logo: '/logos/unibet.svg', about: 'Unibet is een internationaal bekende bookmaker met een breed aanbod aan sporten en markten.' },
  { slug: 'jacks', name: "Jack's", logo: '/logos/jacks.png', about: "Jack's is het online platform van Jack's Casino, bekend van de speelcasino's in Nederland, en biedt ook sportweddenschappen aan." },
  { slug: 'betmgm', name: 'BetMGM', logo: null, about: 'BetMGM is het merk van MGM Resorts en Entain en biedt online sportweddenschappen en casinospellen aan.' },
  { slug: 'circus', name: 'Circus', logo: '/logos/circus.png', about: 'Circus is een van oorsprong Belgisch merk dat in Nederland online sportweddenschappen en casinospellen aanbiedt.' },
  { slug: 'leovegas', name: 'LeoVegas', logo: '/logos/leovegas.jpg', about: 'LeoVegas is van oorsprong een Zweeds merk, bekend van online casino en sportweddenschappen.' },
  { slug: 'holland-casino-online', name: 'Holland Casino Online', logo: null, about: 'Holland Casino Online is het online platform van Holland Casino, bekend van de speelcasino\'s in Nederland.' },
  { slug: 'bingoal', name: 'Bingoal', logo: '/logos/bingoal.jpg', about: 'Bingoal is een van oorsprong Belgisch merk voor sportweddenschappen en casinospellen.' },
  { slug: 'vbet', name: 'Vbet', logo: null, about: 'Vbet is een internationaal merk voor online sportweddenschappen en casinospellen.' },
  { slug: '711', name: '711', logo: null, about: '711 is een online kansspelaanbieder op de Nederlandse markt, met casinospellen en sportweddenschappen.' },
  { slug: 'zebet', name: 'ZEbet', logo: null, about: 'ZEbet is een van oorsprong Frans merk voor online sportweddenschappen.' },
  { slug: 'one-casino', name: 'One Casino', logo: null, about: 'One Casino is een online kansspelaanbieder op de Nederlandse markt.' },
  { slug: 'tonybet', name: 'Tonybet', logo: null, about: 'Tonybet is een internationaal merk voor online sportweddenschappen en casinospellen.' },
  { slug: 'starcasino', name: 'Starcasino', logo: null, about: 'Starcasino is een online kansspelmerk met casinospellen en sportweddenschappen.' },
  { slug: '888', name: '888', logo: '/logos/888sport.png', about: '888 is een internationaal bekend merk voor online kansspelen, met 888sport voor sportweddenschappen.' },
  { slug: 'betnation', name: 'Betnation', logo: null, about: 'Betnation is een online aanbieder van sportweddenschappen en casinospellen op de Nederlandse markt.' },
  { slug: 'comeon', name: 'ComeOn', logo: null, about: 'ComeOn is een van oorsprong Scandinavisch merk voor online casino en sportweddenschappen.' },
  { slug: 'hommerson', name: 'Hommerson', logo: null, about: 'Hommerson is bekend van de speelcasino\'s in Nederland en biedt ook online kansspelen aan.' },
  { slug: 'oranjepalace', name: 'OranjePalace', logo: null, about: 'OranjePalace is een online kansspelaanbieder op de Nederlandse markt.' },
];

export const BOOKMAKER_PAGES = BOOKMAKERS.map(b => ({
  ...b,
  title: `${b.name} bets bijhouden: je resultaat bij ${b.name} in één overzicht`,
  metaTitle: `${b.name} bets bijhouden en analyseren`,
  description: `Houd je ${b.name} bets bij en zie je winst, ROI en saldo bij ${b.name}. Importeer je ${b.name} bethistorie met een screenshot en vergelijk met andere bookmakers.`,
  intro: `Wed je bij ${b.name}? Dan wil je weten hoeveel je daar echt wint of verliest. Met TrackMijnBets houd je je ${b.name} bets bij, zie je je saldo, stortingen en opnames, en vergelijk je je resultaat met je andere bookmakers.`,
  sections: [
    { h2: `Over ${b.name}`, p: [b.about, 'Wed in Nederland alleen bij bookmakers met een vergunning van de Kansspelautoriteit. Die vind je in het openbare vergunningenregister op kansspelautoriteit.nl.'] },
    {
      h2: `Zo houd je je ${b.name} bets bij`,
      ul: [
        `Voeg ${b.name} toe onder Bookmakers, met je huidige saldo en startdatum`,
        `Maak een screenshot van je openstaande of afgeronde bets in je ${b.name}-account`,
        'Upload de screenshot bij Bet Invoeren: de AI herkent wedstrijd, markt, odds, inzet en uitkomst',
        'Controleer de bets en sla ze in één keer op',
        'Registreer stortingen, opnames en bonussen als transactie, zodat je saldo klopt',
      ],
    },
    {
      h2: `Wat je ziet over je ${b.name} resultaten`,
      p: [`Filter je dashboard en statistieken op ${b.name} en je ziet:`],
      ul: [
        `Je totale winst of verlies bij ${b.name}`,
        'Je ROI, win rate en gemiddelde odds',
        'Je resultaat per sport en per markt',
        `Hoe ${b.name} zich verhoudt tot je andere bookmakers`,
        `Je actuele saldo, inclusief stortingen en opnames`,
      ],
    },
    {
      h2: 'Freebets, odds boosts en bonussen',
      p: [
        'Plaats je een bet met een freebet, markeer hem dan als freebet. Zo telt je inzet niet mee als eigen geld en klopt je rendement. Een bet met een odds boost geef je een tag, bijvoorbeeld "boost", zodat je later ziet wat boosts je opleveren.',
      ],
    },
    {
      h2: `Vergelijk odds voordat je bij ${b.name} inzet`,
      p: [
        'Dezelfde bet kan bij de ene bookmaker hogere odds hebben dan bij de andere. Wie structureel de beste odds pakt, verhoogt zijn rendement zonder extra risico. Gebruik daarvoor de Odds Vergelijker, of reken met de gratis tools uit of een bet waarde heeft.',
      ],
    },
  ],
  faq: [
    { q: `Is TrackMijnBets gekoppeld aan mijn ${b.name}-account?`, a: `Nee. TrackMijnBets heeft geen toegang tot je ${b.name}-account en vraagt nooit om je inloggegevens. Je voert je bets zelf in of importeert ze met een screenshot.` },
    { q: `Werkt de screenshot import met ${b.name}?`, a: `Ja. De AI leest de screenshot zelf uit en werkt daardoor met vrijwel elke bookmaker, ook met ${b.name}.` },
    { q: `Is TrackMijnBets onderdeel van ${b.name}?`, a: `Nee. TrackMijnBets is een onafhankelijke tool en is niet verbonden aan ${b.name} of een andere bookmaker.` },
  ],
  related: ['bookmakers-beheren', 'bets-importeren-met-ai', 'odds-vergelijker'],
}));

export const getBookmakerPage = (slug) => BOOKMAKER_PAGES.find(b => b.slug === slug);
