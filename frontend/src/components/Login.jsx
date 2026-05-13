import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Invalid username or password.');
      }
    } catch {
      setError(`Cannot connect to server at ${API_BASE_URL}. Ensure the backend is running with --host 0.0.0.0`);
    }
    setLoading(false);
  };

  const EyeOpen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #09090b; color: #f2f2f8; -webkit-font-smoothing: antialiased; background-image: radial-gradient(circle at 50% 0%, rgba(91,127,245,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(167,139,250,0.15) 0%, transparent 50%); background-size: cover; background-attachment: fixed; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input {
          width: 100%; padding: 12px 16px; background: rgba(24, 24, 27, 0.6); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #f2f2f8; font-size: 13.5px; font-family: 'Inter', sans-serif;
          outline: none; transition: all .2s; backdrop-filter: blur(8px);
          -webkit-appearance: none; appearance: none;
        }
        .auth-input:focus { border-color: rgba(91,127,245,0.5); box-shadow: 0 0 0 3px rgba(91,127,245,0.12); }
        .auth-input::placeholder { color: #52525b; }
        .auth-input::-ms-reveal, .auth-input::-ms-clear { display: none; }
        .auth-input::-webkit-credentials-auto-fill-button,
        .auth-input::-webkit-contacts-auto-fill-button { display: none !important; visibility: hidden; pointer-events: none; }
        .auth-btn {
          width: 100%; padding: 12px; background: linear-gradient(135deg, #5b7ff5, #8b5cf6); color: #fff; border: none;
          border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(91,127,245,0.3);
        }
        .auth-btn:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(91,127,245,0.4); transform: translateY(-1px); }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 12px; color: #52525b; font-size: 12px; margin: 4px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #27272a; }
        .pwd-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #52525b;
          display: flex; align-items: center; justify-content: center;
          padding: 4px; border-radius: 4px; transition: color .15s;
        }
        .pwd-toggle:hover { color: #a1a1aa; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fade-up .4s cubic-bezier(0.16, 1, 0.3, 1)' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#5b7ff5,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" />
                <rect x="27" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" />
                <rect x="4" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.95" />
                <rect x="27" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.4" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f2f2f8', letterSpacing: '-0.4px', marginBottom: 4 }}>VisionAI</h1>
            <p style={{ fontSize: 13, color: '#71717a' }}>Sign in to your workspace</p>
          </div>

          <div style={{ background: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa', display: 'block', marginBottom: 6, textAlign: 'left' }}>
                  Username
                </label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa', display: 'block', marginBottom: 6, textAlign: 'left' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowPwd(p => !p)}
                    tabIndex={-1}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ padding: '9px 12px', background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, fontSize: 12.5, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="divider" style={{ margin: '20px 0 16px' }}>or</div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#71717a' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#7b9aff', fontWeight: 500, textDecoration: 'none' }}>Create account</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: '#52525b', marginTop: 20 }}>
            VisionAI Collaborative IDE · Secure workspace
          </p>
        </div>
      </div>
    </>
  );
}