import React from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';

export default function TeacherPersonalPlans({ store, onUpdate, teacherId, myClasses }) {
  const { currentUser } = useAuth();
  const tId = teacherId || currentUser?.linkedId;
  // students in teacher's classes
  const classStudentIds = (store.students || []).filter(s => myClasses.some(c => c.id === s.classId)).map(s => s.id);
  const plans = (store.personalizedPlans || []).filter(p => classStudentIds.includes(p.studentId));
  const students = store.students || [];

  function acknowledge(planId) {
    const updatedPlans = (store.personalizedPlans || []).map(p => p.id === planId ? { ...p, status: 'acknowledged' } : p);
    onUpdate({ ...store, personalizedPlans: updatedPlans });
    alert('Plan acknowledged');
  }

  return (
    <div>
      <Topbar title="My Students' Plans" subtitle="View and acknowledge plans" school={store.school} />
      <div className="page-content animate-in">
        <div className="card">
          <div className="card-title">Assigned Plans</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Goals</th><th>Actions</th></tr></thead>
              <tbody>
                {plans.length===0 && <tr><td colSpan={3} style={{ padding: 24, color: 'var(--text3)' }}>No plans for your classes</td></tr>}
                {plans.map(p => {
                  const s = students.find(x => x.id === p.studentId) || {};
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{s.firstName} {s.lastName} <div style={{ color: 'var(--text3)' }}>{s.id}</div></td>
                      <td>{p.goals.map(g => <div key={g.subject}>{g.subject}: target {g.target}</div>)}</td>
                      <td><button className="btn btn-primary" onClick={()=>acknowledge(p.id)}>Acknowledge</button></td>
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
