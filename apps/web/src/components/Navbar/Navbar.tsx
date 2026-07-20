'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, Search, MapPin, ShoppingCart, User, X, PackageSearch } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Home',   href: '#home' },
  { label: 'Menu',   href: '#menu' },
  { label: 'Contact',href: '#contact' },
];

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { cartCount, setCartOpen, lastOrderId, orderType, setOrderType, location, setLocationModalOpen } = useCart();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customer, setCustomer]     = useState<{name: string} | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    
    // Check auth state
    try {
      const stored = localStorage.getItem('dek_customer');
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch (e) {}

    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Left: Hamburger & Logo */}
        <div className={styles.navLeft}>
          <button
            className={styles.burger}
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <a href="/" className={styles.logo}>
            <Image 
              src="/logo.jpg" 
              alt="Dawat E Khaas" 
              width={70} 
              height={70} 
              style={{ objectFit: 'contain', borderRadius: '50%' }} 
              priority
            />
          </a>
        </div>

        {/* Center: Controls (Hidden on Mobile) */}
        <div className={styles.navCenter}>
          {/* Order Toggle */}
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${orderType === 'delivery' ? styles.activeToggle : ''}`}
              onClick={() => { setOrderType('delivery'); setLocationModalOpen(true); }}
            >
              Delivery
            </button>
            <button 
              className={`${styles.toggleBtn} ${orderType === 'pickup' ? styles.activeToggle : ''}`}
              onClick={() => { setOrderType('pickup'); setLocationModalOpen(true); }}
            >
              Pick Up
            </button>
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <Search size={18} className={styles.iconMuted} />
            <input 
              type="text" 
              placeholder="Find in Dawat E Khaas" 
              className={styles.searchInput} 
              onChange={e => {
                onSearch?.(e.target.value);
                // Also scroll to menu section if they start typing
                if (e.target.value) {
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </div>

          <div className={styles.locationBox} onClick={() => setLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
            <MapPin size={18} className={styles.iconMuted} />
            <input 
              type="text" 
              placeholder={orderType === 'pickup' ? 'Pickup from Restaurant' : 'Enter Delivery Address...'} 
              className={styles.locationInput} 
              value={location}
              readOnly
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className={styles.navRight}>
          <a
            href={lastOrderId ? `/track-order/${lastOrderId}` : '/track-order'}
            className={styles.trackBtn}
            id="nav-track-btn"
          >
            <PackageSearch size={16} strokeWidth={2.2} /> Track Order
          </a>
          <button className={styles.actionBtn} onClick={() => setCartOpen(true)} id="nav-cart-btn">
            <ShoppingCart size={18} strokeWidth={2.5} /> CART
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
          
          {customer ? (
            <a href="/account" className={styles.actionBtn} id="nav-account-btn" style={{ textDecoration: 'none' }}>
              <User size={18} strokeWidth={2.5} /> {customer.name.split(' ')[0].toUpperCase()}
            </a>
          ) : (
            <a href="/login" className={styles.actionBtn} id="nav-login-btn" style={{ textDecoration: 'none' }}>
              <User size={18} strokeWidth={2.5} /> LOGIN
            </a>
          )}
        </div>

      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerInner}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className={styles.drawerLink}
               onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
          <a href="#menu" className={`btn btn-red`} style={{ marginTop: 24, width: '100%', justifyContent:'center' }}
             onClick={() => setMobileOpen(false)}>Order Now</a>
        </div>
      </div>
    </header>
  );
}
