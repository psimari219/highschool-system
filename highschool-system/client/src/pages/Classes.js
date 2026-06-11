import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ClassModal = ({ cls, teachers, onClose, onSave }) => {
  const [form, setForm] = useState(cls || { name:'',subject:'',grade:'9',section:'A',teacherId:'',schedule:'',room:'',capacity:30 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (cls) await api.put(`/classes/${cls.id}`, form);
      else await api.post('/classes', form);
      onSave();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{cls ? 'Edit Class' : 'Create Class'}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Class Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Mathematics 10A" required/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Teacher</label>
                <select className="form-input" value={form.teacherId} onChange={e=>setForm({...form,teacherId:e.target.value})} required>
                  <option value="">Select Teacher</option>
                  {teachers.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Grade</label>
                <select className="form-input" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>
                  {['9','10','11','12'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Section</label>
                <select className="form-input" value={form.section} onChange={e=>setForm({...form,section:e.target.value})}>
                  {['A','B','C','D'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Schedule</label><input className="form-input" value={form.schedule} onChange={e=>setForm({...form,schedule:e.target.value})} placeholder="Mon/Wed/Fri 08:00-09:00"/></div>
              <div className="form-group"><label className="form-label">Room</label><input className="form-input" value={form.room} onChange={e=>setForm({...form,room:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">Capacity</label><input type="number" className="form-input" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value)})}/></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCls, setEditCls] = useState(null);
  const { user } = useAuth();

  const load = () => {
    api.get('/classes').then(r=>setClasses(r.data));
    api.get('/teachers').then(r=>setTeachers(r.data));
  };
  useEffect(()=>{ load(); },[]);

  const filtered = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header"><h2>Classes</h2><p>{classes.length} classes registered</p></div>
      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search classes..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {user?.role==='admin' && <button className="btn btn-primary" onClick={()=>{setEditCls(null);setShowModal(true);}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Class
          </button>}
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Class Name</th><th>Subject</th><th>Grade</th><th>Teacher</th><th>Schedule</th><th>Room</th><th>Capacity</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontFamily:'JetBrains Mono',fontSize:'12px',color:'var(--text3)'}}>{c.id}</td>
                    <td style={{fontWeight:'600'}}>{c.name}</td>
                    <td><span className="badge badge-blue">{c.subject}</span></td>
                    <td>Grade {c.grade}-{c.section}</td>
                    <td>{c.teacherName}</td>
                    <td style={{fontSize:'12px',color:'var(--text2)'}}>{c.schedule}</td>
                    <td>{c.room}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'60px'}}>
                          <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(c.enrolledCount/c.capacity)*100)}%`,background:'var(--accent)'}}></div></div>
                        </div>
                        <span style={{fontSize:'12px',color:'var(--text3)'}}>{c.enrolledCount}/{c.capacity}</span>
                      </div>
                    </td>
                    <td>
                      {['admin','teacher'].includes(user?.role) && (
                        <div style={{display:'flex',gap:'6px'}}>
                          <button className="btn btn-secondary btn-sm" onClick={()=>{setEditCls(c);setShowModal(true);}}>Edit</button>
                          {user?.role==='admin' && <button className="btn btn-danger btn-sm" onClick={async()=>{if(window.confirm('Delete class?')){await api.delete(`/classes/${c.id}`);load();}}}>Del</button>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && <ClassModal cls={editCls} teachers={teachers} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load();}}/>}
    </div>
  );
};

export default Classes;
