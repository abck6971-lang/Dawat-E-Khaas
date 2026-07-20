'use client';
import { useEffect, useState } from 'react';
import { Banknote, ShoppingCart, TrendingUp, AlertCircle, TrendingDown, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Stats {
  salesToday: number;
  ordersToday: number;
  totalRevenue: number;
  pendingOrders: number;
  revenueChart: { date: string; revenue: number }[];
  popularItems: { name: string; quantity: number }[];
}

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer: { name: string; phone: string | null };
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    fetch('/api/admin/orders').then(r => r.json()).then((d: Order[]) => setOrders(d.slice(0, 10)));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--md-sys-color-on-background)', margin: '0 0 4px 0' }}>Overview</h2>
        <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', margin: 0 }}>Here is what's happening at your restaurant today.</p>
      </div>

      {/* ── Top Stat Cards ── */}
      <div className="statsGrid">
        <div className="statCard">
          <div className="statIcon" style={{ background: 'var(--md-sys-color-primary-container)' }}>
            <Banknote size={22} color="var(--md-sys-color-on-primary-container)" />
          </div>
          <span className="statLabel">Sales Today</span>
          <span className="statValue">Rs. {(stats?.salesToday ?? 0).toLocaleString()}</span>
        </div>
        
        <div className="statCard">
          <div className="statIcon" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
            <ShoppingCart size={22} color="var(--md-sys-color-on-secondary-container)" />
          </div>
          <span className="statLabel">Orders Today</span>
          <span className="statValue">{stats?.ordersToday ?? 0}</span>
        </div>
        
        <div className="statCard">
          <div className="statIcon" style={{ background: '#E8DEF8' }}>
            <TrendingUp size={22} color="#4A4458" />
          </div>
          <span className="statLabel">Total Revenue</span>
          <span className="statValue">Rs. {(stats?.totalRevenue ?? 0).toLocaleString()}</span>
        </div>
        
        <div className="statCard">
          <div className="statIcon" style={{ background: 'var(--md-sys-color-error-container)' }}>
            <AlertCircle size={22} color="var(--md-sys-color-on-error-container)" />
          </div>
          <span className="statLabel">Pending Orders</span>
          <span className="statValue">{stats?.pendingOrders ?? 0}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* ── 7-Day Revenue Chart ── */}
        <div className="tableCard" style={{ marginBottom: 0 }}>
          <div className="tableHeader">
            <span className="tableTitle">Revenue (Last 7 Days)</span>
          </div>
          <div style={{ height: 300, padding: '20px 20px 0 0' }}>
            {stats && stats.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueChart}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'var(--md-sys-color-surface-container-high)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--md-sys-color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-outline)' }}>
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* ── Popular Items ── */}
        <div className="tableCard" style={{ marginBottom: 0 }}>
          <div className="tableHeader">
            <span className="tableTitle">Popular Items</span>
          </div>
          <div style={{ padding: '0 20px 20px 20px' }}>
            {!stats || stats.popularItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--md-sys-color-outline)' }}>No sales yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {stats.popularItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: i === stats.popularItems.length - 1 ? 'none' : '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--md-sys-color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                        {i === 0 ? <Star size={14} color="#C8A84B" /> : i + 1}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)', background: 'var(--md-sys-color-surface-container)', padding: '4px 8px', borderRadius: '8px' }}>
                      {item.quantity} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Recent Orders ── */}
      <div className="tableCard">
        <div className="tableHeader">
          <span className="tableTitle">Recent Orders</span>
          <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-primary)', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
        </div>
        {orders.length === 0 ? (
          <p className="emptyState">No orders yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.customer.name}</strong></td>
                  <td>{o.customer.phone ?? '—'}</td>
                  <td>Rs. {Number(o.totalAmount).toLocaleString()}</td>
                  <td>
                    <span className={`statusBadge status${o.status}`}>{o.status}</span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
