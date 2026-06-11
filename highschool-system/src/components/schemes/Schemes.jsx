import React, { useState } from 'react';
import { Plus, BookMarked, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

function WeekRow({ week, onChange, onDelete }) {
  const [open, setOpen] = useState(true);
  function set(f, v) { onChange({ ...week, [f]: v }); }

  return (
    <div className="scheme-week">
      <div className="scheme-week-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: 8, padding: '4px 10px', fontWeight: 700, fontSize: 13 }}>
            Week {week.week}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{week.topic || <span style={{ color: 'var(--text3)' }}>No topic set</span>}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setOpen(o => !o)}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </div>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Topic</label>
            <input className="form-control" value={week.topic} onChange={e => set('topic', e.target.value)} placeholder="Main topic" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subtopics (comma separated)</label>
            <input className="form-control" value={Array.isArray(week.subtopics) ? week.subtopics.join(', ') : week.subtopics}
              onChange={e => set('subtopics', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="e.g. Introduction, Key concepts" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
            <label className="form-label">Learning Objectives</label>
            <textarea className="form-control" value={week.objectives} onChange={e => set('objectives', e.target.value)} placeholder="What students will be able to do..." rows={2} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Resources / Materials</label>
            <input className="form-control" value={week.resources} onChange={e => set('resources', e.target.value)} placeholder="Textbooks, tools, etc." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assessment</label>
            <input className="form-control" value={week.assessment} onChange={e => set('assessment', e.target.value)} placeholder="How learning will be assessed" />
          </div>
        </div>
      )}
    </div>
  );
}

function SchemeModal({ mode, scheme, store, onSave, onClose }) {
  const [form, setForm] = useState(scheme || {
    subject: '', grade: '', term: store.school.currentTerm, year: store.school.currentYear,
    teacherId: '', weeks: []
  });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  function addWeek() {
    setForm(f => ({
      ...f,
      weeks: [...f.weeks, { week: f.weeks.length + 1, topic: '', subtopics: [], objectives: '', resources: '', assessment: '' }]
    }));
  }

  function updateWeek(i, updated) {
    setForm(f => ({ ...f, weeks: f.weeks.map((w, idx) => idx === i ? updated : w) }));
  }

  function deleteWeek(i) {
    setForm(f => ({
      ...f,
      weeks: f.weeks.filter((_, idx) => idx !== i).map((w, idx) => ({ ...w, week: idx + 1 }))
    }));
  }

  const cls = store.classes.find(c => c.grade === form.grade);
  const subjects = cls?.subjects || ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science'];

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg" style={{ maxWidth: 860 }}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Create Scheme of Work' : 'Edit Scheme of Work'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row three">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)} required>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Grade *</label>
                <select className="form-control" value={form.grade} onChange={e => set('grade', e.target.value)} required>
                  <option value="">Select grade</option>
                  <option value="9">Grade 9</option><option value="10">Grade 10</option>
                  <option value="11">Grade 11</option><option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Term</label>
                <select className="form-control" value={form.term} onChange={e => set('term', e.target.value)}>
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teacher</label>
                <select className="form-control" value={form.teacherId} onChange={e => set('teacherId', e.target.value)}>
                  <option value="">Select teacher</option>
                  {store.teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input className="form-control" value={form.year} onChange={e => set('year', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Weekly Plan ({form.weeks.length} weeks)</div>
                <button type="button" className="btn btn-primary btn-sm" onClick={addWeek}><Plus size={13} /> Add Week</button>
              </div>
              {form.weeks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                  No weeks added yet. Click "Add Week" to start planning.
                </div>
              )}
              {form.weeks.map((week, i) => (
                <WeekRow key={i} week={week} onChange={updated => updateWeek(i, updated)} onDelete={() => deleteWeek(i)} />
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Save Scheme' : 'Update Scheme'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Schemes({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.schemes = [...store.schemes, { ...data, id: generateId('SCH') }];
    } else {
      updated.schemes = store.schemes.map(s => s.id === data.id ? data : s);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this scheme of work?')) return;
    onUpdate({ ...store, schemes: store.schemes.filter(s => s.id !== id) });
  }

  return (
    <div>
      <Topbar
        title="Schemes of Work"
        subtitle="Curriculum planning and weekly lesson guides"
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Create Scheme</button>}
      />
      <div className="page-content animate-in">
        {store.schemes.length === 0 && (
          <div className="card empty-state">
            <BookMarked size={48} />
            <h3>No Schemes of Work</h3>
            <p>Create curriculum plans and weekly lesson guides for your teachers.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('add')}>
              <Plus size={15} /> Create First Scheme
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {store.schemes.map(scheme => {
            const teacher = store.teachers.find(t => t.id === scheme.teacherId);
            const isExpanded = expanded === scheme.id;
            return (
              <div key={scheme.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(167,139,250,0.1)', borderRadius: 12, padding: 12 }}>
                      <BookMarked size={22} color="var(--accent4)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>{scheme.subject}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">Grade {scheme.grade}</span>
                        <span className="badge badge-info">{scheme.term}</span>
                        <span className="badge badge-purple">{scheme.year}</span>
                        <span className="badge badge-success">{scheme.weeks.length} weeks planned</span>
                      </div>
                      {teacher && (
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                          Teacher: {teacher.firstName} {teacher.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(isExpanded ? null : scheme.id)}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Collapse' : 'View Plan'}
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(scheme); setModal('edit'); }}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(scheme.id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                {isExpanded && scheme.weeks.length > 0 && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {scheme.weeks.map(week => (
                        <div key={week.week} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: 6, padding: '3px 9px', fontWeight: 700, fontSize: 12 }}>Week {week.week}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{week.topic}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {[
                              { label: 'Subtopics', val: Array.isArray(week.subtopics) ? week.subtopics.join(' · ') : week.subtopics },
                              { label: 'Resources', val: week.resources },
                              { label: 'Assessment', val: week.assessment },
                            ].map(item => (
                              <div key={item.label}>
                                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.val || '—'}</div>
                              </div>
                            ))}
                          </div>
                          {week.objectives && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Objectives</div>
                              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{week.objectives}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {modal && <SchemeModal mode={modal} scheme={selected} store={store} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
    </div>
  );
}
