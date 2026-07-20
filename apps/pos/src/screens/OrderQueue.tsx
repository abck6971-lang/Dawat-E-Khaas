import React, { useEffect, useState } from 'react';
import { usePOSStore } from '../store';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PREPARING: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

export default function OrderQueue() {
  const { orders } = usePOSStore();
  
  return (
    <div className="queue-container">
      <header className="queue-header">
        <h1>Live Order Queue</h1>
        <p>{orders.length} orders today</p>
      </header>

      <div className="queue-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
              <span className="order-status" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                {order.status}
              </span>
            </div>
            
            <div className="order-customer">
              <strong>{order.customerName || 'Guest'}</strong>
              <span className="order-type">{order.type}</span>
            </div>

            <div className="order-items">
              {order.items.map((item, i) => (
                <div key={i} className="item-row">
                  <span>{item.quantity}× {item.name}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <span className="order-total">Rs. {order.totalAmount}</span>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>Print</button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
