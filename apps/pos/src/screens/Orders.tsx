import React, { useState } from 'react';
import { usePOSStore, type POSOrder } from '../store';
import { Printer, XCircle, Search, ChefHat, CheckCircle2, Inbox, Phone, MapPin } from 'lucide-react';

const STATUS_SEQUENCE: POSOrder['status'][] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];

function getNextStatus(current: POSOrder['status']): POSOrder['status'] | null {
  const idx = STATUS_SEQUENCE.indexOf(current);
  if (idx < 0 || idx >= STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[idx + 1];
}

function getNextStatusLabel(current: POSOrder['status']) {
  const next = getNextStatus(current);
  if (next === 'PREPARING') return <><ChefHat size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Start Preparing</>;
  if (next === 'READY') return <><CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Mark Ready</>;
  if (next === 'COMPLETED') return <><CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Complete</>;
  return null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function ReceiptModal({ order, onClose }: { order: POSOrder; onClose: () => void }) {
  const { settings } = usePOSStore();
  const tax = Math.round(order.totalAmount * settings.taxPercent / 100);
  const grandTotal = order.totalAmount + tax;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt-modal" onClick={e => e.stopPropagation()}>
        <div className="receipt-header">
          <h2>{settings.restaurantName}</h2>
          <p>{settings.restaurantAddress}</p>
          <p>{settings.restaurantPhone}</p>
          <p style={{ marginTop: 8, fontSize: 11 }}>
            #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div className="receipt-row"><span>Customer</span><span>{order.customerName || 'Walk-in'}</span></div>
          <div className="receipt-row"><span>Type</span><span>{order.type.replace('_', ' ')}</span></div>
          {order.tableNumber && <div className="receipt-row"><span>Table</span><span>{order.tableNumber}</span></div>}
        </div>

        <div style={{ borderTop: '2px dashed rgba(255,255,255,0.1)', borderBottom: '2px dashed rgba(255,255,255,0.1)', padding: '10px 0', margin: '10px 0' }}>
          {order.items.map((item, i) => (
            <div key={i} className="receipt-row">
              <span>{item.quantity}× {item.name}</span>
              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="receipt-row"><span>Subtotal</span><span>Rs. {order.totalAmount.toLocaleString()}</span></div>
        {settings.taxPercent > 0 && (
          <div className="receipt-row"><span>Tax ({settings.taxPercent}%)</span><span>Rs. {tax.toLocaleString()}</span></div>
        )}
        <div className="receipt-row total"><span>Total</span><span>Rs. {grandTotal.toLocaleString()}</span></div>

        <div className="receipt-footer">
          <p>Thank you for dining with us!</p>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>
            <Printer size={15} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

const FILTERS = ['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export default function Orders({ addToast }: { addToast?: (msg: string) => void }) {
  const { orders, updateOrderStatus } = usePOSStore();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<POSOrder | null>(null);

  const handleStatusUpdate = (id: string, status: POSOrder['status']) => {
    updateOrderStatus(id, status);
    addToast?.(`Order #${id.slice(0, 6).toUpperCase()} → ${status}`);
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'ALL' || o.status === filter;
    const matchSearch = !search ||
      (o.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search);
    return matchFilter && matchSearch;
  });

  const countFor = (s: string) =>
    s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;

  return (
    <div className="orders-page fade-in">
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, paddingTop: 4 }}>
        <div style={{ position: 'relative', maxWidth: 300 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            className="menu-search-input"
            placeholder="Search orders…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="orders-filter-bar">
        {FILTERS.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All Orders' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="count">{countFor(f)}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="orders-grid-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Inbox size={40} opacity={0.5} /></div>
            <h3>No orders found</h3>
            <p>Try a different filter or place a new order</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filtered.map(order => {
              const nextLabel = getNextStatusLabel(order.status);
              return (
                <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
                  <div className="order-card-header">
                    <div>
                      <div className="order-number">#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="order-time">{timeAgo(order.createdAt)}</div>
                    </div>
                    <span className={`order-status-badge ${order.status}`}>{order.status}</span>
                  </div>

                  <div className="order-customer-row">
                    <div className="order-customer-name">{order.customerName || 'Walk-in Guest'}</div>
                    <span className={`order-source-badge ${order.source}`}>{order.source.replace('_', '-')}</span>
                  </div>

                  {order.customerPhone && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {order.customerPhone}</div>
                  )}
                  {order.tableNumber && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> Table {order.tableNumber}</div>
                  )}

                  <div className="order-items-list">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item-row">
                        <span><strong>{item.quantity}×</strong> {item.name}</span>
                        <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total-row">
                      <span className="order-type-badge">{order.type.replace('_', ' ')}</span>
                      <span className="order-total-amount">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="order-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setReceiptOrder(order)}>
                        <Printer size={13} /> Receipt
                      </button>
                      {nextLabel && order.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                        >
                          {nextLabel}
                        </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                          onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
