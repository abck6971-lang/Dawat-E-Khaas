'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const SLIDES = [
  { label: 'BURGER FESTIVAL', sub: 'BIGGER BOLDER BETTER', img: '/burger_hero_1784211696582.png' },
  { label: 'PIZZA NIGHT',     sub: 'CHEESY DELICIOUSNESS', img: '/pizza_hero_1784211707424.png'  },
  { label: 'BBQ PLATTER',     sub: 'SMOKY & SPICY',        img: '/bbq_hero_1784211728260.png'    },
  { label: 'DESI KARAHI',     sub: 'AUTHENTIC TASTE',      img: '/desi_hero_1784211754067.png'   },
  { label: 'CHINESE WOK',     sub: 'SWEET & SOUR',         img: '/chinese_hero_1784211773815.png'},
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.slider}>
        {SLIDES.map((slide, i) => (
          <div 
            key={slide.label} 
            className={`${styles.slide} ${i === currentSlide ? styles.activeSlide : ''}`}
          >
            {/* Full Cover Image */}
            <div className={styles.bgImage}>
              <Image 
                src={slide.img} 
                alt={slide.label} 
                fill 
                sizes="100vw" 
                style={{ objectFit: 'cover' }} 
                priority={i === 0} 
              />
              <div className={styles.overlay}></div>
            </div>

            <div className={`container ${styles.slideInner}`}>
              {/* Overlay Text */}
              <div className={styles.textContent}>
                <h2 className={styles.mainTitle}>{slide.label}</h2>
                <h3 className={styles.subTitle}>{slide.sub}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ''}`}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
