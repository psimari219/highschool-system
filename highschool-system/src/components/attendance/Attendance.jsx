import React, { useState, useMemo } from 'react';
import { Plus, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { v4 as uuidv4 } from 'uuid';

function AttendanceModal({ store, onSave, onClose }) {
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [records, setRecords] = useState({});

  const cls = store.classes.find(c => c.id === classId);
  const classStudents = cls ? store.students.filter(s => s.grade === cls.grade && s.stream === cls.stream && s.status === 'Active') : [];

  function setStatus(studentId, status) {
    setRecords(r => ({ ...r, [studentId]: status }));
  }

  function markAll(status) {
    const all = {};
    classStudents.forEach(s => { all[s.id] = status; });
    setRecords(all);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!classId || !date || !subject) { alert('Please fill all fields'); return; }
    const newRecords = classStudents.map(s => ({
      id: uuidv4(), studentId: s.id, classId, date, subject,
      status: records[s.id] || 'Present'
    }));
    onSave(newRecords);
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">Take Attendance</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row three">
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={classId} onChange={e => setClassId(e.target.value)} required>
                  <option value="">Select class</option>
                  {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">Select subject</option>
                  {(cls?.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>

            {classStudents.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{classStudents.length} students</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-success btn-sm" onClick={() => markAll('Present')}>All Present</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>All Absent</button>
                  </div>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {classStudents.map(student => (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                      <div className="avatar avatar-blue" style={{ width: 32, height: 32, fontSize: 12 }}>{student.firstName[0]}{student.lastName[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{student.firstName} {student.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{student.id}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Present', 'Absent', 'Late', 'Excused'].map(s => (
                          <button key={s} type="button"
                            onClick={() => setStatus(student.id, s)}
                            style={{
                              padding: '4px 10px', borderRadius: 20, border: '1px solid', fontSize: 11, cursor: 'pointer',
                              fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all 0.15s',
                              background: records[student.id] === s || (!records[student.id] && s === 'Present')
                                ? s === 'Present' ? 'var(--success)' : s === 'Absent' ? 'var(--danger)' : s === 'Late' ? 'var(--warning)' : 'var(--info)'
                                : 'transparent',
                              borderColor: s === 'Present' ? 'var(--success)' : s === 'Absent' ? 'var(--danger)' : s === 'Late' ? 'var(--warning)' : 'var(--info)',
                              color: records[student.id] === s || (!records[student.id] && s === 'Present') ? 'white'
                                : s === 'Present' ? 'var(--success)' : s === 'Absent' ? 'var(--danger)' : s === 'Late' ? 'var(--warning)' : 'var(--info)'
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classId && classStudents.length === 0 && (
              <div className="alert alert-warning">No active students found in this class.</div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!classId || !subject}>Save Attendance</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Attendance({ store, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  function handleSave(records) {
    onUpdate({ ...store, attendance: [...store.attendance, ...records] });
    setModal(false);
  }

  // Summary
  const totalPresent = store.attendance.filter(a => a.status === 'Present').length;
  const totalAbsent = store.attendance.filter(a => a.status === 'Absent').length;
  const totalLate = store.attendance.filter(a => a.status === 'Late').length;
  const total = store.attendance.length;
  const rate = total ? Math.round((totalPresent / total) * 100) : 0;

  const filtered = useMemo(() => {
    return store.attendance.filter(a => {
      const student = store.students.find(s => s.id === a.studentId);
      if (!student) return false;
      const q = search.toLowerCase();
      const matchSearch = !q || student.firstName.toLowerCase().includes(q) || student.lastName.toLowerCase().includes(q);
      const matchClass = !classFilter || a.classId === classFilter;
      return matchSearch && matchClass;
    });
  }, [store.attendance, store.students, search, classFilter]);

  return (
    <div>
      <Topbar
        title="Attendance"
        subtitle="Daily register and attendance tracking"
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Take Register</button>}
      />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="stat-card green">
            <div className="stat-icon green"><CheckCircle size={20} /></div>
            <div className="stat-value">{totalPresent}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><XCircle size={20} /></div>
            <div className="stat-value">{totalAbsent}</div>
            <div className="stat-label">Absent</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber"><Clock size={20} /></div>
            <div className="stat-value">{totalLate}</div>
            <div className="stat-label">Late</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><AlertCircle size={20} /></div>
            <div className="stat-value">{rate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>

        <div className="filters-row">
          <div className="search-bar">
            <Search size={15} color="var(--text3)" />
            <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={classFilter} onChange={e => setClassFilter(e.target.value)}>
            <option value="">All Classes</option>
            {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Class</th><th>Subject</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No attendance records found</td></tr>
                ) : filtered.map(a => {
                  const student = store.students.find(s => s.id === a.studentId);
                  const cls = store.classes.find(c => c.id === a.classId);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{student?.firstName} {student?.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{student?.id}</div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{cls?.name || '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{a.subject}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{a.date}</td>
                      <td>
                        <span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Absent' ? 'badge-danger' : a.status === 'Late' ? 'badge-warning' : 'badge-info'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modal && <AttendanceModal store={store} onSave={handleSave} onClose={() => setModal(false)} />}
    </div>
  );
}
