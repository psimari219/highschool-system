import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardShell from '../layout/DashboardShell';
import { LayoutDashboard, Award, ClipboardList, Trophy, Calendar, FileText, Bell } from 'lucide-react';
import StudentHome from './StudentHome';
import StudentGrades from './StudentGrades';
import StudentAttendance from './StudentAttendance';
import StudentSports from './StudentSports';
import StudentEvents from './StudentEvents';
import StudentReportCard from './StudentReportCard';
import StudentTimetable from './StudentTimetable';
import StudentResources from './StudentResources';

export default function StudentDashboard({ store, onUpdate }) {
  const { currentUser } = useAuth();
  const studentId = currentUser?.linkedId;
  const student = store.students.find(s => s.id === studentId);

  const navSections = [
    {
      label: 'My Portal',
      items: [
        { path: '/student',           icon: LayoutDashboard, label: 'Overview' },
        { path: '/student/grades',    icon: Award,           label: 'My Grades' },
        { path: '/student/attendance',icon: ClipboardList,   label: 'Attendance' },
        { path: '/student/sports',    icon: Trophy,          label: 'Sports & Clubs' },
        { path: '/student/events',    icon: Calendar,        label: 'Events' },
        { path: '/student/report',    icon: FileText,        label: 'Report Card' },
        { path: '/student/resources', icon: FileText,        label: 'Resources' },
        { path: '/student/timetable', icon: Calendar,        label: 'My Timetable' },
          ]
    }
  ];

  const props = { store, studentId, student };

  return (
    <DashboardShell navSections={navSections} brandLabel={`Student — ${student?.firstName || ''} ${student?.lastName || ''}`}>
      <Routes>
        <Route path="/"            element={<StudentHome {...props} />} />
        <Route path="/grades"      element={<StudentGrades {...props} />} />
        <Route path="/attendance"  element={<StudentAttendance {...props} />} />
        <Route path="/sports"      element={<StudentSports {...props} />} />
        <Route path="/events"      element={<StudentEvents {...props} />} />
        <Route path="/report"      element={<StudentReportCard {...props} />} />
        <Route path="/resources"   element={<StudentResources store={store} student={student} />} />
        <Route path="/timetable"   element={<StudentTimetable store={store} student={student} />} />
        <Route path="*"            element={<Navigate to="/student" replace />} />
      </Routes>
    </DashboardShell>
  );
}
