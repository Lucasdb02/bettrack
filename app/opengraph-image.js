import { ImageResponse } from 'next/og';

export const alt = 'TrackMijnBets: de bet tracker voor Nederlandse sportwedders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: 'linear-gradient(135deg, #04111f 0%, #0d1f38 100%)', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#5469d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>TrackMijnBets</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 950 }}>Houd je bets bij. Slimmer en automatisch met AI.</div>
        <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.6)', marginTop: 28 }}>Bet tracker · Statistieken · Odds vergelijker · Calculators</div>
      </div>
    ),
    size,
  );
}
