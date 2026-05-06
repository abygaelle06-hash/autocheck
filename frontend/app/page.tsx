'use client';

import { useState } from 'react';
import DamageReport from '../components/DamageReport';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Home() {
  const [caseId, setCaseId] = useState('');
  const [scanData, setScanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = caseId.trim();
    if (!trimmedId) return;

    setIsLoading(true);
    setError(null);
    setScanData(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/scan/${encodeURIComponent(trimmedId)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setScanData(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du rapport');
    } finally {
      setIsLoading(false);
    }
  };

  const startInspection = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-checkout`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Erreur paiement');
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.message || 'Erreur paiement. Veuillez reessayer.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🚗</span>
            <span style={styles.logoText}>Auto<strong>Check</strong></span>
          </div>
          <nav style={styles.nav}>
            <a href="/admin" style={styles.navLink}>Dashboard Admin</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Powered by IA & Cardeen</div>
          <h1 style={styles.heroTitle}>Inspection automobile<br /><span style={styles.heroAccent}>intelligente & instantanee</span></h1>
          <p style={styles.heroSubtitle}>
            Obtenez un rapport complet de l&apos;etat de votre vehicule avec estimation des reparations en quelques minutes.
          </p>

          {/* CTA Paiement */}
          <button
            onClick={startInspection}
            disabled={paymentLoading}
            style={{
              ...styles.btnPrimary,
              ...(paymentLoading ? styles.btnDisabled : {})
            }}
          >
            {paymentLoading ? (
              <span>Redirection...</span>
            ) : (
              <span>🔍 Lancer une inspection — 29,99 EUR</span>
            )}
          </button>
          <p style={styles.heroNote}>Paiement securise via Stripe · Rapport disponible sous 24h</p>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>98%</span>
            <span style={styles.statLabel}>Precision detection</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>+2 000</span>
            <span style={styles.statLabel}>Inspections realisees</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>24h</span>
            <span style={styles.statLabel}>Delai rapport</span>
          </div>
        </div>
      </section>

      {/* Section recherche rapport */}
      <section style={styles.searchSection}>
        <div style={styles.searchCard}>
          <h2 style={styles.searchTitle}>📄 Consulter un rapport existant</h2>
          <p style={styles.searchSubtitle}>Entrez votre identifiant de dossier Cardeen pour acceder a votre rapport</p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Ex: CARD-2024-001234"
              style={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !caseId.trim()}
              style={{
                ...styles.btnSearch,
                ...(isLoading || !caseId.trim() ? styles.btnDisabled : {})
              }}
            >
              {isLoading ? (
                <span style={styles.spinner}>⟳ Chargement...</span>
              ) : (
                'Voir le rapport'
              )}
            </button>
          </form>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>
      </section>

      {/* Rapport de dommages */}
      {scanData && (
        <section style={styles.reportSection}>
          <DamageReport caseId={scanData.case_id} scanData={scanData} />
        </section>
      )}

      {/* Features */}
      {!scanData && (
        <section style={styles.featuresSection}>
          <h2 style={styles.featuresTitle}>Pourquoi AutoCheck ?</h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: '🎯', title: 'Detection precise', desc: 'IA entrainee sur +500 000 vehicules pour identifier chaque dommage avec precision' },
              { icon: '💰', title: 'Prix en temps reel', desc: 'Integration Groupe Lacour pour estimer le cout des pieces et reparations instantanement' },
              { icon: '📊', title: 'Rapport detaille', desc: 'Rapport PDF complet avec photos, zones, severite et devis garage' },
              { icon: '🔒', title: 'Securise & confidentiel', desc: 'Donnees chiffrees, conformite RGPD, acces uniquement au proprietaire du dossier' },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2024 AutoCheck · Solution d&apos;inspection automobile intelligente</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>Propulse par Cardeen · Groupe Lacour · Stripe</p>
      </footer>
    </div>
  );
}

const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  accent: '#0ea5e9',
  bg: '#f8fafc',
  bgCard: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  error: '#dc2626',
  errorBg: '#fef2f2',
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: colors.bg,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: colors.text,
  },
  header: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 1.5rem',
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.3rem',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: { color: colors.text },
  nav: { display: 'flex', gap: '1.5rem' },
  navLink: {
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  hero: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0ea5e9 100%)',
    color: 'white',
    padding: '5rem 1.5rem 4rem',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '999px',
    padding: '0.25rem 1rem',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(8px)',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: '1.25rem',
    letterSpacing: '-0.02em',
  },
  heroAccent: { color: '#7dd3fc' },
  heroSubtitle: {
    fontSize: '1.15rem',
    opacity: 0.85,
    marginBottom: '2.5rem',
    lineHeight: 1.7,
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    color: colors.primary,
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1.05rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
    marginBottom: '1rem',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  heroNote: {
    fontSize: '0.85rem',
    opacity: 0.7,
    marginTop: '0.75rem',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
    marginTop: '3rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#7dd3fc',
  },
  statLabel: {
    fontSize: '0.85rem',
    opacity: 0.8,
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255,255,255,0.3)',
  },
  searchSection: {
    padding: '4rem 1.5rem',
    maxWidth: '700px',
    margin: '0 auto',
  },
  searchCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.border}`,
  },
  searchTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: colors.text,
  },
  searchSubtitle: {
    color: colors.textMuted,
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '0.875rem 1.25rem',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.2s',
    background: colors.bg,
  },
  btnSearch: {
    padding: '0.875rem 1.75rem',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    marginTop: '1rem',
    background: colors.errorBg,
    color: colors.error,
    padding: '0.875rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    border: `1px solid #fecaca`,
  },
  reportSection: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 1.5rem 4rem',
  },
  featuresSection: {
    padding: '4rem 1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featuresTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '2.5rem',
    color: colors.text,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.75rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: colors.text,
  },
  featureDesc: {
    color: colors.textMuted,
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  footer: {
    borderTop: `1px solid ${colors.border}`,
    padding: '2rem 1.5rem',
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '0.9rem',
    background: 'white',
  },
};
