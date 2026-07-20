'use client';
import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { Bike, Store, MapPin, X, LocateFixed, Loader } from 'lucide-react';
import styles from './LocationModal.module.css';

type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export default function LocationModal() {
  const { isLocationModalOpen, setLocationModalOpen, orderType, setOrderType, location, setLocation } = useCart();
  const [selectedType, setSelectedType] = useState<'delivery' | 'pickup' | null>(orderType as 'delivery' | 'pickup' | null);
  const [inputValue, setInputValue] = useState(location);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoError, setGeoError] = useState('');

  if (!isLocationModalOpen) return null;

  const handleSave = () => {
    if (!selectedType) return;
    setOrderType(selectedType);
    setLocation(inputValue);
    setLocationModalOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('loading');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap's free Nominatim API for reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          // Build a readable address from the response
          const addr = data.address;
          const parts = [
            addr.road || addr.suburb,
            addr.neighbourhood || addr.village || addr.town || addr.city,
            addr.state_district || addr.county,
          ].filter(Boolean);
          const readable = parts.join(', ') || data.display_name;
          setInputValue(readable);
          setGeoStatus('success');
        } catch {
          setGeoStatus('error');
          setGeoError('Could not fetch address. Please type it manually.');
        }
      },
      (err) => {
        setGeoStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Please allow location access and try again.');
        } else {
          setGeoError('Unable to get your location. Please type manually.');
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {orderType && (
          <button className={styles.closeBtn} onClick={() => setLocationModalOpen(false)}>
            <X size={20} />
          </button>
        )}
        
        <h2>How would you like your order?</h2>
        <p className={styles.subtitle}>Select your order type to see accurate pricing and availability.</p>

        <div className={styles.typeGrid}>
          <button 
            className={`${styles.typeCard} ${selectedType === 'delivery' ? styles.active : ''}`}
            onClick={() => setSelectedType('delivery')}
          >
            <Bike size={24} />
            <span>Delivery</span>
          </button>
          <button 
            className={`${styles.typeCard} ${selectedType === 'pickup' ? styles.active : ''}`}
            onClick={() => setSelectedType('pickup')}
          >
            <Store size={24} />
            <span>Pick Up</span>
          </button>
        </div>

        {selectedType === 'delivery' && (
          <div className={styles.inputGroup}>
            <div className={styles.inputGroupHeader}>
              <label>Delivery Address</label>
              <button
                type="button"
                className={`${styles.geoBtn} ${geoStatus === 'loading' ? styles.geoBtnLoading : ''} ${geoStatus === 'success' ? styles.geoBtnSuccess : ''}`}
                onClick={handleUseCurrentLocation}
                disabled={geoStatus === 'loading'}
              >
                {geoStatus === 'loading' ? (
                  <><Loader size={14} className={styles.spinIcon} /> Locating...</>
                ) : (
                  <><LocateFixed size={14} /> Use Current Location</>
                )}
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.icon} />
              <input 
                type="text" 
                placeholder="Street, Area, D.I.Khan..." 
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setGeoStatus('idle'); }}
              />
            </div>
            {geoStatus === 'error' && (
              <p className={styles.geoError}>{geoError}</p>
            )}
            {geoStatus === 'success' && (
              <p className={styles.geoSuccess}>✓ Location detected successfully!</p>
            )}
          </div>
        )}

        {selectedType === 'pickup' && (
          <div className={styles.infoBox}>
            <MapPin size={18} className={styles.icon} />
            <p><strong>Dawat E Khaas</strong><br/>Main Boulevard, Dera Ismail Khan</p>
          </div>
        )}

        <button 
          className="btn btn-red" 
          style={{ width: '100%', marginTop: 24, padding: '14px', fontSize: '1rem' }}
          onClick={handleSave}
          disabled={!selectedType || (selectedType === 'delivery' && !inputValue)}
        >
          Confirm Details
        </button>
      </div>
    </div>
  );
}
