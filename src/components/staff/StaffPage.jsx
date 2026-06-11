import React, { useState } from 'react';
import { Plus, Edit2, Trash2, UserCog, DollarSign } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId, generatePassword } from '../../data/store';

const STAFF_ROLES = ['Accountant', 'Secretary', 'Librarian', 'Cleaner', 'Security', 'Lab Technician', 'Counselor', 'Nurse', 'IT Support', 'Other'];
const DEPARTMENTS = ['Admin', 'Finance', 'Library', 'Maintenance', 'Security', 'Health', 'IT', 'Other'];

function StaffModal({ mode, staff, onSave, onClose }) {
  const [form, setForm] = useState(staff || { firstName: '', lastName: '', role: 'Secretary', department: 'Admin', hireDate: '', status: 'Active', phone: '', email: '', nationalId: '', salary: '' });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e=>set('role',e.target.value)}>
                  {STAFF_ROLES.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e=>set('department',e.target.value)}>
                  {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
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
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                  <option>Active</option><option>On Leave</option><option>Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode==='add'?'Add Staff':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffPage({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const staff = store.staff || [];
  const totalSalary = staff.reduce((a, s) => a + (s.salary || 0), 0);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      const newId = generateId('ST');
      updated.staff = [...staff, { ...data, id: newId }];
      // Auto-create login
      const pwd = generatePassword(data.firstName);
      updated.users = [...(store.users||[]), { id: newId, role: 'staff', username: newId, password: pwd, name: `${data.firstName} ${data.lastName}`, email: data.email, linkedId: newId, mustChangePassword: true }];
      alert(`Staff account created!\nID: ${newId}\nPassword: ${pwd}\n(User must change password on first login)`);
    } else {
      updated.staff = staff.map(s => s.id === data.id ? data : s);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this staff member?')) return;
    onUpdate({ ...store, staff: staff.filter(s => s.id !== id), users: (store.users||[]).filter(u => u.id !== id) });
  }

  return (
    <div>
      <Topbar title="Staff" subtitle={`${staff.length} non-teaching staff`} school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Staff</button>}
      />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="stat-card blue"><div className="stat-icon blue"><UserCog size={20} /></div><div className="stat-value">{staff.length}</div><div className="stat-label">Total Staff</div></div>
          <div className="stat-card green"><div className="stat-icon green"><UserCog size={20} /></div><div className="stat-value">{staff.filter(s=>s.status==='Active').length}</div><div className="stat-label">Active</div></div>
          <div className="stat-card amber"><div className="stat-icon amber"><DollarSign size={20} /></div><div className="stat-value">${totalSalary.toLocaleString()}</div><div className="stat-label">Monthly Payroll</div></div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>ID</th><th>Role</th><th>Department</th><th>Phone</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{s.firstName[0]}{s.lastName[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4, fontSize: 12 }}>{s.id}</span></td>
                    <td><span className="badge badge-purple">{s.role}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{s.department}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{s.phone}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>${(s.salary||0).toLocaleString()}</td>
                    <td><span className={`badge ${s.status==='Active'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(s); setModal('edit'); }}><Edit2 size={13} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modal && <StaffModal mode={modal} staff={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
    </div>
  );
}
