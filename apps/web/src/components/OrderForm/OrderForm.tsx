'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Banknote, MapPin, Phone, Bike, Store } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import styles from './OrderForm.module.css';

import type { CartItem } from '@/lib/CartContext';

type OrderType = 'delivery' | 'pickup';

interface OrderFormProps {
  cartItems: CartItem[];
  totalAmount: number;
  onSuccess: () => void;
}

export default function OrderForm({ cartItems, totalAmount, onSuccess }: OrderFormProps) {
  const router = useRouter();
  const { setLastOrderId, orderType: globalOrderType, setOrderType: setGlobalOrderType, location: globalLocation } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Default to delivery if somehow null
  const currentOrderType = globalOrderType || 'delivery';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    // Serialize item customizations into a readable string to append to the global order notes
    const itemDetails = cartItems.map(item => {
      const parts = [];
      if (item.spiceLevel) parts.push(`Spice: ${item.spiceLevel}`);
      if (item.addOns?.length) parts.push(`Add-ons: ${item.addOns.map(a => a.name).join(', ')}`);
      if (item.specialInstructions) parts.push(`Note: ${item.specialInstructions}`);
      
      const customizationString = parts.length > 0 ? ` (${parts.join(' | ')})` : '';
      return `${item.qty}x ${item.name}${customizationString}`;
    }).join('\n');

    const finalNotes = `${formData.get('notes') ? formData.get('notes') + '\n\n' : ''}--- Item Details ---\n${itemDetails}`;

    const orderData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: currentOrderType === 'delivery' ? formData.get('address') : 'Pickup',
      notes: finalNotes,
      orderType: currentOrderType,
      totalAmount,
      items: cartItems.map(item => ({ id: item.id, qty: item.qty, price: item.customPrice || Number(item.price) })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error('Failed to place order');

      const data = await res.json();
      // Persist orderId so Navbar "Track Order" button works even after page refresh
      setLastOrderId(data.orderId);
      onSuccess();
      router.push(`/track-order/${data.orderId}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="order" className={`section light-section ${styles.section}`}>
      <div className="container">
        <div className={styles.wrapper}>

          {/* Left Info */}
          <div className={styles.info}>
            <span className="section-eyebrow">Place Your Order</span>
            <h2 className="section-title">Ready to Order?</h2>
            <div className="gold-line" />
            <p className={styles.infoText}>
              Fill in your details and we&apos;ll get your food prepared fresh and delivered to your doorstep in Dera Ismail Khan.
            </p>

            <div className={styles.infoCards}>
              {[
                { icon: <Clock size={24} strokeWidth={1.5} />, label:'Delivery Time', val:'30–45 minutes' },
                { icon: <Banknote size={24} strokeWidth={1.5} />, label:'Payment',       val:'Cash on Delivery' },
                { icon: <MapPin size={24} strokeWidth={1.5} />, label:'Area',          val:'Dera Ismail Khan' },
                { icon: <Phone size={24} strokeWidth={1.5} />, label:'Helpline',      val:'0000-0000000' },
              ].map((c, i) => (
                <div key={i} className={styles.infoCard}>
                  <span className={styles.infoIcon}>{c.icon}</span>
                  <div>
                    <span className={styles.infoLabel}>{c.label}</span>
                    <span className={styles.infoVal}>{c.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form */}
          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h3 className={styles.formTitle}>Order Details</h3>

                {/* Order type toggle */}
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${currentOrderType === 'delivery' ? styles.typeActive : ''}`}
                    onClick={() => setGlobalOrderType('delivery')}
                  ><Bike size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Delivery</button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${currentOrderType === 'pickup' ? styles.typeActive : ''}`}
                    onClick={() => setGlobalOrderType('pickup')}
                  ><Store size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Pickup</button>
                </div>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label htmlFor="order-name">Full Name *</label>
                    <input id="order-name" name="name" type="text" placeholder="Muhammad Ali" required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="order-phone">Phone Number *</label>
                    <input id="order-phone" name="phone" type="tel" placeholder="03XX-XXXXXXX" required />
                  </div>
                  {currentOrderType === 'delivery' && (
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                      <label htmlFor="order-address">Delivery Address *</label>
                      <input id="order-address" name="address" type="text" defaultValue={globalLocation} placeholder="Street, Area, Dera Ismail Khan" required />
                    </div>
                  )}
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Order Summary</label>
                    <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      {cartItems.map(item => (
                        <div key={item.cartItemId} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{item.qty}x {item.name}</span>
                            <span>Rs. {((item.customPrice || Number(item.price)) * item.qty).toLocaleString()}</span>
                          </div>
                          {(item.spiceLevel || item.addOns?.length || item.specialInstructions) && (
                            <div style={{ fontSize: '0.8rem', color: '#666', paddingLeft: '20px' }}>
                              {item.spiceLevel && <div>• Spice: {item.spiceLevel}</div>}
                              {item.addOns?.map(a => <div key={a.name}>• {a.name} (+Rs.{a.price})</div>)}
                              {item.specialInstructions && <div style={{ fontStyle: 'italic', marginTop: '2px' }}>"{item.specialInstructions}"</div>}
                            </div>
                          )}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #e0e0e0', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label htmlFor="order-notes">Special Instructions (optional)</label>
                    <input id="order-notes" name="notes" type="text" placeholder="Extra spicy, no onions, etc." />
                  </div>
                  {error && <div style={{ color: 'red', fontSize: '0.9rem', gridColumn: '1 / -1' }}>{error}</div>}
                </div>

                <button type="submit" className={`btn btn-red ${styles.submitBtn}`} id="order-submit-btn" disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <><Bike size={18} style={{ marginRight: 4 }} /> Place Order Now</>}
                </button>

                <p className={styles.codNote}><Banknote size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} /> Cash on Delivery · No advance payment needed</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
