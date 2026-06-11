import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, Calendar,
  Trophy, ClipboardList, BookMarked, GraduationCap,
  Settings, FileText, Award, School, DollarSign, Layers,
  UserCog, Building2, TrendingUp, MessageSquare
} from 'lucide-react';

// Re-export all admin pages
import AdminHome from './AdminHome';
import Students from '../students/Students';
import Teachers from '../teachers/Teachers';
import Classes from '../classes/Classes';
import Timetables from '../classes/Timetables';
import Grades from '../grades/Grades';
import Attendance from '../attendance/Attendance';
import Sports from '../sports/Sports';
import Schemes from '../schemes/Schemes';
import Enrollment from '../enrollment/Enrollment';
import Events from '../events/Events';
import Reports from '../reports/Reports';
import AdminSettings from './AdminSettings';
import SubjectsPage from '../subjects/SubjectsPage';
import AdminRequests from './AdminRequests';
import AdminAnalytics from './AdminAnalytics';
import AdminPersonalPlans from './AdminPersonalPlans';
import MessagesPage from '../messages/MessagesPage';
import StaffPage from '../staff/StaffPage';
import UsersPage from './UsersPage';

const navSections = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
      { path: '/admin/school', icon: Building2, label: 'School Profile' },
    ]
  },
  {
    label: 'People',
    items: [
      { path: '/admin/students',   icon: Users,    label: 'Students' },
      { path: '/admin/teachers',   icon: UserCheck,label: 'Teachers' },
      { path: '/admin/staff',      icon: UserCog,  label: 'Staff' },
      { path: '/admin/enrollment', icon: School,   label: 'Enrollment' },
      { path: '/admin/users',      icon: UserCog,  label: 'User Accounts' },
    ]
  },
  {
    label: 'Academics',
    items: [
      { path: '/admin/classes',    icon: BookOpen,      label: 'Classes' },
      { path: '/admin/subjects',   icon: Layers,        label: 'Subjects' },
      { path: '/admin/timetables', icon: Calendar,      label: 'Timetables' },
      { path: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
      { path: '/admin/grades',     icon: Award,         label: 'Grades & GPA' },
      { path: '/admin/schemes',    icon: BookMarked,    label: 'Schemes of Work' },
      { path: '/admin/personal-plans', icon: BookMarked, label: 'Personalized Plans' },
      { path: '/admin/reports',    icon: FileText,      label: 'Reports' },
    ]
  },
  {
    label: 'Co-Curricular',
    items: [
      { path: '/admin/sports', icon: Trophy,         label: 'Sports & Clubs' },
      { path: '/admin/events', icon: GraduationCap,  label: 'Events' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { path: '/admin/fees', icon: DollarSign, label: 'Fees Overview' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/admin/requests', icon: FileText, label: 'Requests' },
      { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export default function AdminDashboard({ store, onUpdate }) {
  const props = { store, onUpdate };
  return (
    <DashboardShell navSections={navSections} brandLabel="Administrator Portal">
      <Routes>
        <Route path="/"           element={<AdminHome {...props} />} />
        <Route path="/school"     element={<AdminSettings {...props} />} />
        <Route path="/students/*" element={<Students {...props} />} />
        <Route path="/teachers/*" element={<Teachers {...props} />} />
        <Route path="/staff"      element={<StaffPage {...props} />} />
        <Route path="/enrollment" element={<Enrollment {...props} />} />
        <Route path="/users"      element={<UsersPage {...props} />} />
        <Route path="/classes"    element={<Classes {...props} />} />
        <Route path="/subjects"   element={<SubjectsPage {...props} />} />
        <Route path="/timetables" element={<Timetables {...props} />} />
        <Route path="/requests" element={<AdminRequests {...props} />} />
        <Route path="/messages" element={<MessagesPage {...props} />} />
        <Route path="/analytics" element={<AdminAnalytics {...props} />} />
        <Route path="/personal-plans" element={<AdminPersonalPlans {...props} />} />
        <Route path="/attendance" element={<Attendance {...props} />} />
        <Route path="/grades"     element={<Grades {...props} />} />
        <Route path="/schemes"    element={<Schemes {...props} />} />
        <Route path="/reports"    element={<Reports {...props} />} />
        <Route path="/sports"     element={<Sports {...props} />} />
        <Route path="/events"     element={<Events {...props} />} />
        <Route path="/fees"       element={<AdminFeesView {...props} />} />
        <Route path="/settings"   element={<AdminSettings {...props} />} />
        <Route path="*"           element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardShell>
  );
}

// Quick fees overview for admin
function AdminFeesView({ store }) {
  const totalExpected = store.feeStructure?.reduce((a, f) => a + f.amount, 0) * store.students.length || 0;
  const totalCollected = store.feePayments?.reduce((a, p) => a + p.amount, 0) || 0;
  return (
    <div className="page-content animate-in">
      <div className="stat-grid">
        <div className="stat-card green">
          <div className="stat-icon green"><DollarSign size={20} /></div>
          <div className="stat-value">${totalCollected.toLocaleString()}</div>
          <div className="stat-label">Total Collected</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><DollarSign size={20} /></div>
          <div className="stat-value">{store.feePayments?.length || 0}</div>
          <div className="stat-label">Transactions</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Fee Structure</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fee</th><th>Term</th><th>Amount</th><th>Due Date</th></tr></thead>
            <tbody>
              {(store.feeStructure || []).map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text)' }}>{f.name}</td>
                  <td>{f.term}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>${f.amount}</td>
                  <td style={{ color: 'var(--text3)' }}>{f.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
