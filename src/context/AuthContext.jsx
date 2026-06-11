import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchRemoteConfig, DEFAULT_REMOTE_CONFIG } from '../utils/remoteConfig';

// Tenant storage prefix for isolated installs
const TENANT_STORAGE_PREFIX = 'educore_data_v3_tenant_';

const AuthContext = createContext(null);

export function AuthProvider({ children, store, onUpdate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = sessionStorage.getItem('educore_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [remoteConfig, setRemoteConfig] = useState(DEFAULT_REMOTE_CONFIG);
  const [remoteUrl, setRemoteUrl] = useState(() => {
    try { return localStorage.getItem('remote_config_url') || ''; } catch { return ''; }
  });

  const loadRemote = useCallback(async (url) => {
    const cfg = await fetchRemoteConfig(url || remoteUrl);
    setRemoteConfig(cfg || DEFAULT_REMOTE_CONFIG);
    return cfg;
  }, [remoteUrl]);

  useEffect(() => {
    // initial load
    loadRemote(remoteUrl);
    // poll every 5 minutes
    const id = setInterval(() => loadRemote(remoteUrl), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadRemote, remoteUrl]);

  // Listen for test login events dispatched from OwnerDashboard for debugging
  useEffect(() => {
    function handler(e) {
      const { username, password } = e.detail || {};
      if (!username) return;
      const result = login(username, password);
      console.debug('[Auth] Test login for', username, 'result:', result);
      if (result && result.success) {
        alert(`Test login succeeded for ${username}`);
      } else {
        alert(`Test login failed for ${username}: ${result?.error || 'unknown'}`);
      }
    }
    window.addEventListener('educore-test-login', handler);
    return () => window.removeEventListener('educore-test-login', handler);
  }, [/* no deps: keep stable login reference via closure */]);

  function login(username, password) {
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    let user = (store.users || []).find(u => (u.username || '').toLowerCase() === normalizedUsername && u.password === normalizedPassword);

    // Keep references for diagnostics and tenant fallback
    let persistedGlobal = null;
    let tenantKeyFound = null;
    let tenantStoreFound = null;

    // Fallback: check global persisted store
    if (!user) {
      try {
        const raw = localStorage.getItem('educore_data_v3');
        if (raw) {
          persistedGlobal = JSON.parse(raw);
          user = (persistedGlobal.users || []).find(u => (u.username || '').toLowerCase() === normalizedUsername && u.password === normalizedPassword);
        }
      } catch (e) { /* ignore */ }
    }

    // If still not found, scan tenant-scoped persisted stores
    if (!user) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(TENANT_STORAGE_PREFIX)) continue;
          try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const tstore = JSON.parse(raw);
            const found = (tstore.users || []).find(u => (u.username || '').toLowerCase() === normalizedUsername && u.password === normalizedPassword);
            if (found) {
              user = found;
              tenantKeyFound = key;
              tenantStoreFound = tstore;
              break;
            }
          } catch (e) { /* ignore parse errors for this key */ }
        }
      } catch (e) { /* ignore */ }
    }

    // If still not found, provide clearer diagnostic (check existence without password)
    if (!user) {
      let existsInStore = false;
      let existsInGlobal = false;
      let existsInTenant = false;
      try { existsInStore = (store.users || []).some(u => (u.username || '').toLowerCase() === normalizedUsername); } catch (e) { existsInStore = false; }
      try { if (persistedGlobal) existsInGlobal = (persistedGlobal.users || []).some(u => (u.username || '').toLowerCase() === normalizedUsername); else { const raw = localStorage.getItem('educore_data_v3'); if (raw) { const p = JSON.parse(raw); existsInGlobal = (p.users||[]).some(u => (u.username||'').toLowerCase() === normalizedUsername); } } } catch (e) { existsInGlobal = false; }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(TENANT_STORAGE_PREFIX)) continue;
          try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const tstore = JSON.parse(raw);
            const exists = (tstore.users || []).some(u => (u.username || '').toLowerCase() === normalizedUsername);
            if (exists) { existsInTenant = true; break; }
          } catch (e) { /* ignore parse errors */ }
        }
      } catch (e) { existsInTenant = false; }

      if (existsInStore || existsInGlobal || existsInTenant) {
        console.debug('[Auth] Login failed: password mismatch for', normalizedUsername, { existsInStore, existsInGlobal, existsInTenant });
        return { success: false, error: 'Wrong password for this ID' };
      }

      console.debug('[Auth] Login failed: no matching user for', normalizedUsername, { storeCount: (store.users||[]).length, persistedCount: (persistedGlobal && persistedGlobal.users) ? persistedGlobal.users.length : 0 });
      return { success: false, error: 'Invalid ID or password' };
    }
    // Respect local owner lock: if owner has locked the system, only owner may login
    try {
      const ownerLock = store.ownerLock || JSON.parse(localStorage.getItem('owner_lock') || 'null');
      if (ownerLock && ownerLock.locked && user.role !== 'owner') {
        return { success: false, error: ownerLock.message || 'System is currently unavailable while update is in progress' };
      }
    } catch (e) {
      // ignore parsing errors
    }

    // Respect tenant block: if user belongs to a tenant that is blocked, disallow login
    try {
      const tenantId = user.tenantId;
      if (tenantId) {
        const tenant = (store.tenants || []).find(t => t.id === tenantId);
        if (tenant && tenant.blocked && user.role !== 'owner') {
          return { success: false, error: 'This school is blocked by vendor' };
        }
      }
    } catch (e) {
      // ignore
    }
    sessionStorage.setItem('educore_session', JSON.stringify(user));
    setCurrentUser(user);
    // If user belongs to a tenant, try switching to tenant-scoped store
    try {
      const tenantId = user.tenantId;
      // If we found a tenant-store during scan, prefer that
      if (tenantStoreFound && tenantKeyFound && typeof onUpdate === 'function') {
        tenantStoreFound.__tenantKey = tenantKeyFound;
        onUpdate(tenantStoreFound);
      } else if (tenantId && typeof onUpdate === 'function') {
        const tenantKey = `${TENANT_STORAGE_PREFIX}${tenantId}`;
        const raw = localStorage.getItem(tenantKey);
        if (raw) {
          try {
            const tenantStore = JSON.parse(raw);
            tenantStore.__tenantKey = tenantKey;
            onUpdate(tenantStore);
          } catch (e) {
            console.debug('[Auth] Failed parsing tenant store, falling back to global store', e);
          }
        } else {
          // initialize an empty tenant-scoped store so the new admin gets a clean system
          const emptyTenant = { ...store };
          // wipe data arrays but preserve minimal school info and tenants list
          const keysToEmpty = ['users','staff','feeStructure','feePayments','subjects','students','teachers','classes','subjectAssignments','grades','attendance','sports','schemes','events','enrollmentRequests','timetables','requests','uploadedFiles','notifications','personalizedPlans','announcements'];
          keysToEmpty.forEach(k => { emptyTenant[k] = []; });
          emptyTenant.school = { name: `${tenantId} School`, currentYear: store.school?.currentYear || '' };
          // ensure the tenant and admin user are present in the tenant store
          emptyTenant.tenants = [{ id: tenantId, name: (store.tenants||[]).find(t=>t.id===tenantId)?.name || 'New School', adminId: user.id, createdAt: new Date().toISOString(), blocked: false, userCount: 1 }];
          emptyTenant.users = [user];
          // mark tenant store with its key so App.handleUpdate persists to tenant-specific key
          try { emptyTenant.__tenantKey = tenantKey; localStorage.setItem(tenantKey, JSON.stringify(emptyTenant)); } catch (e) { /* ignore */ }
          onUpdate(emptyTenant);
        }
      }
    } catch (e) { /* ignore */ }
    return { success: true, user };
  }

  function logout() {
    sessionStorage.removeItem('educore_session');
    setCurrentUser(null);
    // Restore global store on logout so owner/admin can access global data
    try {
      const raw = localStorage.getItem('educore_data_v3');
      if (raw && typeof onUpdate === 'function') {
        const parsed = JSON.parse(raw);
        onUpdate(parsed);
      }
    } catch (e) {
      // ignore
    }
  }

  function setRemoteConfigUrl(url) {
    try { localStorage.setItem('remote_config_url', url || ''); } catch {}
    setRemoteUrl(url || '');
    loadRemote(url);
  }

  function changePassword(userId, oldPass, newPass) {
    const uid = (userId || '').toString();
    const uname = uid.toLowerCase();

    // Try current in-memory store first
    try {
      const user = (store.users || []).find(u => u.id === uid || (u.username || '').toLowerCase() === uname);
      if (user) {
        if (user.password !== oldPass) return { success: false, error: 'Current password is incorrect' };
        const updatedUsers = (store.users || []).map(u => (u.id === user.id || (u.username || '').toLowerCase() === uname) ? { ...u, password: newPass, mustChangePassword: false } : u);
        const updated = { ...store, users: updatedUsers };
        onUpdate(updated);
        const updatedUser = updatedUsers.find(u => u.id === user.id || (u.username || '').toLowerCase() === uname);
        sessionStorage.setItem('educore_session', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        return { success: true };
      }
    } catch (e) {
      // continue to persisted lookups
    }

    // Check persisted global store
    try {
      const raw = localStorage.getItem('educore_data_v3');
      if (raw) {
        const persisted = JSON.parse(raw);
        const user = (persisted.users || []).find(u => u.id === uid || (u.username || '').toLowerCase() === uname);
        if (user) {
          if (user.password !== oldPass) return { success: false, error: 'Current password is incorrect' };
          const updatedUsers = (persisted.users || []).map(u => (u.id === user.id || (u.username || '').toLowerCase() === uname) ? { ...u, password: newPass, mustChangePassword: false } : u);
          const updated = { ...persisted, users: updatedUsers };
          try { localStorage.setItem('educore_data_v3', JSON.stringify(updated)); } catch (e) {}
          try { onUpdate(updated); } catch (e) {}
          const updatedUser = updatedUsers.find(u => u.id === user.id || (u.username || '').toLowerCase() === uname);
          sessionStorage.setItem('educore_session', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          return { success: true };
        }
      }
    } catch (e) {
      // ignore and continue
    }

    // Search tenant-scoped persisted stores
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('educore_data_v3_tenant_')) continue;
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const tenantStore = JSON.parse(raw);
          const user = (tenantStore.users || []).find(u => u.id === uid || (u.username || '').toLowerCase() === uname);
          if (user) {
            if (user.password !== oldPass) return { success: false, error: 'Current password is incorrect' };
            const updatedUsers = (tenantStore.users || []).map(u => (u.id === user.id || (u.username || '').toLowerCase() === uname) ? { ...u, password: newPass, mustChangePassword: false } : u);
            const updatedTenant = { ...tenantStore, users: updatedUsers };
            // persist tenant store
            try { localStorage.setItem(key, JSON.stringify(updatedTenant)); } catch (e) {}
            // set in-memory store to tenant store so UI reflects tenant context
            updatedTenant.__tenantKey = key;
            try { onUpdate(updatedTenant); } catch (e) {}
            const updatedUser = updatedUsers.find(u => u.id === user.id || (u.username || '').toLowerCase() === uname);
            sessionStorage.setItem('educore_session', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            return { success: true };
          }
        } catch (e) {
          // ignore parse errors for this key
        }
      }
    } catch (e) {
      // ignore
    }

    return { success: false, error: 'User not found' };
  }

  function changeUsername(userId, currentPassword, newUsername) {
    const uid = (userId || '').toString();
    const normalizedNew = (newUsername || '').trim();
    if (!normalizedNew) return { success: false, error: 'New username is required' };
    const lowerNew = normalizedNew.toLowerCase();

    // verify current user credentials from the current store
    const current = (store.users || []).find(u => u.id === uid || (u.username || '').toLowerCase() === uid.toLowerCase());
    if (!current) return { success: false, error: 'User not found' };
    if (current.password !== currentPassword) return { success: false, error: 'Current password is incorrect' };

    const existsInStore = (store.users || []).some(u => u.id !== uid && (u.username || '').toLowerCase() === lowerNew);
    if (existsInStore) return { success: false, error: 'That username is already in use' };

    try {
      const raw = localStorage.getItem('educore_data_v3');
      if (raw) {
        const persisted = JSON.parse(raw);
        if ((persisted.users || []).some(u => u.id !== uid && (u.username || '').toLowerCase() === lowerNew)) {
          return { success: false, error: 'That username is already in use' };
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('educore_data_v3_tenant_')) continue;
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const tenantStore = JSON.parse(raw);
          if ((tenantStore.users || []).some(u => u.id !== uid && (u.username || '').toLowerCase() === lowerNew)) {
            return { success: false, error: 'That username is already in use' };
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    } catch (e) {
      // ignore
    }

    const updatedUsers = (store.users || []).map(u => u.id === uid ? { ...u, username: normalizedNew } : u);
    const updated = { ...store, users: updatedUsers };
    onUpdate(updated);
    const updatedUser = updatedUsers.find(u => u.id === uid);
    sessionStorage.setItem('educore_session', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return { success: true };
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, changePassword, changeUsername, remoteConfig, remoteUrl, setRemoteConfigUrl, refreshRemoteConfig: () => loadRemote(remoteUrl) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
