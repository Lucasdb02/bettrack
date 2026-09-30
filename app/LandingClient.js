'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase';
import SiteFooter from './components/SiteFooter';
import { useSiteDark } from './components/useSiteTheme';
import FaqSection from './components/FaqSection';
import SiteHeader from './components/SiteHeader';
import PricingSection from './components/PricingSection';
import HowItWorks from './components/HowItWorks';
import TrustStats from './components/TrustStats';
import BookmakerFlow from './components/BookmakerFlow';
import { FAQS } from '@/lib/faqs';

/* ── Landing page theme context ── */
const LpTheme = createContext({ dark: true });
const useLp = () => useContext(LpTheme);

/* ── Catmull-Rom → cubic Bezier SVG path ── */
function mkSmoothPath(pts) {
  const t = 0.3;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = (p1[0] + (p2[0] - p0[0]) * t).toFixed(1);
    const cp1y = (p1[1] + (p2[1] - p0[1]) * t).toFixed(1);
    const cp2x = (p2[0] - (p3[0] - p1[0]) * t).toFixed(1);
    const cp2y = (p2[1] - (p3[1] - p1[1]) * t).toFixed(1);
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ── Lighten a hex color towards white ── */
function lightenColor(hex, factor = 0.22) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const lc = c => Math.min(255, Math.round(c + (255 - c) * factor));
  return `#${lc(r).toString(16).padStart(2,'0')}${lc(g).toString(16).padStart(2,'0')}${lc(b).toString(16).padStart(2,'0')}`;
}

/* ── Hero ── */
/* Hero-animatie: bij laden komen de koptekstregels van onder een masker omhoog en volgen
   badge, tekst, knoppen en cijfers gestaffeld; bij scrollen gaat de tekst
   sneller omhoog dan het dashboard (parallax). */
const HERO_EASE = [0.22, 1, 0.36, 1];
const heroStagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const heroItem = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: HERO_EASE } },
};
const heroLine = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.8, ease: HERO_EASE } },
};

function Hero() {
  const { dark } = useLp();
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [linesRevealed, setLinesRevealed] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -110]);
  const mockY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -35]);
  const cBg   = 'rgba(255,255,255,0.04)';
  const cBrd  = 'rgba(255,255,255,0.07)';

  return (
    <section ref={heroRef} className="lp-hero-section" style={{
      background: dark
        ? 'linear-gradient(160deg, #04111f 0%, #0a2540 45%, #0d1f38 100%)'
        : '#ffffff',
      paddingBottom: 0, paddingTop: 0,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>

      {/* Dotted grid — fades outward from where the dashboard lives */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle, ${dark ? 'rgba(107,130,240,0.38)' : 'rgba(84,105,212,0.34)'} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
        maskImage:        'radial-gradient(ellipse 90% 90% at 75% 50%, black 0%, transparent 65%)',
      }} />

      {/* Subtle glow behind mockup */}
      <div style={{ position: 'absolute', top: '10%', left: '42%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(84,105,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Full-width flex — left text | right mockup */}
      <div className="lp-hero-row" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

        {/* Left text — aligned to 1400px grid */}
        <motion.div className="lp-hero-text" initial="hidden" animate="show" variants={heroStagger}
          style={{ flexShrink: 0, width: '50%', minWidth: 320, padding: '128px 48px 80px max(32px, calc((100vw - 1400px) / 2 + 32px))', y: textY }}>
          <motion.div variants={heroItem} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: dark ? 'rgba(84,105,212,0.15)' : 'rgba(84,105,212,0.1)', border: '1px solid rgba(84,105,212,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5469d4', animation: 'dot-pulse 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: 13, color: dark ? '#a5b8f5' : '#5469d4', fontWeight: 500 }}>Gebouwd voor Nederlandse sportwedders</span>
          </motion.div>

          <h1 className="lp-hero-title" style={{ fontSize: 62, fontWeight: 400, color: dark ? 'rgba(255,255,255,0.85)' : '#334155', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 22 }}>
            <span className={`lp-hero-line${linesRevealed ? ' is-revealed' : ''}`}><motion.span variants={heroLine} style={{ display: 'block' }}>
            Track je <strong className="lp-hero-strong">Bets</strong>{' '}
            <span style={{ display:'inline-block', position:'relative', width:'0.84em', height:'0.84em', margin:'0 0.14em 0 0.04em', verticalAlign:'middle', top:'-0.05em', flexShrink:0 }}>
              {/* Outer tilted white card */}
              <span style={{ position:'absolute', inset:0, backgroundColor:'#ffffff', borderRadius:'18%', transform:'rotate(-9deg)', boxShadow:'0 6px 22px rgba(0,0,0,0.14)', border:'1.5px solid rgba(0,0,0,0.09)', display:'block', zIndex:0 }}/>
              {/* Inner colored square */}
              <span style={{ position:'absolute', inset:'14%', backgroundColor:'rgba(84,105,212,0.13)', borderRadius:'14%', display:'block', zIndex:1 }}/>
              {/* Icon */}
              <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width:'54%', height:'54%' }}>
                  <path fill="#1e3a5f" d="M19,24H14a5.006,5.006,0,0,1-5-5V14a5.006,5.006,0,0,1,5-5h5a5.006,5.006,0,0,1,5,5v5A5.006,5.006,0,0,1,19,24ZM14,11a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V14a3,3,0,0,0-3-3Zm0,2a1,1,0,1,0,1,1A1,1,0,0,0,14,13Zm5,5a1,1,0,1,0,1,1A1,1,0,0,0,19,18ZM9,7A1,1,0,1,0,8,6,1,1,0,0,0,9,7ZM7,9a1,1,0,1,0-1,1A1,1,0,0,0,7,9Zm-.22,6.826a1,1,0,0,0-.154-1.405,3.15,3.15,0,0,1-.251-.228L2.864,10.634a3.005,3.005,0,0,1,.029-4.243L6.453,2.88a2.98,2.98,0,0,1,2.106-.864h.022a2.981,2.981,0,0,1,2.115.893L14.2,6.465c.057.058.111.117.163.179A1,1,0,1,0,15.9,5.356c-.083-.1-.17-.194-.266-.292L12.12,1.505a5,5,0,0,0-7.071-.049L1.489,4.967a5.007,5.007,0,0,0-.049,7.071L4.951,15.6a4.865,4.865,0,0,0,.423.381,1,1,0,0,0,1.406-.153Z"/>
                </svg>
              </span>
            </span>
            <strong className="lp-hero-strong">Slimmer</strong>
            </motion.span></span>
            <span className={`lp-hero-line${linesRevealed ? ' is-revealed' : ''}`}><motion.span variants={heroLine} style={{ display: 'block' }}
              onAnimationComplete={() => setLinesRevealed(true)}>
            en <strong className={`lp-hero-label${dark ? '' : ' is-light'}`}>Automatisch</strong> met{' '}
            <span className="lp-hero-strong" style={{ background: 'linear-gradient(135deg, #7b9ef0, #5469d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI
            </span>
            </motion.span></span>
          </h1>

          <motion.p variants={heroItem} className="lp-hero-sub" style={{ fontSize: 16, fontWeight: 400, color: dark ? 'rgba(255,255,255,0.55)' : '#64748b', lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
            De meest geavanceerde sports bet tracker. Track je bets direct via screenshots of een browserextensie. Een compleet sportsbook trackingplatform met diepgaande analyses voor serieuze sportsbettors.
          </motion.p>

          <motion.div variants={heroItem} className="lp-cta-row" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <Link href="/signup"
              style={{ background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 28px rgba(84,105,212,0.55)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Gratis beginnen
            </Link>
            <Link href="/functies"
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)', backdropFilter: 'blur(12px) saturate(1.6)', WebkitBackdropFilter: 'blur(12px) saturate(1.6)', border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(99,102,241,0.25)', color: dark ? 'rgba(255,255,255,0.9)' : '#4f46e5', fontSize: 15, fontWeight: 600, padding: '13px 24px', borderRadius: 9, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
            >Bekijk functies</Link>
          </motion.div>

          <motion.div variants={heroItem} className="lp-stats-row" style={{ display: 'flex', alignItems: 'center' }}>
            {[
              {
                value: '2.400+', label: 'Actieve gebruikers',
                icon: 'm11,0c-3.309,0-6,2.691-6,6s2.691,6,6,6,6-2.691,6-6S14.309,0,11,0Zm0,10c-2.206,0-4-1.794-4-4s1.794-4,4-4,4,1.794,4,4-1.794,4-4,4Zm2.969,5.501c-.138.536-.687.857-1.218.719-.568-.146-1.158-.22-1.751-.22-3.859,0-7,3.14-7,7,0,.552-.447,1-1,1s-1-.448-1-1c0-4.962,4.037-9,9-9,.761,0,1.518.095,2.249.284.535.137.857.683.72,1.217Zm10.031,3.499c0,1.654-1.346,3-3,3v1c0,.552-.447,1-1,1s-1-.448-1-1v-1.002h-.27c-1.066,0-2.061-.574-2.596-1.496-.277-.478-.114-1.09.364-1.367.478-.276,1.09-.114,1.366.364.179.308.51.499.866.499l2.27.002c.551,0,.999-.449.999-1,0-.378-.271-.698-.644-.76l-3.041-.507c-1.342-.223-2.315-1.373-2.315-2.733,0-1.654,1.346-3,3-3v-1c0-.552.447-1,1-1s1,.448,1,1v1.003h.271c1.063,0,2.058.573,2.594,1.495.278.477.116,1.089-.361,1.367-.478.278-1.091.115-1.367-.362-.183-.312-.506-.5-.866-.5l-2.271-.003c-.551,0-.999.449-.999,1,0,.378.271.698.644.76l3.041.507c1.342.223,2.315,1.373,2.315,2.733Z',
                vb: '0 0 24 24',
              },
              {
                value: '€3.2M+', label: 'Bets gevolgd',
                icon: 'm24,2v4c0,.552-.447,1-1,1s-1-.448-1-1v-2.586l-4.063,4.062c-1.344,1.344-3.531,1.345-4.875,0l-2.539-2.538c-.565-.565-1.483-.563-2.047,0L1.707,11.707c-.195.195-.451.293-.707.293s-.512-.098-.707-.293c-.391-.391-.391-1.023,0-1.414L7.062,3.524c1.344-1.344,3.531-1.345,4.875,0l2.539,2.538c.565.566,1.483.563,2.047,0l4.062-4.062h-2.586c-.553,0-1-.448-1-1s.447-1,1-1h4c1.103,0,2,.897,2,2Zm-2.315,14.267l-3.04-.506c-.374-.062-.645-.382-.645-.761,0-.552.448-1,1-1h2.268c.356,0,.688.191.867.501.274.478.885.643,1.366.364.478-.276.642-.888.364-1.366-.534-.924-1.53-1.499-2.598-1.499h-.268v-1c0-.552-.447-1-1-1s-1,.448-1,1v1c-1.654,0-3,1.346-3,3,0,1.359.974,2.51,2.315,2.733l3.04.506c.374.062.645.382.645.761,0,.552-.448,1-1,1h-2.268c-.356,0-.688-.191-.867-.501-.275-.479-.888-.645-1.366-.364-.478.276-.642.888-.364,1.366.534.925,1.53,1.499,2.598,1.499h.268v1c0,.553.447,1,1,1s1-.447,1-1v-1c1.654,0,3-1.346,3-3,0-1.359-.974-2.51-2.315-2.733ZM2,14c-.553,0-1,.447-1,1v8c0,.553.447,1,1,1s1-.447,1-1v-8c0-.553-.447-1-1-1Zm5-4.5c-.553,0-1,.448-1,1v12.5c0,.553.447,1,1,1s1-.447,1-1v-12.5c0-.552-.447-1-1-1Zm5,0c-.553,0-1,.448-1,1v12.5c0,.553.447,1,1,1s1-.447,1-1v-12.5c0-.552-.447-1-1-1Z',
                vb: '0 0 24 24',
              },
              {
                value: '94%', label: 'Tevreden bettors',
                icon: 'm24,5v2c0,2.757-2.243,5-5,5h-2c-.552,0-1-.448-1-1s.448-1,1-1h2c1.654,0,3-1.346,3-3v-2c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v2c0,1.654,1.346,3,3,3,.552,0,1,.448,1,1s-.448,1-1,1c-2.757,0-5-2.243-5-5v-2C0,2.243,2.243,0,5,0h14c2.757,0,5,2.243,5,5Zm-5.238,13.552l-4.755-1.783v-4.662c0-1.516-1.076-2.834-2.503-3.066-.879-.143-1.768.103-2.439.674-.672.571-1.057,1.404-1.057,2.286v7.563l-1.003-.799c-1.21-1.083-3.075-1.006-4.188.186-1.13,1.208-1.066,3.11.13,4.23l.558.538c.186.18.435.28.694.28.9,0,1.342-1.095.694-1.72l-.568-.548c-.403-.378-.424-1.013-.046-1.416.375-.402,1.008-.421,1.41-.048h0c.011.011,1.771,1.415,1.771,1.415.476.378,1.111.451,1.66.186.548-.264.889-.806.889-1.415v-8.455c0-.294.128-.572.353-.762.228-.193.519-.272.823-.224.462.076.825.556.825,1.093v5.354c0,.417.259.79.649.937l5.404,2.027c1.111.417,1.873,1.45,1.941,2.633.031.532.472.942.998.942.02,0,.039,0,.059-.001.551-.032.972-.505.94-1.057-.115-1.973-1.385-3.696-3.236-4.39Zm2.207-13.23c-.072-.197-.26-.329-.47-.329h-1.5l-.531-1.49c-.073-.196-.26-.325-.469-.325s-.396.13-.469.325l-.531,1.49h-1.5c-.21,0-.397.131-.469.328-.073.197-.014.418.146.553l1.189.967-.47,1.508c-.063.202.007.423.177.55.089.066.194.1.3.1.097,0,.194-.028.278-.084l1.354-.906,1.377.897c.178.115.409.106.578-.023.168-.13.236-.352.169-.553l-.489-1.49,1.183-.964c.161-.135.22-.357.148-.554Zm-6,0c-.072-.197-.26-.329-.47-.329h-1.5l-.531-1.49c-.073-.196-.26-.325-.469-.325s-.396.13-.469.325l-.531,1.49h-1.5c-.21,0-.397.131-.469.328-.073.197-.014.418.146.553l1.446,1.142c.397-.031.8-.016,1.202.05.823.134,1.576.48,2.21.978l-.396-1.205,1.183-.964c.161-.135.22-.357.148-.554Zm-10.898,3.578c.089.066.194.1.3.1.097,0,.194-.028.278-.084l1.354-.906,1.377.897c.178.115.409.106.578-.023.168-.13.236-.352.169-.553l-.489-1.49,1.183-.964c.161-.135.22-.357.148-.554s-.26-.329-.47-.329h-1.5l-.531-1.49c-.073-.196-.26-.325-.469-.325s-.396.13-.469.325l-.531,1.49h-1.5c-.21,0-.397.131-.469.328-.073.197-.014.418.146.553l1.189.967-.47,1.508c-.063.202.007.423.177.55Z',
                vb: '0 0 24 24',
              },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', margin: '0 24px' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg viewBox={s.vb} width="22" height="22" fill="none" style={{ flexShrink: 0, opacity: 0.55 }}>
                    <path d={s.icon} fill={dark ? '#a5b8f5' : '#5469d4'} />
                  </svg>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 800, color: dark ? '#fff' : '#0f172a', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginTop: 4 }}>{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — screenshot in browser chrome, top/bottom aligned to left column content */}
        <motion.div className="lp-mockup-wrap"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: HERO_EASE }}
          style={{ flex: 1, paddingTop: 128, paddingBottom: 80, paddingLeft: 40, minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
          {/* Browser chrome — light theme, fills exact height; parallax: beweegt trager dan de tekst */}
          <motion.div style={{
            y: mockY,
            flex: 1,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #d1d9e0',
            boxShadow: '0 8px 24px -6px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            width: '115%',
            marginLeft: '8%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Title bar: stoplight + URL bar */}
            <div style={{ background: '#f0f2f5', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid #d1d9e0', flexShrink: 0 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, flexShrink: 0, border: '0.5px solid rgba(0,0,0,0.12)' }} />
              ))}
              <div style={{ flex: 1, marginLeft: 10, height: 22, background: '#e2e6ec', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                <span style={{ fontSize: 10.5, color: '#9ca3af', letterSpacing: '0.01em', fontWeight: 500 }}>trackmijnbets.nl/dashboard</span>
              </div>
            </div>

            {/* Dashboard screenshot — fills browser, top-anchored */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <img
                src="https://www.image2url.com/r2/default/images/1777465020019-6a5651e8-1e10-4943-9495-b1d19c821d54.png"
                alt="TrackMijnBets dashboard"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TMB_REVIEWS = {
  col1: [
    { text: 'Eindelijk een tool die echt snapt hoe sportwedden werkt. Mijn win rate is al met 8% gestegen na twee maanden alles bijhouden.', name: 'Lars Kramer', role: 'Recreatief bettor', color: '#3b82f6' },
    { text: 'TrackMijnBets liet me zien dat ik consistent verlies op voetbal onder 2.5, maar winst pak op tennis. Had dit nooit zelf uitgerekend.', name: 'Roos Visser', role: 'Part-time bettor', color: '#8b5cf6' },
    { text: 'De AI-extensie werkt echt magisch. Screenshot maken en alles staat al ingevuld. Scheelt me elke dag veel tijd.', name: 'Daan Mulder', role: 'Casual bettor', color: '#06b6d4' },
    { text: 'Ik gebruik het nu al 3 maanden en kan echt niet meer zonder. De grafieken geven me precies het overzicht dat ik nodig heb.', name: 'Stefan Bakker', role: 'Serieuze bettor', color: '#10b981' },
    { text: 'Beste investering als bettor. Tientje per maand en je weet eindelijk waar je geld naartoe gaat. Onmisbaar.', name: 'Joris Hendriks', role: 'Sportwedder', color: '#f59e0b' },
  ],
  col2: [
    { text: 'Al jaren wedden en nooit precies geweten hoe ik er voor stond. TrackMijnBets geeft me nu eindelijk echt inzicht in mijn resultaten.', name: 'Emma de Vries', role: 'Recreatief bettor', color: '#ec4899' },
    { text: 'De bookmaker-vergelijking is goud waard. Bleek dat ik bij één bookie structureel slechter presteer. Nu weet ik dat tenminste.', name: 'Tim Roos', role: 'Value bettor', color: '#6366f1' },
    { text: 'Geweldig product. Simpel, overzichtelijk en het doet precies wat het belooft. Aanrader voor elke serieuze bettor.', name: 'Kevin Smit', role: 'Hobbyist bettor', color: '#14b8a6' },
    { text: 'Mijn vrienden gebruiken het inmiddels allemaal. We delen onze stats en proberen elkaar bij te houden — gezellig én nuttig.', name: 'Mark Jansen', role: 'Groepsbettor', color: '#f97316' },
    { text: 'Van chaos naar overzicht in één week. Ik wist niet eens dat ik 6 maanden netto verlies maakte. Nu weet ik het en kan ik bijsturen.', name: 'Bas Otten', role: 'Beginnend bettor', color: '#84cc16' },
  ],
  col3: [
    { text: 'De P&L grafiek per dag geeft me precies het gevoel van controle dat ik zocht. Echt een top tool!', name: 'Niels Willems', role: 'Dagelijks bettor', color: '#0ea5e9' },
    { text: 'Had zelf Excel-sheets. Dit is tien keer beter. En de AI die bets herkent is geen gimmick — het werkt écht.', name: 'Thomas Aarts', role: 'Ex-Excel gebruiker', color: '#a855f7' },
    { text: 'Ik raad het aan aan iedereen in mijn Telegram-groep. Zet je ego opzij en kijk gewoon naar de data.', name: 'Wouter Kok', role: 'Community bettor', color: '#22c55e' },
    { text: 'Gewoon een heel solide product. Niks gaat mis, alles laadt snel. Precies wat je nodig hebt als bettor.', name: 'Rick Fontein', role: 'Pro bettor', color: '#ef4444' },
    { text: 'De statistieken per sport hebben me verrast. Dacht dat voetbal mijn sterkste was, maar tennis is mijn cashcow.', name: 'Sanne Peters', role: 'Multi-sport bettor', color: '#d946ef' },
  ],
};

function TmbCard({ r, dark }) {
  const bg  = dark ? '#0d1a2e' : '#ffffff';
  const bdr = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const t1  = dark ? '#fff' : '#0f172a';
  const t2  = dark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const initials = r.name.split(' ').map(w => w[0]).slice(0,2).join('');
  return (
    // Fixed height ensures every card in every column is identical height → columns stay in sync
    <div style={{ backgroundColor: bg, border: `1px solid ${bdr}`, borderRadius: 16, padding: '20px 22px', marginBottom: 14, boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)', height: 190, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <svg width="24" height="18" viewBox="0 0 24 18" fill="#6b82f0" style={{ marginBottom: 10, flexShrink: 0 }}>
        <path d="M0 18V10.8C0 4.932 3.468 1.332 10.404 0L11.52 2.016C8.748 2.772 6.948 4.068 5.88 6.192 5.4 7.164 5.184 8.148 5.244 9H9.6V18H0zm14.4 0V10.8C14.4 4.932 17.868 1.332 24.804 0L25.92 2.016C23.148 2.772 21.348 4.068 20.28 6.192 19.8 7.164 19.584 8.148 19.644 9H24V18H14.4z" transform="scale(0.9)"/>
      </svg>
      <p style={{ fontSize: 15, color: t1, lineHeight: 1.6, fontWeight: 450, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{r.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{initials}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t1 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: t2 }}>{r.role}</div>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const { dark } = useLp();
  const bg    = dark ? '#060e1a' : '#ffffff';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.45)' : '#64748b';

  const mkCol = (reviews, doubled) => doubled ? [...reviews, ...reviews] : reviews;

  return (
    <section style={{ backgroundColor: bg, padding: '96px 0', borderTop: `1px solid ${border}`, overflow: 'hidden', transition: 'background-color 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 60, padding: '0 32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5469d4', '--dot-color': 'rgba(84,105,212,0.6)' }}/>
          <span style={{ fontSize: 13, color: text2, fontWeight: 500 }}>Wat bettors zeggen</span>
        </div>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: text1, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Geliefd bij bettors door heel Nederland
        </h2>
      </div>

      {/* 3-column scroll grid — wrapped so the fade overlay stays inside */}
      <div style={{ position: 'relative', maxWidth: 1124, margin: '0 auto', padding: '0 32px' }}>
        <div className="tmb-track" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxHeight: 640, overflow: 'hidden' }}>
          {/* Left — scroll down */}
          <div className="tmb-col-down">
            {mkCol(TMB_REVIEWS.col1, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
          {/* Middle — scroll up */}
          <div className="tmb-col-up" style={{ marginTop: -80 }}>
            {mkCol(TMB_REVIEWS.col2, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
          {/* Right — scroll down (different speed) */}
          <div className="tmb-col-down2">
            {mkCol(TMB_REVIEWS.col3, true).map((r, i) => <TmbCard key={i} r={r} dark={dark}/>)}
          </div>
        </div>
        {/* Fade overlay — absolute so it never bleeds outside the track */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(to bottom, ${bg} 0%, transparent 20%, transparent 80%, ${bg} 100%)` }}/>
      </div>
    </section>
  );
}

/* ── Calendar preview ── */
function AnalysePreview() {
  const { dark } = useLp();
  const bg = dark ? '#04111f' : '#f8fafc';
  const border = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const text1 = dark ? '#fff' : '#0f172a';
  const text2 = dark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const bulletText = dark ? 'rgba(255,255,255,0.7)' : '#334155';

  const days = [
    { d: null }, { d: null },
    { d: 1, pnl: null }, { d: 2, pnl: 45.5 }, { d: 3, pnl: -22 }, { d: 4, pnl: 78 }, { d: 5, pnl: -15 },
    { d: 6, pnl: 0 }, { d: 7, pnl: 33 }, { d: 8, pnl: 12 }, { d: 9, pnl: -40 }, { d: 10, pnl: 55 }, { d: 11, pnl: null }, { d: 12, pnl: 28 },
    { d: 13, pnl: -8 }, { d: 14, pnl: 90 }, { d: 15, pnl: 15 }, { d: 16, pnl: -30 }, { d: 17, pnl: 44 }, { d: 18, pnl: null }, { d: 19, pnl: -18 },
    { d: 20, pnl: 62 }, { d: 21, pnl: null }, { d: 22, pnl: 35 }, { d: 23, pnl: -25 }, { d: 24, pnl: 80 }, { d: 25, pnl: null }, { d: 26, pnl: 20 },
    { d: 27, pnl: -12 }, { d: 28, pnl: 48 }, { d: 29, pnl: 18 }, { d: 30, pnl: null }, { d: null }, { d: null },
  ];

  return (
    <section id="analyse" className="lp-section-pad" style={{ backgroundColor: bg, padding: '96px 32px', borderTop: `1px solid ${border}`, transition: 'background-color 0.3s ease' }}>
      <div className="lp-analyse-grid" style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maandoverzicht</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: text1, marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
            Elke dag in één oogopslag
          </h2>
          <p style={{ fontSize: 16, color: text2, lineHeight: 1.7, marginBottom: 24 }}>
            Het Pikkit-stijl kalenderoverzicht toont elke dag van de maand als een gekleurd vakje.
            Groen betekent winst, rood verlies. Klik op een dag om precies te zien welke bets je die dag had geplaatst.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Dagelijkse P&L in één oogopslag',
              'Kleurcodering op basis van winstgrootte',
              'Klik op dag voor gedetailleerde betlijst',
              'Navigeer door maanden met één klik',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 15, color: bulletText }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar mock — always dark (shows app UI) */}
        <div style={{ backgroundColor: '#0d1a2e', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between" style={{ padding: '14px 18px', backgroundColor: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>April 2026</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#34D399' }}>+€363</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d) => (
              <div key={d} style={{ padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#3d5570', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((cell, i) => {
              if (!cell.d) return <div key={i} style={{ minHeight: 52, backgroundColor: 'rgba(0,0,0,0.15)', borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />;
              const hasPnl = cell.pnl !== null && cell.pnl !== 0;
              const bg2 = cell.pnl === null ? 'transparent' : cell.pnl > 0 ? `rgba(52,211,153,${0.06 + Math.abs(cell.pnl)/90*0.16})` : cell.pnl < 0 ? `rgba(251,113,133,${0.06 + Math.abs(cell.pnl)/90*0.14})` : 'transparent';
              return (
                <div key={i} style={{ minHeight: 52, padding: '6px 7px', backgroundColor: bg2, borderRight: i % 7 !== 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: hasPnl ? 'pointer' : 'default' }}>
                  <p style={{ fontSize: 10.5, fontWeight: hasPnl ? 600 : 400, color: hasPnl ? '#8b949e' : '#3d5570' }}>{cell.d}</p>
                  {hasPnl && (
                    <p style={{ fontSize: 9.5, fontWeight: 700, color: cell.pnl > 0 ? '#34D399' : '#FB7185', marginTop: 2 }}>
                      {cell.pnl > 0 ? '+' : ''}€{cell.pnl}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  const { dark } = useLp();
  return (
    <section className="lp-final-cta-section" style={{ background: dark ? 'linear-gradient(135deg, #0a2540 0%, #0d1f38 100%)' : '#f1f5f9', padding: '100px 32px', textAlign: 'center', borderTop: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.06)', transition: 'background 0.3s ease' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h2 className="lp-final-cta-title" style={{ fontSize: 42, fontWeight: 800, color: dark ? '#fff' : '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18 }}>
          Klaar om slimmer te wedden?
        </h2>
        <p style={{ fontSize: 17, color: dark ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: 40, lineHeight: 1.6 }}>
          Doe mee met 2.400+ bettors die TrackMijnBets gebruiken om hun resultaten te verbeteren. Begin vandaag, gratis.
        </p>
        <Link href="/signup" className="lp-final-cta-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6b82f0 0%, #5469d4 100%)', color: '#fff', fontSize: 15.5, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, boxShadow: '0 4px 32px rgba(84,105,212,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          Gratis aanmelden
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.3)' : '#94a3b8', marginTop: 16 }}>Geen creditcard nodig. Direct aan de slag.</p>
      </div>
    </section>
  );
}

/* ── FAQ ── */


function FAQ() {
  const { dark } = useLp();
  return (
    <section className="lp-faq" style={{ backgroundColor: dark ? '#060e1a' : '#f8fafc', padding: '88px 32px', transition: 'background-color 0.3s ease' }}>
      <FaqSection items={FAQS.map(f => ({ q: f.v, a: f.a }))} />
    </section>
  );
}

/* ── Main export ── */
export default function LandingPage() {
  const dark = useSiteDark();

  return (
    <LpTheme.Provider value={{ dark }}>
      <div style={{ backgroundColor: dark ? '#04111f' : '#ffffff', transition: 'background-color 0.3s ease' }}>
        <SiteHeader home />
        <Hero />
        <HowItWorks dark={dark} />
        <Testimonials />
        <TrustStats dark={dark} />
        <PricingSection dark={dark} />
        <BookmakerFlow dark={dark} />
        <FAQ />
        <FinalCTA />
        <SiteFooter />
      </div>
    </LpTheme.Provider>
  );
}
