'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ naam: '', email: '', bericht: '', website: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending'); setError('');
    try {
      const res = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verzenden mislukt.');
      setStatus('sent');
    } catch (err) {
      setError(err.message); setStatus('idle');
    }
  }

  if (status === 'sent') {
    return <div className="calc-box"><p className="calc-thanks">Bedankt! We hebben je bericht ontvangen en reageren zo snel mogelijk.</p></div>;
  }

  return (
    <form onSubmit={submit} className="calc-box" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label className="calc-field"><span>Naam</span><div className="calc-input-wrap"><input required value={form.naam} onChange={set('naam')} autoComplete="name" /></div></label>
      <label className="calc-field"><span>E-mailadres</span><div className="calc-input-wrap"><input required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></div></label>
      <label className="calc-field"><span>Bericht</span><div className="calc-input-wrap"><textarea required rows={6} value={form.bericht} onChange={set('bericht')} style={{ padding: '10px 12px', fontFamily: 'inherit', resize: 'vertical' }} /></div></label>
      {/* Spamval: onzichtbaar veld dat mensen leeg laten */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}
      <button type="submit" className="seo-btn" disabled={status === 'sending'} style={{ border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>{status === 'sending' ? 'Versturen…' : 'Verstuur bericht'}</button>
    </form>
  );
}
