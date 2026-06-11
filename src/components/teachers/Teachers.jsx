import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId, generatePassword } from '../../data/store';

const ALL_SUBJECTS = ['Mathematics','Further Mathematics','English Language','English Literature','Physics','Chemistry','Biology','Science','History','Geography','Computer Science','ICT','Art','Music','Physical Education','Business Studies'];

function TeacherModal({ mode, teacher, onSave, onClose }) {
  const [form, setForm] = useState(teacher ? { ...teacher, subjects: teacher.subjects||[] } : { firstName:'', lastName:'', dob:'', gender:'', qualification:'', subjects:[], hireDate:'', status:'Active', phone:'', email:'', nationalId:'', salary:'' });
  function set(f,v){ setForm(x=>({...x,[f]:v})); }
  function toggleSubject(s){ setForm(x=>({...x,subjects:x.subjects.includes(s)?x.subjects.filter(z=>z!==s):[...x.subjects,s]})); }
  function handleSubmit(e){ e.preventDefault(); if(!form.firstName||!form.lastName) return; onSave(form); }
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header"><div className="modal-title">{mode==='add'?'Add New Teacher':'Edit Teacher'}</div><button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dob} onChange={e=>set('dob',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Gender</label><select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Qualification</label><input className="form-control" value={form.qualification} onChange={e=>set('qualification',e.target.value)} placeholder="e.g. BSc Mathematics, PGCE" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Hire Date</label><input type="date" className="form-control" value={form.hireDate} onChange={e=>set('hireDate',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Salary ($)</label><input type="number" className="form-control" value={form.salary} onChange={e=>set('salary',+e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">National ID</label><input className="form-control" value={form.nationalId} onChange={e=>set('nationalId',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}><option>Active</option><option>On Leave</option><option>Inactive</option></select></div>
            </div>
            <div className="form-group">
              <label className="form-label">Subjects Taught</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8,background:'var(--bg3)',padding:12,borderRadius:'var(--radius-sm)',border:'1px solid var(--border)' }}>
                {ALL_SUBJECTS.map(s=>(
                  <button key={s} type="button" onClick={()=>toggleSubject(s)}
                    style={{ padding:'4px 10px',borderRadius:20,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',transition:'all 0.15s',
                      background:form.subjects.includes(s)?'var(--primary)':'transparent',
                      borderColor:form.subjects.includes(s)?'var(--primary)':'var(--border)',
                      color:form.subjects.includes(s)?'white':'var(--text3)' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode==='add'?'Add Teacher':'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Teachers({ store, onUpdate }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastCredentials, setLastCredentials] = useState(null);

  const filtered = useMemo(() =>
    store.teachers.filter(t => {
      const q = search.toLowerCase();
      return !q || t.firstName.toLowerCase().includes(q) || t.lastName.toLowerCase().includes(q) || t.subjects.some(s=>s.toLowerCase().includes(q));
    }), [store.teachers, search]);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      const newId = generateId('T');
      const pwd = generatePassword(data.firstName);
      // attach tenantId when creating from a tenant-scoped store
      const tenantId = store.__tenantKey ? store.__tenantKey.replace(/^educore_data_v3_tenant_/, '') : (store.tenants && store.tenants[0] && store.tenants[0].id) || null;
      updated.teachers = [...store.teachers, { ...data, id: newId, tenantId }];
      updated.users = [...(store.users||[]), { id: newId, role:'teacher', username: newId, password: pwd, name:`${data.firstName} ${data.lastName}`, email: data.email, linkedId: newId, mustChangePassword: true, tenantId }];
      setLastCredentials({ id: newId, password: pwd, name:`${data.firstName} ${data.lastName}` });
    } else {
      updated.teachers = store.teachers.map(t => t.id===data.id ? data : t);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this teacher? This will also remove their login account.')) return;
    onUpdate({ ...store, teachers: store.teachers.filter(t=>t.id!==id), users: (store.users||[]).filter(u=>u.id!==id) });
  }

  const AVATARS = ['blue','green','purple','amber'];

  return (
    <div>
      <Topbar title="Teachers" subtitle={`${store.teachers.length} staff members`} school={store.school}
        actions={<button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={15} /> Add Teacher</button>}
      />
      <div className="page-content animate-in">
        {lastCredentials && (
          <div style={{ background:'rgba(6,214,160,0.08)',border:'1px solid rgba(6,214,160,0.25)',borderRadius:10,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:'var(--accent)',marginBottom:4 }}>✓ TEACHER ACCOUNT CREATED</div>
              <div style={{ fontSize:13,color:'var(--text2)' }}>Name: <strong style={{ color:'var(--text)' }}>{lastCredentials.name}</strong></div>
              <div style={{ fontSize:13,color:'var(--text2)' }}>Login ID: <strong style={{ color:'var(--text)',fontFamily:'monospace' }}>{lastCredentials.id}</strong> &nbsp;|&nbsp; Password: <strong style={{ color:'var(--text)',fontFamily:'monospace' }}>{lastCredentials.password}</strong></div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setLastCredentials(null)}>Dismiss</button>
          </div>
        )}
        <div className="filters-row">
          <div className="search-bar"><Search size={15} color="var(--text3)" /><input placeholder="Search by name or subject..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {filtered.map((teacher,i) => {
            const classes = store.classes.filter(c=>c.classTeacherId===teacher.id);
            return (
              <div key={teacher.id} className="card">
                <div style={{ display:'flex',alignItems:'flex-start',gap:14,marginBottom:14 }}>
                  <div className={`avatar avatar-${AVATARS[i%4]}`} style={{ width:48,height:48,fontSize:16 }}>{teacher.firstName[0]}{teacher.lastName[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>{teacher.firstName} {teacher.lastName}</div>
                    <div style={{ fontSize:12,color:'var(--text3)',marginTop:2 }}>{teacher.id}</div>
                    <div style={{ marginTop:6 }}><span className={`badge ${teacher.status==='Active'?'badge-success':'badge-warning'}`}>{teacher.status}</span></div>
                  </div>
                  <div style={{ display:'flex',gap:4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>{setSelected(teacher);setModal('edit');}}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={()=>handleDelete(teacher.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ marginBottom:12,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11,color:'var(--text3)',marginBottom:4 }}>QUALIFICATION</div>
                  <div style={{ fontSize:12,color:'var(--text2)' }}>{teacher.qualification||'—'}</div>
                </div>
                <div style={{ marginBottom:12,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11,color:'var(--text3)',marginBottom:6 }}>SUBJECTS</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>{teacher.subjects.map(s=><span key={s} className="badge badge-primary">{s}</span>)}</div>
                </div>
                <div style={{ marginBottom:12,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11,color:'var(--text3)',marginBottom:4 }}>CLASS TEACHER FOR</div>
                  {classes.length===0 ? <span style={{ fontSize:12,color:'var(--text3)' }}>Not assigned</span>
                    : classes.map(c=><span key={c.id} className="badge badge-purple" style={{ marginRight:4 }}>{c.name}</span>)}
                </div>
                <div style={{ display:'flex',gap:12 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text3)' }}><Mail size={12} />{teacher.email||'No email'}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text3)' }}><Phone size={12} />{teacher.phone||'No phone'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {modal && <TeacherModal mode={modal} teacher={selected} onSave={handleSave} onClose={()=>{setModal(null);setSelected(null);}} />}
    </div>
  );
}
