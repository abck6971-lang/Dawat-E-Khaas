'use client';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderForm from '@/components/OrderForm/OrderForm';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar onSearch={() => {}} />
      <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 300px)' }}>
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Order Placed!</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Redirecting to your order tracking page...</p>
            <div style={{ margin: '0 auto', width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Your Cart is Empty</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Looks like you haven't added anything to your cart yet.</p>
            <Link href="/#menu" className="btn btn-gold">
              Browse Menu
            </Link>
          </div>
        ) : (
          <OrderForm 
            cartItems={cartItems} 
            totalAmount={cartTotal} 
            onSuccess={() => {
              setIsSuccess(true);
              clearCart();
            }} 
          />
        )}
      </main>
      <Footer />
    </>
  );
}
