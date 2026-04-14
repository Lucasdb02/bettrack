export const PERIOD_OPTIONS = [
  { label: 'Vandaag',               filter: 'today' },
  { label: 'Gisteren',              filter: 'yesterday' },
  { label: 'Afgelopen 7 dagen',     filter: 'last7' },
  { label: 'Vorige week',           filter: 'lastWeek' },
  { label: 'Afgelopen 28 dagen',    filter: 'last28' },
  { label: 'Deze maand',            filter: 'thisMonth' },
  { label: 'Vorige maand',          filter: 'lastMonth' },
  { label: 'Afgelopen 3 maanden',   filter: 'last3m' },
  { label: 'Afgelopen 6 maanden',   filter: 'last6m' },
  { label: 'Dit jaar (vanaf 1 jan)',filter: 'thisYear' },
  { label: 'Vorig jaar',            filter: 'lastYear' },
  { label: 'Alle tijd',             filter: 'all' },
];

export function getDateRange(filter) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1);
  const d     = today.getDay() || 7;

  switch (filter) {
    case 'today':     return { from: today, to: tom };
    case 'yesterday': { const y = new Date(today); y.setDate(y.getDate()-1); return { from:y, to:today }; }
    case 'last7':     { const f = new Date(today); f.setDate(f.getDate()-7); return { from:f, to:tom }; }
    case 'lastWeek':  { const mon = new Date(today); mon.setDate(today.getDate()-(d+6)); const nxt = new Date(mon); nxt.setDate(mon.getDate()+7); return { from:mon, to:nxt }; }
    case 'last28':    { const f = new Date(today); f.setDate(f.getDate()-28); return { from:f, to:tom }; }
    case 'lastMonth': { const f = new Date(now.getFullYear(), now.getMonth()-1, 1); const t = new Date(now.getFullYear(), now.getMonth(), 1); return { from:f, to:t }; }
    case 'thisMonth': { const f = new Date(now.getFullYear(), now.getMonth(), 1); return { from:f, to:tom }; }
    case 'thisYear':  { const f = new Date(now.getFullYear(), 0, 1); return { from:f, to:tom }; }
    case 'last3m':    { const f = new Date(today); f.setMonth(f.getMonth()-3); return { from:f, to:tom }; }
    case 'last6m':    { const f = new Date(today); f.setMonth(f.getMonth()-6); return { from:f, to:tom }; }
    case 'lastYear':  { const f = new Date(now.getFullYear()-1, 0, 1); const t = new Date(now.getFullYear(), 0, 1); return { from:f, to:t }; }
    default: return null;
  }
}

export function filterBetsByPeriod(bets, filter) {
  if (filter === 'all') return bets;
  const range = getDateRange(filter);
  if (!range) return bets;
  return bets.filter(b => { const d = new Date(b.datum); return d >= range.from && d < range.to; });
}

const NL_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

export function fmtBucketLabel(date, type) {
  if (type === 'day')   return `${date.getDate()} ${NL_SHORT[date.getMonth()]}`;
  if (type === 'week')  return `${date.getDate()} ${NL_SHORT[date.getMonth()]}`;
  return `${NL_SHORT[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;
}
