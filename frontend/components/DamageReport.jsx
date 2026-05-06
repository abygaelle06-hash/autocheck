// frontend/components/DamageReport.jsx
// Rapport de dommages - version corrigee avec UI moderne

import { useState } from 'react';

const colors = {
  primary: '#2563eb',
  accent: '#0ea5e9',
  bg: '#f8fafc',
  bgCard: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  light: '#e0f2fe',
  moderate: '#fef3c7',
  severe: '#fee2e2',
};

export default function DamageReport({ caseId, scanData }) {
  const [selectedDamage, setSelectedDamage] = useState(null);

  if (!scanData) {
    return (
      <div style={styles.empty}>
        <p>Aucune donnee disponible</p>
      </div>
    );
  }

  const { status, vehicle_data = {}, damage_report = {}, lacour_enriched, created_at } = scanData;
  const damages = damage_report.damages || [];

  return (
    <div style={styles.container}>
      {/* Header card */}
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.badge}>{statusText(status)}</div>
            <h1 style={styles.title}>Rapport d'inspection</h1>
            <p style={styles.subtitle}>Reference: <strong>{caseId}</strong></p>
          </div>
          <div style={styles.dateBlock}>
            <span style={styles.dateLabel}>Date</span>
            <span style={styles.dateValue}>{formatDate(created_at)}</span>
          </div>
        </div>

        {vehicle_data.make && (
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleIcon}>🚗</div>
            <div style={styles.vehicleDetails}>
              <div style={styles.vehicleName}>
                {vehicle_data.make} {vehicle_data.model} {vehicle_data.year}
              </div>
              {vehicle_data.vin && (
                <div style={styles.vin}>VIN: {vehicle_data.vin}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔧</div>
          <div style={styles.statValue}>{damages.length}</div>
          <div style={styles.statLabel}>Dommage(s) detecte(s)</div>
        </div>

        <div style={{...styles.statCard, background: colors.light, borderColor: colors.accent}}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>
            {damage_report.estimated_value_loss || 'N/A'}
          </div>
          <div style={styles.statLabel}>Perte de valeur estimee (EUR)</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>{lacour_enriched ? '✅' : '⏳'}</div>
          <div style={styles.statValue}>{lacour_enriched ? 'Oui' : 'Non'}</div>
          <div style={styles.statLabel}>Prix Lacour enrichis</div>
        </div>
      </div>

      {/* Damages list */}
      <div style={styles.damagesSection}>
        <h2 style={styles.sectionTitle}>
          📄 Dommages detectes ({damages.length})
        </h2>

        {damages.length === 0 ? (
          <div style={styles.noDamages}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p>Aucun dommage detecte. Le vehicule est en bon etat.</p>
          </div>
        ) : (
          <div style={styles.damagesList}>
            {damages.map((damage, idx) => (
              <DamageCard
                key={idx}
                damage={damage}
                index={idx}
                enriched={lacour_enriched}
                onClick={() => setSelectedDamage(damage)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal detail */}
      {selectedDamage && (
        <DamageModal
          damage={selectedDamage}
          onClose={() => setSelectedDamage(null)}
        />
      )}
    </div>
  );
}

function DamageCard({ damage, index, enriched, onClick }) {
  const severity = damage.severity || 'unknown';
  const severityColor = {
    light: colors.success,
    moderate: colors.warning,
    severe: colors.error,
    unknown: colors.textMuted
  }[severity.toLowerCase()] || colors.textMuted;

  const severityBg = {
    light: colors.light,
    moderate: colors.moderate,
    severe: colors.severe,
    unknown: '#f1f5f9'
  }[severity.toLowerCase()] || '#f1f5f9';

  return (
    <div style={styles.damageCard} onClick={onClick}>
      <div style={styles.damageHeader}>
        <div style={{...styles.severityBadge, background: severityBg, color: severityColor}}>
          {severity.toUpperCase()}
        </div>
        <div style={styles.damageIndex}>#{index + 1}</div>
      </div>

      <div style={styles.damageBody}>
        <div style={styles.damageTitle}>
          {damage.partName || damage.partId || 'Piece non identifiee'}
        </div>
        <div style={styles.damageZone}>
          📍 Zone: <strong>{damage.zone || 'Non specifiee'}</strong>
        </div>
      </div>

      {enriched && damage.estimatedPrice && (
        <div style={styles.damageFooter}>
          <div style={styles.priceTag}>
            💵 {damage.estimatedPrice} EUR
          </div>
          {damage.availability && (
            <div style={styles.availability}>
              {damage.availability.available ? '✅ Disponible' : '❌ Indisponible'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DamageModal({ damage, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Detail du dommage</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Piece:</span>
            <span style={styles.modalValue}>{damage.partName || damage.partId || 'N/A'}</span>
          </div>
          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Zone:</span>
            <span style={styles.modalValue}>{damage.zone || 'N/A'}</span>
          </div>
          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Severite:</span>
            <span style={styles.modalValue}>{damage.severity || 'unknown'}</span>
          </div>
          {damage.estimatedPrice && (
            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Prix estime:</span>
              <span style={styles.modalValue}>{damage.estimatedPrice} EUR</span>
            </div>
          )}
          {damage.availability && (
            <div style={styles.modalRow}>
              <span style={styles.modalLabel}>Disponibilite:</span>
              <span style={styles.modalValue}>
                {damage.availability.available ? 'En stock' : 'Sur commande'}
                {damage.availability.deliveryDays && ` (${damage.availability.deliveryDays} jours)`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusText(status) {
  const map = {
    PENDING: '⏳ En attente',
    PROCESSING: '🔄 En cours',
    FINISHED: '✅ Termine',
    ERROR: '❌ Erreur'
  };
  return map[status] || status;
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return 'N/A';
  }
}

const styles = {
  container: {
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerCard: {
    background: colors.bgCard,
    borderRadius: '16px',
    padding: '2rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: colors.light,
    color: colors.accent,
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: '0.95rem',
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  dateLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: '0.05em',
  },
  dateValue: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: colors.text,
  },
  vehicleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: colors.bg,
    borderRadius: '12px',
    marginTop: '1rem',
  },
  vehicleIcon: {
    fontSize: '2rem',
  },
  vehicleDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  vehicleName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.text,
  },
  vin: {
    fontSize: '0.85rem',
    color: colors.textMuted,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    background: colors.bgCard,
    padding: '1.5rem',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statIcon: {
    fontSize: '1.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text,
  },
  statLabel: {
    fontSize: '0.85rem',
    color: colors.textMuted,
  },
  damagesSection: {
    background: colors.bgCard,
    borderRadius: '16px',
    padding: '2rem',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: colors.text,
  },
  noDamages: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: colors.textMuted,
  },
  damagesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  damageCard: {
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  damageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  severityBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  damageIndex: {
    fontSize: '0.8rem',
    color: colors.textMuted,
    fontWeight: 600,
  },
  damageBody: {
    marginBottom: '0.75rem',
  },
  damageTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.375rem',
  },
  damageZone: {
    fontSize: '0.85rem',
    color: colors.textMuted,
  },
  damageFooter: {
    paddingTop: '0.75rem',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  priceTag: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: colors.success,
  },
  availability: {
    fontSize: '0.8rem',
    color: colors.textMuted,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: colors.bgCard,
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: colors.text,
  },
  closeBtn: {
    fontSize: '1.75rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: colors.textMuted,
    lineHeight: 1,
    padding: '0.25rem',
  },
  modalBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  modalLabel: {
    fontWeight: 600,
    color: colors.textMuted,
    fontSize: '0.9rem',
  },
  modalValue: {
    textAlign: 'right',
    color: colors.text,
    fontSize: '0.95rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: colors.textMuted,
  },
};
