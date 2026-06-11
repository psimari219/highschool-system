import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, BookOpen } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

const DEPARTMENTS = ['Sciences', 'Languages', 'Humanities', 'Technology', 'Arts', 'Sports', 'Commerce', 'Mathematics'];

function SubjectModal({ mode, subject, onSave, onClose }) {
  const [form, setForm] = useState(subject || { name: '', code: '', department: 'Sciences', isCore: false });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Add Subject' : 'Edit Subject'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Mathematics" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Subject Code</label>
                <input className="form-control" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. MATH" maxLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isCore} onChange={e => set('isCore', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Core / Compulsory subject</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add Subject' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubjectsPage({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const subjects = store.subjects || [];

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.subjects = [...subjects, { ...data, id: generateId('SUB') }];
    } else {
      updated.subjects = subjects.map(s => s.id === data.id ? data : s);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this subject? It may still be referenced in classes.')) return;
    onUpdate({ ...store, subjects: subjects.filter(s => s.id !== id) });
  }

  const byDept = subjects.reduce((acc, s) => {
    if (!acc[s.department]) acc[s.department] = [];
    acc[s.department].push(s);
    return acc;
  }, {});

  const DEPT_COLORS = { Sciences: '#3b82f6', Languages: '#06d6a0', Humanities: '#f59e0b', Technology: '#06b6d4', Arts: '#ec4899', Sports: '#ef4444', Commerce: '#a78bfa', Mathematics: '#8b5cf6' };

  return (
    <div>
      <Topbar title="Subjects" subtitle={`${subjects.length} subjects across ${Object.keys(byDept).length} departments`} school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Subject</button>}
      />
      <div className="page-content animate-in">
        {Object.entries(byDept).map(([dept, subs]) => {
          const color = DEPT_COLORS[dept] || 'var(--primary)';
          return (
            <div key={dept} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{dept}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{subs.length} subjects</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {subs.map(sub => (
                  <div key={sub.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{sub.name}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <span style={{ background: `${color}15`, color, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{sub.code || '—'}</span>
                          {sub.isCore && <span className="badge badge-warning" style={{ fontSize: 10 }}>Core</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(sub); setModal('edit'); }}><Edit2 size={12} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(sub.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {subjects.length === 0 && (
          <div className="card empty-state">
            <Layers size={40} />
            <h3>No Subjects</h3>
            <p>Add subjects to get started.</p>
          </div>
        )}
      </div>
      {modal && <SubjectModal mode={modal} subject={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
    </div>
  );
}
