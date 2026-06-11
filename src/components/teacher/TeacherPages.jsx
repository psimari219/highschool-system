import React, { useState, useMemo } from 'react';
import { BookOpen, Users, Plus, Award } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { scoreToGrade, calculateGPA } from '../../data/store';
import { v4 as uuidv4 } from 'uuid';

/* ─── CLASSES ─────────────────────────────────────────── */
export function TeacherClasses({ store, teacherId, myClasses, myAssignments }) {
  return (
    <div>
      <Topbar title="My Classes" subtitle={`${myClasses.length} classes assigned`} school={store.school} />
      <div className="page-content animate-in">
        {myClasses.length === 0 && (
          <div className="card empty-state"><BookOpen size={40} /><h3>No Classes Assigned</h3><p>Contact the administrator to be assigned to classes.</p></div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {myClasses.map(cls => {
            const students = store.students.filter(s => s.grade === cls.grade && s.stream === cls.stream);
            const mySubjects = myAssignments.filter(a => a.classId === cls.id).map(a => a.subject);
            const isClassTeacher = cls.classTeacherId === teacherId;
            const recentGrades = store.grades.filter(g => g.classId === cls.id && g.teacherId === teacherId);
            return (
              <div key={cls.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{cls.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{cls.room}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {isClassTeacher && <span className="badge badge-success" style={{ fontSize: 9 }}>Class Teacher</span>}
                  </div>
                </div>
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>MY SUBJECTS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {mySubjects.length > 0 ? mySubjects.map(s => <span key={s} className="badge badge-primary">{s}</span>) : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Class teacher only</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{students.length}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>Students</div></div>
                  <div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{recentGrades.length}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>Grades</div></div>
                  <div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent2)' }}>{cls.subjects.length}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>Subjects</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── STUDENTS ─────────────────────────────────────────── */
export function TeacherStudents({ store, teacherId, myClasses }) {
  const myStudents = store.students.filter(s =>
    myClasses.some(c => c.grade === s.grade && c.stream === s.stream)
  );
  return (
    <div>
      <Topbar title="My Students" subtitle={`${myStudents.length} students in your classes`} school={store.school} />
      <div className="page-content animate-in">
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Class</th><th>Gender</th><th>Parent</th><th>Status</th></tr></thead>
              <tbody>
                {myStudents.map((s, i) => {
                  const cls = myClasses.find(c => c.grade === s.grade && c.stream === s.stream);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{s.firstName[0]}{s.lastName[0]}</div>
                          <div><div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.firstName} {s.lastName}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.id}</div></div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{cls?.name}</span></td>
                      <td style={{ color: 'var(--text2)' }}>{s.gender}</td>
                      <td><div style={{ fontSize: 12 }}>{s.parentName}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.parentPhone}</div></td>
                      <td><span className={`badge ${s.status==='Active'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GRADES ─────────────────────────────────────────── */
export function TeacherGrades({ store, onUpdate, teacherId, myClasses, myAssignments }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', subject: '', term: store.school.currentTerm, score: '', examType: 'End of Term', classId: '' });
  function setF(f, v) { setForm(x => ({ ...x, [f]: v })); }

  const myStudents = store.students.filter(s => myClasses.some(c => c.grade === s.grade && c.stream === s.stream));
  const myGrades = store.grades.filter(g => g.teacherId === teacherId);

  function handleSave(e) {
    e.preventDefault();
    const score = parseFloat(form.score);
    if (isNaN(score) || score < 0 || score > 100) { alert('Score must be 0–100'); return; }
    const gs = scoreToGrade(score);
    const cls = store.students.find(s=>s.id===form.studentId);
    const clsObj = cls ? store.classes.find(c=>c.grade===cls.grade&&c.stream===cls.stream) : null;
    onUpdate({ ...store, grades: [...store.grades, { ...form, id: uuidv4(), score, grade: gs.grade, teacherId, year: store.school.currentYear, classId: form.classId || clsObj?.id || '' }] });
    setModal(false);
    setForm({ studentId:'', subject:'', term: store.school.currentTerm, score:'', examType:'End of Term', classId:'' });
  }

  const selectedStudent = store.students.find(s=>s.id===form.studentId);
  const availableSubjects = selectedStudent
    ? myAssignments.filter(a => { const cls = store.classes.find(c=>c.grade===selectedStudent.grade&&c.stream===selectedStudent.stream); return cls && a.classId===cls.id; }).map(a=>a.subject)
    : [];

  return (
    <div>
      <Topbar title="Grades" subtitle="Enter and manage student grades" school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Record Grade</button>}
      />
      <div className="page-content animate-in">
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Points</th><th>Type</th></tr></thead>
              <tbody>
                {myGrades.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No grades recorded yet</td></tr>
                ) : myGrades.map(g => {
                  const student = store.students.find(s=>s.id===g.studentId);
                  const gs = scoreToGrade(g.score);
                  return (
                    <tr key={g.id}>
                      <td><div style={{ fontWeight:600,color:'var(--text)' }}>{student?.firstName} {student?.lastName}</div><div style={{ fontSize:11,color:'var(--text3)' }}>Grade {student?.grade}{student?.stream}</div></td>
                      <td style={{ fontWeight:500,color:'var(--text2)' }}>{g.subject}</td>
                      <td style={{ color:'var(--text3)' }}>{g.term}</td>
                      <td><span style={{ fontWeight:700, color: g.score>=80?'var(--success)':g.score>=60?'var(--warning)':'var(--danger)' }}>{g.score}%</span></td>
                      <td><span className={`badge ${g.score>=80?'badge-success':g.score>=60?'badge-warning':'badge-danger'}`}>{gs.grade}</span></td>
                      <td style={{ fontWeight:700 }}>{gs.points}</td>
                      <td style={{ color:'var(--text3)',fontSize:12 }}>{g.examType}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Record Grade</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-control" value={form.studentId} onChange={e=>setF('studentId',e.target.value)} required>
                    <option value="">Select student</option>
                    {myStudents.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName} (Grade {s.grade}{s.stream})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <select className="form-control" value={form.subject} onChange={e=>setF('subject',e.target.value)} required>
                      <option value="">Select subject</option>
                      {availableSubjects.map(s=><option key={s} value={s}>{s}</option>)}
                      {availableSubjects.length===0 && <option disabled>— Select a student first —</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Score (0–100) *</label>
                    <input type="number" className="form-control" value={form.score} onChange={e=>setF('score',e.target.value)} min={0} max={100} step={0.5} required />
                  </div>
                </div>
                {form.score !== '' && !isNaN(parseFloat(form.score)) && (
                  <div className="alert alert-info">{(()=>{ const gs = scoreToGrade(parseFloat(form.score)); return `Grade: ${gs.grade} · Points: ${gs.points} · ${gs.description}`; })()}</div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Term</label>
                    <select className="form-control" value={form.term} onChange={e=>setF('term',e.target.value)}>
                      <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Exam Type</label>
                    <select className="form-control" value={form.examType} onChange={e=>setF('examType',e.target.value)}>
                      <option>End of Term</option><option>Mid-Term</option><option>Class Test</option><option>Assignment</option><option>Practical</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ATTENDANCE ─────────────────────────────────────────── */
export function TeacherAttendance({ store, onUpdate, teacherId, myClasses }) {
  const [modal, setModal] = useState(false);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [records, setRecords] = useState({});
  const myAttendance = store.attendance.filter(a => myClasses.some(c=>c.id===a.classId));

  const cls = store.classes.find(c=>c.id===classId);
  const classStudents = cls ? store.students.filter(s=>s.grade===cls.grade&&s.stream===cls.stream&&s.status==='Active') : [];

  function markAll(status) { const all={}; classStudents.forEach(s=>{all[s.id]=status;}); setRecords(all); }

  function handleSave(e) {
    e.preventDefault();
    if (!classId||!date||!subject) return;
    const newRecs = classStudents.map(s => ({ id: uuidv4(), studentId: s.id, classId, date, subject, status: records[s.id]||'Present' }));
    onUpdate({ ...store, attendance: [...store.attendance, ...newRecs] });
    setModal(false);
  }

  return (
    <div>
      <Topbar title="Attendance" subtitle="Take and view class registers" school={store.school}
        actions={<button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={15} /> Take Register</button>}
      />
      <div className="page-content animate-in">
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          {[['Present','var(--success)'],[' Absent','var(--danger)'],['Late','var(--warning)']].map(([label,color])=>{
            const count = myAttendance.filter(a=>a.status===label.trim()).length;
            return (
              <div key={label} className="card" style={{ flex:1, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--font-display)', color }}>{count}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{label.trim()}</div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Class</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {myAttendance.length===0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No attendance records yet</td></tr>
                ) : myAttendance.slice(-30).reverse().map(a=>{
                  const student=store.students.find(s=>s.id===a.studentId);
                  const clsObj=store.classes.find(c=>c.id===a.classId);
                  return (
                    <tr key={a.id}>
                      <td><div style={{fontWeight:600,color:'var(--text)'}}>{student?.firstName} {student?.lastName}</div></td>
                      <td>{clsObj?.name}</td>
                      <td style={{color:'var(--text2)'}}>{a.subject}</td>
                      <td style={{color:'var(--text3)',fontSize:12}}>{a.date}</td>
                      <td><span className={`badge ${a.status==='Present'?'badge-success':a.status==='Absent'?'badge-danger':'badge-warning'}`}>{a.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header"><div className="modal-title">Take Register</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row three">
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-control" value={classId} onChange={e=>setClassId(e.target.value)} required>
                      <option value="">Select class</option>
                      {myClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-control" value={subject} onChange={e=>setSubject(e.target.value)} required>
                      <option value="">Select subject</option>
                      {(cls?.subjects||[]).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} required />
                  </div>
                </div>
                {classStudents.length>0 && (
                  <div>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>{classStudents.length} students</span>
                      <div style={{display:'flex',gap:6}}>
                        <button type="button" className="btn btn-success btn-sm" onClick={()=>markAll('Present')}>All Present</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={()=>markAll('Absent')}>All Absent</button>
                      </div>
                    </div>
                    <div style={{maxHeight:300,overflowY:'auto'}}>
                      {classStudents.map(st=>(
                        <div key={st.id} style={{display:'flex',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)',gap:10}}>
                          <div className="avatar avatar-blue" style={{width:28,height:28,fontSize:11}}>{st.firstName[0]}{st.lastName[0]}</div>
                          <span style={{flex:1,fontSize:13}}>{st.firstName} {st.lastName}</span>
                          {['Present','Absent','Late','Excused'].map(s=>(
                            <button key={s} type="button" onClick={()=>setRecords(r=>({...r,[st.id]:s}))}
                              style={{padding:'3px 9px',borderRadius:20,border:'1px solid',fontSize:11,cursor:'pointer',fontFamily:'var(--font-body)',fontWeight:600,transition:'all 0.15s',
                                background:records[st.id]===s||(!records[st.id]&&s==='Present')?s==='Present'?'var(--success)':s==='Absent'?'var(--danger)':s==='Late'?'var(--warning)':'var(--info)':'transparent',
                                borderColor:s==='Present'?'var(--success)':s==='Absent'?'var(--danger)':s==='Late'?'var(--warning)':'var(--info)',
                                color:records[st.id]===s||(!records[st.id]&&s==='Present')?'white':s==='Present'?'var(--success)':s==='Absent'?'var(--danger)':s==='Late'?'var(--warning)':'var(--info)'}}>
                              {s}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SCHEMES ─────────────────────────────────────────── */
export function TeacherSchemes({ store, onUpdate, teacherId, myClasses }) {
  // Reuse same Schemes logic but filtered to this teacher
  const Schemes = require('../schemes/Schemes').default;
  const filteredStore = { ...store, schemes: store.schemes.filter(s=>s.teacherId===teacherId) };
  function handleUpdate(updated) {
    // merge back
    const otherSchemes = store.schemes.filter(s=>s.teacherId!==teacherId);
    onUpdate({ ...updated, schemes: [...otherSchemes, ...updated.schemes] });
  }
  return <Schemes store={filteredStore} onUpdate={handleUpdate} />;
}

/* ─── REPORTS ─────────────────────────────────────────── */
export function TeacherReports({ store, teacherId, myClasses }) {
  const Reports = require('../reports/Reports').default;
  // Teacher can only see reports for their students
  const myStudentIds = new Set(myClasses.flatMap(c => store.students.filter(s=>s.grade===c.grade&&s.stream===c.stream).map(s=>s.id)));
  const filteredStore = { ...store, students: store.students.filter(s=>myStudentIds.has(s.id)) };
  return <Reports store={filteredStore} />;
}

export default { TeacherClasses, TeacherStudents, TeacherGrades, TeacherAttendance, TeacherSchemes, TeacherReports };
