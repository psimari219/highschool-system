import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, LogOut, KeyRound, Bell, Menu, X } from 'lucide-react';
import ChangePasswordModal from '../../auth/ChangePasswordModal';

export default function DashboardShell({ navSections, children, accentColor = 'var(--primary)', brandLabel }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPwModal, setShowPwModal] = useState(currentUser?.mustChangePassword || false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Find current page title
  let pageTitle = '';
  navSections.forEach(s => s.items.forEach(i => { if (location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path))) pageTitle = i.label; }));

  const roleColors = { admin: '#ef4444', teacher: '#3b82f6', student: '#06d6a0', accountant: '#f59e0b' };
  const roleColor = roleColors[currentUser?.role] || 'var(--primary)';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className="sidebar" style={{ background: 'var(--bg2)', transform: mobileOpen ? 'none' : undefined }}>
        {/* Brand */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, background: `linear-gradient(135deg, ${roleColor}, #06d6a0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            THE DIGITAL 5
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{brandLabel}</div>
        </div>

        {/* User chip */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${roleColor}22`, border: `2px solid ${roleColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: roleColor, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
              {currentUser?.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
              <div style={{ fontSize: 11, color: roleColor, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{currentUser?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        {navSections.map(section => (
          <div key={section.label} style={{ padding: '12px 10px 4px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', padding: '0 8px', marginBottom: 4 }}>{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button key={item.path}
                  className={`nav-item ${active ? 'active' : ''}`}
                  style={active ? { background: `${roleColor}18`, color: roleColor, borderColor: `${roleColor}30` } : {}}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}>
                  <Icon size={15} className="nav-icon" />
                  {item.label}
                  {item.badge ? <span className="nav-badge" style={{ background: roleColor }}>{item.badge}</span> : null}
                  {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom actions */}
        <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="nav-item" onClick={() => setShowPwModal(true)}>
            <KeyRound size={14} /> Change Password
          </button>
          <button className="nav-item" style={{ color: 'var(--danger)' }} onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{pageTitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost btn-icon"><Bell size={16} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${roleColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: roleColor }}>
                {currentUser?.name?.[0]}
              </div>
              <span style={{ color: 'var(--text2)' }}>{currentUser?.username}</span>
              <span style={{ background: `${roleColor}22`, color: roleColor, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, textTransform: 'uppercase' }}>{currentUser?.role}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        {children}
      </main>

      {showPwModal && <ChangePasswordModal forced={currentUser?.mustChangePassword} onClose={() => setShowPwModal(false)} />}
    </div>
  );
}
