// frontend/components/DamageReport.jsx
// Composant React pour le rapport de dommages

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Composant rapport de dommages
 * @param {string} caseId - Reference du scan Cardeen
 */
export default function DamageReport({ caseId }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScan() {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('case_id', caseId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setScan(data);
      }
      setLoading(false);
    }
    fetchScan();
  }, [caseId]);

  if (loading) {
    return <div className="loading">Chargement du rapport...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  if (!scan) {
    return <div className="empty">Aucun rapport trouve.</div>;
  }

  const { vehicle_data, damage_report, lacour_enriched } = scan;

  return (
    <div className="damage-report">
      {/* En-tete vehicule */}
      <header className="vehicle-header">
        <h2>Rapport d\'inspection</h2>
        <p>Status: {scan.status}</p>
        <p>Reference: {scan.case_id}</p>
        {vehicle_data.make && (
          <div>
            <p>{vehicle_data.make} {vehicle_data.model} {vehicle_data.year}</p>
            <p>VIN: {vehicle_data.vin}</p>
          </div>
        )}
      </header>

      {/* Perte de valeur estimee */}
      <section className="value-loss">
        <h3>Perte de valeur estimee</h3>
        <p className="value-amount">
          {damage_report.estimated_value_loss
            ? `${damage_report.estimated_value_loss} EUR`
            : 'Non disponible'}
        </p>
      </section>

      {/* Visualisation vehicule SVG */}
      <section className="vehicle-preview">
        <h3>Etat du vehicule</h3>
        <VehicleSVG damages={damage_report.damages || []} />
      </section>

      {/* Liste des dommages */}
      <section className="damages-list">
        <h3>Dommages detectes</h3>
        {(damage_report.damages || []).length === 0 ? (
          <p>Aucun dommage detecte.</p>
        ) : (
          <ul>
            {(damage_report.damages || []).map((damage, idx) => (
              <DamageItem key={idx} damage={damage} enriched={lacour_enriched} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Composant item dommage
 */
function DamageItem({ damage, enriched }) {
  const severityColors = {
    light: '#28a745',
    moderate: '#ffc107',
    severe: '#dc3545'
  };

  return (
    <li className={`damage-item damage-${damage.severity}`}>
      <span className="severity-badge"
            style={{ backgroundColor: severityColors[damage.severity] || '#6c757d' }}>
        {damage.severity || 'unknown'}
      </span>
      <span className="part-name">{damage.partName || damage.partId}</span>
      <span className="zone">{damage.zone || 'N/A'}</span>
      {enriched && damage.estimatedPrice && (
        <span className="lacour-price">Prix: {damage.estimatedPrice} EUR</span>
      )}
    </li>
  );
}

/**
 * Composant SVG vehicule avec points cliquables
 */
function VehicleSVG({ damages }) {
  // Points cliquables bases sur les zones de dommages
  const damageZones = damages.map(d => d.zone);

  return (
    <div className="vehicle-svg-container">
      <svg width="300" height="150" viewBox="0 0 300 150">
        {/*轮廓 vehicule */}
        <rect x="20" y="50" width="260" height="70" rx="10" fill="#e0e0e0" stroke="#333" />
        <rect x="60" y="20" width="180" height="40" rx="5" fill="#e0e0e0" stroke="#333" />
        {/* Roues */}
        <circle cx="55" cy="120" r="20" fill="#333" />
        <circle cx="245" cy="120" r="20" fill="#333" />
        {/* Points dommages */}
        {damageZones.includes('FRONT') && (
          <circle cx="280" cy="85" r="8" fill="#dc3545" className="damage-point" />
        )}
        {damageZones.includes('REAR') && (
          <circle cx="20" cy="85" r="8" fill="#dc3545" className="damage-point" />
        )}
        {damageZones.includes('LEFT') && (
          <circle cx="100" cy="120" r="8" fill="#ffc107" className="damage-point" />
        )}
        {damageZones.includes('RIGHT') && (
          <circle cx="200" cy="120" r="8" fill="#ffc107" className="damage-point" />
        )}
        {damageZones.includes('ROOF') && (
          <circle cx="150" cy="20" r="8" fill="#28a745" className="damage-point" />
        )}
      </svg>
      <p className="svg-note">Cliquez sur un point pour voir le dommage</p>
    </div>
  );
}

// --- Styles CSS-inline ---
const styles = `
.damage-report { padding: 20px; font-family: sans-serif; }
.vehicle-header { border-bottom: 1px solid #e0e0e0; margin-bottom: 20px; }
.value-loss { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
.value-amount { font-size: 24px; font-weight: bold; color: #dc3545; }
.damages-list ul { list-style: none; padding: 0; }
.damage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}
.severity-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  text-transform: uppercase;
}
.lacour-price { color: #28a745; font-weight: bold; margin-left: auto; }
.vehicle-svg-container { text-align: center; margin: 20px 0; }
.svg-note { font-size: 12px; color: #6c757d; margin-top: 8px; }
.loading, .error, .empty { text-align: center; padding: 40px; }
.error { color: #dc3545; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
