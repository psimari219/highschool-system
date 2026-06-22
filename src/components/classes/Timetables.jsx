import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Save } from 'lucide-react';
import Topbar from '../layout/Topbar';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// default periods are stored in `store.periods` now; fallback defined here
const DEFAULT_PERIODS = [
  { period: 1, time: '07:30–08:30' },
  { period: 2, time: '08:30–09:30' },
  { period: 3, time: '09:30–10:30' },
  { period: 4, time: '11:00–12:00' },
  { period: 5, time: '12:00–13:00' },
  { period: 6, time: '14:00–15:00' },
];

const PERIOD_COLORS = {
  Mathematics: '#3b82f6', 'Further Mathematics': '#2563eb',
  'English Language': '#06d6a0', 'English Literature': '#059669',
  Physics: '#a78bfa', Chemistry: '#7c3aed', Biology: '#8b5cf6',
  History: '#f59e0b', Geography: '#d97706',
  'Computer Science': '#06b6d4', ICT: '#0891b2',
  Science: '#10b981', Art: '#ec4899', Music: '#f43f5e',
  'Physical Education': '#ef4444', 'Business Studies': '#f97316',
  Break: '#374151', Lunch: '#374151',
};

function CellEditor({ value, store, cls, onSave, onClose }) {
  const [form, setForm] = useState(value || { subject: '', teacherId: '', room: '' });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <div className="modal-title">Edit Period</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
              <option value="">— Free Period —</option>
              {(cls?.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Teacher</label>
            <select className="form-control" value={form.teacherId} onChange={e => set('teacherId', e.target.value)}>
              <option value="">Select teacher</option>
              {store.teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Room</label>
            <input className="form-control" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Room 201" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Timetables({ store, onUpdate }) {
  const [classId, setClassId] = useState(store.classes[0]?.id || '');
  const [editing, setEditing] = useState(null); // { day, period }
  const [editingTimes, setEditingTimes] = useState(false);

  const cls = store.classes.find(c => c.id === classId);
  const timetable = store.timetables?.[classId] || {};
  const periods = store.periods || DEFAULT_PERIODS;

  function getCell(day, period) {
    return timetable[day]?.find(p => p.period === period) || null;
  }

  async function saveCell(day, period, data) {
    const body = { day, period, subject: data.subject || null, teacherId: data.teacherId || null, room: data.room || null, time: data.time || null };
    const headers = { 'Content-Type': 'application/json' };
    try {
      const res = await fetch(`/api/timetables/class/${classId}/cell`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (res.ok) {
        const json = await res.json();
        const grouped = {};
        (json.timetable || []).forEach(r => {
          grouped[r.day] = grouped[r.day] || [];
          grouped[r.day].push({ period: r.period, time: r.startTime || (periods.find(p => p.period === r.period)?.time || ''), subject: r.subject || null, teacherId: r.teacherId || null, room: r.room || '' });
        });
        const newTimetable = { ...store.timetables, [classId]: grouped };
        onUpdate({ ...store, timetables: newTimetable });
        setEditing(null);
        return;
      }
    } catch (e) {
      console.debug('Timetable save failed:', e);
    }

    const existing = timetable[day] || [];
    const updated = existing.filter(p => p.period !== period);
    if (data.subject) updated.push({ period, time: periods.find(p => p.period === period)?.time || '', ...data });
    const newTimetable = { ...store.timetables, [classId]: { ...timetable, [day]: updated } };
    onUpdate({ ...store, timetables: newTimetable });
    setEditing(null);
  }

  // When classId changes, try to load server-side timetable for that class
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!classId) return;
      try {
        const res = await fetch(`/api/timetables/class/${classId}`);
        if (!res.ok) return;
        const json = await res.json();
        const grouped = {};
        (json.timetable || []).forEach(r => {
          grouped[r.day] = grouped[r.day] || [];
          grouped[r.day].push({ period: r.period, time: r.startTime || (periods.find(p => p.period === r.period)?.time || ''), subject: r.subject || null, teacherId: r.teacherId || null, room: r.room || '' });
        });
        if (!cancelled) {
          onUpdate({ ...store, timetables: { ...store.timetables, [classId]: grouped } });
        }
      } catch (e) {
        console.debug('Timetable load failed:', e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [classId]);

  const editCell = editing ? getCell(editing.day, editing.period) : null;

  return (
    <div>
      <Topbar
        title="Timetables"
        subtitle="Weekly class schedules"
        school={store.school}
      />
      <div className="page-content animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Select Class</label>
            <select className="form-control" style={{ width: 200 }} value={classId} onChange={e => setClassId(e.target.value)}>
              {store.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {cls && (
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <span className="badge badge-primary">Grade {cls.grade}{cls.stream}</span>
              <span className="badge badge-info">{cls.room}</span>
              <span className="badge badge-purple">{cls.subjects.length} subjects</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(cls?.subjects || []).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: PERIOD_COLORS[s] || '#64748b', display: 'inline-block' }} />
              <span style={{ color: 'var(--text2)' }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ background: 'var(--bg3)', padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', width: 100, borderBottom: '1px solid var(--border)' }}>Period</th>
                {DAYS.map(day => (
                  <th key={day} style={{ background: 'var(--bg3)', padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text2)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(p => (
                <tr key={p.period}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>P{p.period}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.time}</div>
                  </td>
                  {DAYS.map(day => {
                    const cell = getCell(day, p.period);
                    const color = cell?.subject ? (PERIOD_COLORS[cell.subject] || '#64748b') : null;
                    const teacher = cell?.teacherId ? store.teachers.find(t => t.id === cell.teacherId) : null;
                    return (
                      <td key={day} style={{ borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 6, verticalAlign: 'top', minWidth: 140 }}>
                        <div
                          onClick={() => setEditing({ day, period: p.period })}
                          style={{
                            minHeight: 64, borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                            background: color ? `${color}18` : 'transparent',
                            border: `1px solid ${color ? `${color}35` : 'var(--border)'}`,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          {cell?.subject ? (
                            <>
                              <div style={{ fontWeight: 700, fontSize: 12, color, marginBottom: 3 }}>{cell.subject}</div>
                              {teacher && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{teacher.firstName[0]}. {teacher.lastName}</div>}
                              {cell.room && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{cell.room}</div>}
                            </>
                          ) : (
                            <div style={{ color: 'var(--text3)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 48 }}>
                              + Add
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} /> Click any cell to assign a subject, teacher, and room.
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-ghost" onClick={() => setEditingTimes(true)}><Plus size={12} /> Edit Period Times</button>
          </div>
        </div>
      </div>

      {editing && (
        <CellEditor
          value={editCell}
          store={store}
          cls={cls}
          onSave={(data) => saveCell(editing.day, editing.period, data)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Exam timetable management for selected class */}
      {cls && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 8 }}>Exam Timetable — {cls.name}</h3>
          <ExamEditor cls={cls} store={store} onUpdate={onUpdate} />
        </div>
      )}

      {editingTimes && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title">Edit Period Times</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditingTimes(false)}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault();
              const form = e.target;
              const updated = periods.map(p => ({ period: p.period, time: form[`time-${p.period}`].value }));
              onUpdate({ ...store, periods: updated });
              setEditingTimes(false);
            }}>
              <div className="modal-body">
                {periods.map(p => (
                  <div className="form-group" key={p.period}>
                    <label className="form-label">P{p.period} Time</label>
                    <input name={`time-${p.period}`} defaultValue={p.time} className="form-control" />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingTimes(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={12} /> Save Times</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamEditor({ cls, store, onUpdate }) {
  const classId = cls.id;
  const exams = store.examTimetables?.[classId] || [];
  const [form, setForm] = React.useState({ date: '', start: '', end: '', subject: '', venue: '', invigilator: '' });

  function addExam(e) {
    e.preventDefault();
    if (!form.date || !form.start || !form.end || !form.subject) { alert('Please fill date, time and subject'); return; }
    const updated = [...exams, { ...form }];
    onUpdate({ ...store, examTimetables: { ...store.examTimetables, [classId]: updated } });
    setForm({ date: '', start: '', end: '', subject: '', venue: '', invigilator: '' });
  }

  function removeExam(idx) {
    const updated = exams.filter((_,i)=>i!==idx);
    onUpdate({ ...store, examTimetables: { ...store.examTimetables, [classId]: updated } });
  }

  return (
    <div style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
      <form onSubmit={addExam} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 140 }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        </div>
        <div style={{ minWidth: 100 }}>
          <label className="form-label">Start</label>
          <input type="time" className="form-control" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} />
        </div>
        <div style={{ minWidth: 100 }}>
          <label className="form-label">End</label>
          <input type="time" className="form-control" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} />
        </div>
        <div style={{ minWidth: 160 }}>
          <label className="form-label">Subject</label>
          <input className="form-control" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} />
        </div>
        <div style={{ minWidth: 120 }}>
          <label className="form-label">Venue</label>
          <input className="form-control" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} />
        </div>
        <div style={{ minWidth: 140 }}>
          <label className="form-label">Invigilator</label>
          <select className="form-control" value={form.invigilator} onChange={e=>setForm({...form,invigilator:e.target.value})}>
            <option value="">— none —</option>
            {store.teachers.map(t=> <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-primary">Add Exam</button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        {exams.length === 0 ? <div style={{ color: 'var(--text3)' }}>No exams scheduled for this class.</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th><th>Time</th><th>Subject</th><th>Venue</th><th></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, idx)=>(
                <tr key={idx}>
                  <td>{e.date}</td>
                  <td>{e.start} - {e.end}</td>
                  <td>{e.subject}</td>
                  <td>{e.venue}</td>
                  <td><button className="btn btn-ghost" onClick={()=>removeExam(idx)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
