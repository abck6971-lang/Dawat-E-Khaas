import { MapPin, Phone, Clock, Package } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`container ${styles.inner}`}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>Dawat <em>E Khaas</em></span>
          </div>
          <p className={styles.tagline}>
            Authentic Pakistani flavors, crafted with love.<br />
            Serving Dera Ismail Khan since day one.
          </p>
          <div className={styles.socials}>
            {[
              { label: 'Facebook',  href: '#', icon: <FaFacebook size={18} /> },
              { label: 'Instagram', href: '#', icon: <FaInstagram size={18} /> },
              { label: 'WhatsApp', href: '#', icon: <FaWhatsapp size={18} /> },
            ].map(s => (
              <a key={s.label} href={s.href} className={styles.social} aria-label={s.label}
                 id={`footer-social-${s.label.toLowerCase()}`}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <ul className={styles.colLinks}>
            {['Home','Menu','Deals','About','Order Now'].map(l => (
              <li key={l}><a href={`#${l.toLowerCase().replace(' ','-')}`} className={styles.colLink}>{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Menu Categories */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Our Menu</h4>
          <ul className={styles.colLinks}>
            {['Burgers','Pizza','BBQ','Chinese','Desi Food','Deals'].map(l => (
              <li key={l}><a href="#menu" className={styles.colLink}>{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li><MapPin size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Dera Ismail Khan, KPK, Pakistan</li>
            <li><Phone size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> <a href="tel:0000000000" className={styles.colLink}>0000-0000000</a></li>
            <li><Clock size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Open Daily: 12 PM – 12 AM</li>
            <li><Package size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Delivery Available</li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className={styles.bar}>
        <div className="container">
          <span>© {new Date().getFullYear()} Dawat E Khaas. All rights reserved.</span>
          <span className={styles.barRight}>Made with <span style={{ color: 'var(--color-primary)' }}>❤</span> in Dera Ismail Khan</span>
        </div>
      </div>
    </footer>
  );
}
