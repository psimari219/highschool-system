import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import OwnerDashboard from './components/owner/OwnerDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import AccountantDashboard from './components/accountant/AccountantDashboard';
import { getStore, saveStore } from './data/store';

function AppRoutes({ store, onUpdate }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const role = currentUser.role;

  return (
    <Routes>
      {/* Admin */}
      {role === 'admin' && (
        <>
          <Route path="/admin/*" element={<AdminDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      )}
      {/* Owner */}
      {role === 'owner' && (
        <>
          <Route path="/owner/*" element={<OwnerDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/owner" replace />} />
        </>
      )}
      {/* Teacher */}
      {role === 'teacher' && (
        <>
          <Route path="/teacher/*" element={<TeacherDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </>
      )}
      {/* Student */}
      {role === 'student' && (
        <>
          <Route path="/student/*" element={<StudentDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </>
      )}
      {/* Accountant */}
      {role === 'accountant' && (
        <>
          <Route path="/accountant/*" element={<AccountantDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/accountant" replace />} />
        </>
      )}
      {/* Staff (generic) */}
      {role === 'staff' && (
        <>
          <Route path="/accountant/*" element={<AccountantDashboard store={store} onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/accountant" replace />} />
        </>
      )}
      {/* Fallback */}
      <Route path="/login" element={<Navigate to={`/${role}`} replace />} />
      <Route path="*" element={<Navigate to={`/${role}`} replace />} />
    </Routes>
  );
}

export default function App() {
  const [store, setStore] = useState(() => getStore());

  function handleUpdate(newStore) {
    setStore(newStore);
    try {
      // If the store indicates a tenant-specific key, persist it to that key only
      if (newStore && newStore.__tenantKey) {
        const key = newStore.__tenantKey;
        const copy = { ...newStore };
        delete copy.__tenantKey;
        localStorage.setItem(key, JSON.stringify(copy));
        return;
      }
    } catch (e) {
      // ignore and fall back to normal save
    }
    saveStore(newStore);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadRemoteTimetables() {
      try {
        const res = await fetch('/api/timetables', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json) return;
        setStore(prevStore => {
          const updatedStore = {
            ...prevStore,
            timetables: json.timetables || prevStore.timetables,
            examTimetables: json.examTimetables || prevStore.examTimetables,
          };
          try { saveStore(updatedStore); } catch (err) { console.debug('Failed to persist remote timetables locally:', err); }
          return updatedStore;
        });
      } catch (e) {
        console.debug('Unable to load timetables from backend:', e);
      }
    }

    loadRemoteTimetables();
    return () => { cancelled = true; };
  }, []);

  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider store={store} onUpdate={handleUpdate}>
          <LicenseWrapper store={store} onUpdate={handleUpdate} />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

function LicenseWrapper(props) {
  const { currentUser } = useAuth();
  // lazy load to avoid circular import issues in some bundlers
  // eslint-disable-next-line global-require
  const LicenseGate = require('./components/layout/LicenseGate').default;

  return (
    <LicenseGate store={props.store} onUpdate={props.onUpdate}>
      <AppRoutes {...props} />
    </LicenseGate>
  );
}
