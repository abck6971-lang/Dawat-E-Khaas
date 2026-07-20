import React, { useState, useEffect } from 'react';
import { Printer, Wifi, Usb, RefreshCw, CheckCircle2, XCircle, AlertCircle, ChevronDown, ToggleLeft, ToggleRight, FileText, AlignLeft } from 'lucide-react';
import { usePOSStore } from '../store';

interface SystemPrinter {
  name: string;
  displayName?: string;
  description?: string;
  status: number;
  isDefault: boolean;
}

const ipc = (window as any).ipcRenderer;

export default function PrinterSettings() {
  const { settings, updateSettings } = usePOSStore();
  const [printers, setPrinters] = useState<SystemPrinter[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      if (ipc) {
        const list: SystemPrinter[] = await ipc.invoke('get-printers');
        setPrinters(list);
        // Auto-select default printer if none selected
        if (!settings.selectedPrinter) {
          const def = list.find(p => p.isDefault);
          if (def) updateSettings({ selectedPrinter: def.name });
        }
      } else {
        // Not in Electron — show mock data
        setPrinters([
          { name: 'Microsoft Print to PDF', displayName: 'Microsoft Print to PDF', status: 0, isDefault: true },
          { name: 'EPSON TM-T20II', displayName: 'EPSON TM-T20II Receipt', status: 0, isDefault: false },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrinters(); }, []);

  const handleTestPrint = async () => {
    if (!settings.selectedPrinter) return;
    setTestStatus('printing');
    setTestMsg('');
    try {
      const receiptHtml = buildReceiptHtml(settings);
      if (ipc) {
        const result = await ipc.invoke('test-print', { printerName: settings.selectedPrinter, htmlContent: receiptHtml });
        if (result?.success) {
          setTestStatus('success');
          setTestMsg('Test receipt sent successfully!');
        } else {
          setTestStatus('error');
          setTestMsg(result?.error || 'Print failed');
        }
      } else {
        // Web preview fallback
        const w = window.open('', '_blank');
        if (w) { w.document.write(receiptHtml); w.document.close(); w.print(); }
        setTestStatus('success');
        setTestMsg('Opened print preview (web mode)');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMsg(e.message || 'Unknown error');
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  const selectedPrinterInfo = printers.find(p => p.name === settings.selectedPrinter);

  return (
    <div style={{ padding: '16px 12px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
            <Printer size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9' }}>Printer Settings</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Configure hardware receipt printing</p>
          </div>
        </div>
      </div>

      {/* 3-column grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Usb size={16} style={{ color: '#a78bfa' }} /> Hardware Printer
          </h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchPrinters}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Scanning...' : 'Refresh'}
          </button>
        </div>

        {/* Dropdown */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <select
            value={settings.selectedPrinter}
            onChange={e => updateSettings({ selectedPrinter: e.target.value })}
            style={{
              width: '100%', padding: '12px 40px 12px 14px', borderRadius: '10px',
              background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600,
              appearance: 'none', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">— Select a printer —</option>
            {printers.map(p => (
              <option key={p.name} value={p.name}>
                {p.displayName || p.name} {p.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
        </div>

        {/* Printer Status */}
        {selectedPrinterInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', color: '#86efac' }}>
              <strong>{selectedPrinterInfo.displayName || selectedPrinterInfo.name}</strong> — Ready
              {selectedPrinterInfo.isDefault && ' · System Default'}
            </span>
          </div>
        )}

        {printers.length === 0 && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={15} style={{ color: '#f87171' }} />
            <span style={{ fontSize: '0.82rem', color: '#fca5a5' }}>No printers found. Make sure your printer is installed on this PC.</span>
          </div>
        )}
      </div>

      {/* Paper & Receipt Options */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} style={{ color: '#a78bfa' }} /> Receipt Options
        </h3>

        {/* Paper Width */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paper Width</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['58mm', '80mm'] as const).map(w => (
              <button
                key={w}
                onClick={() => updateSettings({ paperWidth: w })}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid',
                  borderColor: settings.paperWidth === w ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)',
                  background: settings.paperWidth === w ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  color: settings.paperWidth === w ? '#c4b5fd' : '#64748b',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <AlignLeft size={12} style={{ display: 'inline', marginRight: '4px' }} /> Receipt Footer Message
          </label>
          <input
            type="text"
            value={settings.footerMessage}
            onChange={e => updateSettings({ footerMessage: e.target.value })}
            placeholder="e.g. Thank you for dining with us!"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Toggles */}
        {[
          { key: 'showLogo', label: 'Show Restaurant Name on Receipt', value: settings.showLogo },
          { key: 'autoPrint', label: 'Auto-Print Receipt After Every Order', value: settings.autoPrint },
        ].map(({ key, label, value }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>{label}</span>
            <button
              onClick={() => updateSettings({ [key]: !value } as any)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: value ? '#a78bfa' : '#475569', transition: 'color 0.2s' }}
            >
              {value ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        ))}
      </div>

      {/* Test Print Card */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi size={16} style={{ color: '#a78bfa' }} /> Connection Test
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
          Print a test receipt to verify your printer is configured correctly.
        </p>

        <button
          className="btn btn-primary"
          onClick={handleTestPrint}
          disabled={!settings.selectedPrinter || testStatus === 'printing'}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', fontWeight: 700, gap: '10px' }}
        >
          {testStatus === 'printing' ? (
            <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending to printer…</>
          ) : (
            <><Printer size={18} /> Print Test Receipt</>
          )}
        </button>

        {testStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={15} style={{ color: '#4ade80' }} />
            <span style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: 600 }}>{testMsg}</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle size={15} style={{ color: '#f87171' }} />
            <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>{testMsg}</span>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Receipt HTML Builder ──────────────────────────────────────────────────────
function buildReceiptHtml(settings: any) {
  const width = settings.paperWidth === '58mm' ? '200px' : '280px';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: ${width}; padding: 8px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .large { font-size: 16px; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; }
  td:last-child { text-align: right; }
</style>
</head>
<body>
  ${settings.showLogo ? `<div class="center bold large">${settings.restaurantName}</div>` : ''}
  <div class="center">${settings.restaurantPhone}</div>
  <div class="center">${settings.restaurantAddress}</div>
  <hr/>
  <div class="center bold">** TEST RECEIPT **</div>
  <div class="center">${new Date().toLocaleString()}</div>
  <hr/>
  <table>
    <tr><td>1x Test Item</td><td>Rs. 500</td></tr>
    <tr><td>1x Sample Drink</td><td>Rs. 150</td></tr>
  </table>
  <hr/>
  <table>
    <tr><td>Subtotal</td><td>Rs. 650</td></tr>
    <tr><td class="bold">TOTAL</td><td class="bold">Rs. 650</td></tr>
  </table>
  <hr/>
  <div class="center">${settings.footerMessage}</div>
  <div class="center">Powered by ePOSmatic</div>
  <br/><br/><br/>
</body>
</html>`;
}
