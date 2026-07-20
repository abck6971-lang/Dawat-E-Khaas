'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import {
  CheckCircle, Clock, ChefHat, PackageCheck, Bike, XCircle, RefreshCw,
  Hash, Phone, MapPin, UtensilsCrossed, Copy, Check, Star, RotateCcw,
} from 'lucide-react';
import styles from './TrackOrder.module.css';
import { useCart } from '@/lib/CartContext';

type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  menuItem: any;
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  customer: { name: string; phone: string | null };
  orderItems: OrderItem[];
}

/* ── Status steps ───────────────────────────────────── */
const STEPS: {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  desc: string;
  eta: string;
}[] = [
  { status: 'PENDING',   label: 'Order Placed', icon: <Clock size={18} />,       desc: 'Your order has been received and is awaiting confirmation.', eta: 'Awaiting confirmation…' },
  { status: 'PREPARING', label: 'Preparing',    icon: <ChefHat size={18} />,      desc: 'We are preparing your food and getting it ready for you!',   eta: '~20–45 min remaining' },
  { status: 'COMPLETED', label: 'Completed',     icon: <Bike size={18} />,         desc: 'Your order is complete. Enjoy your meal! 🎉',                eta: 'Completed!' },
];

/* ── Helpers ────────────────────────────────────────── */
function getStepIndex(status: OrderStatus) {
  const idx = STEPS.findIndex(s => s.status === status);
  return idx === -1 ? 0 : idx;
}

function fillPercent(status: OrderStatus): string {
  if (status === 'CANCELLED') return '0%';
  const idx = getStepIndex(status);
  return `${(idx / (STEPS.length - 1)) * 100}%`;
}

function shortId(id: string) { return id.slice(-8).toUpperCase(); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Component ──────────────────────────────────────── */
export default function TrackOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { clearCart, addToCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrder(data);
      setLastRefresh(new Date());
    } catch {
      setError('Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [id]);

  // Auto-refresh every 10s while not terminal status
  useEffect(() => {
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED') return;
    const timer = setInterval(fetchOrder, 10_000);
    return () => clearInterval(timer);
  }, [order, fetchOrder]);

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleReorder = () => {
    if (!order) return;
    clearCart();
    // Add each item from the past order back to the cart
    order.orderItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.menuItem, { customPrice: Number(item.unitPrice) });
      }
    });
    router.push('/checkout');
  };

  const isCancelled = order?.status === 'CANCELLED';
  const isCompleted = order?.status === 'COMPLETED';
  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const currentStep = STEPS[currentStepIdx];

  /* address parsing */
  const addressLine = order?.notes?.startsWith('Delivery Address:')
    ? order.notes.split('\n')[0].replace('Delivery Address:', '').trim()
    : order?.notes?.startsWith('Pickup Order')
    ? 'Pickup'
    : order?.notes || '—';

  return (
    <>
      <Navbar onSearch={() => {}} />

      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Loading ── */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading your order…</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className={styles.error}>
              <XCircle size={56} color="#e74c3c" style={{ marginBottom: 16 }} />
              <h2>Order Not Found</h2>
              <p>{error}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/track-order" className="btn btn-gold">Look Up by Phone</Link>
                <Link href="/" className="btn btn-red">Back to Menu</Link>
              </div>
            </div>
          )}

          {/* ── Order Found ── */}
          {!loading && order && (
            <>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.orderIdTag}>
                  <Hash size={13} /> Order #{shortId(order.id)}
                </div>
                <h1>{isCancelled ? 'Order Cancelled' : isCompleted ? 'Completed! 🎉' : 'Track Your Order'}</h1>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  Placed on {fmtDate(order.createdAt)}
                  &nbsp;·&nbsp;
                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#27ae60', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#27ae60', animation: 'pulse 1.5s infinite' }} />
                      Live
                    </span>
                  ) : (
                    <button className={styles.refreshBtn} onClick={fetchOrder}>
                      <RefreshCw size={12} /> Refresh
                    </button>
                  )}
                </p>
              </div>

              {/* ── Active / Delivered Stepper ── */}
              {!isCancelled && (
                <div className={styles.statusCard}>
                  <div className={styles.stepper}>
                    <div className={styles.stepperFill} style={{ width: fillPercent(order.status) }} />
                    {STEPS.map((step, i) => {
                      const isDone   = i < currentStepIdx;
                      const isActive = i === currentStepIdx;
                      return (
                        <div key={step.status} className={styles.step}>
                          <div className={`${styles.stepCircle} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                            {step.icon}
                          </div>
                          <span className={`${styles.stepLabel} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Current status + ETA */}
                  <div className={styles.currentStatus}>
                    <div className={`${styles.statusDot} ${isCompleted ? styles.completed : ''}`} />
                    <div style={{ flex: 1 }}>
                      <h3>{currentStep.label}</h3>
                      <p>{currentStep.desc}</p>
                    </div>
                    {!isCompleted && (
                      <div className={styles.etaBadge}>
                        <Clock size={13} />
                        {currentStep.eta}
                      </div>
                    )}
                  </div>

                  {/* Post-delivery CTA */}
                  {isCompleted && (
                    <div className={styles.deliveredCta}>
                      <Star size={18} color="#C8A84B" />
                      <span>Enjoyed your meal?</span>
                      <button onClick={handleReorder} className={styles.reorderBtn} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                        <RotateCcw size={14} /> Reorder
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Cancelled ── */}
              {isCancelled && (
                <div className={styles.statusCard}>
                  <div className={styles.currentStatus} style={{ borderColor: '#e0e0e0', background: '#f9f9f9' }}>
                    <div className={`${styles.statusDot} ${styles.cancelled}`} />
                    <div>
                      <h3>Order Cancelled</h3>
                      <p>This order was cancelled. Please contact us if you have any questions.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Info Cards ── */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <label>Customer</label>
                  <span>{order.customer.name}</span>
                </div>
                <div className={styles.infoCard}>
                  <label>Phone</label>
                  <span><Phone size={14} /> {order.customer.phone || '—'}</span>
                </div>
                <div className={styles.infoCard} style={{ gridColumn: '1 / -1' }}>
                  <label>Delivery / Pickup</label>
                  <span><MapPin size={14} /> {addressLine}</span>
                </div>
              </div>

              {/* ── Order Items ── */}
              <div className={styles.itemsCard}>
                <h3><UtensilsCrossed size={18} /> Order Summary</h3>
                {order.orderItems.map(item => (
                  <div key={item.id} className={styles.item}>
                    <span className={styles.itemName}>{item.menuItem.name}</span>
                    <span className={styles.itemQty}>× {item.quantity}</span>
                    <span className={styles.itemPrice}>
                      Rs. {(Number(item.unitPrice) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className={styles.total}>
                  <span>Total Amount</span>
                  <span>Rs. {Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className={styles.actions}>
                <Link href="/" className="btn btn-gold">Back to Menu</Link>
                <button className="btn btn-red" onClick={fetchOrder} style={{ gap: 6 }}>
                  <RefreshCw size={15} /> Refresh Status
                </button>
                <button className={styles.copyBtn} onClick={copyTrackingLink}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Share Link</>}
                </button>
                <a href="tel:0000-0000000" className={styles.callBtn}>
                  <Phone size={14} /> Call Us
                </a>
              </div>
            </>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
