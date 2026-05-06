'use client';

import { useState } from 'react';
import DamageReport from '../components/DamageReport';

export default function Home() {
  const [caseId, setCaseId] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/api/scan/' + caseId);
      if (res.ok) setShowReport(true);
    } catch {
      console.error('Erreur chargement scan');
    } finally {
      setIsLoading(false);
    }
  };

  const startInspection = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/api/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Erreur paiement. Veuillez reessayer.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '700px', width: '100%', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ textAlign: 'center', color: '#1a237e', fontSize: '2.5rem', marginBottom: '8px' }}>AutoCheck</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>Inspection automobile intelligente</p>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Nouvelle inspection</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Entrez votre case ID Cardeen"
              style={{ flex: 1, padding: '16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{ padding: '16px 24px', background: '#3f51b5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
            >
              {isLoading ? 'Chargement...' : 'Voir le rapport'}
            </button>
          </form>
        </div>

        {showReport && <DamageReport caseId={caseId} />}

        <div style={{ borderTop: '1px solid #eee', paddingTop: '24px', marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '12px' }}>Ou demarrer une inspection</h3>
          <button
            onClick={startInspection}
            style={{ width: '100%', padding: '16px', background: '#43a047', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
          >
            Acheter un scan - 29,99 EUR
          </button>
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <a
            href="/autocheck/admin"
            style={{ display: 'inline-block', padding: '10px 20px', background: '#607d8b', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            Demo Admin - Parametres
          </a>
        </div>
      </div>
    </main>
  );
}
