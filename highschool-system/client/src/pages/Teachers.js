import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TeacherModal = ({ teacher, onClose, onSave }) => {
  const [form, setForm] = useState(teacher || { firstName:'',lastName:'',email:'',phone:'',subjects:'',grades:'',qualification:'',hireDate:'',salary:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, subjects: typeof form.subjects === 'string' ? form.subjects.split(',').map(s=>s.trim()) : form.subjects, grades: typeof form.grades === 'string' ? form.grades.split(',').map(s=>s.trim()) : form.grades };
      if (teacher) await api.put(`/teachers/${teacher.id}`, payload);
      else await api.post('/teachers', payload);
      onSave();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{teacher ? 'Edit Teacher' : 'Add Teacher'}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} required/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">Subjects (comma separated)</label><input className="form-input" value={Array.isArray(form.subjects)?form.subjects.join(', '):form.subjects} onChange={e=>setForm({...form,subjects:e.target.value})} placeholder="Mathematics, Physics"/></div>
            <div className="form-group"><label className="form-label">Grades (comma separated)</label><input className="form-input" value={Array.isArray(form.grades)?form.grades.join(', '):form.grades} onChange={e=>setForm({...form,grades:e.target.value})} placeholder="10, 11, 12"/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={form.qualification} onChange={e=>setForm({...form,qualification:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Salary</label><input type="number" className="form-input" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">Hire Date</label><input type="date" className="form-input" value={form.hireDate} onChange={e=>setForm({...form,hireDate:e.target.value})}/></div>
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

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const { user } = useAuth();

  const load = () => api.get('/teachers').then(r => setTeachers(r.data));
  useEffect(() => { load(); }, []);

  const filtered = teachers.filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header"><h2>Teachers</h2><p>{teachers.length} staff members</p></div>
      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search teachers..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {user?.role==='admin' && <button className="btn btn-primary" onClick={()=>{setEditTeacher(null);setShowModal(true);}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Teacher
          </button>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,var(--green),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',flexShrink:0}}>
                  {t.firstName[0]}{t.lastName[0]}
                </div>
                <div>
                  <div style={{fontWeight:'700',fontSize:'16px'}}>{t.firstName} {t.lastName}</div>
                  <div style={{fontSize:'12px',color:'var(--text3)'}}>{t.id}</div>
                </div>
                <span className={`badge ${t.status==='Active'?'badge-green':'badge-red'}`} style={{marginLeft:'auto'}}>{t.status}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {(Array.isArray(t.subjects)?t.subjects:[t.subjects]).map(s=><span key={s} className="badge badge-blue">{s}</span>)}
              </div>
              <div style={{fontSize:'13px',color:'var(--text2)',display:'flex',flexDirection:'column',gap:'4px'}}>
                <div><span style={{color:'var(--text3)'}}>Grades: </span>{Array.isArray(t.grades)?t.grades.join(', '):t.grades}</div>
                <div><span style={{color:'var(--text3)'}}>Qualification: </span>{t.qualification}</div>
                <div><span style={{color:'var(--text3)'}}>Email: </span>{t.email}</div>
                <div><span style={{color:'var(--text3)'}}>Hire Date: </span>{t.hireDate}</div>
              </div>
              {user?.role==='admin' && (
                <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                  <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={()=>{setEditTeacher(t);setShowModal(true);}}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={async()=>{if(window.confirm('Remove teacher?')){await api.delete(`/teachers/${t.id}`);load();}}}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showModal && <TeacherModal teacher={editTeacher} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load();}}/>}
    </div>
  );
};

export default Teachers;
