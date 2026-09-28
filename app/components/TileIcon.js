import {
  ScanLine, ListChecks, LayoutDashboard, ChartColumn, CalendarDays, Wallet, Scale, Calculator,
  ArrowLeftRight, Layers, Shield, Target, TrendingUp, Percent, Repeat, Split, BookOpen, Gem,
  PiggyBank, Landmark, Trophy, Sparkles,
} from 'lucide-react';

/* Gekleurd icoon-vierkantje voor tegels (kaarten) op de publieke site */
const COLORS = {
  blue:   ['#60a5fa', 'rgba(59,130,246,0.16)'],
  green:  ['#4ade80', 'rgba(34,197,94,0.16)'],
  purple: ['#c084fc', 'rgba(168,85,247,0.18)'],
  orange: ['#fb923c', 'rgba(249,115,22,0.16)'],
  red:    ['#f87171', 'rgba(239,68,68,0.16)'],
  yellow: ['#facc15', 'rgba(234,179,8,0.16)'],
  cyan:   ['#22d3ee', 'rgba(6,182,212,0.16)'],
  pink:   ['#f472b6', 'rgba(236,72,153,0.16)'],
};

const BY_SLUG = {
  /* Functies */
  'bets-importeren-met-ai': [ScanLine, 'purple'],
  'bets-bijhouden':         [ListChecks, 'blue'],
  'dashboard':              [LayoutDashboard, 'cyan'],
  'statistieken':           [ChartColumn, 'orange'],
  'maandoverzicht':         [CalendarDays, 'green'],
  'bookmakers-beheren':     [Wallet, 'yellow'],
  'odds-vergelijker':       [Scale, 'pink'],
  'calculators':            [Calculator, 'blue'],
  'asian-handicap-uitleg':  [ArrowLeftRight, 'red'],
  'units-en-export':        [Layers, 'purple'],
  /* Tools */
  'arbitrage-calculator':       [Shield, 'green'],
  'kelly-criterion-calculator': [Target, 'blue'],
  'expected-value-berekenen':   [TrendingUp, 'cyan'],
  'bookmaker-marge-berekenen':  [Percent, 'orange'],
  'odds-omrekenen':             [Repeat, 'purple'],
  'dutching-calculator':        [Split, 'pink'],
  /* Gidsen */
  'hoe-houd-je-je-bets-bij': [BookOpen, 'blue'],
  'value-betting':           [Gem, 'purple'],
  'bankroll-management':     [PiggyBank, 'yellow'],
};

function resolve(href) {
  const slug = href.split('/').filter(Boolean).pop();
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  if (href.startsWith('/bookmaker')) return [Landmark, 'yellow'];
  if (href.startsWith('/bet-tracker')) return [Trophy, 'green'];
  return [Sparkles, 'blue'];
}

export default function TileIcon({ href }) {
  const [Icon, color] = resolve(href);
  const [fg, bg] = COLORS[color];
  return (
    <span className="tile-icon" style={{ background: bg, color: fg }} aria-hidden>
      <Icon size={20} strokeWidth={2} />
    </span>
  );
}
