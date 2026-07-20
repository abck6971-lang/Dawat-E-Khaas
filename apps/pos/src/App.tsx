import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, ShoppingCart, UtensilsCrossed,
  Settings as SettingsIcon, LayoutDashboard, RefreshCw, Bell,
  Clock as ClockIcon, Package, Monitor, LineChart, Printer, Home,
  User, ShoppingBag, Truck, MousePointerClick, CheckCircle2
} from 'lucide-react';
import { usePOSStore } from './store';
import Dashboard from './screens/Dashboard';
import Orders from './screens/Orders';
import NewOrder from './screens/NewOrder';
import MenuManagement from './screens/MenuManagement';
import Settings from './screens/Settings';
import KDS from './screens/KDS';
import PrinterSettings from './screens/PrinterSettings';
import Reports from './screens/Reports';

/* ─── Placeholder Screens ─── */
function PlaceholderScreen({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state-icon" style={{ opacity: 0.5, marginBottom: '20px' }}>
        <Icon size={64} />
      </div>
      <h3>{title}</h3>
      <p>This module is coming soon in the next update.</p>
    </div>
  );
}

/* ─── Clock ─── */
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="topbar-clock">
      <div className="time">
        {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="date">
        {now.toLocaleDateString('en-PK', { weekday: 'long', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="toast">
      <CheckCircle2 size={16} /> {message}
    </div>
  );
}

/* ─── Top Bar ─── */
const PAGE_LABELS: Record<string, string> = {
  '/':          'Select Order Type',
  '/orders':    'Order Queue',
  '/new-order': 'New Order',
  '/menu':      'Menu Management',
  '/settings':  'Settings',
  '/dashboard': 'Dashboard',
  '/kds':       'Kitchen Display',
  '/shifts':    'Shifts',
  '/cashier':   'Cashier',
  '/reports':   'Reports & Analytics',
  '/printer':   'Printer Settings',
};

function TopBar({ toasts, clearToast }: { toasts: string[]; clearToast: (i: number) => void }) {
  const { isOnline, orders, settings } = usePOSStore();
  const location = useLocation();
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const title = PAGE_LABELS[location.pathname] ?? 'POS';
  const initials = settings.restaurantName.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const handleSync = async () => {
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.invoke('force-sync');
    }
  };

  return (
    <>
      <div className="pos-topbar">
        {/* Left */}
        <div className="topbar-left">
          {location.pathname !== '/' && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ borderRadius: 'var(--radius-pill)', gap: '6px', display: 'flex', alignItems: 'center' }}>
              <Home size={14} /> Home
            </button>
          )}
          <div className="topbar-status">
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
            <div className="topbar-status-text">
              <strong>{isOnline ? 'Connected' : 'Offline'}</strong>
              <span>{isOnline ? `Sync enabled` : 'Local mode'}</span>
            </div>
          </div>
          <Clock />
        </div>

        {/* Center */}
        <div className="topbar-center">
          <span className="topbar-page-title">{title}</span>
        </div>

        {/* Right */}
        <div className="topbar-right">
          {isOnline && (
            <button className="btn btn-ghost btn-sm" onClick={handleSync} title="Sync now">
              <RefreshCw size={14} />
            </button>
          )}
          <div className="topbar-restaurant">
            <div className="restaurant-avatar">{initials}</div>
            <span className="restaurant-name">{settings.restaurantName}</span>
          </div>
          <div className="topbar-notif-btn">
            <Bell size={18} />
            {pendingCount > 0 && <div className="notif-badge" />}
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t, i) => (
            <Toast key={i} message={t} onDone={() => clearToast(i)} />
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Home Screen (Order Type Selector) ─── */
const ORDER_TYPES = [
  { id: 'WALK_IN',   label: 'Walk In',     icon: <User size={48} strokeWidth={1.5} />, cls: 'walk-in' },
  { id: 'PICKUP',    label: 'Take Away',   icon: <ShoppingBag size={48} strokeWidth={1.5} />, cls: 'takeaway' },
  { id: 'DELIVERY',  label: 'Delivery',    icon: <Truck size={48} strokeWidth={1.5} />, cls: 'delivery' },
  { id: 'KIOSK',     label: 'Kiosk',       icon: <MousePointerClick size={48} strokeWidth={1.5} />, cls: 'kiosk' },
];

function HomeScreen() {
  const navigate = useNavigate();
  const { settings } = usePOSStore();

  const handleSelect = (type: string) => {
    navigate('/new-order', { state: { orderType: type } });
  };

  return (
    <div className="home-screen fade-in">
      <div className="home-greeting">
        <h1>Welcome to {settings.restaurantName}</h1>
        <p>Select order type to begin</p>
      </div>
      <div className="order-type-grid">
        {ORDER_TYPES.map(t => (
          <button key={t.id} className={`order-type-tile ${t.cls}`} onClick={() => handleSelect(t.id)}>
            <div className="tile-icon">{t.icon}</div>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Bottom Dock ─── */
const DOCK_ITEMS = [
  { path: '/orders',    label: 'Orders',    icon: ClipboardList, badge: true  },
  { path: '/shifts',    label: 'Shifts',    icon: ClockIcon,     badge: false },
  { path: '/cashier',   label: 'Cashier',   icon: Package,       badge: false },
  { path: '/kds',       label: 'KDS',       icon: Monitor,       badge: false },
  { path: '/reports',   label: 'Reports',   icon: LineChart,     badge: false },
  { path: '/printer',   label: 'Printer',   icon: Printer,       badge: false },
];

const SETTINGS_DOCK_ITEM = { path: '/settings', label: 'Settings', icon: SettingsIcon };

function BottomDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = usePOSStore();
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="bottom-dock">
      <div className="dock-group">
        {DOCK_ITEMS.map(({ path, label, icon: Icon, badge }) => (
          <button
            key={path}
            className={`dock-btn ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={22} />
            {label}
            {badge && pendingCount > 0 && (
              <span className="dock-btn-badge">{pendingCount}</span>
            )}
          </button>
        ))}
        <div className="dock-divider" />
        <button
          className={`dock-btn ${location.pathname === SETTINGS_DOCK_ITEM.path ? 'active' : ''}`}
          onClick={() => navigate(SETTINGS_DOCK_ITEM.path)}
        >
          <SETTINGS_DOCK_ITEM.icon size={22} />
          {SETTINGS_DOCK_ITEM.label}
        </button>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
function AppInner() {
  const { setOrders, setMenuItems, setOnline } = usePOSStore();
  const [toasts, setToasts] = useState<string[]>([]);

  const addToast = (msg: string) => setToasts(prev => [...prev, msg]);
  const clearToast = (i: number) => setToasts(prev => prev.filter((_, idx) => idx !== i));

  useEffect(() => {
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.on('live-orders-updated', (_: any, orders: any[]) => {
        setOnline(true);
        if (orders?.length) {
          setOrders(orders);
          addToast(`${orders.length} order(s) synced from cloud`);
        }
      });

      (window as any).ipcRenderer.on('live-menu-updated', (_: any, menuItems: any[]) => {
        if (menuItems?.length) {
          setMenuItems(menuItems);
        }
      });

      // Load local offline orders on boot
      (window as any).ipcRenderer.invoke('get-local-orders').then((local: any[]) => {
        if (local?.length > 0) {
          setOrders(local.map((o: any) => ({
            ...o,
            items: typeof o.itemsJson === 'string' ? JSON.parse(o.itemsJson) : (o.items ?? []),
            isSynced: !!o.isSynced,
          })));
        }
      });
    }

    const onOnline  = () => { setOnline(true);  addToast('Back online — syncing orders…'); };
    const onOffline = () => { setOnline(false); };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="pos-layout">
      <TopBar toasts={toasts} clearToast={clearToast} />
      <div className="pos-content">
        <Routes>
          <Route path="/"          element={<HomeScreen />} />
          <Route path="/new-order" element={<NewOrder />} />
          <Route path="/orders"    element={<Orders addToast={addToast} />} />
          <Route path="/shifts"    element={<PlaceholderScreen title="Shifts Management" icon={ClockIcon} />} />
          <Route path="/cashier"   element={<PlaceholderScreen title="Cashier & Register" icon={Package} />} />
          <Route path="/kds"       element={<KDS />} />
          <Route path="/reports"   element={<Reports />} />
          <Route path="/printer"   element={<PrinterSettings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu"      element={<MenuManagement />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </div>
      <BottomDock />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
