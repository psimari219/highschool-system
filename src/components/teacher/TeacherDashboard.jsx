import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardShell from '../layout/DashboardShell';
import { LayoutDashboard, BookOpen, ClipboardList, BookMarked, Award, FileText, Calendar, Users, MessageSquare, Zap } from 'lucide-react';
import TeacherHome from './TeacherHome';
import TeacherClasses from './TeacherClasses';
import TeacherAttendance from './TeacherAttendance';
import TeacherGrades from './TeacherGrades';
import TeacherSchemes from './TeacherSchemes';
import TeacherReports from './TeacherReports';
import TeacherResources from './TeacherResources';
import TeacherStudents from './TeacherStudents';
import TeacherTimetable from './TeacherTimetable';
import TeacherRequests from './TeacherRequests';
import TeacherPersonalPlans from './TeacherPersonalPlans';
import TeacherAITools from './TeacherAITools';
import MessagesPage from '../messages/MessagesPage';

export default function TeacherDashboard({ store, onUpdate }) {
  const { currentUser } = useAuth();
  const teacherId = currentUser?.linkedId;
  const teacher = store.teachers.find(t => t.id === teacherId);

  // Classes this teacher is responsible for (class teacher OR subject assignment)
  const myAssignments = (store.subjectAssignments || []).filter(a => a.teacherId === teacherId);
  const myClassIds = [...new Set([
    ...store.classes.filter(c => c.classTeacherId === teacherId).map(c => c.id),
    ...myAssignments.map(a => a.classId)
  ])];
  const myClasses = store.classes.filter(c => myClassIds.includes(c.id));

  const navSections = [
    {
      label: 'Overview',
      items: [{ path: '/teacher', icon: LayoutDashboard, label: 'My Dashboard' }]
    },
    {
      label: 'Teaching',
      items: [
        { path: '/teacher/classes',    icon: BookOpen,      label: 'My Classes', badge: myClasses.length },
        { path: '/teacher/students',   icon: Users,         label: 'My Students' },
        { path: '/teacher/attendance', icon: ClipboardList, label: 'Attendance' },
        { path: '/teacher/grades',     icon: Award,         label: 'Grades' },
        { path: '/teacher/schemes',    icon: BookMarked,    label: 'Schemes of Work' },
        { path: '/teacher/reports',    icon: FileText,      label: 'Reports' },
        { path: '/teacher/resources',  icon: FileText,      label: 'Resources' },
        { path: '/teacher/timetable',  icon: Calendar,      label: 'My Timetable' },
        { path: '/teacher/requests',   icon: FileText,      label: 'Requests' },
        { path: '/teacher/messages',   icon: MessageSquare, label: 'Messages' },
        { path: '/teacher/personal-plans', icon: BookOpen,   label: 'Student Plans' },
        { path: '/teacher/ai-tools',   icon: Zap,           label: '🤖 AI Tools' },
      ]
    }
  ];

  const sharedProps = { store, onUpdate, teacherId, teacher, myClasses, myAssignments };

  return (
    <DashboardShell navSections={navSections} brandLabel={`Teacher — ${teacher?.firstName || ''} ${teacher?.lastName || ''}`}>
      <Routes>
        <Route path="/"           element={<TeacherHome {...sharedProps} />} />
        <Route path="/classes"    element={<TeacherClasses {...sharedProps} />} />
        <Route path="/students"   element={<TeacherStudents {...sharedProps} />} />
        <Route path="/attendance" element={<TeacherAttendance {...sharedProps} />} />
        <Route path="/grades"     element={<TeacherGrades {...sharedProps} />} />
        <Route path="/schemes"    element={<TeacherSchemes {...sharedProps} />} />
        <Route path="/reports"    element={<TeacherReports {...sharedProps} />} />
        <Route path="/requests" element={<TeacherRequests {...sharedProps} />} />
        <Route path="/messages" element={<MessagesPage {...sharedProps} />} />
        <Route path="/resources" element={<TeacherResources {...sharedProps} teacherId={teacherId} myClasses={myClasses} />} />
        <Route path="/personal-plans" element={<TeacherPersonalPlans {...sharedProps} />} />
        <Route path="/timetable"  element={<TeacherTimetable store={store} teacherId={teacherId} />} />
        <Route path="/ai-tools"   element={<TeacherAITools {...sharedProps} />} />
        <Route path="*"           element={<Navigate to="/teacher" replace />} />
      </Routes>
    </DashboardShell>
  );
}
