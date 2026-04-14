'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ── Smooth scroll helper ── */
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Sticky header ── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: scrolled ? 'rgba(10,37,64,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      transition: 'all 0.25s ease',
      padding: '0 40px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ backgroundColor: '#5469d4', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>BetTrack</span>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1">
          {[
            { label: 'Functies', id: 'functies' },
            { label: 'Hoe het werkt', id: 'hoe-het-werkt' },
            { label: 'Analyse', id: 'analyse' },
            { label: 'Prijzen', id: 'prijzen' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500,
                padding: '7px 14px', borderRadius: 6,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '7px 14px', borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
          >
            Inloggen
          </Link>
          <Link
            href="/dashboard"
            style={{
              backgroundColor: '#5469d4', color: '#fff', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'none', padding: '8px 18px', borderRadius: 7,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4356b8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5469d4'}
          >
            Aanmelden — Gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #04111f 0%, #0a2540 45%, #0d1f38 100%)',
      paddingTop: 140, paddingBottom: 100,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(84,105,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', textAlign: 'center', position: 'relative' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, backgroundColor: 'rgba(84,105,212,0.2)', border: '1px solid rgba(84,105,212,0.35)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5469d4' }} />
          <span style={{ fontSize: 13, color: '#a5b8f5', fontWeight: 500 }}>Gebouwd voor Nederlandse sportwedders</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 58, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, maxWidth: 800, margin: '0 auto 20px' }}>
          Stop met gokken,{' '}
          <span style={{ background: 'linear-gradient(135deg, #7b9ef0, #5469d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            begin met analyseren
          </span>
        </h1>

        {/* Subline */}
        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto 40px' }}>
          Houd al je sportbets bij, analyseer je prestaties en ontdek precies waar je winst maakt — of verliest.
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-center gap-4" style={{ marginBottom: 64 }}>
          <Link
            href="/dashboard"
            style={{
              backgroundColor: '#5469d4', color: '#fff', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', padding: '13px 28px', borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 24px rgba(84,105,212,0.45)',
            }}
          >
            Gratis beginnen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <button
            onClick={() => scrollTo('functies')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 600, padding: '13px 24px', borderRadius: 9, cursor: 'pointer' }}
          >
            Bekijk functies
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-8">
          {[
            { value: '2.400+', label: 'Actieve gebruikers' },
            { value: '€3.2M+', label: 'Bets gevolgd' },
            { value: '94%', label: 'Tevreden bettors' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App preview mockup */}
      <div style={{ maxWidth: 960, margin: '64px auto 0', padding: '0 40px', position: 'relative' }}>
        <div style={{
          backgroundColor: '#0d1a2e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          {/* Window bar */}
          <div style={{ backgroundColor: '#1a2e45', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />)}
            <div style={{ flex: 1, marginLeft: 12, height: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>bettrack.nl/dashboard</span>
            </div>
          </div>

          {/* App mockup content */}
          <div style={{ display: 'flex', minHeight: 360 }}>
            {/* Fake sidebar */}
            <div style={{ width: 180, backgroundColor: '#0a1e32', padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 24, paddingLeft: 8 }}>
                <div style={{ width: 22, height: 22, backgroundColor: '#5469d4', borderRadius: 5 }} />
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>BetTrack</span>
              </div>
              {['Dashboard', 'Bets Overzicht', 'Bet Invoeren', 'Maandoverzicht', 'Statistieken'].map((item, i) => (
                <div key={i} style={{ padding: '7px 10px', borderRadius: 5, marginBottom: 2, backgroundColor: i === 0 ? 'rgba(84,105,212,0.25)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: i === 0 ? '#5469d4' : 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 11 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Fake dashboard */}
            <div style={{ flex: 1, padding: '20px 24px', backgroundColor: '#f6f9fc' }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Totale P&L', value: '+€312.50', color: '#0e9f6e' },
                  { label: 'Win Rate', value: '61.3%', color: '#1a1f36' },
                  { label: 'ROI', value: '+8.7%', color: '#0e9f6e' },
                  { label: 'Bets', value: '47', color: '#1a1f36' },
                ].map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{c.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: c.color }}>{c.value}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Cumulatieve P&L</p>
                <svg viewBox="0 0 400 80" style={{ width: '100%', height: 60 }}>
                  <defs>
                    <linearGradient id="mockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5469d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#5469d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 L40,65 L80,58 L120,62 L160,45 L200,38 L240,42 L280,28 L320,20 L360,12 L400,8" fill="none" stroke="#5469d4" strokeWidth="2" />
                  <path d="M0,70 L40,65 L80,58 L120,62 L160,45 L200,38 L240,42 L280,28 L320,20 L360,12 L400,8 L400,80 L0,80 Z" fill="url(#mockGrad)" />
                </svg>
              </div>
              {/* Fake table rows */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                {[
                  { match: 'Ajax vs PSV', result: '+€55', green: true },
                  { match: 'Liverpool vs Chelsea', result: '-€25', green: false },
                  { match: 'Sinner vs Alcaraz', result: '+€38', green: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                    <span style={{ fontSize: 10, color: '#374151', fontWeight: 500 }}>{r.match}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: r.green ? '#0e9f6e' : '#e02424' }}>{r.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Glow under screenshot */}
        <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 60, background: 'radial-gradient(ellipse, rgba(84,105,212,0.3) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      </div>
    </section>
  );
}

/* ── Features ── */
function Features() {
  const items = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      title: 'Realtime P&L tracking',
      desc: 'Volg je winst en verlies live. Zie exact hoeveel je verdient per sport, bookmaker en markt.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: 'Maandelijks kalenderoverzicht',
      desc: 'Zie elke dag als een cel in de kalender — groen voor winst, rood voor verlies. Klik voor details.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
      title: 'Diepgaande statistieken',
      desc: 'Analyseer je ROI per sport, bookmaker en markt. Ontdek je sterkste en zwakste segmenten.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      title: 'Slim filteren & zoeken',
      desc: 'Filter op sport, uitkomst of bookmaker. Vind elke bet in seconden met de zoekfunctie.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      title: 'Uitgebreide bet invoer',
      desc: 'Voer bets in met alle details: sport, markt, selectie, odds, inzet en bookmaker. Met live winstpreview.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Privacy-first',
      desc: 'Je data blijft lokaal opgeslagen. Geen verplichte accounts, geen data die we verkopen. Jij beheert alles.',
    },
  ];

  return (
    <section id="functies" style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Functies</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0a1628', marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Alles wat je nodig hebt<br />om beter te wedden
          </h2>
          <p style={{ fontSize: 17, color: '#6b7280', marginTop: 16, maxWidth: 520, margin: '16px auto 0' }}>
            Van eenvoudige bet-invoer tot diepgaande analyse — BetTrack geeft je alle tools om patronen te ontdekken.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ padding: '28px 30px', border: '1px solid #e5e7eb', borderRadius: 14, transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c7d2f8'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(84,105,212,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5469d4', marginBottom: 18 }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
function HoeHetWerkt() {
  const steps = [
    { num: '01', title: 'Voer je bet in', desc: 'Vul sport, wedstrijd, markt, selectie, odds en inzet in. Zie direct je potentiële winst voordat je de bet opslaat.' },
    { num: '02', title: 'Bijhouden & updaten', desc: 'Zodra de uitkomst bekend is, update je de bet met één klik. BetTrack berekent automatisch je winst of verlies.' },
    { num: '03', title: 'Analyseer je data', desc: 'Bekijk per sport, markt en bookmaker waar je goed en slecht presteert. Verbeter je strategie op basis van echte data.' },
  ];

  return (
    <section id="hoe-het-werkt" style={{ backgroundColor: '#f6f9fc', padding: '96px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hoe het werkt</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0a1628', marginTop: 12, letterSpacing: '-0.02em' }}>
            In drie stappen naar inzicht
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {i < 2 && (
                <div style={{ position: 'absolute', top: 28, left: 'calc(50% + 36px)', right: 'calc(-50% + 36px)', height: 1, backgroundColor: '#e5e7eb', zIndex: 0 }} />
              )}
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#5469d4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 1 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{step.num}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Calendar preview ── */
function AnalysePreview() {
  const days = [
    { d: null }, { d: null },
    { d: 1, pnl: null }, { d: 2, pnl: 45.5 }, { d: 3, pnl: -22 }, { d: 4, pnl: 78 }, { d: 5, pnl: -15 },
    { d: 6, pnl: 0 }, { d: 7, pnl: 33 }, { d: 8, pnl: 12 }, { d: 9, pnl: -40 }, { d: 10, pnl: 55 }, { d: 11, pnl: null }, { d: 12, pnl: 28 },
    { d: 13, pnl: -8 }, { d: 14, pnl: 90 }, { d: 15, pnl: 15 }, { d: 16, pnl: -30 }, { d: 17, pnl: 44 }, { d: 18, pnl: null }, { d: 19, pnl: -18 },
    { d: 20, pnl: 62 }, { d: 21, pnl: null }, { d: 22, pnl: 35 }, { d: 23, pnl: -25 }, { d: 24, pnl: 80 }, { d: 25, pnl: null }, { d: 26, pnl: 20 },
    { d: 27, pnl: -12 }, { d: 28, pnl: 48 }, { d: 29, pnl: 18 }, { d: 30, pnl: null }, { d: null }, { d: null },
  ];

  return (
    <section id="analyse" style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maandoverzicht</span>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#0a1628', marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
            Elke dag in één oogopslag
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
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
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 15, color: '#374151' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar mock */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between" style={{ padding: '14px 18px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>April 2026</span>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0e9f6e' }}>+€363</span>
            </div>
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d) => (
              <div key={d} style={{ padding: '7px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((cell, i) => {
              if (!cell.d) return (
                <div key={i} style={{ minHeight: 52, backgroundColor: '#fafafa', borderRight: i % 7 !== 6 ? '1px solid #f3f4f6' : 'none', borderBottom: '1px solid #f3f4f6' }} />
              );
              const hasPnl = cell.pnl !== null && cell.pnl !== 0;
              const bg = cell.pnl === null ? '#fff' : cell.pnl > 0 ? `rgba(14,159,110,${0.07 + Math.abs(cell.pnl) / 90 * 0.15})` : cell.pnl < 0 ? `rgba(224,36,36,${0.07 + Math.abs(cell.pnl) / 90 * 0.13})` : '#fff';
              return (
                <div key={i} style={{ minHeight: 52, padding: '6px 7px', backgroundColor: bg, borderRight: i % 7 !== 6 ? '1px solid #f3f4f6' : 'none', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 10.5, fontWeight: hasPnl ? 600 : 400, color: hasPnl ? '#374151' : '#9ca3af' }}>{cell.d}</p>
                  {hasPnl && (
                    <p style={{ fontSize: 9.5, fontWeight: 700, color: cell.pnl > 0 ? '#0e9f6e' : '#e02424', marginTop: 2 }}>
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

/* ── Pricing ── */
function Prijzen() {
  return (
    <section id="prijzen" style={{ backgroundColor: '#f6f9fc', padding: '96px 40px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5469d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prijzen</span>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0a1628', marginTop: 12, letterSpacing: '-0.02em' }}>Eenvoudige, transparante prijzen</h2>
          <p style={{ fontSize: 17, color: '#6b7280', marginTop: 14 }}>Begin gratis. Upgrade wanneer jij er klaar voor bent.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Free */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '36px 36px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gratis</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#0a1628', lineHeight: 1 }}>€0</span>
              <span style={{ fontSize: 15, color: '#9ca3af', marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '11px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none', marginBottom: 28 }}>
              Gratis beginnen
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Tot 100 bets per maand', 'Dashboard & statistieken', 'Maandoverzicht kalender', 'Alle sporten & markten'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: '#374151' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{ backgroundColor: '#0a2540', border: '1px solid #1e4976', borderRadius: 16, padding: '36px 36px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#5469d4', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.04em' }}>
              POPULAIRSTE
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#7b9ef0', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</p>
            <div className="flex items-end gap-2" style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}>€9</span>
              <span style={{ fontSize: 15, color: '#4a6885', marginBottom: 6 }}>/maand</span>
            </div>
            <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '11px', backgroundColor: '#5469d4', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', marginBottom: 28 }}>
              Pro starten
            </Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Onbeperkte bets', 'Alles uit Gratis', 'CSV export', 'Geavanceerde filters', 'Prioriteitsondersteuning', 'Vroeg toegang tot nieuwe functies'].map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ marginBottom: 12, fontSize: 14.5, color: '#c5d8ec' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7b9ef0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0d1f38 100%)', padding: '100px 40px', textAlign: 'center' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18 }}>
          Klaar om slimmer te wedden?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.6 }}>
          Doe mee met 2.400+ bettors die BetTrack gebruiken om hun resultaten te verbeteren. Begin vandaag, gratis.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: '#5469d4', color: '#fff', fontSize: 15.5, fontWeight: 700,
            textDecoration: 'none', padding: '14px 32px', borderRadius: 10,
            boxShadow: '0 4px 28px rgba(84,105,212,0.5)',
          }}
        >
          Gratis aanmelden
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>Geen creditcard nodig. Direct aan de slag.</p>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ backgroundColor: '#04111f', padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: '#5469d4', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>BetTrack</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 BetTrack. Alle rechten voorbehouden.</p>
        <div className="flex items-center gap-4">
          {['Privacy', 'Voorwaarden', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── Main export ── */
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#04111f' }}>
      <Header />
      <Hero />
      <Features />
      <HoeHetWerkt />
      <AnalysePreview />
      <Prijzen />
      <FinalCTA />
      <Footer />
    </div>
  );
}
