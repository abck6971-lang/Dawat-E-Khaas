import { Flame, Leaf, Truck, Banknote } from 'lucide-react';
import styles from './About.module.css';

const STATS = [
  { value: '5+',   label: 'Years Serving DIK' },
  { value: '50+',  label: 'Menu Items' },
  { value: '4.8★', label: 'Customer Rating' },
  { value: '10k+', label: 'Happy Customers' },
];

export default function About() {
  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className="container">
        <div className={styles.grid}>

          {/* Left: Text */}
          <div className={styles.left}>
            <span className="section-eyebrow">Our Story</span>
            <h2 className="section-title">
              Taste the Tradition of<br />Dera Ismail Khan
            </h2>
            <div className="gold-line" />

            <p className={styles.para}>
              Dawat E Khaas was born from a simple passion — to bring the authentic, rich flavors of traditional Pakistani cuisine to the people of Dera Ismail Khan. What started as a humble kitchen has grown into one of the city&apos;s most beloved dining destinations.
            </p>
            <p className={styles.para}>
              From hand-rolled seekh kebabs grilled over charcoal, to slow-cooked karahi bubbling with fresh spices, every dish we serve carries the warmth of home cooking and the craft of a seasoned kitchen. We believe great food brings people together — and that is the true spirit of <strong style={{ color: 'var(--color-primary)' }}>Dawat E Khaas</strong>.
            </p>

            {/* USPs */}
            <ul className={styles.usps}>
              {[
                { text: 'Freshly prepared on every order', icon: <Flame size={16} style={{ flexShrink: 0 }} /> },
                { text: 'Premium quality ingredients', icon: <Leaf size={16} style={{ flexShrink: 0 }} /> },
                { text: 'Fast delivery across D.I. Khan', icon: <Truck size={16} style={{ flexShrink: 0 }} /> },
                { text: 'Cash on Delivery available', icon: <Banknote size={16} style={{ flexShrink: 0 }} /> },
              ].map((u, i) => (
                <li key={i} className={styles.usp}>
                  {u.icon} {u.text}
                </li>
              ))}
            </ul>

            <a href="#order" className="btn btn-gold" id="about-order-btn" style={{ marginTop: 8 }}>
              Order Now →
            </a>
          </div>

          {/* Right: Stats */}
          <div className={styles.right}>
            <div className={styles.statsGrid}>
              {STATS.map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statVal}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Decorative box */}
            <div className={styles.decoBox}>
              <span className={styles.decoIcon}>✦</span>
              <p className={styles.decoQuote}>&ldquo;Every meal is a celebration. Every bite is a memory.&rdquo;</p>
              <span className={styles.decoSub}>— Dawat E Khaas</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
