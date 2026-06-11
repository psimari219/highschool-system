import React, { useState } from 'react';
import { ArrowLeft, Edit2, Mail, Phone, MapPin, User, Award, Activity, Trophy } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { calculateGPA, scoreToGrade, GRADE_SCALE } from '../../data/store';

export default function StudentDetail({ student, store, onBack, onEdit }) {
  const [tab, setTab] = useState('overview');
  const studentGrades = store.grades.filter(g => g.studentId === student.id);
  const studentAttendance = store.attendance.filter(a => a.studentId === student.id);
  const studentSports = store.sports.filter(s => s.members.includes(student.id));
  const gpa = calculateGPA(studentGrades);
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = studentAttendance.length ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

  const gpaClass = gpa >= 3.5 ? 'gpa-excellent' : gpa >= 3.0 ? 'gpa-good' : gpa >= 2.0 ? 'gpa-average' : 'gpa-poor';

  const cls = store.classes.find(c => c.grade === student.grade && c.stream === student.stream);

  return (
    <div>
      <Topbar
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Student Profile · ${student.id}`}
        school={store.school}
        actions={
          <button className="btn btn-primary" onClick={onEdit}>
            <Edit2 size={14} /> Edit Student
          </button>
        }
      />
      <div className="page-content animate-in">
        <button className="back-link" onClick={onBack}><ArrowLeft size={14} /> Back to Students</button>

        {/* Header card */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'white'
          }}>
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
              {student.firstName} {student.lastName}
            </h2>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">Grade {student.grade}{student.stream}</span>
              <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{student.status}</span>
              <span className="badge badge-info">{student.id}</span>
              <span className="badge badge-info">{cls?.name || 'No Class'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
            <div>
              <div className={`gpa-badge ${gpaClass}`}>{gpa}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>GPA</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                border: `3px solid ${attendanceRate >= 90 ? 'var(--success)' : attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)',
                color: attendanceRate >= 90 ? 'var(--success)' : attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)'
              }}>{attendanceRate}%</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Attendance</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'grades', 'attendance', 'sports'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Personal Information</div>
              {[
                { icon: User, label: 'Full Name', val: `${student.firstName} ${student.lastName}` },
                { icon: User, label: 'Date of Birth', val: student.dob },
                { icon: User, label: 'Gender', val: student.gender },
                { icon: User, label: 'National ID', val: student.nationalId || '—' },
                { icon: MapPin, label: 'Address', val: student.address || '—' },
                { icon: User, label: 'Enrollment Date', val: student.enrollmentDate },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <row.icon size={14} color="var(--text3)" />
                  <span style={{ color: 'var(--text3)', fontSize: 12, minWidth: 110 }}>{row.label}</span>
                  <span style={{ color: 'var(--text)', fontSize: 13 }}>{row.val}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Parent/Guardian</div>
              {[
                { icon: User, label: 'Name', val: student.parentName },
                { icon: Phone, label: 'Phone', val: student.parentPhone || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <row.icon size={14} color="var(--text3)" />
                  <span style={{ color: 'var(--text3)', fontSize: 12, minWidth: 80 }}>{row.label}</span>
                  <span style={{ color: 'var(--text)', fontSize: 13 }}>{row.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <div className="card-title" style={{ marginBottom: 12 }}>Sports & Activities</div>
                {studentSports.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>Not enrolled in any sport</p> :
                  studentSports.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Trophy size={14} color="var(--accent2)" />
                      <span style={{ fontSize: 13 }}>{s.name}</span>
                      <span className="badge badge-warning">{s.type}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {tab === 'grades' && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="card-title">Academic Results</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>GPA:</span>
                <span className={`gpa-badge ${gpaClass}`} style={{ width: 44, height: 44, fontSize: 15 }}>{gpa}</span>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Points</th><th>Exam Type</th></tr></thead>
                <tbody>
                  {studentGrades.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>No grades recorded</td></tr>
                  ) : studentGrades.map(g => {
                    const gs = scoreToGrade(g.score);
                    return (
                      <tr key={g.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{g.subject}</td>
                        <td>{g.term}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: g.score >= 80 ? 'var(--success)' : g.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{g.score}%</span>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className={`progress-fill ${g.score >= 80 ? 'progress-green' : g.score >= 60 ? 'progress-amber' : 'progress-red'}`} style={{ width: `${g.score}%` }} />
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge ${g.score >= 80 ? 'badge-success' : g.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>{gs.grade}</span></td>
                        <td style={{ fontWeight: 600 }}>{gs.points}</td>
                        <td style={{ color: 'var(--text3)' }}>{g.examType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'attendance' && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
              <div className="card-title">Attendance Record</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[
                  { label: 'Present', val: presentCount, color: 'var(--success)' },
                  { label: 'Absent', val: studentAttendance.filter(a => a.status === 'Absent').length, color: 'var(--danger)' },
                  { label: 'Late', val: studentAttendance.filter(a => a.status === 'Late').length, color: 'var(--warning)' },
                  { label: 'Rate', val: `${attendanceRate}%`, color: 'var(--primary)' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: item.color }}>{item.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                <tbody>
                  {studentAttendance.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>No attendance records</td></tr>
                  ) : studentAttendance.map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.subject}</td>
                      <td><span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'sports' && (
          <div>
            {studentSports.length === 0 ? (
              <div className="card empty-state">
                <Trophy size={40} />
                <h3>No Sports/Activities</h3>
                <p>This student has not been added to any sports teams or clubs.</p>
              </div>
            ) : studentSports.map(sport => (
              <div key={sport.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: 12 }}>
                    <Trophy size={20} color="var(--accent2)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{sport.name}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 13 }}>{sport.schedule} · {sport.venue}</div>
                  </div>
                  <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>{sport.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
