import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Topbar({ title, subtitle, actions, school }) {
  return (
    <div className="topbar">
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}
        <button className="btn btn-ghost btn-icon" title="Notifications">
          <Bell size={16} />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', background: 'var(--bg3)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          fontSize: 13, color: 'var(--text2)', cursor: 'pointer'
        }}>
          <User size={14} />
          <span>{school?.principal || 'Administrator'}</span>
        </div>
      </div>
    </div>
  );
}
