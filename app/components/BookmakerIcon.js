'use client';
import { useState } from 'react';

/** Dominant brand color per bookmaker — used for chart bars, dots, etc. */
export const BOOKIE_BRAND_COLORS = {
  'bet365':                '#11B981',
  'BetCity':               '#082142',
  'Unibet':                '#007940', // Dark green
  'LeoVegas':              '#F5A623', // Golden orange
  'Holland Casino Online': '#C8102E', // Red
  'TOTO':                  '#FF6B00', // Deep orange
  "Jack's":                '#1B4F9B', // Blue
  'Bingoal':               '#E5B800', // Golden yellow
  'Circus':                '#E30613', // Red
  'BetMGM':                '#B5982A', // Gold
  'Vbet':                  '#003087', // Dark blue
  '711':                   '#FF8000', // Orange
  'ZEbet':                 '#0066CC', // Blue
  'One Casino':            '#A855F7', // Purple
  'Tonybet':               '#1D4ED8', // Blue
  'Starcasino':            '#7C3AED', // Purple
  '888':                   '#FF4500', // Red-orange
  'Betnation':             '#2563EB', // Blue
  'ComeOn':                '#DC2626', // Red
  'Overig':                '#6B7280', // Grey
};

export const BOOKMAKER_DOMAINS = {
  'bet365':                'bet365.com',
  'BetCity':               'betcity.nl',
  'Unibet':                'unibet.nl',
  'LeoVegas':              'leovegas.com',
  'Holland Casino Online': 'hollandcasino.nl',
  'TOTO':                  'toto.nl',
  "Jack's":                'jacks.nl',
  'Bingoal':               'bingoal.nl',
  'Circus':                'circus.nl',
  'BetMGM':                'betmgm.com',
  'Vbet':                  'vbet.com',
  '711':                   '711.nl',
  'ZEbet':                 'zebet.nl',
  'One Casino':            'onecasino.nl',
  'Tonybet':               'tonybet.com',
  'Starcasino':            'starcasino.be',
  '888':                   '888sport.com',
  'Betnation':             'betnation.com',
  'ComeOn':                'comeon.nl',
  'Overig':                null,
};

export default function BookmakerIcon({ naam, size = 18 }) {
  const [errored, setErrored] = useState(false);
  const domain = BOOKMAKER_DOMAINS[naam];

  if (!domain || errored) {
    // Fallback: coloured letter avatar
    const letter = naam ? naam[0].toUpperCase() : '?';
    const colors = ['#5469d4','#0e9f6e','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#f97316','#84cc16','#e02424'];
    const bg = colors[(naam?.charCodeAt(0) || 0) % colors.length];
    return (
      <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:size, height:size, borderRadius:4, backgroundColor:bg, color:'#fff', fontSize:size * 0.55, fontWeight:700, flexShrink:0, lineHeight:1 }}>
        {letter}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      width={size}
      height={size}
      alt={naam}
      onError={() => setErrored(true)}
      style={{ borderRadius:4, objectFit:'contain', flexShrink:0, display:'block' }}
    />
  );
}
