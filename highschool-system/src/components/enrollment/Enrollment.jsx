import React, { useState } from 'react';
import { Plus, School, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';
import { v4 as uuidv4 } from 'uuid';

function EnrollmentModal({ store, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: '', grade: '', stream: 'A',
    parentName: '', parentPhone: '', parentEmail: '', address: '', nationalId: '',
    previousSchool: '', reason: '', documents: [], notes: ''
  });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      id: uuidv4(),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">New Enrollment Application</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              📋 Complete this form to submit an enrollment application. The request will be reviewed by the administration.
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 4 }}>Student Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" value={form.dob} onChange={e => set('dob', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)} required>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Applying for Grade *</label>
                <select className="form-control" value={form.grade} onChange={e => set('grade', e.target.value)} required>
                  <option value="">Select grade</option>
                  <option value="9">Grade 9</option><option value="10">Grade 10</option>
                  <option value="11">Grade 11</option><option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">National ID</label>
                <input className="form-control" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Previous School</label>
              <input className="form-control" value={form.previousSchool} onChange={e => set('previousSchool', e.target.value)} placeholder="Name of previous school" />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 16 }}>Parent/Guardian Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Parent/Guardian Name *</label>
                <input className="form-control" value={form.parentName} onChange={e => set('parentName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Home Address</label>
                <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Enrollment / Notes</label>
              <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any additional information..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><FileText size={14} /> Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Enrollment({ store, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState('pending');

  function handleSave(request) {
    onUpdate({ ...store, enrollmentRequests: [...(store.enrollmentRequests || []), request] });
    setModal(false);
  }

  function approve(id) {
    const req = store.enrollmentRequests.find(r => r.id === id);
    if (!req) return;
    const newStudent = {
      id: generateId('S'),
      firstName: req.firstName,
      lastName: req.lastName,
      dob: req.dob,
      gender: req.gender,
      grade: req.grade,
      stream: req.stream || 'A',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      parentName: req.parentName,
      parentPhone: req.parentPhone,
      address: req.address,
      nationalId: req.nationalId,
      photo: null
    };
    const updatedRequests = store.enrollmentRequests.map(r => r.id === id ? { ...r, status: 'Approved', approvedDate: new Date().toISOString().split('T')[0] } : r);
    onUpdate({ ...store, students: [...store.students, newStudent], enrollmentRequests: updatedRequests });
  }

  function reject(id) {
    const updatedRequests = store.enrollmentRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r);
    onUpdate({ ...store, enrollmentRequests: updatedRequests });
  }

  const requests = store.enrollmentRequests || [];
  const pending = requests.filter(r => r.status === 'Pending');
  const approved = requests.filter(r => r.status === 'Approved');
  const rejected = requests.filter(r => r.status === 'Rejected');
  const shown = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  return (
    <div>
      <Topbar
        title="Enrollment"
        subtitle="Student applications and admissions"
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> New Application</button>}
      />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="stat-card amber">
            <div className="stat-icon amber"><Clock size={20} /></div>
            <div className="stat-value">{pending.length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><CheckCircle size={20} /></div>
            <div className="stat-value">{approved.length}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><XCircle size={20} /></div>
            <div className="stat-value">{rejected.length}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="tabs">
          {[['pending', `Pending (${pending.length})`], ['approved', `Approved (${approved.length})`], ['rejected', `Rejected (${rejected.length})`]].map(([key, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card empty-state">
            <School size={40} />
            <h3>No {tab} applications</h3>
            <p>{tab === 'pending' ? 'All applications have been processed.' : `No ${tab} applications yet.`}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {shown.map(req => (
              <div key={req.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent4))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                      {req.firstName?.[0]}{req.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{req.firstName} {req.lastName}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">Grade {req.grade}</span>
                        <span className={`badge ${req.status === 'Pending' ? 'badge-warning' : req.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>{req.status}</span>
                        <span className="badge badge-info">Applied: {req.submittedDate}</span>
                      </div>
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        {[
                          { label: 'Parent', val: req.parentName },
                          { label: 'Phone', val: req.parentPhone },
                          { label: 'Previous School', val: req.previousSchool || '—' },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                      {req.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>"{req.notes}"</div>}
                    </div>
                  </div>
                  {req.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-success btn-sm" onClick={() => approve(req.id)}>
                        <CheckCircle size={13} /> Approve & Enroll
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => reject(req.id)}>
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                  {req.status === 'Approved' && (
                    <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckCircle size={14} /> Enrolled {req.approvedDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && <EnrollmentModal store={store} onSave={handleSave} onClose={() => setModal(false)} />}
    </div>
  );
}
