'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChefHat, Printer, RefreshCw, LogOut, MoreVertical } from 'lucide-react';
import styles from './kitchen.module.css';

const KITCHEN_PIN = process.env.NEXT_PUBLIC_KITCHEN_PIN || '1234';
const REFRESH_INTERVAL = 5000;

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  menuItem: { name: string; isSpicy: boolean };
  notes?: string;
}

interface Order {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string | null };
  type: string;
  orderItems: OrderItem[];
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── PIN Screen ──────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleKey = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === KITCHEN_PIN) {
          sessionStorage.setItem('kitchen_unlocked', '1');
          onUnlock();
        } else {
          setShake(true);
          setError('Wrong PIN. Try again.');
          setTimeout(() => { setShake(false); setPin(''); setError(''); }, 800);
        }
      }, 100);
    }
  };

  return (
    <div className={styles.pinScreen}>
      <div className={`${styles.pinCard} ${shake ? styles.shake : ''}`}>
        <div className={styles.pinLogo}><ChefHat size={40} /></div>
        <h1 className={styles.pinTitle}>Kitchen KDS</h1>
        <p className={styles.pinSub}>Enter PIN to continue</p>
        <div className={styles.pinDots}>
          {[0,1,2,3].map(i => <div key={i} className={`${styles.pinDot} ${pin.length > i ? styles.pinDotFilled : ''}`} />)}
        </div>
        {error && <p className={styles.pinError}>{error}</p>}
        <div className={styles.numpad}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            <button key={i} className={`${styles.numKey} ${k === '' ? styles.numKeyBlank : ''}`} onClick={() => k === '⌫' ? setPin('') : k !== '' && handleKey(k)} disabled={k === ''}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus, disabled }: {
  order: Order;
  onUpdateStatus: (id: string, status: string) => void;
  disabled: boolean;
}) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 60000); return () => clearInterval(t); }, []);

  const orderNum = order.id.slice(-4).toUpperCase();
  const typeStr = order.type ? order.type.replace('_', ' ') : 'Walk In';
  
  let headerClass = styles['type-walk_in'];
  if (order.type === 'DINE_IN') headerClass = styles['type-dine_in'];
  else if (order.type === 'DELIVERY' || order.type === 'PICKUP') headerClass = styles['type-delivery'];

  let progress = 25;
  let btnClass = styles.btnPlaced;
  let btnLabel = 'Placed';
  let nextStatus = 'PREPARING';

  if (order.status === 'PREPARING') { progress = 50; btnClass = styles.btnPreparing; btnLabel = 'Preparing'; nextStatus = 'READY'; }
  else if (order.status === 'READY') { progress = 75; btnClass = styles.btnReady; btnLabel = 'Ready'; nextStatus = 'COMPLETED'; }
  else if (order.status === 'COMPLETED') { progress = 100; btnClass = styles.btnCompleted; btnLabel = 'Completed'; nextStatus = ''; }

  return (
    <div className={styles.card} style={{ opacity: disabled ? 0.6 : 1 }}>
      <div className={`${styles.cardHead} ${headerClass}`}>
        <span className={styles.cardSourcePill}>POS</span>
        <span className={styles.cardOrderTitle}>{typeStr} #{orderNum}</span>
        <MoreVertical size={18} className={styles.cardMenuIcon} />
      </div>
      <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
      
      <div className={styles.cardTimestamps}>
        {order.status !== 'PENDING' && (
          <div className={`${styles.timestampRow} ${styles.updated}`}>
            <span><RefreshCw size={10} style={{marginRight: 4}}/> Updated {timeAgo(order.updatedAt)}</span>
            <span className={styles.timeRight}>{formatTime(order.updatedAt)}</span>
          </div>
        )}
        <div className={styles.timestampRow}>
          <span><RefreshCw size={10} style={{marginRight: 4}}/> Created {timeAgo(order.createdAt)}</span>
          <span className={styles.timeRight}>{formatTime(order.createdAt)}</span>
        </div>
      </div>

      <ul className={styles.itemList}>
        {order.orderItems.map((item, idx) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.itemNum}>{idx + 1}.</span>
            <div className={styles.itemImage}>🍽️</div>
            <div className={styles.itemQty}>{item.quantity}x</div>
            <div className={styles.itemDetails}>
              <span className={styles.itemName}>{item.menuItem.name}</span>
              {item.notes && <span className={styles.itemSub}>{item.notes}</span>}
              {item.menuItem.isSpicy && <span className={styles.itemSub}>SPICY</span>}
            </div>
          </li>
        ))}
      </ul>

      {nextStatus && (
        <button className={`${styles.actionBtn} ${btnClass}`} onClick={() => onUpdateStatus(order.id, nextStatus)} disabled={disabled}>
          <div className={styles.actionBtnIcon}><Printer size={16} /></div>
          <span>{btnLabel}</span>
          <div className={styles.actionBtnIcon}><RefreshCw size={16} /></div>
        </button>
      )}
      {!nextStatus && (
        <button className={`${styles.actionBtn} ${btnClass}`} disabled>
          <div className={styles.actionBtnIcon}><Printer size={16} /></div>
          <span>{btnLabel}</span>
          <div className={styles.actionBtnIcon}><RefreshCw size={16} /></div>
        </button>
      )}
    </div>
  );
}

// ── Main KDS Board ───────────────────────────────────────────────────────────
function KitchenBoard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(new Date());
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/kitchen', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchOrders();
    const int1 = setInterval(fetchOrders, REFRESH_INTERVAL);
    const int2 = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(int1); clearInterval(int2); };
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch('/api/kitchen', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      await fetchOrders();
    } finally { setUpdating(null); }
  };

  const pending   = orders.filter(o => o.status === 'PENDING');
  const preparing = orders.filter(o => o.status === 'PREPARING');
  const ready     = orders.filter(o => o.status === 'READY');
  const completed = orders.filter(o => o.status === 'COMPLETED');

  return (
    <div className={styles.board}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <ChefHat size={28} className={styles.topBarIcon} />
          <h1 className={styles.topBarTitle}>ePOSmatic</h1>
        </div>
        <div className={styles.clockTime}>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
        <div className={styles.topBarRight}>
          <button className={styles.refreshBtn} onClick={fetchOrders}><RefreshCw size={14} /> LOAD PAST ORDERS</button>
          <button className={styles.logoutBtn} onClick={onLogout}><LogOut size={14} /></button>
        </div>
      </div>

      <div className={styles.columns}>
        {/* Placed */}
        <div className={styles.column}>
          <div className={styles.columnHead}>
            <span className={styles.columnTitle}>Placed</span>
            <span className={styles.columnCount}>{pending.length}</span>
          </div>
          <div className={styles.columnBody}>
            {pending.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} disabled={updating === o.id} />)}
          </div>
        </div>

        {/* Preparing */}
        <div className={styles.column}>
          <div className={styles.columnHead}>
            <span className={styles.columnTitle}>Preparing</span>
            <span className={styles.columnCount}>{preparing.length}</span>
          </div>
          <div className={styles.columnBody}>
            {preparing.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} disabled={updating === o.id} />)}
          </div>
        </div>

        {/* Ready */}
        <div className={styles.column}>
          <div className={styles.columnHead}>
            <span className={styles.columnTitle}>Ready</span>
            <span className={styles.columnCount}>{ready.length}</span>
          </div>
          <div className={styles.columnBody}>
            {ready.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} disabled={updating === o.id} />)}
          </div>
        </div>

        {/* Completed */}
        <div className={styles.column}>
          <div className={styles.columnHead}>
            <span className={styles.columnTitle}>Completed</span>
            <span className={styles.columnCount}>{completed.length}</span>
          </div>
          <div className={styles.columnBody}>
            {completed.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} disabled={updating === o.id} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Entry ───────────────────────────────────────────────────────────────
export default function KitchenPage() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => { if (sessionStorage.getItem('kitchen_unlocked') === '1') setUnlocked(true); }, []);
  return !unlocked ? <PinScreen onUnlock={() => setUnlocked(true)} /> : <KitchenBoard onLogout={() => { sessionStorage.removeItem('kitchen_unlocked'); setUnlocked(false); }} />;
}
