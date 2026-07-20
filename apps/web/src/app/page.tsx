'use client';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import Menu, { type MenuItem } from '@/components/Menu/Menu';
import InteriorSection from '@/components/InteriorSection/InteriorSection';
import SplashScreen from '@/components/SplashScreen/SplashScreen';
import LocationModal from '@/components/LocationModal/LocationModal';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <SplashScreen />
      <LocationModal />
      <Navbar onSearch={setSearchQuery} />

      <main>
        <Hero />
        <Menu searchQuery={searchQuery} />
        <InteriorSection />
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
}
