import React from 'react';
import { usePOSStore, type POSOrder } from '../store';
import { TrendingUp, ShoppingBag, Clock, CheckCircle, ArrowRight, Globe, Smartphone, Store, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, icon, color, sub }: any) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-change">{sub}</div>}
      </div>
    </div>
  );
}

function getOrderIcon(source: string) {
  if (source === 'WEB') return <Globe size={18} />;
  if (source === 'APP') return <Smartphone size={18} />;
  return <Store size={18} />;
}
function getOrderIconBg(source: string) {
  if (source === 'WEB') return 'var(--info-light)';
  if (source === 'APP') return 'var(--primary-light)';
  return '#f1f5f9';
}

export default function Dashboard() {
  const { orders, settings } = usePOSStore();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const completedToday = todayOrders.filter(o => o.status === 'COMPLETED').length;

  const recentOrders = [...orders].slice(0, 6);

  return (
    <div className="dashboard-page fade-in">
      <div className="stats-grid">
        <StatCard
          label="Today's Revenue"
          value={`Rs. ${todayRevenue.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          color="orange"
          sub={`${todayOrders.length} orders today`}
        />
        <StatCard
          label="Pending Orders"
          value={pendingCount}
          icon={<Clock size={20} />}
          color="yellow"
          sub={pendingCount > 0 ? 'Needs attention' : 'All clear!'}
        />
        <StatCard
          label="In Preparation"
          value={preparingCount}
          icon={<ShoppingBag size={20} />}
          color="blue"
          sub="Kitchen is working"
        />
        <StatCard
          label="Completed Today"
          value={completedToday}
          icon={<CheckCircle size={20} />}
          color="green"
          sub="Orders fulfilled"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="recent-orders-card">
          <div className="recent-orders-header">
            <h3>Recent Orders</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon"><ClipboardList size={40} opacity={0.5} /></div>
              <p>No orders yet today</p>
            </div>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="recent-order-row" onClick={() => navigate('/orders')}>
                <div className="recent-order-icon" style={{ background: getOrderIconBg(order.source) }}>
                  {getOrderIcon(order.source)}
                </div>
                <div className="recent-order-info">
                  <div className="recent-order-name">{order.customerName || 'Walk-in Guest'}</div>
                  <div className="recent-order-meta">
                    #{order.id.slice(0, 8).toUpperCase()} · {order.type.replace('_', ' ')} ·{' '}
                    <span className={`order-status-badge ${order.status}`} style={{ display: 'inline-block' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="recent-order-amount">Rs. {order.totalAmount.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/new-order')}>
                <ShoppingBag size={18} /> New Walk-in Order
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/orders')}>
                <Clock size={16} /> View Order Queue
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/menu')}>
                <ClipboardList size={16} /> Manage Menu Items
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{settings.restaurantName}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{settings.restaurantAddress}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>
              <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Revenue</span>
                <strong style={{ color: 'var(--primary)' }}>
                  Rs. {orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
