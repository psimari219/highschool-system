import React, { useState } from 'react';
import Topbar from '../layout/Topbar';
import { generatePersonalPlan } from '../../utils/personalized';

export default function AdminPersonalPlans({ store, onUpdate }) {
  const [selected, setSelected] = useState('');
  const students = store.students || [];
  const plans = store.personalizedPlans || [];

  function generateForStudent(id) {
    const plan = generatePersonalPlan(store, id);
    if (!plan) { alert('Unable to generate plan'); return; }
    const updated = { ...store, personalizedPlans: [...plans.filter(p=>p.studentId!==id), plan] };
    onUpdate(updated);
    alert('Plan generated for ' + id);
  }

  function generateForAll() {
    const all = students.map(s => generatePersonalPlan(store, s.id)).filter(Boolean);
    const dedup = plans.filter(p => !all.find(a => a.studentId === p.studentId));
    const updated = { ...store, personalizedPlans: [...dedup, ...all] };
    onUpdate(updated);
    alert('Plans generated for all students');
  }

  return (
    <div>
      <Topbar title="Personalized Plans" subtitle="AI prototype — generate learner plans" school={store.school} />
      <div className="page-content animate-in">
        <div className="card">
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-control" value={selected} onChange={e=>setSelected(e.target.value)}>
                <option value="">— select student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.id})</option>)}
              </select>
              <button className="btn btn-primary" onClick={()=>generateForStudent(selected)} disabled={!selected}>Generate</button>
              <button className="btn btn-ghost" onClick={generateForAll}>Generate For All</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">Existing Plans</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Created</th><th>Goals</th><th>Status</th></tr></thead>
              <tbody>
                {plans.length===0 && <tr><td colSpan={4} style={{ padding: 24, color: 'var(--text3)' }}>No plans yet</td></tr>}
                {plans.map(p => {
                  const student = students.find(s => s.id === p.studentId) || {};
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{student.firstName} {student.lastName} <span style={{ marginLeft: 8, color: 'var(--text3)' }}>{student.id}</span></td>
                      <td style={{ color: 'var(--text3)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>{p.goals.map(g=>g.subject).join(', ')}</td>
                      <td>{p.status}</td>
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
