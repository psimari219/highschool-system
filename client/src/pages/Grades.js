import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GradeModal = ({ grade, students, classes, onClose, onSave }) => {
  const [form, setForm] = useState(grade || { studentId:'',classId:'',subject:'',term:'Term 1',score:'',maxScore:100,type:'Exam',date:new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (grade) await api.put(`/grades/${grade.id}`, { ...form, score: parseFloat(form.score), maxScore: parseFloat(form.maxScore) });
      else await api.post('/grades', { ...form, score: parseFloat(form.score), maxScore: parseFloat(form.maxScore) });
      onSave();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{grade ? 'Edit Grade' : 'Record Grade'}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Student</label>
              <select className="form-input" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName} (Grade {s.grade})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Class</label>
                <select className="form-input" value={form.classId} onChange={e=>{const cls=classes.find(c=>c.id===e.target.value);setForm({...form,classId:e.target.value,subject:cls?.subject||form.subject});}}>
                  <option value="">Select Class</option>
                  {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Score</label><input type="number" className="form-input" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Max Score</label><input type="number" className="form-input" value={form.maxScore} onChange={e=>setForm({...form,maxScore:e.target.value})}/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  {['Exam','CAT','Quiz','Homework','Project','Practical'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Term</label>
                <select className="form-input" value={form.term} onChange={e=>setForm({...form,term:e.target.value})}>
                  {['Term 1','Term 2','Term 3'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState({ studentId:'', term:'', type:'' });
  const [showModal, setShowModal] = useState(false);
  const [editGrade, setEditGrade] = useState(null);
  const [tab, setTab] = useState('grades');
  const [gpaData, setGpaData] = useState([]);
  const { user } = useAuth();

  const load = () => {
    const params = new URLSearchParams();
    if (filter.studentId) params.append('studentId', filter.studentId);
    if (filter.term) params.append('term', filter.term);
    api.get(`/grades?${params}`).then(r=>setGrades(r.data));
  };

  useEffect(() => {
    api.get('/students').then(r=>{
      setStudents(r.data);
      setGpaData(r.data.map(s=>({ name:`${s.firstName} ${s.lastName}`, gpa: parseFloat(s.gpa)||0, grade:`Grade ${s.grade}` })));
    });
    api.get('/classes').then(r=>setClasses(r.data));
  }, []);

  useEffect(() => { load(); }, [filter]);

  const getStudentName = id => { const s=students.find(s=>s.id===id); return s?`${s.firstName} ${s.lastName}`:'Unknown'; };
  const getGradeBadge = g => { if(g.startsWith('A'))return'badge-green'; if(g.startsWith('B'))return'badge-blue'; if(g.startsWith('C'))return'badge-yellow'; return'badge-red'; };

  return (
    <div>
      <div className="page-header"><h2>Grades & GPA</h2><p>Academic performance tracking</p></div>
      <div className="page-body">
        <div className="tabs">
          <div className={`tab ${tab==='grades'?'active':''}`} onClick={()=>setTab('grades')}>Grade Records</div>
          <div className={`tab ${tab==='gpa'?'active':''}`} onClick={()=>setTab('gpa')}>GPA Analysis</div>
        </div>

        {tab === 'grades' && <>
          <div className="toolbar">
            <select className="form-input" style={{width:'200px'}} value={filter.studentId} onChange={e=>setFilter({...filter,studentId:e.target.value})}>
              <option value="">All Students</option>
              {students.map(s=><option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
            <select className="form-input" style={{width:'140px'}} value={filter.term} onChange={e=>setFilter({...filter,term:e.target.value})}>
              <option value="">All Terms</option>
              {['Term 1','Term 2','Term 3'].map(t=><option key={t}>{t}</option>)}
            </select>
            {['admin','teacher'].includes(user?.role) && (
              <button className="btn btn-primary" onClick={()=>{setEditGrade(null);setShowModal(true);}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Record Grade
              </button>
            )}
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Subject</th><th>Type</th><th>Score</th><th>Letter</th><th>Term</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {grades.map(g=>(
                    <tr key={g.id}>
                      <td style={{fontWeight:'600'}}>{getStudentName(g.studentId)}</td>
                      <td>{g.subject}</td>
                      <td><span className="badge badge-purple">{g.type}</span></td>
                      <td style={{fontFamily:'JetBrains Mono'}}>{g.score}/{g.maxScore} <span style={{color:'var(--text3)',fontSize:'12px'}}>({Math.round(g.score/g.maxScore*100)}%)</span></td>
                      <td><span className={`badge ${getGradeBadge(g.letterGrade)}`}>{g.letterGrade}</span></td>
                      <td>{g.term}</td>
                      <td style={{color:'var(--text3)',fontSize:'13px'}}>{g.date}</td>
                      <td>{['admin','teacher'].includes(user?.role) && (
                        <div style={{display:'flex',gap:'6px'}}>
                          <button className="btn btn-secondary btn-sm" onClick={()=>{setEditGrade(g);setShowModal(true);}}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={async()=>{if(window.confirm('Delete?')){await api.delete(`/grades/${g.id}`);load();}}}>Del</button>
                        </div>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {tab === 'gpa' && <>
          <div className="stat-grid">
            {students.map(s=>{
              const gpa=parseFloat(s.gpa)||0;
              const color=gpa>=3.5?'var(--green)':gpa>=2.5?'var(--accent2)':gpa>=1.5?'var(--yellow)':'var(--red)';
              return (
                <div key={s.id} className="card" style={{textAlign:'center'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',margin:'0 auto 10px'}}>
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div style={{fontWeight:'600',fontSize:'14px'}}>{s.firstName} {s.lastName}</div>
                  <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'10px'}}>Grade {s.grade}{s.section}</div>
                  <div style={{fontSize:'32px',fontWeight:'800',color,fontFamily:'JetBrains Mono'}}>{gpa.toFixed(2)}</div>
                  <div style={{fontSize:'11px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.5px'}}>GPA</div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="card-title">GPA Distribution</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gpaData}>
                <XAxis dataKey="name" tick={{fill:'var(--text2)',fontSize:11}} angle={-20} textAnchor="end" height={60}/>
                <YAxis domain={[0,4]} tick={{fill:'var(--text2)',fontSize:12}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text)'}}/>
                <Bar dataKey="gpa" fill="var(--accent)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}
      </div>
      {showModal && <GradeModal grade={editGrade} students={students} classes={classes} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load();}}/>}
    </div>
  );
};

export default Grades;
