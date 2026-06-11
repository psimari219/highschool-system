import React from 'react';
import Topbar from '../layout/Topbar';

export default function StudentTimetable({ store, student }) {
  const periods = store.periods || [];
  const cls = store.classes.find(c => c.grade === student?.grade && c.stream === student?.stream);
  const timetable = cls ? (store.timetables?.[cls.id] || {}) : {};
  const examTable = cls ? (store.examTimetables?.[cls.id] || []) : [];

  function renderCell(day, p) {
    const cell = timetable[day]?.find(x => x.period === p.period) || null;
    if (!cell) return <div style={{ color: 'var(--text3)' }}>Free</div>;
    const teacher = store.teachers.find(t => t.id === cell.teacherId);
    return (
      <div>
        <div style={{ fontWeight: 700 }}>{cell.subject}</div>
        {teacher && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{teacher.firstName} {teacher.lastName}</div>}
        {cell.room && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{cell.room}</div>}
      </div>
    );
  }

  return (
    <div>
      <Topbar title="My Timetable" subtitle={`Class: ${cls?.name || '—'}`} school={store.school} />
      <div className="page-content animate-in">
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: 12, background: 'var(--bg3)' }}>Period</th>
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=> <th key={d} style={{ padding: 12, textAlign: 'center' }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map(p=> (
                <tr key={p.period}>
                  <td style={{ padding: 10, background: 'var(--bg3)' }}>
                    <div style={{ fontWeight:700 }}>P{p.period}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{p.time}</div>
                  </td>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => (
                    <td key={day} style={{ padding: 8, borderLeft: '1px solid var(--border)' }}>{renderCell(day,p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Exam Timetable</h3>
          {examTable.length === 0 ? (
            <div style={{ color: 'var(--text3)' }}>No exams scheduled.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {examTable.map((e,i)=>(
                  <tr key={i}>
                    <td>{e.date}</td>
                    <td>{e.start} - {e.end}</td>
                    <td>{e.subject}</td>
                    <td>{e.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
