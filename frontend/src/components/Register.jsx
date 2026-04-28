import { API_BASE_URL } from "../services/api.js";
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.detail || 'Registration failed. Try a different username.');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }
    setLoading(false);
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#f87171', '#fbbf24', '#34d399'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #09090b; color: #f2f2f8; -webkit-font-smoothing: antialiased; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input {
          width: 100%; padding: 10px 14px; background: #18181b; border: 1px solid #27272a;
          border-radius: 8px; color: #f2f2f8; font-size: 13.5px; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .auth-input:focus { border-color: rgba(52,211,153,0.45); box-shadow: 0 0 0 3px rgba(52,211,153,0.1); }
        .auth-input::placeholder { color: #52525b; }
        .auth-btn {
          width: 100%; padding: 10px; background: #059669; color: #fff; border: none;
          border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: background .15s, transform .1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { background: #10b981; }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 12px; color: #52525b; font-size: 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #27272a; }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#09090b', padding:'24px' }}>
        <div style={{ width:'100%', maxWidth:400, animation:'fade-up .35s ease' }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#059669,#34d399)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95"/>
                <rect x="27" y="4" width="17" height="17" rx="4" fill="white" fillOpacity="0.95"/>
                <rect x="4" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.95"/>
                <rect x="27" y="27" width="17" height="17" rx="4" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <h1 style={{ fontSize:22,fontWeight:700,color:'#f2f2f8',letterSpacing:'-0.4px',marginBottom:4 }}>Create Account</h1>
            <p style={{ fontSize:13,color:'#71717a' }}>Join VisionAI and start collaborating</p>
          </div>

          {/* Card */}
          <div style={{ background:'#111114',border:'1px solid #27272a',borderRadius:14,padding:'28px 28px 24px' }}>
            <form onSubmit={handleRegister} style={{ display:'flex',flexDirection:'column',gap:14 }}>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div>
                  <label style={{ fontSize:12,fontWeight:500,color:'#a1a1aa',display:'block',marginBottom:6 }}>Username</label>
                  <input className="auth-input" type="text" placeholder="username" required value={username} onChange={e=>setUsername(e.target.value)} autoFocus/>
                </div>
                <div>
                  <label style={{ fontSize:12,fontWeight:500,color:'#a1a1aa',display:'block',marginBottom:6 }}>Email</label>
                  <input className="auth-input" type="email" placeholder="you@email.com" required value={email} onChange={e=>setEmail(e.target.value)}/>
                </div>
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:500,color:'#a1a1aa',display:'block',marginBottom:6 }}>Password</label>
                <input className="auth-input" type="password" placeholder="Min. 6 characters" required value={password} onChange={e=>setPassword(e.target.value)}/>
                {password.length > 0 && (
                  <div style={{ marginTop:7 }}>
                    <div style={{ display:'flex',gap:4,marginBottom:4 }}>
                      {[1,2,3].map(i=>(
                        <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=strength?strengthColor[strength]:'#27272a',transition:'background .2s' }}/>
                      ))}
                    </div>
                    <span style={{ fontSize:11,color:strengthColor[strength] }}>{strengthLabel[strength]}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:500,color:'#a1a1aa',display:'block',marginBottom:6 }}>Confirm Password</label>
                <input className="auth-input" type="password" placeholder="Re-enter password" required value={confirm} onChange={e=>setConfirm(e.target.value)}
                  style={{ borderColor: confirm && confirm!==password ? 'rgba(248,113,113,0.4)' : undefined }}/>
                {confirm && confirm !== password && <p style={{ fontSize:11.5,color:'#f87171',marginTop:5 }}>Passwords don't match</p>}
              </div>

              {error && (
                <div style={{ padding:'9px 12px',background:'rgba(248,113,113,0.09)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:7,fontSize:12.5,color:'#f87171' }}>
                  {error}
                </div>
              )}

              <button className="auth-btn" type="submit" disabled={loading || (confirm && confirm!==password)} style={{ marginTop:4 }}>
                {loading ? <>
                  <span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>
                  Creating account…
                </> : 'Create Account'}
              </button>
            </form>

            <div className="divider" style={{ margin:'20px 0 16px' }}>or</div>

            <p style={{ textAlign:'center',fontSize:13,color:'#71717a' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#7b9aff',fontWeight:500,textDecoration:'none' }}>Sign in</Link>
            </p>
          </div>

          <p style={{ textAlign:'center',fontSize:11.5,color:'#52525b',marginTop:20 }}>
            VisionAI Collaborative IDE · Secure workspace
          </p>
        </div>
      </div>
    </>
  );
}