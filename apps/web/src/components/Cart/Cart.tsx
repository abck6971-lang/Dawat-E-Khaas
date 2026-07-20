'use client';
import { ShoppingCart, X, Trash2, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import styles from './Cart.module.css';
import type { MenuItem } from '@/components/Menu/Menu';

import type { CartItem } from '@/lib/CartContext';

export default function Cart() {
  const { cartItems: items, cartCount: count, cartTotal: total, changeQty: onQtyChange, removeItem: onRemove, isCartOpen: isOpen, setCartOpen } = useCart();
  const onClose = () => setCartOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} aria-label="Shopping cart">
        {/* Header */}
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>Your Order</h2>
            {count > 0 && <span className={styles.count}>{count} item{count > 1 ? 's' : ''}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart"><X size={18} /></button>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className={styles.empty}>
            <ShoppingCart className={styles.emptyIcon} size={48} />
            <p>Your cart is empty</p>
            <a href="#menu" className="btn btn-gold" onClick={onClose} style={{ marginTop: 12 }}>
              Browse Menu
            </a>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <>
            <ul className={styles.list}>
              {items.map(item => (
                <li key={item.cartItemId} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>Rs. {((item.customPrice || Number(item.price)) * item.qty).toLocaleString()}</span>
                  </div>
                  {(item.spiceLevel || item.addOns?.length || item.specialInstructions) && (
                    <div className={styles.itemOptions} style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', marginBottom: '8px' }}>
                      {item.spiceLevel && <div>• Spice: {item.spiceLevel}</div>}
                      {item.addOns?.map(a => <div key={a.name}>• {a.name} (+Rs.{a.price})</div>)}
                      {item.specialInstructions && <div style={{ fontStyle: 'italic', marginTop: '2px' }}>"{item.specialInstructions}"</div>}
                    </div>
                  )}
                  <div className={styles.itemActions}>
                    <div className={styles.qty}>
                      <button className={styles.qtyBtn} onClick={() => onQtyChange(item.cartItemId, -1)} aria-label="Decrease">−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => onQtyChange(item.cartItemId, 1)} aria-label="Increase">+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => onRemove(item.cartItemId)} aria-label="Remove"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className={styles.foot}>
              <div className={styles.divider} />
              <div className={styles.subtotal}>
                <span>Delivery</span><span className={styles.free}>Free</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>
              <div className={styles.payNote}><Banknote size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Cash on Delivery</div>
              <Link href="/checkout" className="btn btn-red" style={{ width:'100%', justifyContent:'center' }}
                 onClick={onClose} id="checkout-btn">
                Proceed to Checkout →
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
