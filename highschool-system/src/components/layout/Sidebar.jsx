import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, Calendar, Trophy,
  ClipboardList, BookMarked, GraduationCap, Settings, ChevronRight,
  Building2, FileText, Award, School
} from 'lucide-react';

const sections = [
  {
    label: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/school', icon: Building2, label: 'School Profile' },
    ]
  },
  {
    label: 'People',
    items: [
      { path: '/students', icon: Users, label: 'Students' },
      { path: '/teachers', icon: UserCheck, label: 'Teachers' },
      { path: '/enrollment', icon: School, label: 'Enrollment' },
    ]
  },
  {
    label: 'Academics',
    items: [
      { path: '/classes', icon: BookOpen, label: 'Classes' },
      { path: '/timetables', icon: Calendar, label: 'Timetables' },
      { path: '/attendance', icon: ClipboardList, label: 'Attendance' },
      { path: '/grades', icon: Award, label: 'Grades & GPA' },
      { path: '/schemes', icon: BookMarked, label: 'Schemes of Work' },
      { path: '/reports', icon: FileText, label: 'Reports' },
    ]
  },
  {
    label: 'Co-Curricular',
    items: [
      { path: '/sports', icon: Trophy, label: 'Sports & Clubs' },
      { path: '/events', icon: GraduationCap, label: 'Events' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export default function Sidebar({ schoolName }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>THE DIGITAL 5</h1>
        <p>{schoolName || 'High School Management'}</p>
      </div>

      {sections.map(section => (
        <div key={section.label} className="sidebar-section">
          <div className="sidebar-section-label">{section.label}</div>
          {section.items.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={16} className="nav-icon" />
                {item.label}
                {active && <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
          THE DIGITAL 5 v1.0 · 2024/2025
        </div>
      </div>
    </nav>
  );
}
