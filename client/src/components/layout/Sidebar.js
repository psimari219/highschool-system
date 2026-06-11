import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  teachers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  classes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  grades: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  attendance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>,
  sports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>,
  schemes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  events: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  announcements: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>THE DIGITAL 5</h1>
        <p>School Management</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">Overview</div>
          <NavLink to="/dashboard" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.dashboard}<span>Dashboard</span>
          </NavLink>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">People</div>
          <NavLink to="/students" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.students}<span>Students</span>
          </NavLink>
          <NavLink to="/teachers" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.teachers}<span>Teachers</span>
          </NavLink>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Academics</div>
          <NavLink to="/classes" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.classes}<span>Classes</span>
          </NavLink>
          <NavLink to="/grades" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.grades}<span>Grades & GPA</span>
          </NavLink>
          <NavLink to="/attendance" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.attendance}<span>Attendance</span>
          </NavLink>
          <NavLink to="/schemes" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.schemes}<span>Schemes of Work</span>
          </NavLink>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Activities</div>
          <NavLink to="/sports" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.sports}<span>Sports</span>
          </NavLink>
          <NavLink to="/events" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.events}<span>Events</span>
          </NavLink>
          <NavLink to="/announcements" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.announcements}<span>Announcements</span>
          </NavLink>
        </div>
        <div className="nav-group">
          <div className="nav-group-label">Reports</div>
          <NavLink to="/reports" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            {icons.reports}<span>Reports</span>
          </NavLink>
        </div>
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button onClick={handleLogout} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:'4px'}} title="Logout">
          {icons.logout}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
