import { usePOSStore } from '../store';

export default function KDS() {
  const { settings } = usePOSStore();
  
  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <iframe
        src={`${settings.apiUrl}/kitchen`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Kitchen Display System"
      />
    </div>
  );
}
