import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockNotice, setLockNotice] = useState('');

  useEffect(() => {
    try {
      const ownerLock = JSON.parse(localStorage.getItem('owner_lock') || 'null');
      if (ownerLock && ownerLock.locked) {
        setLockNotice(ownerLock.message || 'The system is currently unavailable while the owner performs maintenance. Only the owner can log in now.');
      } else {
        setLockNotice('');
      }
    } catch (e) {
      setLockNotice('');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // slight delay for UX
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || 'Invalid ID or password');
      } else {
        const role = result.user?.role;
        const path = role === 'owner' ? '/owner' : role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : '/accountant';
        navigate(path, { replace: true });
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative bg circles */}
      {[
        { size: 400, top: '-100px', left: '-100px', color: 'rgba(59,130,246,0.07)' },
        { size: 300, bottom: '-80px', right: '-80px', color: 'rgba(6,214,160,0.07)' },
        { size: 200, top: '40%', right: '10%', color: 'rgba(167,139,250,0.05)' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: c.size, height: c.size, borderRadius: '50%',
          background: c.color, top: c.top, left: c.left, bottom: c.bottom, right: c.right,
          pointerEvents: 'none'
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #3b82f6, #06d6a0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(59,130,246,0.3)'
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #06d6a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            THE DIGITAL 5
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>High School Management System</p>
        </div>

        {/* Login card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24 }}>Sign in with your ID and password</p>

          {lockNotice && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: '#92400e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {lockNotice}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: 'var(--danger)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">User ID</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-control"
                  style={{ paddingLeft: 36 }}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. S001, T001, ADM001"
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts removed per request */}
      </div>
    </div>
  );
}
