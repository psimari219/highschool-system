import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LicenseGate({ children, store }) {
  const { currentUser, remoteConfig } = useAuth();

  // Determine owner/local lock state (store.ownerLock takes precedence)
  let ownerLock = null;
  try { ownerLock = store?.ownerLock || JSON.parse(localStorage.getItem('owner_lock') || 'null'); } catch (e) { ownerLock = null; }

  const remoteLocked = remoteConfig?.locked === true || remoteConfig?.maintenance === true || remoteConfig?.paid === false;
  const locked = remoteLocked || (ownerLock && ownerLock.locked === true);

  // Allow owners to still access; allow unauthenticated access so owner can reach login
  const bypassRoles = ['owner'];
  if (!locked) return <>{children}</>;
  if (!currentUser) return <>{children}</>; // allow login page so owner can authenticate
  if (currentUser && bypassRoles.includes(currentUser.role)) return <>{children}</>;

  const message = (ownerLock && ownerLock.locked) ? (ownerLock.message || 'System locked by owner') : (remoteConfig?.message || (remoteConfig?.paid === false ? 'License not active — please contact the vendor.' : 'This site is temporarily unavailable.'));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)', padding: 24 }}>
      <div style={{ maxWidth: 720, textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', padding: 28, borderRadius: 12 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>THE DIGITAL 5 — Access Restricted</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 12 }}>{message}</p>
        {remoteConfig?.ownerContact && <p style={{ color: 'var(--text3)', marginBottom: 12 }}>Contact: <a href={`mailto:${remoteConfig.ownerContact}`}>{remoteConfig.ownerContact}</a></p>}
        <div style={{ marginTop: 8 }}>
          <small style={{ color: 'var(--text3)' }}>If you believe this is an error, contact the owner.</small>
        </div>
      </div>
    </div>
  );
}
