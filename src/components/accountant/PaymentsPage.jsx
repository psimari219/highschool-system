import React, { useState } from 'react';
import { Plus, Search, DollarSign, CreditCard, Banknote, Building2 } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Credit Card'];

function PaymentModal({ store, onSave, onClose }) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    studentId: '', feeId: '', amount: '', method: 'Cash',
    date: new Date().toISOString().split('T')[0], reference: '', note: '',
    term: store.school.currentTerm, year: store.school.currentYear
  });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  const selectedStudent = store.students.find(s => s.id === form.studentId);
  const selectedFee = (store.feeStructure||[]).find(f => f.id === form.feeId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.studentId || !form.feeId || !form.amount) return;
    onSave({
      ...form,
      id: uuidv4(),
      amount: parseFloat(form.amount),
      receivedBy: currentUser?.id || 'ACC001'
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Record Payment</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select className="form-control" value={form.studentId} onChange={e => set('studentId', e.target.value)} required>
                <option value="">Select student</option>
                {store.students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — Grade {s.grade}{s.stream} ({s.id})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fee Item *</label>
              <select className="form-control" value={form.feeId} onChange={e => {
                set('feeId', e.target.value);
                const fee = (store.feeStructure||[]).find(f=>f.id===e.target.value);
                if (fee) set('amount', fee.amount);
              }} required>
                <option value="">Select fee</option>
                {(store.feeStructure||[]).map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {f.term} (${f.amount})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input type="number" className="form-control" value={form.amount}
                  onChange={e => set('amount', e.target.value)} min={0.01} step={0.01} required
                  placeholder={selectedFee ? `Full: $${selectedFee.amount}` : ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-control" value={form.method} onChange={e => set('method', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reference / Receipt No.</label>
                <input className="form-control" value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="e.g. REC-2025-001" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-control" value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. Partial payment, scholarship..." />
            </div>

            {form.studentId && form.feeId && form.amount && (
              <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>PAYMENT SUMMARY</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Student: <strong style={{ color: 'var(--text)' }}>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Fee: <strong style={{ color: 'var(--text)' }}>{selectedFee?.name}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Amount: <strong style={{ color: 'var(--success)', fontSize: 15 }}>${parseFloat(form.amount||0).toLocaleString()}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Method: <strong style={{ color: 'var(--text)' }}>{form.method}</strong></div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><DollarSign size={14} /> Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentsPage({ store, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');

  const payments = store.feePayments || [];

  function handleSave(payment) {
    onUpdate({ ...store, feePayments: [...payments, payment] });
    setModal(false);
  }

  const filtered = payments.filter(p => {
    const student = store.students.find(s => s.id === p.studentId);
    const q = search.toLowerCase();
    const matchSearch = !q || student?.firstName.toLowerCase().includes(q) || student?.lastName.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q);
    const matchMethod = !methodFilter || p.method === methodFilter;
    const matchTerm = !termFilter || p.term === termFilter;
    return matchSearch && matchMethod && matchTerm;
  });

  const totalFiltered = filtered.reduce((a, p) => a + p.amount, 0);

  const methodIcons = { Cash: <Banknote size={13} />, 'Bank Transfer': <Building2 size={13} />, Cheque: <CreditCard size={13} />, 'Mobile Money': <CreditCard size={13} /> };

  return (
    <div>
      <Topbar title="Payments" subtitle={`${payments.length} total transactions`} school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Record Payment</button>}
      />
      <div className="page-content animate-in">
        <div className="filters-row">
          <div className="search-bar">
            <Search size={14} color="var(--text3)" />
            <input placeholder="Search student or reference..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={termFilter} onChange={e => setTermFilter(e.target.value)}>
            <option value="">All Terms</option>
            <option>Term 1</option><option>Term 2</option><option>Term 3</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text2)' }}>
            Showing: <strong style={{ color: 'var(--success)' }}>${totalFiltered.toLocaleString()}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Fee</th><th>Amount</th><th>Method</th><th>Date</th><th>Reference</th><th>Term</th><th>Note</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No payments found</td></tr>
                ) : [...filtered].reverse().map(p => {
                  const student = store.students.find(s => s.id === p.studentId);
                  const fee = (store.feeStructure||[]).find(f => f.id === p.feeId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{student?.firstName} {student?.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Grade {student?.grade}{student?.stream}</div>
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>{fee?.name || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>${p.amount.toLocaleString()}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                          {methodIcons[p.method]} {p.method}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{p.date}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>{p.reference || '—'}</span></td>
                      <td><span className="badge badge-info">{p.term}</span></td>
                      <td style={{ color: 'var(--text3)', fontSize: 12, fontStyle: p.note ? 'italic' : 'normal' }}>{p.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modal && <PaymentModal store={store} onSave={handleSave} onClose={() => setModal(false)} />}
    </div>
  );
}
