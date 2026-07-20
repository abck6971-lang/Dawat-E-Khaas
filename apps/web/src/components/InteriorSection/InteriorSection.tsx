import Image from 'next/image';
import styles from './InteriorSection.module.css';

export default function InteriorSection() {
  return (
    <section className={styles.interiorSection}>
      <div className={styles.container}>
        <div className={styles.textWrap}>
          <span className={styles.subtitle}>Dine In</span>
          <h2 className={styles.title}>Experience the Ambience</h2>
          <p className={styles.description}>
            Enjoy your favorite meals in our beautifully designed dining area. 
            Perfect for family dinners, catching up with friends, or a quiet evening out.
          </p>
        </div>
        
        <div className={styles.imageWrap}>
          <Image 
            src="/interior.png" 
            alt="Restaurant Interior" 
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </div>
    </section>
  );
}
