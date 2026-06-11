import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';
import {
  LayoutDashboard, DollarSign, CreditCard, Users,
  FileText, Settings, TrendingUp, MessageSquare
} from 'lucide-react';
import AccountantHome from './AccountantHome';
import FeesManagement from './FeesManagement';
import PaymentsPage from './PaymentsPage';
import PayrollPage from './PayrollPage';
import AccountantReports from './AccountantReports';
import AccountantRequests from './AccountantRequests';
import FeeStructurePage from './FeeStructurePage';
import MessagesPage from '../messages/MessagesPage';

const navSections = [
  {
    label: 'Finance',
    items: [
      { path: '/accountant',           icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/accountant/fees',      icon: DollarSign,      label: 'Student Fees' },
      { path: '/accountant/payments',  icon: CreditCard,      label: 'Payments' },
      { path: '/accountant/structure', icon: Settings,        label: 'Fee Structure' },
      { path: '/accountant/payroll',   icon: Users,           label: 'Staff Payroll' },
      { path: '/accountant/requests',  icon: FileText,        label: 'Requests' },
      { path: '/accountant/messages',  icon: MessageSquare,   label: 'Messages' },
      { path: '/accountant/reports',   icon: FileText,        label: 'Financial Reports' },
    ]
  }
];

export default function AccountantDashboard({ store, onUpdate }) {
  const props = { store, onUpdate };
  return (
    <DashboardShell navSections={navSections} brandLabel="Accountant Portal">
      <Routes>
        <Route path="/"           element={<AccountantHome {...props} />} />
        <Route path="/fees"       element={<FeesManagement {...props} />} />
        <Route path="/payments"   element={<PaymentsPage {...props} />} />
        <Route path="/structure"  element={<FeeStructurePage {...props} />} />
        <Route path="/payroll"    element={<PayrollPage {...props} />} />
        <Route path="/requests"   element={<AccountantRequests {...props} />} />
        <Route path="/messages"   element={<MessagesPage {...props} />} />
        <Route path="/reports"    element={<AccountantReports {...props} />} />
        <Route path="*"           element={<Navigate to="/accountant" replace />} />
      </Routes>
    </DashboardShell>
  );
}
