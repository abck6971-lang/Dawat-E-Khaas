'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: Array<{ quantity: number; menuItem: { name: string } }>;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PREPARING: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dek_token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setCustomer(data))
      .catch(() => { localStorage.removeItem('dek_token'); router.push('/login'); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('dek_token');
    localStorage.removeItem('dek_customer');
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#64748b', fontSize: 18 }}>Loading your account...</p>
    </div>
  );

  if (!customer) return null;

  return (
    <div className="account-page">
      {/* Header */}
      <div className="account-header">
        <div className="header-inner">
          <Link href="/" className="brand">🍽️ Dawat-E-Khaas</Link>
          <button onClick={handleLogout} className="logout-btn">Sign Out</button>
        </div>
      </div>

      <div className="account-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="avatar">{customer.name.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{customer.name}</h2>
            <p>{customer.email}</p>
            {customer.phone && <p>📞 {customer.phone}</p>}
          </div>
        </div>

        {/* Orders */}
        <div className="section">
          <h3 className="section-title">Your Orders ({customer.orders.length})</h3>
          {customer.orders.length === 0 ? (
            <div className="empty-orders">
              <p>You haven&apos;t placed any orders yet.</p>
              <Link href="/" className="order-now-btn">Order Now</Link>
            </div>
          ) : (
            <div className="orders-list">
              {customer.orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <p className="order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="order-status" style={{ background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                        {order.status}
                      </span>
                      <p className="order-total">${Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="order-items">
                    {order.orderItems.map((item, i) => (
                      <span key={i} className="order-item-tag">
                        {item.quantity}× {item.menuItem.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .account-page { min-height: 100vh; background: #f8fafc; }
        .account-header { background: #ea580c; padding: 0 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .header-inner { max-width: 800px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 64px; }
        .brand { color: white; font-size: 20px; font-weight: 800; text-decoration: none; }
        .logout-btn { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .logout-btn:hover { background: rgba(255,255,255,0.3); }
        .account-content { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
        .profile-card { background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; background: #ea580c; color: white; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .profile-info h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
        .profile-info p { color: #64748b; margin: 2px 0; font-size: 14px; }
        .section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 20px; }
        .empty-orders { text-align: center; padding: 32px; color: #64748b; }
        .order-now-btn { display: inline-block; margin-top: 12px; background: #ea580c; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .orders-list { display: flex; flex-direction: column; gap: 12px; }
        .order-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .order-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .order-id { font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 2px; }
        .order-date { color: #94a3b8; font-size: 13px; margin: 0; }
        .order-status { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 4px; }
        .order-total { font-weight: 700; color: #ea580c; font-size: 16px; margin: 0; }
        .order-items { display: flex; flex-wrap: wrap; gap: 8px; }
        .order-item-tag { background: #f1f5f9; color: #475569; font-size: 13px; padding: 4px 10px; border-radius: 20px; }
      `}</style>
    </div>
  );
}
