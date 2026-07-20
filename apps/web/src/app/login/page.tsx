'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem('dek_token', data.token);
      localStorage.setItem('dek_customer', JSON.stringify(data.customer));
      router.push('/account');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout fade-in">
      {/* Left side: Image */}
      <div className="auth-image-panel">
        <Image src="/images/auth-bg.png" alt="Dawat E Khaas Cuisine" fill style={{ objectFit: 'cover' }} priority className="auth-bg-img" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <Link href="/" className="auth-logo-link">
            <Image src="/logo.jpg" alt="Logo" width={56} height={56} className="auth-logo-img" />
            <span className="auth-logo-text">DAWAT E KHAAS</span>
          </Link>
          <div className="auth-quote">
            <h2>Taste the<br/>Tradition.</h2>
            <p>Experience authentic flavors curated for the perfect dining experience.</p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <Link href="/" className="auth-logo-link-mobile">
              <Image src="/logo.jpg" alt="Logo" width={50} height={50} className="auth-logo-img" />
            </Link>
          </div>
          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your culinary journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            {error && <p className="auth-error">{error}</p>}
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            New to Dawat E Khaas? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-split-layout {
          display: flex;
          min-height: 100vh;
          background: var(--green-900) url('/images/auth-bg.png') no-repeat center center;
          background-size: cover;
          position: relative;
          color: white;
        }
        
        .auth-split-layout::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(10,28,18,0.85);
          backdrop-filter: blur(10px);
          z-index: 0;
        }
        
        @media (min-width: 900px) {
          .auth-split-layout {
            background: var(--green-900);
          }
          .auth-split-layout::before {
            display: none;
          }
        }
        
        .auth-image-panel {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 900px) {
          .auth-image-panel { display: flex; flex-direction: column; }
        }
        
        .auth-bg-img {
          transition: transform 10s ease-out;
        }
        .auth-image-panel:hover .auth-bg-img {
          transform: scale(1.05);
        }
        
        .auth-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,28,18,0.2) 0%, var(--green-900) 100%);
          z-index: 1;
        }
        
        .auth-image-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
        }
        
        .auth-logo-link {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .auth-logo-img {
          border-radius: 50%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .auth-logo-text {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--color-surface);
        }
        
        .auth-mobile-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        @media (min-width: 900px) {
          .auth-mobile-logo { display: none; }
        }
        
        .auth-quote h2 {
          font-family: var(--font-display);
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 24px;
          color: var(--gold-500);
          text-shadow: 0 4px 30px rgba(0,0,0,0.6);
        }
        .auth-quote p {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.8);
          max-width: 400px;
          line-height: 1.6;
        }
        
        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 900px) {
          .auth-form-panel {
            background: var(--green-900);
          }
        }
        
        .auth-form-container {
          width: 100%;
          max-width: 400px;
        }
        
        .auth-form-header {
          margin-bottom: 48px;
        }
        .auth-form-header h1 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          margin-bottom: 8px;
          color: white;
        }
        .auth-form-header p {
          color: var(--color-text-muted);
          font-size: 1.05rem;
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 18px;
          color: var(--color-text-subtle);
          pointer-events: none;
        }
        .input-group input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-md);
          padding: 16px 16px 16px 52px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        /* Fix Chrome Autofill */
        .input-group input:-webkit-autofill,
        .input-group input:-webkit-autofill:hover, 
        .input-group input:-webkit-autofill:focus, 
        .input-group input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #132a1d inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
          border-color: rgba(255,255,255,0.2) !important;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--gold-500);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 4px rgba(200,168,75,0.1);
        }
        .input-group input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        .auth-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-muted);
          cursor: pointer;
        }
        .checkbox-label input {
          accent-color: var(--gold-500);
          width: 16px;
          height: 16px;
        }
        .forgot-password {
          color: var(--gold-500);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-password:hover {
          color: var(--gold-300);
        }
        
        .auth-error {
          padding: 12px 16px;
          background: rgba(224, 64, 32, 0.1);
          border: 1px solid rgba(224, 64, 32, 0.3);
          border-radius: var(--radius-sm);
          color: var(--red-400);
          font-size: 0.9rem;
        }
        
        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--gold-500);
          color: var(--green-900);
          border: none;
          padding: 16px;
          border-radius: var(--radius-md);
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }
        .btn-submit:hover:not(:disabled) {
          background: var(--gold-400);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(200,168,75,0.25);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .auth-switch {
          text-align: center;
          margin-top: 40px;
          color: var(--color-text-muted);
        }
        .auth-switch a {
          color: var(--gold-500);
          font-weight: 600;
          text-decoration: none;
          margin-left: 8px;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
