import React, { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Users, FileText, TrendingUp, Download, Lock, Unlock } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

/* ─── FEE STRUCTURE ─────────────────────────────────────────── */
function FeeModal({ mode, fee, school, onSave, onClose }) {
  const [form, setForm] = useState(fee || { name: '', amount: '', term: 'Term 1', year: school?.currentYear || '2024/2025', grade: 'all', dueDate: '' });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Add Fee' : 'Edit Fee'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, amount: parseFloat(form.amount) }); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Fee Name *</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Tuition Fee" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input type="number" className="form-control" value={form.amount} onChange={e => set('amount', e.target.value)} required min={0} step={0.01} />
              </div>
              <div className="form-group">
                <label className="form-label">Term</label>
                <select className="form-control" value={form.term} onChange={e => set('term', e.target.value)}>
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Annual</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Applies To</label>
                <select className="form-control" value={form.grade} onChange={e => set('grade', e.target.value)}>
                  <option value="all">All Grades</option>
                  <option value="9">Grade 9</option><option value="10">Grade 10</option>
                  <option value="11">Grade 11</option><option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add Fee' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FeeStructurePage({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const fees = store.feeStructure || [];
  const totalPerStudent = fees.reduce((a, f) => a + f.amount, 0);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.feeStructure = [...fees, { ...data, id: generateId('FS') }];
    } else {
      updated.feeStructure = fees.map(f => f.id === data.id ? data : f);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this fee?')) return;
    onUpdate({ ...store, feeStructure: fees.filter(f => f.id !== id) });
  }

  return (
    <div>
      <Topbar title="Fee Structure" subtitle={`Total per student: $${totalPerStudent.toLocaleString()}`} school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Fee</button>}
      />
      <div className="page-content animate-in">
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fee Name</th><th>Term</th><th>Amount</th><th>Grade</th><th>Due Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No fees configured</td></tr>
                ) : fees.map(fee => (
                  <tr key={fee.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{fee.name}</td>
                    <td><span className="badge badge-info">{fee.term}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 15 }}>${fee.amount.toLocaleString()}</td>
                    <td><span className="badge badge-primary">{fee.grade === 'all' ? 'All Grades' : `Grade ${fee.grade}`}</span></td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{fee.dueDate || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(fee); setModal('edit'); }}><Edit2 size={13} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(fee.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {fees.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--bg3)', fontWeight: 700 }}>
                    <td colSpan={2} style={{ padding: '10px 16px', color: 'var(--text)' }}>TOTAL PER STUDENT</td>
                    <td style={{ padding: '10px 16px', color: 'var(--success)', fontSize: 16, fontFamily: 'var(--font-display)' }}>${totalPerStudent.toLocaleString()}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
      {modal && <FeeModal mode={modal} fee={selected} school={store.school} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
    </div>
  );
}

/* ─── PAYROLL ─────────────────────────────────────────── */
export function PayrollPage({ store }) {
  const teachers = store.teachers || [];
  const staff = store.staff || [];
  const teacherTotal = teachers.reduce((a, t) => a + (t.salary || 0), 0);
  const staffTotal = staff.reduce((a, s) => a + (s.salary || 0), 0);
  const grandTotal = teacherTotal + staffTotal;

  return (
    <div>
      <Topbar title="Staff Payroll" subtitle="Monthly salary overview" school={store.school} />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="stat-card blue"><div className="stat-icon blue"><DollarSign size={20} /></div><div className="stat-value">${teacherTotal.toLocaleString()}</div><div className="stat-label">Teachers Payroll</div><div className="stat-sub">{teachers.length} teachers</div></div>
          <div className="stat-card purple"><div className="stat-icon purple"><DollarSign size={20} /></div><div className="stat-value">${staffTotal.toLocaleString()}</div><div className="stat-label">Staff Payroll</div><div className="stat-sub">{staff.length} staff</div></div>
          <div className="stat-card green"><div className="stat-icon green"><DollarSign size={20} /></div><div className="stat-value">${grandTotal.toLocaleString()}</div><div className="stat-label">Grand Total</div><div className="stat-sub">Monthly payroll</div></div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Teachers</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>ID</th><th>Subjects</th><th>Status</th><th>Salary</th></tr></thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{t.firstName[0]}{t.lastName[0]}</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.firstName} {t.lastName}</div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>{t.id}</span></td>
                    <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(t.subjects||[]).map(s => <span key={s} className="badge badge-info" style={{ fontSize: 9 }}>{s}</span>)}</div></td>
                    <td><span className={`badge ${t.status==='Active'?'badge-success':'badge-warning'}`}>{t.status}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>${(t.salary||0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg3)', fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: '10px 16px', color: 'var(--text)' }}>Teachers Subtotal</td>
                  <td style={{ padding: '10px 16px', color: 'var(--success)', fontSize: 15 }}>${teacherTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {staff.length > 0 && (
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Support Staff</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>ID</th><th>Role</th><th>Status</th><th>Salary</th></tr></thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{s.firstName[0]}{s.lastName[0]}</div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.firstName} {s.lastName}</div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>{s.id}</span></td>
                      <td><span className="badge badge-purple">{s.role}</span></td>
                      <td><span className={`badge ${s.status==='Active'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>${(s.salary||0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--bg3)', fontWeight: 700 }}>
                    <td colSpan={4} style={{ padding: '10px 16px', color: 'var(--text)' }}>Staff Subtotal</td>
                    <td style={{ padding: '10px 16px', color: 'var(--success)', fontSize: 15 }}>${staffTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── FINANCIAL REPORTS ─────────────────────────────────────────── */
export function AccountantReports({ store, onUpdate }) {
  const payments = store.feePayments || [];
  const feeStructure = store.feeStructure || [];
  const totalExpected = feeStructure.reduce((a, f) => a + f.amount, 0) * store.students.length;
  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const teacherPayroll = (store.teachers||[]).reduce((a, t) => a + (t.salary||0), 0);
  const staffPayroll = (store.staff||[]).reduce((a, s) => a + (s.salary||0), 0);
  const totalPayroll = teacherPayroll + staffPayroll;

  const byTerm = ['Term 1','Term 2','Term 3'].map(term => {
    const collected = payments.filter(p=>p.term===term).reduce((a,p)=>a+p.amount,0);
    const expected = feeStructure.filter(f=>f.term===term||f.term==='Annual').reduce((a,f)=>a+f.amount,0) * store.students.length;
    return { term, collected, expected };
  });

  function toggleResultsLock(studentId) {
    const updated = { ...store };
    updated.students = store.students.map(s => s.id === studentId ? { ...s, resultsLocked: !s.resultsLocked } : s);
    onUpdate && onUpdate(updated);
  }

  // compute outstanding per student
  const studentBalances = (store.students || []).map(s => {
    const expected = feeStructure.filter(f => f.grade === 'all' || f.grade === s.grade).reduce((a,f) => a + (f.amount||0), 0);
    const paid = (payments.filter(p => p.studentId === s.id) || []).reduce((a,p) => a + (p.amount||0), 0);
    return { id: s.id, name: `${s.firstName} ${s.lastName}`, expected, paid, outstanding: Math.max(0, expected - paid), resultsLocked: !!s.resultsLocked };
  }).filter(x => x.expected > 0);

  return (
    <div>
      <Topbar title="Financial Reports" subtitle="Summary and analysis" school={store.school}
        actions={<button className="btn btn-primary" onClick={()=>window.print()}><Download size={14} /> Print</button>}
      />
      <div className="page-content animate-in">
        {/* Summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14, textAlign: 'center' }}>
            {store.school.name} — Financial Summary
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text3)', marginBottom: 16 }}>{store.school.currentYear}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              ['Total Expected', `$${totalExpected.toLocaleString()}`, 'var(--text2)'],
              ['Total Collected', `$${totalCollected.toLocaleString()}`, 'var(--success)'],
              ['Outstanding', `$${Math.max(0,totalOutstanding).toLocaleString()}`, 'var(--danger)'],
              ['Teacher Payroll', `$${teacherPayroll.toLocaleString()}`, 'var(--primary)'],
              ['Staff Payroll', `$${staffPayroll.toLocaleString()}`, 'var(--accent4)'],
              ['Net Balance', `$${(totalCollected - totalPayroll).toLocaleString()}`, totalCollected-totalPayroll>=0?'var(--success)':'var(--danger)'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Result Locks Management */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Manage Student Result Locks</div>
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Toggle lock on student report cards. Useful when fees are outstanding.</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Expected</th><th>Paid</th><th>Outstanding</th><th>Lock</th></tr></thead>
                <tbody>
                  {studentBalances.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.name} <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>{s.id}</span></td>
                      <td>${s.expected.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>${s.paid.toLocaleString()}</td>
                      <td style={{ color: s.outstanding>0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>${s.outstanding.toLocaleString()}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleResultsLock(s.id)}>
                          {s.resultsLocked ? <Unlock size={14} /> : <Lock size={14} />} {s.resultsLocked ? 'Unlock' : 'Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* By Term */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Collection by Term</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Term</th><th>Expected</th><th>Collected</th><th>Outstanding</th><th>Rate</th></tr></thead>
              <tbody>
                {byTerm.map(t => {
                  const rate = t.expected > 0 ? Math.round((t.collected/t.expected)*100) : 0;
                  return (
                    <tr key={t.term}>
                      <td style={{ fontWeight: 600 }}>{t.term}</td>
                      <td>${t.expected.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>${t.collected.toLocaleString()}</td>
                      <td style={{ color: (t.expected-t.collected)>0?'var(--danger)':'var(--success)', fontWeight: 700 }}>
                        ${Math.max(0,t.expected-t.collected).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className={`progress-fill ${rate>=100?'progress-green':rate>60?'progress-amber':'progress-red'}`} style={{ width:`${Math.min(100,rate)}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{rate}%</span>
                        </div>
                      </td>
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

export default FeeStructurePage;
