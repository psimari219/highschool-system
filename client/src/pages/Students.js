import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GradeBadge = ({gpa}) => {
  const g = parseFloat(gpa);
  const cls = g>=3.5?'badge-green':g>=2.5?'badge-blue':g>=1.5?'badge-yellow':'badge-red';
  return <span className={`badge ${cls}`}>{gpa}</span>;
};

const StudentModal = ({ student, onClose, onSave }) => {
  const [form, setForm] = useState(student || { firstName:'',lastName:'',dob:'',gender:'Male',grade:'9',section:'A',email:'',phone:'',address:'',parentName:'',parentPhone:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (student) await api.put(`/students/${student.id}`, form);
      else await api.post('/students', form);
      onSave();
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{student ? 'Edit Student' : 'Enroll New Student'}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} required/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                  <option>Male</option><option>Female</option><option>Other</option>
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
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Parent/Guardian Name</label><input className="form-input" value={form.parentName} onChange={e=>setForm({...form,parentName:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Parent Phone</label><input className="form-input" value={form.parentPhone} onChange={e=>setForm({...form,parentPhone:e.target.value})}/></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Save Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentDetail = ({ student, onClose }) => {
  const [detail, setDetail] = useState(null);
  useEffect(() => { api.get(`/students/${student.id}`).then(r=>setDetail(r.data)); }, [student.id]);

  if (!detail) return null;
  const gpa = parseFloat(detail.gpa);
  const gpaColor = gpa>=3.5?'var(--green)':gpa>=2.5?'var(--accent2)':gpa>=1.5?'var(--yellow)':'var(--red)';

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">{detail.firstName} {detail.lastName}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{marginBottom:'20px'}}>
            <div className="card" style={{textAlign:'center'}}>
              <div style={{width:'60px',height:'60px',borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',fontWeight:'800',margin:'0 auto 12px'}}>
                {detail.firstName[0]}{detail.lastName[0]}
              </div>
              <div style={{fontWeight:'700',fontSize:'18px'}}>{detail.firstName} {detail.lastName}</div>
              <div style={{color:'var(--text3)',fontSize:'13px',marginTop:'4px'}}>ID: {detail.id} · Grade {detail.grade}{detail.section}</div>
              <div style={{marginTop:'12px'}}>
                <span className={`badge ${detail.status==='Active'?'badge-green':'badge-red'}`}>{detail.status}</span>
              </div>
            </div>
            <div>
              <div style={{fontSize:'40px',fontWeight:'800',color:gpaColor,fontFamily:'JetBrains Mono',textAlign:'center',marginTop:'8px'}}>{detail.gpa}</div>
              <div style={{textAlign:'center',fontSize:'12px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1px'}}>Current GPA</div>
              <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}><span style={{color:'var(--text2)'}}>DOB:</span><span>{detail.dob}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}><span style={{color:'var(--text2)'}}>Email:</span><span>{detail.email}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}><span style={{color:'var(--text2)'}}>Phone:</span><span>{detail.phone}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}><span style={{color:'var(--text2)'}}>Parent:</span><span>{detail.parentName}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}><span style={{color:'var(--text2)'}}>Enrolled:</span><span>{detail.enrollmentDate}</span></div>
              </div>
            </div>
          </div>
          <div style={{marginBottom:'20px'}}>
            <div style={{fontWeight:'600',marginBottom:'12px',fontSize:'14px',color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Academic Records</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Subject</th><th>Type</th><th>Score</th><th>Grade</th><th>Term</th><th>Date</th></tr></thead>
                <tbody>
                  {detail.grades.map(g=>(
                    <tr key={g.id}>
                      <td>{g.subject}</td>
                      <td><span className="badge badge-blue">{g.type}</span></td>
                      <td style={{fontFamily:'JetBrains Mono'}}>{g.score}/{g.maxScore}</td>
                      <td><span className={`badge ${g.letterGrade.startsWith('A')?'badge-green':g.letterGrade.startsWith('B')?'badge-blue':g.letterGrade.startsWith('C')?'badge-yellow':'badge-red'}`}>{g.letterGrade}</span></td>
                      <td>{g.term}</td>
                      <td style={{color:'var(--text3)'}}>{g.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div style={{fontWeight:'600',marginBottom:'12px',fontSize:'14px',color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Sports Teams</div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {detail.sports.length ? detail.sports.map(s=><span key={s.id} className="badge badge-purple">{s.name}</span>) : <span style={{color:'var(--text3)',fontSize:'13px'}}>Not enrolled in any sports</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const { user } = useAuth();

  const load = () => api.get('/students').then(r => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) { await api.delete(`/students/${id}`); load(); }
  };

  const filtered = students.filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (filterGrade ? s.grade === filterGrade : true);
  });

  const canEdit = ['admin', 'teacher'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <h2>Students</h2>
        <p>{students.length} students enrolled</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="form-input" style={{width:'140px'}} value={filterGrade} onChange={e=>setFilterGrade(e.target.value)}>
            <option value="">All Grades</option>
            {['9','10','11','12'].map(g=><option key={g} value={g}>Grade {g}</option>)}
          </select>
          {canEdit && <button className="btn btn-primary" onClick={() => { setEditStudent(null); setShowModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Enroll Student
          </button>}
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Grade</th><th>Section</th><th>Gender</th><th>GPA</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{fontFamily:'JetBrains Mono',fontSize:'12px',color:'var(--text3)'}}>{s.id}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',flexShrink:0}}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <div style={{fontWeight:'600'}}>{s.firstName} {s.lastName}</div>
                          <div style={{fontSize:'12px',color:'var(--text3)'}}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>Grade {s.grade}</td>
                    <td>{s.section}</td>
                    <td>{s.gender}</td>
                    <td><GradeBadge gpa={s.gpa}/></td>
                    <td><span className={`badge ${s.status==='Active'?'badge-green':'badge-red'}`}>{s.status}</span></td>
                    <td>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button className="btn btn-secondary btn-sm" onClick={()=>setViewStudent(s)}>View</button>
                        {canEdit && <button className="btn btn-secondary btn-sm" onClick={()=>{setEditStudent(s);setShowModal(true);}}>Edit</button>}
                        {user?.role==='admin' && <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(s.id)}>Del</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && <StudentModal student={editStudent} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load();}}/>}
      {viewStudent && <StudentDetail student={viewStudent} onClose={()=>setViewStudent(null)}/>}
    </div>
  );
};

export default Students;
