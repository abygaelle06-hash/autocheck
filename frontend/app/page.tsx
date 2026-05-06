'use client';

import { useState } from 'react';
import DamageReport from '../components/DamageReport';

export default function Home() {
  const [caseId, setCaseId] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/scan/${caseId}`);
      if (res.ok) setShowReport(true);
    } catch {
      console.error('Erreur chargement scan');
    } finally {
      setIsLoading(false);
    }
  };

  const startInspection = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/create-checkout`,
        { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Erreur paiement. Veuillez reessayer.');
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1e40af', marginBottom: '8px' }}>AutoCheck</h1>
        <p style={{ color: '#64748b' }}>Inspection automobile intelligente</p>
      </header>
      {!showReport ? (
        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '16px' }}>Nouvelle inspection</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Entrez votre case ID Cardeen"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              style={{ flex: 1, minHeight: '44px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
            />
            <button
              type="submit"
              disabled={isLoading || !caseId.trim()}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Chargement...' : 'Voir le rapport'}
            </button>
          </form>
          <div style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Ou demarrer une inspection</h3>
            <button
              onClick={startInspection}
              style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '16px', cursor: 'pointer', width: '100%' }}
            >
              Acheter un scan - 29,99 EUR
            </button>
          </div>
                  <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <a href="/admin" style={{ display: 'inline-block', background: '#6b7280', color: 'white', textDecoration: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer' }}>Demo Admin - Parametres</a>
        </div>
        </section>
      ) : (
        <DamageReport caseId={caseId} />
      )}
    </main>
  );
}
