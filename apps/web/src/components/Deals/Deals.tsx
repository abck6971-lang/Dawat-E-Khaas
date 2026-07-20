import Image from 'next/image';
import { Flame, Star, Pizza } from 'lucide-react';
import styles from './Deals.module.css';

const DEALS = [
  {
    id: 'd1',
    icon: <Flame size={14} />,
    tag: 'Best Value',
    title: 'BBQ Family Deal',
    desc: '4 Seekh Kebabs + 2 Chicken Tikka + 4 Naans + Raita + Drinks',
    price: 2999,
    originalPrice: 4200,
    img: '/bbq.png',
    badge: 'Save Rs. 1,201',
  },
  {
    id: 'd2',
    icon: <Star size={14} />,
    tag: 'Most Popular',
    title: 'Burger Combo',
    desc: '2 Smash Burgers + Regular Fries + 2 Cold Drinks',
    price: 1499,
    originalPrice: 1900,
    img: '/burger.png',
    badge: 'Save Rs. 401',
  },
  {
    id: 'd3',
    icon: <Pizza size={14} />,
    tag: 'Pizza Night',
    title: 'Pizza & Karahi Deal',

    desc: '1 Large BBQ Pizza + Special Karahi (serves 2) + Naans',
    price: 2499,
    originalPrice: 3150,
    img: '/pizza.png',
    badge: 'Save Rs. 651',
  },
];

export default function Deals() {
  return (
    <section id="deals" className={`section light-section ${styles.deals}`}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-eyebrow">Limited Time Offers</span>
          <h2 className="section-title">Today&apos;s Special Deals</h2>
          <div className="gold-line" />
          <p className="section-subtitle" style={{ marginTop: 8, textAlign: 'center', marginInline: 'auto' }}>
            Get more for less. Our combo deals are crafted for families and groups.
          </p>
        </div>

        <div className={styles.grid}>
          {DEALS.map((deal, i) => (
            <div key={deal.id} className={`${styles.card} ${i === 1 ? styles.featured : ''}`}>
              {/* Save badge */}
              <div className={styles.saveBadge}>{deal.badge}</div>

              {/* Image */}
              <div className={styles.imgWrap}>
                <Image src={deal.img} alt={deal.title} fill sizes="(max-width: 900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                <div className={styles.imgOverlay} />
              </div>

              {/* Content */}
              <div className={styles.content}>
                <span className={styles.tag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {deal.icon} {deal.tag}
                </span>
                <h3 className={styles.title}>{deal.title}</h3>
                <p className={styles.desc}>{deal.desc}</p>
                <div className={styles.footer}>
                  <div className={styles.pricing}>
                    <span className={styles.price}>Rs. {deal.price.toLocaleString()}</span>
                    <span className={styles.original}>Rs. {deal.originalPrice.toLocaleString()}</span>
                  </div>
                  <a href="#order" className="btn btn-red" id={`deal-order-${deal.id}`}>
                    Order Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
