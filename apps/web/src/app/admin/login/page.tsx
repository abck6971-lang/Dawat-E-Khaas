'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, ArrowRight, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  }

  return (
    <div className="loginPage">

      {/* Left Panel — Branding */}
      <div className="loginBrand">
        <div className="brandContent">
          <div className="brandIcon" style={{ padding: '8px', background: '#fff' }}>
            <Image 
              src="/logo.jpg" 
              alt="Dawat E Khaas Logo" 
              width={60} 
              height={60} 
              style={{ borderRadius: '12px', objectFit: 'contain' }}
            />
          </div>
          <h1 className="brandName">Dawat E Khaas</h1>
          <p className="brandTagline">Restaurant Management System</p>

          <div className="brandDivider" />

          <ul className="brandFeatures">
            <li><span className="featureDot" />Manage your full menu</li>
            <li><span className="featureDot" />Track orders in real-time</li>
            <li><span className="featureDot" />Control categories & pricing</li>
            <li><span className="featureDot" />View customer insights</li>
          </ul>
        </div>

        {/* Decorative Circles */}
        <div className="decCircle decCircle1" />
        <div className="decCircle decCircle2" />
        <div className="decCircle decCircle3" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="loginFormPanel">
        <div className="loginFormCard">
          <div className="loginFormHeader">
            <p className="loginFormEyebrow">Welcome back</p>
            <h2 className="loginFormTitle">Admin Sign In</h2>
            <p className="loginFormSub">Enter your credentials to access the dashboard</p>
          </div>

          <form className="loginForm" onSubmit={handleSubmit}>
            {error && (
              <div className="loginError">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="loginField">
              <label className="loginLabel" htmlFor="admin-username">Username</label>
              <div className="loginInputWrap">
                <User size={17} className="loginInputIcon" />
                <input
                  id="admin-username"
                  type="text"
                  className="loginInput"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="loginField">
              <label className="loginLabel" htmlFor="admin-password">Password</label>
              <div className="loginInputWrap">
                <Lock size={17} className="loginInputIcon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="loginInput"
                  placeholder="Enter your password"
                  style={{ paddingRight: '40px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="loginSubmitBtn" disabled={loading}>
              {loading ? (
                <span className="loginSpinner" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="loginFooterNote" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Lock size={14} /> Secured with JWT authentication
          </p>
        </div>
      </div>

    </div>
  );
}
