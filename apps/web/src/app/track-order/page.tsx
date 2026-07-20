'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { PackageSearch, Search, ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './TrackLookup.module.css';

type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';

interface OrderSummary {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  itemCount: number;
  items: string[];
}

function shortId(id: string) { return id.slice(-8).toUpperCase(); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing & Delivering',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function TrackLookupPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setSearched(false);

    try {
      const res = await fetch(`/api/track?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders ?? []);
      setCustomerName(data.customerName ?? '');
      setSearched(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar onSearch={() => {}} />

      <div className={styles.page}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <PackageSearch size={36} />
            </div>
            <h1>Track Your Order</h1>
            <p>Enter your phone number to find your orders<br />and check their live status.</p>
          </div>

          {/* Search Card */}
          <div className={styles.searchCard}>
            <form onSubmit={handleSearch}>
              <div className={styles.inputGroup}>
                <input
                  type="tel"
                  className={styles.phoneInput}
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                <button type="submit" className={styles.searchBtn} disabled={loading}>
                  {loading
                    ? <span className={styles.spinner} />
                    : <><Search size={16} /> Find Orders</>
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorState}>
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          {searched && !error && (
            <>
              {orders.length === 0 ? (
                <div className={styles.empty}>
                  <ShoppingBag size={44} color="#e0e0e0" style={{ margin: '0 auto 16px' }} />
                  <h3>No orders found</h3>
                  <p>We couldn&apos;t find any orders for that phone number.<br />Double-check the number and try again.</p>
                  <Link href="/#menu" className="btn btn-gold">Browse Menu</Link>
                </div>
              ) : (
                <>
                  <div className={styles.resultsHeader}>
                    <span className={styles.resultsTitle}>
                      {customerName ? `Orders for ${customerName}` : 'Your Orders'}
                    </span>
                    <span className={styles.resultsMeta}>{orders.length} order{orders.length !== 1 ? 's' : ''} found</span>
                  </div>

                  {orders.map(order => (
                    <Link
                      key={order.id}
                      href={`/track-order/${order.id}`}
                      className={styles.orderCard}
                    >
                      <div className={styles.orderLeft}>
                        <div className={styles.orderId}>Order #{shortId(order.id)}</div>
                        <div className={styles.orderName}>
                          {order.items.slice(0, 2).join(', ')}{order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </div>
                        <div className={styles.orderMeta}>{fmtDate(order.createdAt)} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</div>
                      </div>
                      <div className={styles.orderRight}>
                        <span className={styles.orderTotal}>Rs. {Number(order.totalAmount).toLocaleString()}</span>
                        <span className={`${styles.badge} ${styles[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <ArrowRight size={18} className={styles.viewArrow} />
                    </Link>
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
