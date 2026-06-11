import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, ClipboardList, ChevronRight } from 'lucide-react';
import { calculateGPA } from '../../data/store';

export default function TeacherHome({ store, teacherId, teacher, myClasses, myAssignments }) {
  const navigate = useNavigate();
  const base = '/teacher';

  // All students in my classes
  const myStudentIds = new Set(myClasses.flatMap(cls =>
    store.students.filter(s => s.grade === cls.grade && s.stream === cls.stream).map(s => s.id)
  ));
  const myStudents = store.students.filter(s => myStudentIds.has(s.id));

  // My grades
  const myGrades = store.grades.filter(g => g.teacherId === teacherId);
  const myAttendance = store.attendance.filter(a => myClasses.some(c => c.id === a.classId));
  const attendanceRate = myAttendance.length
    ? Math.round((myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-content animate-in">
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,214,160,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
              Good day, {teacher?.firstName}! 👋
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>{today}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              {(teacher?.subjects || []).map(s => <span key={s} className="badge badge-primary">{s}</span>)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Teacher ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{teacherId}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="stat-card blue" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/classes`)}>
          <div className="stat-icon blue"><BookOpen size={20} /></div>
          <div className="stat-value">{myClasses.length}</div>
          <div className="stat-label">My Classes</div>
        </div>
        <div className="stat-card green" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/students`)}>
          <div className="stat-icon green"><Users size={20} /></div>
          <div className="stat-value">{myStudents.length}</div>
          <div className="stat-label">My Students</div>
        </div>
        <div className="stat-card amber" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/grades`)}>
          <div className="stat-icon amber"><Award size={20} /></div>
          <div className="stat-value">{myGrades.length}</div>
          <div className="stat-label">Grades Entered</div>
        </div>
        <div className="stat-card cyan" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/attendance`)}>
          <div className="stat-icon cyan"><ClipboardList size={20} /></div>
          <div className="stat-value">{attendanceRate}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* My classes */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Classes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/classes`)}>View All <ChevronRight size={12} /></button>
          </div>
          {myClasses.map(cls => {
            const studentCount = store.students.filter(s => s.grade === cls.grade && s.stream === cls.stream).length;
            const mySubjectsInClass = myAssignments.filter(a => a.classId === cls.id).map(a => a.subject);
            const isClassTeacher = cls.classTeacherId === teacherId;
            return (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--primary-glow)', borderRadius: 10, padding: 10 }}>
                  <BookOpen size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{cls.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {studentCount} students · {cls.room}
                    {isClassTeacher && <span className="badge badge-success" style={{ marginLeft: 6, fontSize: 9 }}>Class Teacher</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {mySubjectsInClass.map(s => <span key={s} className="badge badge-primary" style={{ fontSize: 9 }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>{studentCount}</div>
              </div>
            );
          })}
          {myClasses.length === 0 && <div style={{ color: 'var(--text3)', textAlign:'center', padding: 24, fontSize: 13 }}>No classes assigned</div>}
        </div>

        {/* Recent grades I entered */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Grades</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/grades`)}>View All <ChevronRight size={12} /></button>
          </div>
          {myGrades.slice(-6).reverse().map(g => {
            const student = store.students.find(s => s.id === g.studentId);
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-blue" style={{ width: 30, height: 30, fontSize: 11 }}>
                  {student?.firstName[0]}{student?.lastName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{student?.firstName} {student?.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{g.subject} · {g.term}</div>
                </div>
                <span className={`badge ${g.score >= 80 ? 'badge-success' : g.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                  {g.score}%
                </span>
              </div>
            );
          })}
          {myGrades.length === 0 && <div style={{ color: 'var(--text3)', textAlign:'center', padding: 24, fontSize: 13 }}>No grades entered yet</div>}
        </div>
      </div>

      {/* Announcements */}
      {(store.announcements||[]).length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Announcements</div>
          {(store.announcements||[]).map(a => (
            <div key={a.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, borderLeft: '3px solid var(--primary)' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{a.body}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{a.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
