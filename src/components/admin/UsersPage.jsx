import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Copy, Edit2, Trash2, UserCog, RefreshCw, Key } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId, generatePassword } from '../../data/store';

const ROLE_COLORS = { admin: '#ef4444', teacher: '#3b82f6', student: '#06d6a0', accountant: '#f59e0b', staff: '#a78bfa' };

function UserModal({ mode, user, store, onSave, onClose }) {
  const [form, setForm] = useState(user || { role: 'student', name: '', email: '', username: '', password: '', linkedId: '', mustChangePassword: true });
  const [showPass, setShowPass] = useState(false);
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  function autoGenerate() {
    const pwd = generatePassword(form.name);
    set('password', pwd);
  }

  function handleRoleChange(role) {
    set('role', role);
    // Auto-suggest linkedId list
    set('linkedId', '');
  }

  const linkedOptions = {
    teacher: store.teachers.map(t => ({ id: t.id, label: `${t.firstName} ${t.lastName} (${t.id})` })),
    student: store.students.map(s => ({ id: s.id, label: `${s.firstName} ${s.lastName} (${s.id})` })),
    staff:   (store.staff||[]).map(s => ({ id: s.id, label: `${s.firstName} ${s.lastName} (${s.id})` })),
    accountant: (store.staff||[]).filter(s=>s.role==='Accountant').map(s => ({ id: s.id, label: `${s.firstName} ${s.lastName}` })),
    admin: [],
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password || !form.name) return;
    onSave(form);
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Create User Account' : 'Edit User Account'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['admin','teacher','student','accountant','staff'].map(r => (
                  <button key={r} type="button" onClick={() => handleRoleChange(r)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                      background: form.role === r ? ROLE_COLORS[r] : 'transparent',
                      borderColor: ROLE_COLORS[r],
                      color: form.role === r ? 'white' : ROLE_COLORS[r] }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Full name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username / ID *</label>
                <input className="form-control" value={form.username} onChange={e => set('username', e.target.value)} required placeholder="e.g. S009, T007" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@school.edu" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type={showPass ? 'text' : 'password'} className="form-control" style={{ paddingRight: 36 }}
                    value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Set initial password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button type="button" className="btn btn-ghost" onClick={autoGenerate} title="Auto-generate password">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            {form.role !== 'admin' && linkedOptions[form.role]?.length > 0 && (
              <div className="form-group">
                <label className="form-label">Link to {form.role} record</label>
                <select className="form-control" value={form.linkedId} onChange={e => set('linkedId', e.target.value)}>
                  <option value="">— Not linked —</option>
                  {linkedOptions[form.role].map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.mustChangePassword} onChange={e => set('mustChangePassword', e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Force password change on first login</span>
              </label>
            </div>

            {mode === 'add' && form.username && form.password && (
              <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>CREDENTIALS TO SHARE WITH USER</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>ID: <strong style={{ color: 'var(--text)' }}>{form.username}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Password: <strong style={{ color: 'var(--text)' }}>{form.password}</strong></div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Create Account' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onSave, onClose }) {
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  function generate() { setNewPass(generatePassword(user.name)); }
  function handleSubmit(e) {
    e.preventDefault();
    if (!newPass) return;
    onSave(newPass);
  }
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title"><Key size={16} style={{ marginRight: 8 }} />Reset Password</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
              Reset password for <strong>{user.name}</strong> ({user.username})
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type={showPass ? 'text' : 'password'} className="form-control" style={{ paddingRight: 36 }}
                    value={newPass} onChange={e => setNewPass(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button type="button" className="btn btn-ghost" onClick={generate}><RefreshCw size={14} /></button>
              </div>
            </div>
            {newPass && <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              New password: <strong style={{ color: 'var(--accent)' }}>{newPass}</strong>
            </div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [showPassFor, setShowPassFor] = useState(null);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      // ensure tenantId is attached when creating accounts from a tenant-scoped store
      const tenantId = store.__tenantKey ? store.__tenantKey.replace(/^educore_data_v3_tenant_/, '') : (store.tenants && store.tenants[0] && store.tenants[0].id) || null;
      const newUser = { ...data, id: data.username, tenantId };
      updated.users = [...(store.users||[]), newUser];
    } else {
      updated.users = store.users.map(u => u.id === data.id ? { ...u, ...data } : u);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleResetPassword(newPass) {
    const updated = { ...store, users: store.users.map(u => u.id === resetTarget.id ? { ...u, password: newPass, mustChangePassword: true } : u) };
    onUpdate(updated);
    setResetTarget(null);
  }

  function handleDelete(id) {
    if (id === 'ADM001') { alert('Cannot delete the primary admin account.'); return; }
    if (!window.confirm('Delete this user account?')) return;
    onUpdate({ ...store, users: store.users.filter(u => u.id !== id) });
  }

  const filtered = (store.users || []).filter(u => u.role !== 'owner' && (!roleFilter || u.role === roleFilter));

  return (
    <div>
      <Topbar title="User Accounts" subtitle={`${store.users?.length || 0} accounts`} school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Create Account</button>}
      />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 20 }}>
          {['admin','teacher','student','accountant','staff'].map(role => {
            const count = (store.users||[]).filter(u => u.role === role && u.role !== 'owner').length;
            return (
              <div key={role} className="card" style={{ padding: 14, cursor: 'pointer', borderColor: roleFilter === role ? ROLE_COLORS[role] : undefined }}
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: ROLE_COLORS[role] }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{role}s</div>
              </div>
            );
          })}
        </div>

        <div className="filters-row">
          <button className={`btn btn-sm ${!roleFilter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setRoleFilter('')}>All Roles</button>
          {['admin','teacher','student','accountant','staff'].map(r => (
            <button key={r} className={`btn btn-sm ${roleFilter===r ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setRoleFilter(roleFilter===r ? '' : r)}>
              {r.charAt(0).toUpperCase()+r.slice(1)}s
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Username / ID</th><th>Role</th><th>Password</th><th>Linked To</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(user => {
                  const roleColor = ROLE_COLORS[user.role] || 'var(--primary)';
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${roleColor}20`, border: `2px solid ${roleColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: roleColor }}>
                            {user.name?.split(' ').map(w=>w[0]).slice(0,2).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{user.username}</span></td>
                      <td><span style={{ background: `${roleColor}15`, color: roleColor, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{user.role}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>
                            {showPassFor === user.id ? user.password : '••••••••'}
                          </span>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowPassFor(showPassFor===user.id ? null : user.id)}>
                            {showPassFor === user.id ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{user.linkedId || '—'}</td>
                      <td>
                        {user.mustChangePassword
                          ? <span className="badge badge-warning">Must Change</span>
                          : <span className="badge badge-success">Active</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Reset password" onClick={() => setResetTarget(user)}><Key size={13} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => { setSelected(user); setModal('edit'); }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(user.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && <UserModal mode={modal} user={selected} store={store} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onSave={handleResetPassword} onClose={() => setResetTarget(null)} />}
    </div>
  );
}
