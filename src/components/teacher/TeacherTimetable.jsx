import React from 'react';
import Topbar from '../layout/Topbar';

export default function TeacherTimetable({ store, teacherId }) {
  const periods = store.periods || [];
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  // Build a map day -> list of cells where teacherId matches
  const teacherCells = {};
  Object.entries(store.timetables || {}).forEach(([classId, tt]) => {
    days.forEach(day => {
      (tt[day] || []).forEach(cell => {
        if (cell.teacherId === teacherId) {
          teacherCells[day] = teacherCells[day] || [];
          teacherCells[day].push({ ...cell, classId });
        }
      });
    });
  });

  // exam invigilation assignments: find exam entries where invigilator==teacherId or all
  const exams = [];
  Object.entries(store.examTimetables || {}).forEach(([classId, arr]) => {
    arr.forEach(e => {
      if (!e.invigilator || e.invigilator === teacherId) exams.push({ ...e, classId });
    });
  });

  return (
    <div>
      <Topbar title="My Timetable" subtitle="Teacher view" school={store.school} />
      <div className="page-content animate-in">
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: 12, background: 'var(--bg3)' }}>Period</th>
                {days.map(d=> <th key={d} style={{ padding: 12, textAlign: 'center' }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map(p=> (
                <tr key={p.period}>
                  <td style={{ padding: 10, background: 'var(--bg3)' }}>
                    <div style={{ fontWeight:700 }}>P{p.period}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{p.time}</div>
                  </td>
                  {days.map(day => (
                    <td key={day} style={{ padding: 8, borderLeft: '1px solid var(--border)' }}>
                      {(teacherCells[day]||[]).filter(c=>c.period===p.period).map((cell,i)=>{
                        const cls = store.classes.find(cc=>cc.id===cell.classId);
                        return (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight:700 }}>{cell.subject}</div>
                            <div style={{ fontSize:12, color:'var(--text3)' }}>{cls?.name || cell.classId}</div>
                            {cell.room && <div style={{ fontSize:11, color:'var(--text3)' }}>{cell.room}</div>}
                          </div>
                        );
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Exam Timetable (Invigilation)</h3>
          {exams.length === 0 ? (
            <div style={{ color: 'var(--text3)' }}>No exam duties assigned.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e,i)=>{
                  const cls = store.classes.find(c=>c.id===e.classId);
                  return (
                    <tr key={i}>
                      <td>{e.date}</td>
                      <td>{e.start} - {e.end}</td>
                      <td>{e.subject}</td>
                      <td>{cls?.name || e.classId}</td>
                      <td>{e.venue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
