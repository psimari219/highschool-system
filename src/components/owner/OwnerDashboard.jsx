import React, { useState } from 'react';
import { APP_VERSION } from '../../config/appConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { wipeStoreExceptOwner } from '../../data/store';

export default function OwnerDashboard({ store, onUpdate }) {
  const { currentUser, remoteConfig, remoteUrl, setRemoteConfigUrl, refreshRemoteConfig, logout, changePassword, changeUsername } = useAuth();
  const [newOwnerUsername, setNewOwnerUsername] = useState('');
  const [newOwnerUsernamePassword, setNewOwnerUsernamePassword] = useState('');
  const [ownerPasswordCurrent, setOwnerPasswordCurrent] = useState('');
  const [ownerPasswordNew, setOwnerPasswordNew] = useState('');
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const navigate = useNavigate();
  const ownerLock = store?.ownerLock || (() => { try { return JSON.parse(localStorage.getItem('owner_lock') || 'null'); } catch { return null; } })();
  const lockMessage = ownerLock?.message || '';

  // Helpers for tenant/admin provisioning
  function makeId(prefix = 'ADM') {
    return `${prefix}${Date.now().toString(36).toUpperCase().slice(-6)}`;
  }
  function makePassword() {
    return 'pw' + Math.random().toString(36).slice(2, 10);
  }

  return (
    <div className="page-content animate-in">
      <div style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">System Management</div>
          <div style={{ padding: 12 }}>
            <div style={{ color: 'var(--text3)', marginBottom: 8 }}>Remote config URL (host a simple JSON with <code style={{background:'transparent',color:'var(--text)'}}>{'{ paid, locked, message, ownerContact, version }'}</code>):</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input defaultValue={remoteUrl || ''} id="ownerRemoteConfigUrlInput" placeholder="https://example.com/config.json" style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <button className="btn btn-primary" onClick={async () => {
                const url = document.getElementById('ownerRemoteConfigUrlInput').value.trim();
                if (!url) return alert('Enter a URL');
                try { await setRemoteConfigUrl(url); alert('Remote URL saved and fetched'); } catch (e) { alert('Failed: ' + e.message); }
              }}>Save & Fetch</button>
              <button className="btn" onClick={async () => { try { await refreshRemoteConfig(); alert('Refreshed'); } catch (e) { alert('Failed: ' + e.message); } }}>Refresh</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Persisted Stores Inspector</div>
              <div style={{ color: 'var(--text3)', marginBottom: 8 }}>Reads the global store and any tenant stores saved in localStorage to help locate missing users.</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button className="btn" onClick={() => {
                  try {
                    const globalRaw = localStorage.getItem('educore_data_v3');
                    const tenants = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('educore_data_v3_tenant_')) {
                        tenants.push(key);
                      }
                    }
                    const out = { global: globalRaw ? JSON.parse(globalRaw) : null, tenantKeys: tenants };
                    navigator.clipboard?.writeText(JSON.stringify(out, null, 2));
                    alert('Persisted stores copied to clipboard (global + tenant keys)');
                  } catch (e) { alert('Failed: ' + e.message); }
                }}>Copy Persisted Stores</button>
                <button className="btn" onClick={() => {
                  try {
                    const globalRaw = localStorage.getItem('educore_data_v3');
                    const global = globalRaw ? JSON.parse(globalRaw) : null;
                    const tenantStores = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('educore_data_v3_tenant_')) {
                        try { tenantStores.push({ key, store: JSON.parse(localStorage.getItem(key)) }); } catch (e) { tenantStores.push({ key, store: null }); }
                      }
                    }
                    const modal = window.open('', '_blank', 'width=800,height=600');
                    modal.document.write('<pre style="white-space:pre-wrap;word-break:break-word;">' + JSON.stringify({ global, tenantStores }, null, 2) + '</pre>');
                  } catch (e) { alert('Failed: ' + e.message); }
                }}>View Persisted Stores</button>
                <button className="btn btn-primary" onClick={() => {
                  // Initialize tenant stores for each tenant in the current active store
                  try {
                    const tenants = (store.tenants || []);
                    if (!tenants || tenants.length === 0) return alert('No tenants found in current store');
                    tenants.forEach(t => {
                      const tenantKey = `educore_data_v3_tenant_${t.id}`;
                      const emptyTenant = { ...store };
                      const keysToEmpty = ['users','staff','feeStructure','feePayments','subjects','students','teachers','classes','subjectAssignments','grades','attendance','sports','schemes','events','enrollmentRequests','timetables','requests','uploadedFiles','notifications','personalizedPlans','announcements'];
                      keysToEmpty.forEach(k => { emptyTenant[k] = []; });
                      emptyTenant.school = { name: t.name, currentYear: store.school?.currentYear || '' };
                      // pick users from current store that belong to this tenant (by tenantId or adminId)
                      const members = (store.users || []).filter(u => (u.tenantId && u.tenantId === t.id) || u.id === t.adminId || u.username === t.adminId);
                      // if no members found, include the admin user from global users if present
                      if (members.length === 0) {
                        const adminUser = (store.users || []).find(u => u.id === t.adminId || u.username === t.adminId);
                        if (adminUser) members.push(adminUser);
                      }
                      emptyTenant.users = members;
                      emptyTenant.tenants = [{ id: t.id, name: t.name, adminId: t.adminId, createdAt: t.createdAt || new Date().toISOString(), blocked: !!t.blocked, userCount: members.length }];
                      emptyTenant.__tenantKey = tenantKey;
                      localStorage.setItem(tenantKey, JSON.stringify(emptyTenant));
                    });
                    alert('Initialized tenant stores from current active store');
                  } catch (e) { alert('Failed: ' + e.message); }
                }}>Initialize Tenant Stores</button>
              </div>
            </div>
            <div style={{ marginTop: 10, color: 'var(--text3)' }}>
              <div>Current remote URL: <strong style={{ color: 'var(--text)' }}>{remoteUrl || '—'}</strong></div>
              <div>Paid: <strong>{remoteConfig?.paid ? 'Yes' : 'No'}</strong> · Locked: <strong>{remoteConfig?.locked ? 'Yes' : 'No'}</strong> · Maintenance: <strong>{remoteConfig?.maintenance ? 'Yes' : 'No'}</strong></div>
              {remoteConfig?.message && <div style={{ marginTop: 6, color: 'var(--text3)' }}>Message: {remoteConfig.message}</div>}
              <div style={{ marginTop: 8, color: 'var(--text3)' }}>App version: <strong>{APP_VERSION}</strong> · Remote version: <strong>{remoteConfig?.version || '—'}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Owner Credentials</div>
          <div style={{ padding: 12 }}>
            <div style={{ marginBottom: 10, color: 'var(--text3)' }}>
              Update the owner's login credentials. Changing username requires the current password for verification.
            </div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>New Owner Username</label>
                <input value={newOwnerUsername} onChange={e => setNewOwnerUsername(e.target.value)} placeholder="Enter a new username" className="form-control" />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Current Password</label>
                <input type="password" value={newOwnerUsernamePassword} onChange={e => setNewOwnerUsernamePassword(e.target.value)} placeholder="Current password" className="form-control" />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => {
                  setUsernameMessage('');
                  if (!newOwnerUsername) return setUsernameMessage('Enter the new username');
                  if (!newOwnerUsernamePassword) return setUsernameMessage('Enter the current password');
                  const result = changeUsername(currentUser.id, newOwnerUsernamePassword, newOwnerUsername);
                  if (!result.success) return setUsernameMessage(result.error || 'Failed to update username');
                  setUsernameMessage('Owner username updated successfully.');
                  setNewOwnerUsername('');
                  setNewOwnerUsernamePassword('');
                }}>Update Username</button>
                <div style={{ flex: 1, minWidth: 0, color: usernameMessage.startsWith('Owner') ? 'var(--success)' : 'var(--danger)', fontSize: 13 }}>{usernameMessage}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Current Password</label>
                  <input type="password" value={ownerPasswordCurrent} onChange={e => setOwnerPasswordCurrent(e.target.value)} placeholder="Current password" className="form-control" />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>New Password</label>
                  <input type="password" value={ownerPasswordNew} onChange={e => setOwnerPasswordNew(e.target.value)} placeholder="New password" className="form-control" />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Confirm Password</label>
                  <input type="password" value={ownerPasswordConfirm} onChange={e => setOwnerPasswordConfirm(e.target.value)} placeholder="Confirm new password" className="form-control" />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={() => {
                    setPasswordMessage('');
                    if (!ownerPasswordCurrent || !ownerPasswordNew || !ownerPasswordConfirm) return setPasswordMessage('Complete all password fields');
                    if (ownerPasswordNew.length < 6) return setPasswordMessage('New password must be at least 6 characters');
                    if (ownerPasswordNew !== ownerPasswordConfirm) return setPasswordMessage('Passwords do not match');
                    const result = changePassword(currentUser.id, ownerPasswordCurrent, ownerPasswordNew);
                    if (!result.success) return setPasswordMessage(result.error || 'Password update failed');
                    setPasswordMessage('Password updated successfully.');
                    setOwnerPasswordCurrent('');
                    setOwnerPasswordNew('');
                    setOwnerPasswordConfirm('');
                  }}>Update Password</button>
                  <div style={{ color: passwordMessage.includes('successfully') ? 'var(--success)' : 'var(--danger)', fontSize: 13, minHeight: 20 }}>{passwordMessage}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Inject Missing User</div>
          <div style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, color: 'var(--text3)' }}>Create a user directly into the selected tenant store (useful for recovery).</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input id="injectUserId" placeholder="User ID e.g. PS2004" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input id="injectUserName" placeholder="Full name" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input id="injectUserUsername" placeholder="username e.g. ps2004" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input id="injectUserPassword" placeholder="password" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <label style={{ color: 'var(--text3)', width: 80 }}>Role</label>
              <select id="injectUserRole" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                <option value="teacher">teacher</option>
                <option value="student">student</option>
                <option value="admin">admin</option>
              </select>
              <label style={{ color: 'var(--text3)', width: 80 }}>Tenant</label>
              <select id="injectUserTenant" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                {(store.tenants || []).map(t => <option key={t.id} value={t.id}>{t.name} · {t.id}</option>)}
              </select>
              <button className="btn btn-primary" onClick={() => {
                try {
                  const id = (document.getElementById('injectUserId').value || '').trim() || null;
                  const name = (document.getElementById('injectUserName').value || '').trim() || 'Unknown';
                  const username = (document.getElementById('injectUserUsername').value || '').trim();
                  const password = (document.getElementById('injectUserPassword').value || '').trim() || 'changeme';
                  const role = document.getElementById('injectUserRole').value;
                  const tenantId = document.getElementById('injectUserTenant').value;
                  if (!username) return alert('Enter a username');
                  const userId = id ? id.toUpperCase() : username.toUpperCase();
                  const userObj = { id: userId, role, username, password, name, email: '', linkedId: null, mustChangePassword: false, tenantId };

                  // Update global store (so owner UI shows user)
                  const existsGlobal = (store.users || []).some(u => (u.username||'').toLowerCase() === username.toLowerCase());
                  if (existsGlobal) return alert('A user with that username already exists in the global store');
                  const updatedGlobal = { ...store, users: [...(store.users||[]), userObj] };
                  onUpdate(updatedGlobal);
                  try { localStorage.setItem('educore_data_v3', JSON.stringify(updatedGlobal)); } catch (e) { /* ignore */ }

                  // Ensure tenant store exists and add user there
                  const tenantKey = `educore_data_v3_tenant_${tenantId}`;
                  let tenantStore = null;
                  try {
                    const raw = localStorage.getItem(tenantKey);
                    tenantStore = raw ? JSON.parse(raw) : null;
                  } catch (e) { tenantStore = null; }
                  if (!tenantStore) {
                    tenantStore = { ...updatedGlobal };
                    const keysToEmpty = ['users','staff','feeStructure','feePayments','subjects','students','teachers','classes','subjectAssignments','grades','attendance','sports','schemes','events','enrollmentRequests','timetables','requests','uploadedFiles','notifications','personalizedPlans','announcements'];
                    keysToEmpty.forEach(k => { tenantStore[k] = []; });
                    tenantStore.tenants = [{ id: tenantId, name: (store.tenants||[]).find(t=>t.id===tenantId)?.name || tenantId, adminId: (store.tenants||[]).find(t=>t.id===tenantId)?.adminId || null, createdAt: new Date().toISOString(), blocked: false, userCount: 0 }];
                  }
                  tenantStore.users = [...(tenantStore.users||[]), userObj];
                  tenantStore.__tenantKey = tenantKey;
                  try { localStorage.setItem(tenantKey, JSON.stringify(tenantStore)); } catch (e) { /* ignore */ }

                  alert(`User injected for tenant ${tenantId}: ${username}/${password}`);
                } catch (e) { alert('Failed to inject user: ' + e.message); }
              }}>Inject User</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Provision New School</div>
          <div style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, color: 'var(--text3)' }}>Create a fresh tenant and admin account for a new school. The generated admin credentials will be shown once created.</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input id="newSchoolName" placeholder="School name (e.g. Springfield High)" style={{ flex: 2, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input id="newAdminId" placeholder="Admin ID (optional) e.g. ADM123" style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input id="newAdminPassword" placeholder="Password (optional)" style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <button className="btn btn-primary" onClick={() => {
                const name = document.getElementById('newSchoolName').value.trim();
                if (!name) return alert('Enter a school name');
                const providedId = document.getElementById('newAdminId').value.trim();
                const providedPass = document.getElementById('newAdminPassword').value;
                const tenantId = 'TNT' + Date.now().toString(36).toUpperCase().slice(-6);
                const adminId = providedId ? providedId.toUpperCase() : makeId('ADM');
                const password = providedPass && providedPass.length > 0 ? providedPass : makePassword();
                const adminUser = { id: adminId, role: 'admin', username: adminId, password, name: `${name} Admin`, email: `admin@${name.replace(/\s+/g,'').toLowerCase()}.school`, linkedId: null, mustChangePassword: false, tenantId };
                const tenant = { id: tenantId, name, adminId, createdAt: new Date().toISOString(), blocked: false, userCount: 1 };
                // Avoid duplicate admin IDs
                const exists = (store.users || []).some(u => u.username.toLowerCase() === adminId.toLowerCase());
                if (exists) return alert('Admin ID already exists. Choose a different ID.');
                const updated = { ...store, tenants: [...(store.tenants||[]), tenant], users: [...(store.users||[]), adminUser] };
                try {
                  onUpdate(updated);
                  try { localStorage.setItem('educore_data_v3', JSON.stringify(updated)); } catch (e) { /* ignore */ }
                  // initialize tenant-scoped empty store so new admin sees a clean system
                  try {
                    const TENANT_KEY = `educore_data_v3_tenant_${tenantId}`;
                    const emptyTenant = { ...updated };
                    const keysToEmpty = ['users','staff','feeStructure','feePayments','subjects','students','teachers','classes','subjectAssignments','grades','attendance','sports','schemes','events','enrollmentRequests','timetables','requests','uploadedFiles','notifications','personalizedPlans','announcements'];
                    keysToEmpty.forEach(k => { emptyTenant[k] = []; });
                    emptyTenant.school = { name, currentYear: store.school?.currentYear || '' };
                    emptyTenant.tenants = [{ id: tenantId, name, adminId, createdAt: new Date().toISOString(), blocked: false, userCount: 1 }];
                    // include the admin user only
                    emptyTenant.users = [adminUser];
                    localStorage.setItem(TENANT_KEY, JSON.stringify(emptyTenant));
                  } catch (e) { console.debug('[Owner] Failed to init tenant store', e); }
                  console.debug('[Owner] Created tenant/admin', tenantId, adminId, password);
                  alert(`Tenant created. Admin ID: ${adminId}\nPassword: ${password}`);
                } catch (e) { alert('Failed: ' + e.message); }
              }}>Create Admin</button>
            </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Current Admins (owner-only debug)</div>
                <div style={{ color: 'var(--text3)', marginBottom: 6 }}>This list shows admin accounts and their stored passwords so you can verify persistence.</div>
                {(store.users || []).filter(u => u.role === 'admin').map(u => (
                  <div key={u.id} style={{ padding: 8, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{u.name} · {u.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>ID: {u.id} · Tenant: {u.tenantId || '—'}</div>
                    </div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--text)' }}>pw: {u.password}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn" onClick={async () => {
                        try {
                          const res = await (async () => {
                            // lazy import to avoid circular deps
                            // eslint-disable-next-line global-require
                            const auth = require('../../context/AuthContext');
                            return null;
                          })();
                        } catch (e) {
                          // no-op
                        }
                        try {
                          const ev = new CustomEvent('educore-test-login', { detail: { username: u.username, password: u.password } });
                          window.dispatchEvent(ev);
                          alert('Test login event dispatched. Check console for result.');
                        } catch (e) {
                          alert('Test login failed to dispatch: ' + e.message);
                        }
                      }}>Test Login</button>
                      <button className="btn" onClick={() => {
                        const newPass = window.prompt('Enter new password for ' + u.username + ':');
                        if (!newPass) return;
                        try {
                          const updatedUsers = (store.users || []).map(x => x.id === u.id ? { ...x, password: newPass } : x);
                          const updated = { ...store, users: updatedUsers };
                          onUpdate(updated);
                          try { localStorage.setItem('educore_data_v3', JSON.stringify(updated)); } catch (e) {}
                          try {
                            const tenantKey = `educore_data_v3_tenant_${u.tenantId}`;
                            const raw = localStorage.getItem(tenantKey);
                            if (raw) {
                              const ts = JSON.parse(raw);
                              ts.users = (ts.users || []).map(x => x.id === u.id ? { ...x, password: newPass } : x);
                              ts.__tenantKey = tenantKey;
                              localStorage.setItem(tenantKey, JSON.stringify(ts));
                            }
                          } catch (e) {}
                          alert('Password updated');
                        } catch (e) { alert('Failed: ' + e.message); }
                      }}>Reset Password</button>
                      <button className="btn btn-danger" onClick={() => {
                        if (!window.confirm(`Delete admin account ${u.username}? This will remove the account from the global and tenant store.`)) return;
                        try {
                          const updatedUsers = (store.users || []).filter(x => x.id !== u.id);
                          const updatedTenants = (store.tenants || []).map(tt => {
                            const updatedCount = updatedUsers.filter(x => x.tenantId === tt.id).length;
                            return {
                              ...tt,
                              adminId: tt.adminId === u.id ? null : tt.adminId,
                              userCount: updatedCount
                            };
                          });
                          const updated = { ...store, users: updatedUsers, tenants: updatedTenants };
                          onUpdate(updated);
                          try { localStorage.setItem('educore_data_v3', JSON.stringify(updated)); } catch (e) {}
                          if (u.tenantId) {
                            try {
                              const tenantKey = `educore_data_v3_tenant_${u.tenantId}`;
                              const raw = localStorage.getItem(tenantKey);
                              if (raw) {
                                const ts = JSON.parse(raw);
                                ts.users = (ts.users || []).filter(x => x.id !== u.id);
                                ts.__tenantKey = tenantKey;
                                localStorage.setItem(tenantKey, JSON.stringify(ts));
                              }
                            } catch (e) {}
                          }
                          alert(`Admin ${u.username} deleted.`);
                        } catch (e) { alert('Delete failed: ' + e.message); }
                      }}>Delete Admin</button>
                    </div>
                  </div>
                ))}
              </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Existing Tenants</div>
              {(store.tenants || []).length === 0 && <div style={{ color: 'var(--text3)' }}>No tenants yet.</div>}
              {(store.tenants || []).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Tenant: {t.id} · Admin: {t.adminId} · Users: {t.userCount || 0}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => {
                      // toggle blocked
                      const updatedTenants = (store.tenants || []).map(tt => tt.id === t.id ? { ...tt, blocked: !tt.blocked } : tt);
                      const updated = { ...store, tenants: updatedTenants };
                      try { onUpdate(updated); alert(`Tenant ${t.id} is now ${(!t.blocked) ? 'blocked' : 'unblocked'}`); } catch (e) { alert('Failed: ' + e.message); }
                    }}>{t.blocked ? 'Unblock' : 'Block'}</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Current Users (owner-only debug)</div>
              <div style={{ color: 'var(--text3)', marginBottom: 6 }}>All users in the active store. Use Test Login to verify credentials.</div>
              <div style={{ marginBottom: 8 }}>
                <button className="btn" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(store.users || [], null, 2)); alert('Users copied to clipboard'); }}>Copy Users JSON</button>
              </div>
              {(store.users || []).map(u => (
                <div key={u.id} style={{ padding: 8, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{u.name} · {u.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Role: {u.role} · ID: {u.id} · Tenant: {u.tenantId || '—'}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text)' }}>pw: {u.password}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => {
                      try {
                        const ev = new CustomEvent('educore-test-login', { detail: { username: u.username, password: u.password } });
                        window.dispatchEvent(ev);
                        alert('Test login event dispatched. Check console/alerts for result.');
                      } catch (e) { alert('Failed to dispatch test login: ' + e.message); }
                    }}>Test Login</button>
                    <button className="btn" onClick={() => {
                      const newPass = window.prompt('Enter new password for ' + u.username + ':');
                      if (!newPass) return;
                      try {
                        const updatedUsers = (store.users || []).map(x => x.id === u.id ? { ...x, password: newPass } : x);
                        const updated = { ...store, users: updatedUsers };
                        onUpdate(updated);
                        try { localStorage.setItem('educore_data_v3', JSON.stringify(updated)); } catch (e) {}
                        try {
                          const tenantKey = `educore_data_v3_tenant_${u.tenantId}`;
                          const raw = localStorage.getItem(tenantKey);
                          if (raw) {
                            const ts = JSON.parse(raw);
                            ts.users = (ts.users || []).map(x => x.id === u.id ? { ...x, password: newPass } : x);
                            ts.__tenantKey = tenantKey;
                            localStorage.setItem(tenantKey, JSON.stringify(ts));
                          }
                        } catch (e) {}
                        alert('Password updated');
                      } catch (e) { alert('Failed: ' + e.message); }
                    }}>Reset Password</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Owner Actions</div>
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(store)); alert('Backup copied to clipboard'); }}>Backup Store</button>
              <button className="btn btn-danger" onClick={() => {
                if (!window.confirm('Wipe all system data and keep only the owner account? This cannot be undone.')) return;
                try {
                  const cleaned = wipeStoreExceptOwner(store);
                  // remove tenant stores and owner lock
                  for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (!key) continue;
                    if (key === 'educore_data_v3') continue;
                    localStorage.removeItem(key);
                  }
                  localStorage.setItem('educore_data_v3', JSON.stringify(cleaned));
                  localStorage.removeItem('owner_lock');
                  onUpdate(cleaned);
                  alert('System wiped. Only the owner account remains. Refresh if needed.');
                } catch (e) { alert('Failed: ' + e.message); }
              }}>Wipe All Data (Owner Only)</button>
              <button className="btn btn-danger" onClick={() => {
                if (!window.confirm('Reset system to defaults? This will overwrite local data.')) return;
                try { onUpdate(undefined); alert('Please refresh to reload defaults'); } catch (e) { alert('Failed: ' + e.message); }
              }}>Reset to Defaults</button>
              <button className="btn" onClick={() => {
                try { logout(); navigate('/login', { replace: true }); } catch (e) { window.location.href = '/login'; }
              }}>Sign Out</button>
            </div>
            <div style={{ marginTop: 10, color: 'var(--text3)' }}>
              Use these controls to manage global system settings, remote license, and backups.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Owner Lock</div>
          <div style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, color: 'var(--text3)' }}>Use this to locally lock the system so only the owner can login and unlock it.</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <input id="ownerLockMessage" placeholder="Optional lock message" defaultValue={lockMessage} style={{ flex: 1, minWidth: 220, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <button className="btn btn-danger" onClick={() => {
                const msg = document.getElementById('ownerLockMessage').value.trim();
                const updated = { ...store, ownerLock: { locked: true, message: msg || 'Locked by owner', mode: 'lock', by: 'OWN001', createdAt: new Date().toISOString() } };
                try { onUpdate(updated); localStorage.setItem('owner_lock', JSON.stringify(updated.ownerLock)); alert('System locked — only owner can login'); } catch (e) { alert('Failed: ' + e.message); }
              }}>Lock System</button>
              <button className="btn btn-warning" onClick={() => {
                const msg = document.getElementById('ownerLockMessage').value.trim() || 'System is temporarily unavailable for update. Only owner can access the system while maintenance is in progress.';
                const updated = { ...store, ownerLock: { locked: true, message: msg, mode: 'update', by: 'OWN001', createdAt: new Date().toISOString() } };
                try { onUpdate(updated); localStorage.setItem('owner_lock', JSON.stringify(updated.ownerLock)); alert('Update mode enabled — non-owner access is blocked.'); } catch (e) { alert('Failed: ' + e.message); }
              }}>Update Mode</button>
              <button className="btn" onClick={() => {
                const updated = { ...store, ownerLock: { locked: false, message: '', mode: 'normal', by: null, createdAt: new Date().toISOString() } };
                try { onUpdate(updated); localStorage.removeItem('owner_lock'); alert('System unlocked'); } catch (e) { alert('Failed: ' + e.message); }
              }}>Unlock</button>
            </div>
            <div style={{ color: 'var(--text3)' }}>
              Current owner lock: <strong>{ownerLock?.locked ? (ownerLock?.mode === 'update' ? 'Update mode' : 'Locked') : 'Unlocked'}</strong>{ownerLock?.message ? ` — ${ownerLock.message}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
