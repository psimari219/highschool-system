import React, { useState } from 'react';
import { Plus, Users, BookOpen, Edit2, Trash2, Eye } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

const ALL_SUBJECTS = [
  'Mathematics','Further Mathematics','English Language','English Literature',
  'Physics','Chemistry','Biology','Science','History','Geography','Computer Science','ICT','Art','Music','Physical Education','Business Studies'
];

function ClassModal({ mode, cls, teachers, onSave, onClose }) {
  const [form, setForm] = useState(cls || { name: '', grade: '', stream: 'A', classTeacherId: '', capacity: 35, room: '', subjects: [] });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  function toggleSubject(s) {
    setForm(x => ({ ...x, subjects: x.subjects.includes(s) ? x.subjects.filter(z => z !== s) : [...x.subjects, s] }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const updated = { ...form };
    if (!updated.name && updated.grade) updated.name = `Grade ${updated.grade}${updated.stream}`;
    onSave(updated);
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Create Class' : 'Edit Class'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Grade 10A" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade *</label>
                <select className="form-control" value={form.grade} onChange={e => set('grade', e.target.value)} required>
                  <option value="">Select</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stream</label>
                <select className="form-control" value={form.stream} onChange={e => set('stream', e.target.value)}>
                  <option>A</option><option>B</option><option>C</option><option>D</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Class Teacher</label>
                <select className="form-control" value={form.classTeacherId} onChange={e => set('classTeacherId', e.target.value)}>
                  <option value="">None</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-control" value={form.capacity} onChange={e => set('capacity', +e.target.value)} min={1} max={60} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Classroom / Room</label>
              <input className="form-control" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Room 201" />
            </div>
            <div className="form-group">
              <label className="form-label">Subjects</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'var(--bg3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {ALL_SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                      background: form.subjects.includes(s) ? 'var(--primary)' : 'transparent',
                      borderColor: form.subjects.includes(s) ? 'var(--primary)' : 'var(--border)',
                      color: form.subjects.includes(s) ? 'white' : 'var(--text3)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Create Class' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Classes({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewClass, setViewClass] = useState(null);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.classes = [...store.classes, { ...data, id: generateId('C') }];
    } else {
      updated.classes = store.classes.map(c => c.id === data.id ? data : c);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return;
    onUpdate({ ...store, classes: store.classes.filter(c => c.id !== id) });
  }

  const grades = ['9', '10', '11', '12'];

  return (
    <div>
      <Topbar
        title="Classes"
        subtitle={`${store.classes.length} classes across Grades 9–12`}
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> New Class</button>}
      />
      <div className="page-content animate-in">
        {grades.map(grade => {
          const gradeClasses = store.classes.filter(c => c.grade === grade);
          if (!gradeClasses.length) return null;
          return (
            <div key={grade} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 20, fontSize: 13 }}>Grade {grade}</span>
                <span style={{ fontSize: 13, fontWeight: 400 }}>{gradeClasses.length} class{gradeClasses.length !== 1 ? 'es' : ''}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {gradeClasses.map(cls => {
                  const classTeacher = store.teachers.find(t => t.id === cls.classTeacherId);
                  const studentCount = store.students.filter(s => s.grade === cls.grade && s.stream === cls.stream).length;
                  const pct = Math.round((studentCount / cls.capacity) * 100);
                  return (
                    <div key={cls.id} className="card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{cls.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cls.room}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(cls); setModal('edit'); }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(cls.id)}><Trash2 size={13} /></button>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text3)' }}>Enrollment</span>
                          <span style={{ fontWeight: 600, color: pct > 90 ? 'var(--danger)' : 'var(--text2)' }}>{studentCount}/{cls.capacity}</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${pct > 90 ? 'progress-red' : pct > 70 ? 'progress-amber' : 'progress-blue'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>CLASS TEACHER</div>
                        {classTeacher
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div className="avatar avatar-blue" style={{ width: 28, height: 28, fontSize: 11 }}>{classTeacher.firstName[0]}{classTeacher.lastName[0]}</div>
                              <span style={{ fontSize: 13 }}>{classTeacher.firstName} {classTeacher.lastName}</span>
                            </div>
                          : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Not assigned</span>
                        }
                      </div>

                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>SUBJECTS ({cls.subjects.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {cls.subjects.slice(0, 4).map(s => <span key={s} className="badge badge-info" style={{ fontSize: 10 }}>{s}</span>)}
                          {cls.subjects.length > 4 && <span className="badge badge-info" style={{ fontSize: 10 }}>+{cls.subjects.length - 4} more</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <ClassModal
          mode={modal}
          cls={selected}
          teachers={store.teachers}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}
    </div>
  );
}
