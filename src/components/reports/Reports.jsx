import React, { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { calculateGPA, scoreToGrade } from '../../data/store';

export default function Reports({ store }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [term, setTerm] = useState(store.school.currentTerm);

  const student = store.students.find(s => s.id === selectedStudent);
  const studentGrades = store.grades.filter(g => g.studentId === selectedStudent && g.term === term);
  const studentAttendance = store.attendance.filter(a => a.studentId === selectedStudent);
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = studentAttendance.length ? Math.round((presentCount / studentAttendance.length) * 100) : 0;
  const gpa = calculateGPA(studentGrades);
  const cls = student ? store.classes.find(c => c.grade === student.grade && c.stream === student.stream) : null;
  const classTeacher = cls ? store.teachers.find(t => t.id === cls.classTeacherId) : null;
  const sports = store.sports.filter(s => s.members.includes(selectedStudent));

  function printReport() {
    window.print();
  }

  return (
    <div>
      <Topbar title="Reports" subtitle="Student academic report cards" school={store.school}
        actions={selectedStudent && <button className="btn btn-primary" onClick={printReport}><Download size={14} /> Print Report</button>}
      />
      <div className="page-content animate-in">
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Student</label>
              <select className="form-control" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                <option value="">Choose a student...</option>
                {store.students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — Grade {s.grade}{s.stream}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Term</label>
              <select className="form-control" value={term} onChange={e => setTerm(e.target.value)}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </div>
          </div>
        </div>

        {!selectedStudent && (
          <div className="card empty-state">
            <FileText size={40} />
            <h3>Select a Student</h3>
            <p>Choose a student above to generate their report card.</p>
          </div>
        )}

        {student && (
          <div className="card animate-in" id="report-card" style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginBottom: 4 }}>
                {store.school.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>{store.school.address}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12, color: 'var(--text)' }}>
                ACADEMIC REPORT CARD
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{store.school.currentYear} · {term}</div>
            </div>

            {/* Student info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, background: 'var(--bg3)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
              {[
                { label: 'Student Name', val: `${student.firstName} ${student.lastName}` },
                { label: 'Student ID', val: student.id },
                { label: 'Class', val: cls?.name || `Grade ${student.grade}${student.stream}` },
                { label: 'Class Teacher', val: classTeacher ? `${classTeacher.firstName} ${classTeacher.lastName}` : '—' },
                { label: 'Gender', val: student.gender },
                { label: 'Date of Birth', val: student.dob },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 12, minWidth: 120 }}>{item.label}:</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Grades table */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                Academic Performance
              </div>
              {studentGrades.length === 0 ? (
                <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No grades recorded for {term}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)' }}>
                      {['Subject', 'Score', 'Grade', 'Points', 'Remark'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map(g => {
                      const gs = scoreToGrade(g.score);
                      return (
                        <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{g.subject}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: g.score >= 80 ? 'var(--success)' : g.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{g.score}%</td>
                          <td style={{ padding: '10px 12px' }}><span className={`badge ${g.score >= 80 ? 'badge-success' : g.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>{gs.grade}</span></td>
                          <td style={{ padding: '10px 12px', fontWeight: 700 }}>{gs.points}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text3)', fontSize: 12 }}>{gs.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg3)', fontWeight: 700 }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text)' }}>OVERALL</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{studentGrades.length > 0 ? Math.round(studentGrades.reduce((a, g) => a + g.score, 0) / studentGrades.length) + '%' : '—'}</td>
                      <td colSpan={2} style={{ padding: '10px 12px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: gpa >= 3.5 ? 'var(--success)' : gpa >= 3.0 ? 'var(--primary)' : gpa >= 2.0 ? 'var(--warning)' : 'var(--danger)' }}>
                          GPA: {gpa}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Attendance & Sports */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Attendance</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>{presentCount}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Present</div></div>
                  <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>{studentAttendance.length - presentCount}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Absent</div></div>
                  <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{attendanceRate}%</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Rate</div></div>
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Sports & Activities</div>
                {sports.length === 0
                  ? <div style={{ fontSize: 12, color: 'var(--text3)' }}>None</div>
                  : sports.map(s => <div key={s.id} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3 }}>• {s.name}</div>)
                }
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, textAlign: 'center' }}>
              {['Class Teacher', 'Head of Department', 'Principal'].map(sig => (
                <div key={sig}>
                  <div style={{ borderBottom: '1px solid var(--text3)', marginBottom: 6, height: 36 }} />
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sig}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
