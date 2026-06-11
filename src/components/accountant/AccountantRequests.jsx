import React, { useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { generateId } from '../../data/store';

export default function AccountantRequests({ store, onUpdate }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const requests = (store.requests || []).filter(r => r.toRole === 'accountant' && (r.toIds.length===0 || r.toIds.includes(userId)));
  const [uploading, setUploading] = useState(null);
  const [form, setForm] = useState({ name: '', notes: '' });

  function startUpload(req) { setUploading(req); setForm({ name: '', notes: '' }); }

  function submitFile(e) {
    e.preventDefault();
    if (!form.name) { alert('Provide file name'); return; }
    const file = { id: generateId('F'), name: form.name, notes: form.notes, uploadedBy: userId, uploadedAt: new Date().toISOString() };
    const updatedFiles = [...(store.uploadedFiles||[]), file];
    const updatedRequests = store.requests.map(r => r.id === uploading.id ? { ...r, status: 'completed', response: { byId: userId, type: 'file', id: file.id, note: form.notes, respondedAt: new Date().toISOString() } } : r);
    onUpdate({ ...store, uploadedFiles: updatedFiles, requests: updatedRequests });
    setUploading(null);
    alert('File uploaded (metadata saved) and request completed');
  }

  return (
    <div>
      <Topbar title="Requests" subtitle="Requests assigned to accountant" school={store.school} />
      <div className="page-content animate-in">
        <div className="card">
          <div className="card-title">Incoming Requests</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>From</th><th>Type</th><th>Message</th><th>Status</th><th>When</th><th></th></tr></thead>
              <tbody>
                {requests.length===0 && <tr><td colSpan={6} style={{ padding: 24, color: 'var(--text3)' }}>No requests</td></tr>}
                {requests.map(r=> (
                  <tr key={r.id}>
                    <td>{r.fromRole}</td>
                    <td style={{ fontWeight:700 }}>{r.type}</td>
                    <td style={{ maxWidth: 420 }}>{r.message}</td>
                    <td>{r.status}</td>
                    <td style={{ color: 'var(--text3)' }}>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.status==='pending' && <button className="btn btn-primary" onClick={()=>startUpload(r)}>Upload</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {uploading && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">Upload File (metadata only)</div>
            <form onSubmit={submitFile} style={{ padding: 12 }}>
              <div className="form-group">
                <label className="form-label">File Name</label>
                <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. TrialBalance_March2025.pdf" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={4} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" type="button" onClick={()=>setUploading(null)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Save & Complete Request</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
