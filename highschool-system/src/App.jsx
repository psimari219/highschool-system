import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Students from './components/students/Students';
import Teachers from './components/teachers/Teachers';
import Classes from './components/classes/Classes';
import Timetables from './components/classes/Timetables';
import Grades from './components/grades/Grades';
import Attendance from './components/attendance/Attendance';
import Sports from './components/sports/Sports';
import Schemes from './components/schemes/Schemes';
import Enrollment from './components/enrollment/Enrollment';
import Events from './components/events/Events';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import { getStore, saveStore } from './data/store';

export default function App() {
  const [store, setStore] = useState(() => getStore());

  function handleUpdate(newStore) {
    setStore(newStore);
    saveStore(newStore);
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar schoolName={store.school.name} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard store={store} onUpdate={handleUpdate} />} />
            <Route path="/students" element={<Students store={store} onUpdate={handleUpdate} />} />
            <Route path="/teachers" element={<Teachers store={store} onUpdate={handleUpdate} />} />
            <Route path="/enrollment" element={<Enrollment store={store} onUpdate={handleUpdate} />} />
            <Route path="/classes" element={<Classes store={store} onUpdate={handleUpdate} />} />
            <Route path="/timetables" element={<Timetables store={store} onUpdate={handleUpdate} />} />
            <Route path="/attendance" element={<Attendance store={store} onUpdate={handleUpdate} />} />
            <Route path="/grades" element={<Grades store={store} onUpdate={handleUpdate} />} />
            <Route path="/schemes" element={<Schemes store={store} onUpdate={handleUpdate} />} />
            <Route path="/reports" element={<Reports store={store} />} />
            <Route path="/sports" element={<Sports store={store} onUpdate={handleUpdate} />} />
            <Route path="/events" element={<Events store={store} onUpdate={handleUpdate} />} />
            <Route path="/settings" element={<Settings store={store} onUpdate={handleUpdate} />} />
            <Route path="/school" element={<Settings store={store} onUpdate={handleUpdate} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
