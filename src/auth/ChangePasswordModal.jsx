import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordModal({ onClose, forced = false }) {
  const { currentUser, changePassword } = useAuth();
  const [form, setForm] = useState({ old: '', newPass: '', confirm: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.newPass.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.newPass !== form.confirm) { setError('Passwords do not match'); return; }
    const result = changePassword(currentUser.id, form.old, form.newPass);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    setTimeout(() => { onClose(); }, 1500);
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="var(--primary)" />
            {forced ? 'Set New Password' : 'Change Password'}
          </div>
          {!forced && <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>}
        </div>
        <div className="modal-body">
          {forced && (
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              You must change your default password before continuing.
            </div>
          )}
          {success ? (
            <div className="alert alert-success" style={{ textAlign: 'center' }}>
              ✓ Password changed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input type={showOld ? 'text' : 'password'} className="form-control" style={{ paddingLeft: 36, paddingRight: 40 }}
                    value={form.old} onChange={e => set('old', e.target.value)} required placeholder="Your current password" />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input type={showNew ? 'text' : 'password'} className="form-control" style={{ paddingLeft: 36, paddingRight: 40 }}
                    value={form.newPass} onChange={e => set('newPass', e.target.value)} required placeholder="Minimum 6 characters" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.newPass && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {[6, 8, 10].map(len => (
                      <div key={len} style={{ height: 3, flex: 1, borderRadius: 2, background: form.newPass.length >= len ? (len === 10 ? 'var(--success)' : len === 8 ? 'var(--warning)' : 'var(--danger)') : 'var(--border)' }} />
                    ))}
                    <span style={{ fontSize: 10, color: 'var(--text3)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                      {form.newPass.length < 8 ? 'Weak' : form.newPass.length < 10 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={form.confirm} onChange={e => set('confirm', e.target.value)} required placeholder="Repeat new password" />
                {form.confirm && form.newPass !== form.confirm && (
                  <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>Passwords do not match</div>
                )}
              </div>
              <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
                {!forced && <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>}
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
