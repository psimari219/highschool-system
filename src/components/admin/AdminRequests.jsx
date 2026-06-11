import React, { useState } from 'react';
import { generateId } from '../../data/store';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';

export default function AdminRequests({ store, onUpdate }) {
  const { currentUser } = useAuth();
  const teachers = store.teachers || [];
  const accountants = (store.users || []).filter(u => u.role === 'accountant');
  const [role, setRole] = useState('teacher');
  const [toIds, setToIds] = useState([]);
  const [type, setType] = useState('scheme');
  const [message, setMessage] = useState('');

  const requests = store.requests || [];

  function toggleSelect(id) {
    setToIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  function sendRequest(e) {
    e.preventDefault();
    if (!message) { alert('Please add a brief message'); return; }
    const req = { id: generateId('R'), type, fromRole: 'admin', fromId: currentUser?.id || null, toRole: role, toIds: toIds.length?toIds:[], message, createdAt: new Date().toISOString(), status: 'pending', response: null };
    onUpdate({ ...store, requests: [...requests, req] });
    setMessage(''); setToIds([]);
    alert('Request sent');
  }

  function cancelRequest(id) {
    if (!window.confirm('Cancel this request?')) return;
    onUpdate({ ...store, requests: requests.filter(r=>r.id!==id) });
  }

  return (
    <div>
      <Topbar title="Requests" subtitle="Send requests to teachers or accountant" school={store.school} />
      <div className="page-content animate-in">
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ padding: 12 }}>
            <form onSubmit={sendRequest} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label className="form-label">Recipient Role</label>
                <select className="form-control" value={role} onChange={e=>{ setRole(e.target.value); setToIds([]); setType(e.target.value==='teacher'?'scheme':'file'); }}>
                  <option value="teacher">Teacher(s)</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>

              <div style={{ minWidth: 240 }}>
                <label className="form-label">Recipients (leave blank for All)</label>
                {role === 'teacher' ? (
                  <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid var(--border)', padding: 8, borderRadius: 6 }}>
                    {teachers.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={toIds.includes(t.id)} onChange={() => toggleSelect(t.id)} />
                        <div style={{ fontSize: 13 }}>{t.firstName} {t.lastName} <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>{t.id}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <select className="form-control" value={toIds[0]||''} onChange={e=>setToIds(e.target.value?[e.target.value]:[])}>
                      <option value="">— Select accountant —</option>
                      {accountants.map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Request Type</label>
                <select className="form-control" value={type} onChange={e=>setType(e.target.value)}>
                  <option value="scheme">Scheme of Work</option>
                  <option value="file">File / Document</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 320 }}>
                <label className="form-label">Message</label>
                <input className="form-control" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe what you need and any deadline" />
              </div>

              <div>
                <button className="btn btn-primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recent Requests</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>To</th><th>Type</th><th>Message</th><th>Status</th><th>When</th><th></th></tr></thead>
              <tbody>
                {(requests||[]).slice().reverse().map(r => (
                  <tr key={r.id}>
                    <td>{r.toRole} {r.toIds && r.toIds.length>0 ? `(${r.toIds.join(',')})` : '(All)'} </td>
                    <td style={{ fontWeight: 700 }}>{r.type}</td>
                    <td style={{ maxWidth: 400 }}>{r.message}</td>
                    <td>{r.status}</td>
                    <td style={{ color: 'var(--text3)' }}>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {r.status === 'pending' && <button className="btn btn-ghost" onClick={()=>cancelRequest(r.id)}>Cancel</button>}
                        {r.status === 'completed' && <span style={{ color: 'var(--success)' }}>Completed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {(requests||[]).length===0 && <tr><td colSpan={6} style={{ padding: 24, color: 'var(--text3)' }}>No requests</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
