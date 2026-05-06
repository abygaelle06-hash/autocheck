'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').order('id');
    if (data) setSettings(data);
    setLoading(false);
  };

  const updateSetting = (index, key, value) => {
    const newSettings = [...settings];
    newSettings[index].value = value;
    setSettings(newSettings);
  };

  const saveAll = async () => {
    for (const s of settings) {
      await supabase
        .from('settings')
        .update({ value: s.value, updated_at: new Date().toISOString() })
        .eq('key', s.key);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleMaintenance = (idx) => {
    const newSettings = [...settings];
    newSettings[idx].value = newSettings[idx].value === 'true' ? 'false' : 'true';
    setSettings(newSettings);
  };

  return (
    <main style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#1e40af', margin: '0 0 8px 0' }}>Dashboard Admin - AutoCheck</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Gerer les parametres, marges et cles API</p>
        </div>
        <a href="/" style={{ background: '#2563eb', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}>Retour accueil</a>
      </header>

      <section style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>Parametres globaux</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {settings.map((s, i) => (
              <div key={s.id || i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: s.key.includes('mode') || s.key === 'lacour_api_enabled' || s.key === 'persistent_storage_enabled' ? '#059669' : '#334155' }}>
                  {s.description || s.key}
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>({s.key})</span>
                </label>
                {s.key === 'maintenance_mode' ? (
                  <button
                    onClick={() => toggleMaintenance(i)}
                    style={{
                      background: s.value === 'true' ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Maintenance: {s.value === 'true' ? 'ACTIVEE' : 'INACTIVE'}
                  </button>
                ) : (
                  <input
                    type={s.key.includes('price') || s.key.includes('commission') ? 'number' : 'text'}
                    value={s.value}
                    onChange={(e) => updateSetting(i, s.key, e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={saveAll}
          style={{ marginTop: '20px', width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
        >
          Sauvegarder les modifications
        </button>
        {saved && (
          <p style={{ color: '#28a745', textAlign: 'center', marginTop: '12px', fontWeight: 500 }}>Modifications sauvegardees !</p>
        )}
      </section>

      <section style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', fontSize: '13px', color: '#64748b' }}>
        <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>Notes</h3>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>Les cles API Cardeen et Lacour doivent etre fournies par les services respectifs</li>
          <li>Le mode maintenance bloque tout acces a l'application quand active</li>
          <li>Prix du scan client modifiable pour des promotions</li>
          <li>Commission marketplace ajustable selon la marge desiree</li>
        </ul>
      </section>
    </main>
  );
}
