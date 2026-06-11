import React from 'react';
import Topbar from '../layout/Topbar';
import { overallAttendanceRate, feeRiskStudents, averageGradeForTerm, interventionAlerts, attendanceByGrade, gradeDistribution } from '../../utils/analytics';
import { sendNotification } from '../../utils/notifications';
import { useState } from 'react';

export default function AdminAnalytics({ store, onUpdate }) {
  const [showGrades, setShowGrades] = useState(false);
  const attendanceRate = overallAttendanceRate(store);
  const feeRisks = feeRiskStudents(store);
  const avgGrade = averageGradeForTerm(store);
  const alerts = interventionAlerts(store);
  const byGrade = attendanceByGrade(store);
  const dist = gradeDistribution(store);

  return (
    <div>
      <Topbar title="Analytics" subtitle="School insights & intervention alerts" school={store.school} />
      <div className="page-content animate-in">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon"><svg width="20" height="20"><circle cx="10" cy="10" r="9" stroke="#3b82f6" strokeWidth="2" fill="none" /></svg></div>
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">Overall Attendance</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber"><svg width="20" height="20"><rect x="3" y="3" width="14" height="14" stroke="#f59e0b" strokeWidth="2" fill="none" /></svg></div>
            <div className="stat-value">{feeRisks.length}</div>
            <div className="stat-label">Students At Fee Risk</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><svg width="20" height="20"><path d="M3 12 L8 6 L13 10 L17 4" stroke="#10b981" strokeWidth="2" fill="none" /></svg></div>
            <div className="stat-value">{avgGrade !== null ? `${avgGrade}%` : '—'}</div>
            <div className="stat-label">Average Grade (term)</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">Intervention Alerts</div>
          <div style={{ padding: 12 }}>
            <button className="btn btn-ghost" onClick={() => setShowGrades(s => !s)}>{showGrades ? 'Hide' : 'Show'} grade breakdown</button>
            <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={() => {
              if (!alerts.length) { alert('No alerts to send'); return; }
              alerts.forEach(a => sendNotification(store, onUpdate, { to: a.student?.id, channel: 'email', subject: `Alert: ${a.type}`, body: `${a.type} — ${a.value}`, meta: { alert: a } }));
              alert('Simulated alerts saved to notifications');
            }}>Send Alerts</button>
            <button className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => {
              // export alerts as CSV
              const csv = ['studentId,firstName,lastName,alert,value', ...alerts.map(a => `${a.studentId},${a.student?.firstName||''},${a.student?.lastName||''},${a.type},${a.value}`)].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'alerts.csv'; document.body.appendChild(a); a.click(); a.remove();
            }}>Export CSV</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Alert</th><th>Value</th></tr></thead>
              <tbody>
                {alerts.length === 0 && <tr><td colSpan={3} style={{ padding: 24, color: 'var(--text3)' }}>No alerts</td></tr>}
                {alerts.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.student?.firstName} {a.student?.lastName} <span style={{ color: 'var(--text3)', marginLeft: 8 }}>{a.student?.id}</span></td>
                    <td>{a.type}</td>
                    <td>{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showGrades && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">Attendance by Grade</div>
            <div style={{ padding: 12 }}>
              {byGrade.map(bg => (
                <div key={bg.grade} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontWeight: 700 }}>{bg.grade}</div><div>{bg.rate}%</div></div>
                  <div style={{ background: '#eee', height: 10, borderRadius: 6 }}><div style={{ width: `${bg.rate}%`, height: 10, background: 'linear-gradient(90deg,#3b82f6,#60a5fa)', borderRadius: 6 }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">Grade Distribution (counts)</div>
          <div style={{ padding: 12 }}>
            {dist.map(d => (
              <div key={d.range} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, fontWeight: 600 }}>{d.range}</div>
                <div style={{ flex: 1, background: '#f3f4f6', height: 12, borderRadius: 6 }}><div style={{ width: `${Math.min(100, d.count*10)}%`, height: 12, background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 6 }} /></div>
                <div style={{ width: 40, textAlign: 'right' }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
