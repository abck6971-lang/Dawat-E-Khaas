'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Hold the splash screen for 1.8 seconds, then trigger slide up animation
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, 1800);

    // Remove component from DOM entirely after animation completes (800ms)
    const cleanup = setTimeout(() => {
      setIsVisible(false);
    }, 2600);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${styles.splashContainer} ${isAnimatingOut ? styles.slideOut : ''}`}>
      <div className={styles.logoWrapper}>
        <Image 
          src="/logo.jpg" 
          alt="Dawat E Khaas Loading..." 
          width={140} 
          height={140} 
          className={styles.logoImage}
          priority
        />
      </div>
    </div>
  );
}
