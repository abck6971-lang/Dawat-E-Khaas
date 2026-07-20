import React, { useState } from 'react';
import { usePOSStore } from '../store';
import { Save } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = usePOSStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="settings-page fade-in">
      <div className="settings-sections">

        {/* Restaurant Info */}
        <div className="settings-card">
          <h3>🏪 Restaurant Information</h3>
          <div className="settings-field">
            <label className="form-label">Restaurant Name</label>
            <input className="form-input" value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)} />
          </div>
          <div className="settings-field">
            <label className="form-label">Phone Number</label>
            <input className="form-input" placeholder="+92 300 0000000" value={form.restaurantPhone} onChange={e => set('restaurantPhone', e.target.value)} />
          </div>
          <div className="settings-field">
            <label className="form-label">Address (shown on receipts)</label>
            <input className="form-input" placeholder="Main Street, City" value={form.restaurantAddress} onChange={e => set('restaurantAddress', e.target.value)} />
          </div>
        </div>

        {/* Tax */}
        <div className="settings-card">
          <h3>💰 Tax Settings</h3>
          <div className="settings-field">
            <label className="form-label">Tax Percentage (%)</label>
            <input
              className="form-input"
              type="number" min="0" max="100"
              value={form.taxPercent}
              onChange={e => set('taxPercent', parseFloat(e.target.value) || 0)}
              style={{ maxWidth: 160 }}
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Set to 0 if you don't charge tax. This will appear on receipts.</p>
          </div>
        </div>

        {/* Sync */}
        <div className="settings-card">
          <h3>☁️ Cloud Sync Settings</h3>
          <div className="settings-field">
            <label className="form-label">Backend API URL</label>
            <input
              className="form-input"
              placeholder="https://your-restaurant.vercel.app"
              value={form.apiUrl}
              onChange={e => set('apiUrl', e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              This is the URL of your web app. The POS will sync orders here when online.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <h3>ℹ️ About</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>POS Version</span>
              <strong>1.0.0</strong>
            </div>
            <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform</span>
              <strong>Dawat-E-Khaas POS</strong>
            </div>
            <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Data Storage</span>
              <strong>Local (Offline-First)</strong>
            </div>
          </div>
        </div>

        <div className="settings-save-row">
          <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: 160 }}>
            {saved ? '✅ Saved!' : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

      </div>
    </div>
  );
}
