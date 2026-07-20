'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';

const STATUSES = ['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'];

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  menuItem: { name: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
  orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => { fetch('/api/admin/orders').then(r => r.json()).then(setOrders); };
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function deleteOrder(id: string) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="tableCard">
      <div className="tableHeader">
        <span className="tableTitle">All Orders ({orders.length})</span>
      </div>

      {orders.length === 0 ? (
        <p className="emptyState">No orders yet. They will appear here once customers place them.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
              <th>Track</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td>{expanded === order.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                  <td><strong>{order.customer.name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{order.customer.email}</span></td>
                  <td>{order.customer.phone ?? '—'}</td>
                  <td>Rs. {Number(order.totalAmount).toLocaleString()}</td>
                  <td><span className={`statusBadge status${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      className="selectStatus"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <a
                      href={`/track-order/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600, color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}
                    >
                      <ExternalLink size={13} /> Track
                    </a>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="btnDanger"
                      onClick={() => deleteOrder(order.id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>

                {expanded === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={9} style={{ background: 'var(--md-sys-color-surface-container-low)', paddingLeft: 48, borderRadius: '0 0 16px 16px' }}>
                      <div style={{ padding: '16px 0' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface)' }}>Order Items:</strong>
                        <table style={{ marginTop: 8, width: '60%' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', padding: '4px 12px 4px 0' }}>Item</th>
                              <th style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', padding: '4px 12px 4px 0' }}>Qty</th>
                              <th style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', padding: '4px 0' }}>Unit Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.orderItems.map(oi => (
                              <tr key={oi.id}>
                                <td style={{ fontSize: '0.85rem', padding: '4px 12px 4px 0', color: 'var(--md-sys-color-on-surface)' }}>{oi.menuItem.name}</td>
                                <td style={{ fontSize: '0.85rem', padding: '4px 12px 4px 0', color: 'var(--md-sys-color-on-surface)' }}>×{oi.quantity}</td>
                                <td style={{ fontSize: '0.85rem', padding: '4px 0', color: 'var(--md-sys-color-on-surface)' }}>Rs. {Number(oi.unitPrice).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {order.notes && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)' }}>📝 {order.notes}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
