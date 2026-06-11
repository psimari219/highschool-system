import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit2, Trash2, Users, Lock, Unlock } from 'lucide-react';
import Topbar from '../layout/Topbar';
import StudentModal from './StudentModal';
import StudentDetail from './StudentDetail';
import { generateId, generatePassword } from '../../data/store';

const AVATAR_COLORS = ['blue', 'green', 'purple', 'amber'];

export default function Students({ store, onUpdate }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [lastCredentials, setLastCredentials] = useState(null);

  const filtered = useMemo(() => {
    return store.students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.parentName?.toLowerCase().includes(q);
      const matchGrade = !gradeFilter || s.grade === gradeFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchSearch && matchGrade && matchStatus;
    });
  }, [store.students, search, gradeFilter, statusFilter]);

  function handleSave(studentData) {
    const updated = { ...store };
    if (modal === 'add') {
    const newId = generateId('S');
    const pwd = generatePassword(studentData.firstName);
    const tenantId = store.__tenantKey ? store.__tenantKey.replace(/^educore_data_v3_tenant_/, '') : (store.tenants && store.tenants[0] && store.tenants[0].id) || null;
    const newStudent = { ...studentData, id: newId, enrollmentDate: new Date().toISOString().split('T')[0], resultsLocked: false, tenantId };
      updated.students = [...store.students, newStudent];
      // Auto-create login account with tenantId
      updated.users = [...(store.users||[]), { id: newId, role: 'student', username: newId, password: pwd, name: `${studentData.firstName} ${studentData.lastName}`, email: '', linkedId: newId, mustChangePassword: true, tenantId }];
      setLastCredentials({ id: newId, password: pwd, name: `${studentData.firstName} ${studentData.lastName}` });
    } else {
      updated.students = store.students.map(s => s.id === studentData.id ? studentData : s);
    }
    onUpdate(updated);
    setModal(null);
    setSelectedStudent(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this student? This will also remove their login account.')) return;
    onUpdate({ ...store, students: store.students.filter(s => s.id !== id), users: (store.users||[]).filter(u => u.id !== id) });
  }

  function toggleResultsLock(studentId) {
    const updated = { ...store };
    updated.students = store.students.map(s => s.id === studentId ? { ...s, resultsLocked: !s.resultsLocked } : s);
    onUpdate(updated);
  }

  if (detailStudent) {
    const student = store.students.find(s => s.id === detailStudent);
    return <StudentDetail student={student} store={store} onBack={() => setDetailStudent(null)} onEdit={() => { setSelectedStudent(student); setModal('edit'); setDetailStudent(null); }} />;
  }

  return (
    <div>
      <Topbar
        title="Students"
        subtitle={`${store.students.length} enrolled · ${store.students.filter(s=>s.status==='Active').length} active`}
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Student</button>}
      />
      <div className="page-content animate-in">
        {lastCredentials && (
          <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>✓ STUDENT ACCOUNT CREATED</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Name: <strong style={{ color: 'var(--text)' }}>{lastCredentials.name}</strong></div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Login ID: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{lastCredentials.id}</strong> &nbsp;|&nbsp; Password: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{lastCredentials.password}</strong></div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setLastCredentials(null)}>Dismiss</button>
          </div>
        )}

        <div className="filters-row">
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={15} color="var(--text3)" />
            <input placeholder="Search by name, ID, parent..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width:'auto' }} value={gradeFilter} onChange={e=>setGradeFilter(e.target.value)}>
            <option value="">All Grades</option>
            {['9','10','11','12'].map(g=><option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select className="form-control" style={{ width:'auto' }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Active</option><option>Inactive</option><option>Graduated</option>
          </select>
          <span style={{ fontSize:13, color:'var(--text3)', marginLeft:'auto' }}>{filtered.length} results</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {['9','10','11','12'].map(g => {
            const count = store.students.filter(s=>s.grade===g).length;
            return (
              <div key={g} className="card" style={{ padding:14, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ background:'var(--primary-glow)', borderRadius:8, padding:8 }}><Users size={16} color="var(--primary)" /></div>
                <div><div style={{ fontWeight:700, fontSize:20, fontFamily:'var(--font-display)' }}>{count}</div><div style={{ fontSize:12, color:'var(--text3)' }}>Grade {g}</div></div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>ID</th><th>Grade</th><th>Gender</th><th>Parent/Guardian</th><th>Enrolled</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No students found</td></tr>
                ) : filtered.map((student,i) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className={`avatar avatar-${AVATAR_COLORS[i%4]}`}>{student.firstName[0]}{student.lastName[0]}</div>
                        <div><div style={{ fontWeight:600, color:'var(--text)', fontSize:13 }}>{student.firstName} {student.lastName}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{student.nationalId}</div></div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace', fontSize:12, background:'var(--bg3)', padding:'2px 7px', borderRadius:4 }}>{student.id}</span></td>
                    <td><span className="badge badge-primary">Grade {student.grade}{student.stream}</span></td>
                    <td style={{ color:'var(--text2)' }}>{student.gender}</td>
                    <td><div style={{ fontSize:13, color:'var(--text2)' }}>{student.parentName}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{student.parentPhone}</div></td>
                    <td style={{ color:'var(--text2)', fontSize:12 }}>{student.enrollmentDate}</td>
                    <td><span className={`badge ${student.status==='Active'?'badge-success':'badge-warning'}`}><span className={`dot dot-${student.status==='Active'?'green':'amber'}`} />{student.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDetailStudent(student.id)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelectedStudent(student); setModal('edit'); }}><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title={student.resultsLocked ? 'Unlock results' : 'Lock results'} onClick={() => toggleResultsLock(student.id)}>
                          {student.resultsLocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(student.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modal && <StudentModal mode={modal} student={selectedStudent} onSave={handleSave} onClose={() => { setModal(null); setSelectedStudent(null); }} />}
    </div>
  );
}
