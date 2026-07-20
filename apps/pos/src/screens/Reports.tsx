import React, { useState, useMemo } from 'react';
import {
  TrendingUp, ShoppingBag, CheckCircle2, XCircle,
  BarChart3, Star, Clock, ArrowUpRight, ArrowDownRight, Bike, ShoppingCart, Users, Footprints
} from 'lucide-react';
import { usePOSStore, type POSOrder } from '../store';

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `Rs. ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

function startOf(period: 'today' | 'week' | 'month', d = new Date()) {
  const base = new Date(d);
  if (period === 'today') { base.setHours(0, 0, 0, 0); return base; }
  if (period === 'week')  { base.setDate(base.getDate() - base.getDay()); base.setHours(0,0,0,0); return base; }
  base.setDate(1); base.setHours(0,0,0,0); return base;
}

// ── Tiny bar chart (pure CSS + inline SVG) ──────────────────────────────────
function MiniBarChart({ data, color = '#8b5cf6' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', width: '100%' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            title={`${d.label}: ${d.value}`}
            style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: d.value > 0 ? color : 'rgba(255,255,255,0.05)',
              height: `${(d.value / max) * 100}%`,
              minHeight: d.value > 0 ? '4px' : '0',
              transition: 'height 0.4s ease',
              opacity: d.value > 0 ? 1 : 0.3,
            }}
          />
          <span style={{ fontSize: '0.6rem', color: '#475569', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function ReportStatCard({ label, value, sub, icon, accent, trend }: any) {
  return (
    <div style={{
      background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${accent}20`, border: `1px solid ${accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: trend >= 0 ? '#4ade80' : '#f87171' }}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
] as const;

type Period = 'today' | 'week' | 'month';

const ORDER_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  WALK_IN:  { label: 'Walk In',   icon: <Footprints size={14} />, color: '#8b5cf6' },
  PICKUP:   { label: 'Take Away', icon: <ShoppingCart size={14} />, color: '#3b82f6' },
  DELIVERY: { label: 'Delivery',  icon: <Bike size={14} />, color: '#f59e0b' },
  KIOSK:    { label: 'Kiosk',     icon: <Users size={14} />, color: '#10b981' },
};

export default function Reports() {
  const { orders } = usePOSStore();
  const [period, setPeriod] = useState<Period>('today');

  const filtered = useMemo(() => {
    const cutoff = startOf(period);
    return orders.filter(o => new Date(o.createdAt) >= cutoff && o.status !== 'CANCELLED');
  }, [orders, period]);

  // KPIs
  const totalRevenue  = filtered.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders   = filtered.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedCount = filtered.filter(o => o.status === 'COMPLETED').length;
  const cancelledCount = orders.filter(o => {
    const cutoff = startOf(period);
    return new Date(o.createdAt) >= cutoff && o.status === 'CANCELLED';
  }).length;

  // Best selling items
  const itemSales = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filtered.forEach(o => o.items.forEach(item => {
      if (!map[item.menuItemId]) map[item.menuItemId] = { name: item.name, qty: 0, revenue: 0 };
      map[item.menuItemId].qty += item.quantity;
      map[item.menuItemId].revenue += item.price * item.quantity;
    }));
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [filtered]);

  // Hourly breakdown (today only, or last 24h otherwise)
  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({
      label: `${(i * 2).toString().padStart(2, '0')}:00`,
      value: 0,
    }));
    filtered.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      const bucket = Math.floor(h / 2);
      if (bucket >= 0 && bucket < 12) buckets[bucket].value += o.totalAmount;
    });
    return buckets;
  }, [filtered]);

  // Orders by type
  const byType = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.forEach(o => {
      const t = o.type || 'WALK_IN';
      if (!map[t]) map[t] = { count: 0, revenue: 0 };
      map[t].count++;
      map[t].revenue += o.totalAmount;
    });
    return Object.entries(map).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // Peak hour
  const peakBucket = hourlyData.reduce((best, b, i) => b.value > hourlyData[best].value ? i : best, 0);
  const peakLabel = hourlyData[peakBucket].label;

  const maxItem = itemSales[0];

  return (
    <div style={{ padding: '16px 12px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header + Period Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9' }}>Reports & Analytics</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{filtered.length} orders in period</p>
          </div>
        </div>

        {/* Period toggle */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.15s',
                background: period === p.key ? '#8b5cf6' : 'transparent',
                color: period === p.key ? '#fff' : '#64748b',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <ReportStatCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          sub={`${totalOrders} orders`}
          icon={<TrendingUp size={20} />}
          accent="#8b5cf6"
        />
        <ReportStatCard
          label="Avg. Order Value"
          value={fmt(Math.round(avgOrderValue))}
          sub="Per transaction"
          icon={<ShoppingBag size={20} />}
          accent="#3b82f6"
        />
        <ReportStatCard
          label="Completed Orders"
          value={completedCount}
          sub={`${cancelledCount} cancelled`}
          icon={<CheckCircle2 size={20} />}
          accent="#10b981"
        />
        <ReportStatCard
          label="Peak Hour"
          value={totalOrders > 0 ? peakLabel : '—'}
          sub={totalOrders > 0 ? `Busiest 2-hr window` : 'No data yet'}
          icon={<Clock size={20} />}
          accent="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Hourly Revenue Chart */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Revenue by Hour</h3>
            <span style={{ fontSize: '0.75rem', color: '#475569', background: 'rgba(139,92,246,0.15)', padding: '3px 10px', borderRadius: '20px', color: '#a78bfa' }}>
              {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.85rem' }}>
              No data yet — place some orders!
            </div>
          ) : (
            <MiniBarChart data={hourlyData} color="#8b5cf6" />
          )}
        </div>

        {/* Sales by Order Type */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Sales by Order Type</h3>
          {byType.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.85rem', height: '80px' }}>
              No data yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {byType.map(({ type, count, revenue }) => {
                const meta = ORDER_TYPE_META[type] ?? { label: type, icon: <ShoppingBag size={14} />, color: '#8b5cf6' };
                const pct = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span style={{ color: meta.color }}>{meta.icon}</span> {meta.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>{count} orders</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Best Sellers */}
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Star size={16} style={{ color: '#f59e0b' }} />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Best Selling Items</h3>
        </div>

        {itemSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#334155', fontSize: '0.85rem' }}>
            No sales data yet for this period
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {itemSales.map((item, i) => {
              const isTop = i === 0;
              const pct = maxItem ? Math.round((item.qty / maxItem.qty) * 100) : 0;
              return (
                <div key={item.name} style={{
                  padding: '14px', borderRadius: '12px', position: 'relative', overflow: 'hidden',
                  background: isTop ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isTop ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                  {isTop && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', fontWeight: 800, background: '#f59e0b', color: '#000', padding: '2px 7px', borderRadius: '99px' }}>
                      #1 BEST
                    </div>
                  )}
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '2px' }}>
                    {i + 1}. {item.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                    {item.qty} sold · {fmt(item.revenue)}
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isTop ? '#8b5cf6' : '#334155', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancelled orders warning */}
      {cancelledCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px' }}>
          <XCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>
            {cancelledCount} order{cancelledCount > 1 ? 's were' : ' was'} cancelled this period — review the Order Queue for details.
          </span>
        </div>
      )}
    </div>
  );
}
