import React, { useState } from 'react';
import { generateId } from '../../data/store';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';

export default function TeacherRequests({ store, onUpdate, teacherId }) {
  const { currentUser } = useAuth();
  const id = teacherId || currentUser?.linkedId || currentUser?.id;
  const requests = (store.requests || []).filter(r => r.toRole === 'teacher' && (r.toIds.length === 0 || r.toIds.includes(id)));
  const [responding, setResponding] = useState(null);
  const [form, setForm] = useState({ subject: '', grade: '', notes: '' });

  function startResponse(r) { setResponding(r); setForm({ subject: '', grade: '', notes: '' }); }

  function submitScheme(e) {
    e.preventDefault();
    if (!form.subject) { alert('Provide subject or title'); return; }
    const scheme = { id: generateId('SCH'), subject: form.subject, grade: form.grade || '', term: store.school.currentTerm, year: store.school.currentYear, teacherId: id, notes: form.notes, weeks: [] };
    const newSchemes = [...(store.schemes || []), scheme];
    const updatedRequests = store.requests.map(r => r.id === responding.id ? { ...r, status: 'completed', response: { byId: id, type: 'scheme', id: scheme.id, note: form.notes, respondedAt: new Date().toISOString() } } : r);
    onUpdate({ ...store, schemes: newSchemes, requests: updatedRequests });
    setResponding(null);
    alert('Scheme submitted and request marked completed');
  }

  return (
    <div>
      <Topbar title="Requests" subtitle="Requests for Schemes & documents" school={store.school} />
      <div className="page-content animate-in">
        <div className="card">
          <div className="card-title">Incoming Requests</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>From</th><th>Type</th><th>Message</th><th>Status</th><th>When</th><th></th></tr></thead>
              <tbody>
                {requests.length===0 && <tr><td colSpan={6} style={{ padding: 24, color: 'var(--text3)' }}>No requests</td></tr>}
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>{r.fromRole}</td>
                    <td style={{ fontWeight: 700 }}>{r.type}</td>
                    <td style={{ maxWidth: 420 }}>{r.message}</td>
                    <td>{r.status}</td>
                    <td style={{ color: 'var(--text3)' }}>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      {r.status==='pending' && (
                        <button className="btn btn-primary" onClick={() => startResponse(r)}>Respond</button>
                      )}
                      {r.status==='completed' && <span style={{ color: 'var(--success)' }}>Completed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {responding && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">Respond to Request</div>
            <form onSubmit={submitScheme} style={{ padding: 12 }}>
              <div className="form-group">
                <label className="form-label">Subject / Title</label>
                <input className="form-control" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Grade (optional)</label>
                <input className="form-control" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes / Content</label>
                <textarea className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={6} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" type="button" onClick={()=>setResponding(null)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Submit Scheme</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
