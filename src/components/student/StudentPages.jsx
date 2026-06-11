import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../layout/Topbar';
import { Award, ClipboardList, Trophy, Calendar, BookOpen } from 'lucide-react';
import { calculateGPA, scoreToGrade, GRADE_SCALE } from '../../data/store';

/* ─── HOME ─────────────────────────────────────────── */
export function StudentHome({ store, studentId, student }) {
  if (!student) return <div className="page-content"><div className="alert alert-danger">Student record not found for this account.</div></div>;

  const myGrades = store.grades.filter(g => g.studentId === studentId);
  const myAttendance = store.attendance.filter(a => a.studentId === studentId);
  const mySports = store.sports.filter(s => s.members.includes(studentId));
  const gpa = calculateGPA(myGrades);
  const presentCount = myAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = myAttendance.length ? Math.round((presentCount / myAttendance.length) * 100) : 0;
  const cls = store.classes.find(c => c.grade === student.grade && c.stream === student.stream);
  const classTeacher = cls ? store.teachers.find(t => t.id === cls.classTeacherId) : null;
  const gpaClass = gpa >= 3.5 ? 'gpa-excellent' : gpa >= 3.0 ? 'gpa-good' : gpa >= 2.0 ? 'gpa-average' : 'gpa-poor';
  const announcements = (store.announcements || []).filter(a => a.audience === 'all' || a.audience === 'students');

  return (
    <div className="page-content animate-in">
      {/* Profile banner */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(6,214,160,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #06d6a0, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{student.firstName} {student.lastName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-success">{cls?.name || `Grade ${student.grade}${student.stream}`}</span>
              <span className="badge badge-info">{student.id}</span>
              <span className="badge badge-primary">{store.school.currentYear}</span>
            </div>
            {classTeacher && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Class Teacher: {classTeacher.firstName} {classTeacher.lastName}</div>}
          </div>
          <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
            <div>
              <div className={`gpa-badge ${gpaClass}`}>{gpa}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>GPA</div>
            </div>
            <div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${attendanceRate >= 90 ? 'var(--success)' : attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: attendanceRate >= 90 ? 'var(--success)' : attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' }}>
                {attendanceRate}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Attendance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="stat-card green"><div className="stat-icon green"><Award size={20} /></div><div className="stat-value">{myGrades.length}</div><div className="stat-label">Grades Recorded</div></div>
        <div className="stat-card blue"><div className="stat-icon blue"><ClipboardList size={20} /></div><div className="stat-value">{attendanceRate}%</div><div className="stat-label">Attendance</div></div>
        <div className="stat-card amber"><div className="stat-icon amber"><Trophy size={20} /></div><div className="stat-value">{mySports.length}</div><div className="stat-label">Sports/Clubs</div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><BookOpen size={20} /></div><div className="stat-value">{cls?.subjects?.length || 0}</div><div className="stat-label">Subjects</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Recent Grades</div>
          {myGrades.slice(-5).reverse().map(g => {
            const gs = scoreToGrade(g.score);
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{g.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{g.term} · {g.examType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: g.score>=80?'var(--success)':g.score>=60?'var(--warning)':'var(--danger)' }}>{g.score}%</div>
                  <span className={`badge ${g.score>=80?'badge-success':g.score>=60?'badge-warning':'badge-danger'}`} style={{ fontSize: 10 }}>{gs.grade}</span>
                </div>
              </div>
            );
          })}
          {myGrades.length === 0 && <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20, fontSize: 13 }}>No grades yet</div>}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Announcements</div>
          {announcements.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No announcements</div>}
          {announcements.map(a => (
            <div key={a.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid var(--primary)' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{a.body}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{a.date}</div>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>My Subjects</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(cls?.subjects || []).map(s => <span key={s} className="badge badge-info">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GRADES ─────────────────────────────────────────── */
export function StudentGrades({ store, studentId, student }) {
  const myGrades = store.grades.filter(g => g.studentId === studentId);
  const gpa = calculateGPA(myGrades);
  const gpaClass = gpa >= 3.5 ? 'gpa-excellent' : gpa >= 3.0 ? 'gpa-good' : gpa >= 2.0 ? 'gpa-average' : 'gpa-poor';
  const [termFilter, setTermFilter] = useState('');
  const filtered = myGrades.filter(g => !termFilter || g.term === termFilter);

  return (
    <div>
      <Topbar title="My Grades" subtitle="Academic results" school={store.school} />
      <div className="page-content animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className={`gpa-badge ${gpaClass}`} style={{ width: 64, height: 64, fontSize: 20 }}>{gpa}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>Overall GPA</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{myGrades.length} grade records · {store.school.currentYear}</div>
          </div>
        </div>
        <div className="filters-row">
          {['', 'Term 1', 'Term 2', 'Term 3'].map(t => (
            <button key={t} className={`btn btn-sm ${termFilter===t?'btn-primary':'btn-ghost'}`} onClick={() => setTermFilter(t)}>{t||'All Terms'}</button>
          ))}
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Points</th><th>Type</th><th>Teacher</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No grades found</td></tr>
                ) : filtered.map(g => {
                  const gs = scoreToGrade(g.score);
                  const teacher = store.teachers.find(t=>t.id===g.teacherId);
                  return (
                    <tr key={g.id}>
                      <td style={{ fontWeight:600,color:'var(--text)' }}>{g.subject}</td>
                      <td style={{ color:'var(--text3)' }}>{g.term}</td>
                      <td>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <span style={{ fontWeight:700,color:g.score>=80?'var(--success)':g.score>=60?'var(--warning)':'var(--danger)' }}>{g.score}%</span>
                          <div className="progress-bar" style={{ width:50 }}><div className={`progress-fill ${g.score>=80?'progress-green':g.score>=60?'progress-amber':'progress-red'}`} style={{ width:`${g.score}%` }} /></div>
                        </div>
                      </td>
                      <td><span className={`badge ${g.score>=80?'badge-success':g.score>=60?'badge-warning':'badge-danger'}`}>{gs.grade}</span></td>
                      <td style={{ fontWeight:700 }}>{gs.points}</td>
                      <td style={{ color:'var(--text3)',fontSize:12 }}>{g.examType}</td>
                      <td style={{ color:'var(--text3)',fontSize:12 }}>{teacher?`${teacher.firstName} ${teacher.lastName}`:'—'}</td>
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

/* ─── ATTENDANCE ─────────────────────────────────────────── */
export function StudentAttendance({ store, studentId }) {
  const myAtt = store.attendance.filter(a => a.studentId === studentId);
  const present = myAtt.filter(a=>a.status==='Present').length;
  const absent = myAtt.filter(a=>a.status==='Absent').length;
  const late = myAtt.filter(a=>a.status==='Late').length;
  const rate = myAtt.length ? Math.round((present/myAtt.length)*100) : 0;

  return (
    <div>
      <Topbar title="Attendance" subtitle="Your attendance records" school={store.school} />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)',marginBottom:20 }}>
          {[['Present',present,'var(--success)'],['Absent',absent,'var(--danger)'],['Late',late,'var(--warning)'],['Rate',`${rate}%`,'var(--primary)']].map(([l,v,c])=>(
            <div key={l} className="card" style={{ padding:14,textAlign:'center' }}>
              <div style={{ fontSize:28,fontWeight:800,fontFamily:'var(--font-display)',color:c }}>{v}</div>
              <div style={{ fontSize:11,color:'var(--text3)' }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {myAtt.length===0 ? <tr><td colSpan={3} style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No records</td></tr>
                : myAtt.slice().reverse().map(a=>(
                  <tr key={a.id}>
                    <td style={{ color:'var(--text2)' }}>{a.date}</td>
                    <td style={{ color:'var(--text2)' }}>{a.subject}</td>
                    <td><span className={`badge ${a.status==='Present'?'badge-success':a.status==='Absent'?'badge-danger':'badge-warning'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SPORTS ─────────────────────────────────────────── */
export function StudentSports({ store, studentId }) {
  const mySports = store.sports.filter(s => s.members.includes(studentId));
  return (
    <div>
      <Topbar title="Sports & Clubs" subtitle="Your activities" school={store.school} />
      <div className="page-content animate-in">
        {mySports.length === 0 ? (
          <div className="card empty-state"><Trophy size={40} /><h3>No Activities</h3><p>You have not been enrolled in any sports or clubs yet.</p></div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
            {mySports.map(sport=>(
              <div key={sport.id} className="card">
                <div style={{ fontSize:36,marginBottom:12 }}>🏆</div>
                <div style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,marginBottom:8 }}>{sport.name}</div>
                <div style={{ display:'flex',gap:6,marginBottom:12 }}>
                  <span className={`badge ${sport.type==='Team'?'badge-primary':'badge-info'}`}>{sport.type}</span>
                  <span className={`badge ${sport.status==='Active'?'badge-success':'badge-warning'}`}>{sport.status}</span>
                </div>
                {[['Coach',sport.coach],['Schedule',sport.schedule],['Venue',sport.venue],['Members',`${sport.members.length} members`]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex',gap:8,fontSize:12,marginBottom:4 }}>
                    <span style={{ color:'var(--text3)',minWidth:60 }}>{l}:</span>
                    <span style={{ color:'var(--text2)' }}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── EVENTS ─────────────────────────────────────────── */
export function StudentEvents({ store }) {
  const sorted = [...store.events].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const upcoming = sorted.filter(e=>new Date(e.date)>=new Date());
  const TYPE_COLORS = { Academic:'badge-primary',Sports:'badge-success',Ceremony:'badge-purple',Holiday:'badge-warning',Meeting:'badge-info',Cultural:'badge-purple',Other:'badge-info' };

  return (
    <div>
      <Topbar title="Events" subtitle="School calendar" school={store.school} />
      <div className="page-content animate-in">
        {upcoming.length === 0 ? (
          <div className="card empty-state"><Calendar size={40} /><h3>No Upcoming Events</h3><p>Check back later for new events.</p></div>
        ) : upcoming.map(ev=>{
          const d = new Date(ev.date);
          return (
            <div key={ev.id} className="card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex',alignItems:'flex-start',gap:16 }}>
                <div style={{ background:'var(--primary-glow)',borderRadius:12,padding:'10px 14px',textAlign:'center',minWidth:58,flexShrink:0 }}>
                  <div style={{ fontSize:22,fontWeight:800,fontFamily:'var(--font-display)',color:'var(--primary)',lineHeight:1 }}>{d.getDate()}</div>
                  <div style={{ fontSize:10,color:'var(--text3)',marginTop:2 }}>{d.toLocaleString('default',{month:'short'}).toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:700 }}>{ev.title}</div>
                  <div style={{ display:'flex',gap:6,marginTop:5,flexWrap:'wrap' }}>
                    <span className={`badge ${TYPE_COLORS[ev.type]||'badge-info'}`}>{ev.type}</span>
                    {ev.organizer && <span className="badge badge-purple">{ev.organizer}</span>}
                  </div>
                  {ev.description && <div style={{ marginTop:6,fontSize:13,color:'var(--text2)' }}>{ev.description}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── REPORT CARD ─────────────────────────────────────────── */
export function StudentReportCard({ store, studentId, student }) {
  const { currentUser } = useAuth();
  const [term, setTerm] = useState(store.school.currentTerm);
  const myGrades = store.grades.filter(g => g.studentId === studentId && g.term === term);
  const myAtt = store.attendance.filter(a => a.studentId === studentId);
  const present = myAtt.filter(a=>a.status==='Present').length;
  const rate = myAtt.length ? Math.round((present/myAtt.length)*100) : 0;
  const gpa = calculateGPA(myGrades);
  const cls = student ? store.classes.find(c=>c.grade===student.grade&&c.stream===student.stream) : null;
  const classTeacher = cls ? store.teachers.find(t=>t.id===cls.classTeacherId) : null;

  // If results are locked for this student, prevent students from viewing
  if (student?.resultsLocked && currentUser?.role === 'student') {
    return (
      <div>
        <Topbar title="Report Card" subtitle="Your academic report" school={store.school} />
        <div className="page-content animate-in">
          <div className="card" style={{ maxWidth:780,margin:'0 auto', textAlign: 'center' }}>
            <div style={{ padding: 40 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--danger)' }}>Results Locked</div>
              <div style={{ marginTop: 8, color: 'var(--text3)' }}>Your report card has been locked due to outstanding fees. Please contact the school accountant or an administrator to unlock.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Report Card" subtitle="Your academic report" school={store.school}
        actions={<button className="btn btn-primary" onClick={()=>window.print()}>🖨 Print</button>}
      />
      <div className="page-content animate-in">
        <div className="card" style={{ marginBottom:16 }}>
          <label className="form-label">Term</label>
          <select className="form-control" style={{ width:160 }} value={term} onChange={e=>setTerm(e.target.value)}>
            <option>Term 1</option><option>Term 2</option><option>Term 3</option>
          </select>
        </div>
        {student && (
          <div className="card" style={{ maxWidth:780,margin:'0 auto' }}>
            <div style={{ textAlign:'center',borderBottom:'2px solid var(--primary)',paddingBottom:16,marginBottom:16 }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,color:'var(--primary)' }}>{store.school.name}</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{store.school.address}</div>
              <div style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,marginTop:10 }}>STUDENT REPORT CARD</div>
              <div style={{ fontSize:12,color:'var(--text2)' }}>{store.school.currentYear} · {term}</div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,background:'var(--bg3)',padding:14,borderRadius:'var(--radius-sm)',marginBottom:16 }}>
              {[['Name',`${student.firstName} ${student.lastName}`],['Student ID',student.id],['Class',cls?.name||`Grade ${student.grade}${student.stream}`],['Class Teacher',classTeacher?`${classTeacher.firstName} ${classTeacher.lastName}`:'—']].map(([l,v])=>(
                <div key={l} style={{ display:'flex',gap:8 }}>
                  <span style={{ color:'var(--text3)',fontSize:12,minWidth:110 }}>{l}:</span>
                  <span style={{ fontWeight:600,fontSize:13 }}>{v}</span>
                </div>
              ))}
            </div>
            {myGrades.length === 0 ? (
              <div style={{ textAlign:'center',padding:30,color:'var(--text3)' }}>No grades for {term}</div>
            ) : (
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:16 }}>
                <thead><tr style={{ background:'var(--bg3)' }}>{['Subject','Score','Grade','Points','Remark'].map(h=><th key={h} style={{ padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {myGrades.map(g=>{const gs=scoreToGrade(g.score);return(
                    <tr key={g.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 12px',fontWeight:600 }}>{g.subject}</td>
                      <td style={{ padding:'10px 12px',fontWeight:700,color:g.score>=80?'var(--success)':g.score>=60?'var(--warning)':'var(--danger)' }}>{g.score}%</td>
                      <td style={{ padding:'10px 12px' }}><span className={`badge ${g.score>=80?'badge-success':g.score>=60?'badge-warning':'badge-danger'}`}>{gs.grade}</span></td>
                      <td style={{ padding:'10px 12px',fontWeight:700 }}>{gs.points}</td>
                      <td style={{ padding:'10px 12px',color:'var(--text3)',fontSize:12 }}>{gs.description}</td>
                    </tr>
                  );})}
                  <tr style={{ background:'var(--bg3)',fontWeight:700 }}>
                    <td style={{ padding:'10px 12px' }}>OVERALL GPA</td>
                    <td style={{ padding:'10px 12px',color:'var(--text2)' }}>{myGrades.length>0?Math.round(myGrades.reduce((a,g)=>a+g.score,0)/myGrades.length)+'%':'—'}</td>
                    <td colSpan={3} style={{ padding:'10px 12px' }}><span style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,color:'var(--primary)' }}>GPA: {gpa}</span></td>
                  </tr>
                </tbody>
              </table>
            )}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
              <div style={{ background:'var(--bg3)',padding:12,borderRadius:'var(--radius-sm)' }}>
                <div style={{ fontWeight:700,fontSize:12,marginBottom:6 }}>Attendance</div>
                <div style={{ display:'flex',gap:16 }}>
                  {[['Present',present,'var(--success)'],['Absent',myAtt.length-present,'var(--danger)'],['Rate',`${rate}%`,'var(--primary)']].map(([l,v,c])=>(
                    <div key={l}><div style={{ fontSize:18,fontWeight:800,fontFamily:'var(--font-display)',color:c }}>{v}</div><div style={{ fontSize:10,color:'var(--text3)' }}>{l}</div></div>
                  ))}
                </div>
              </div>
              <div style={{ background:'var(--bg3)',padding:12,borderRadius:'var(--radius-sm)' }}>
                <div style={{ fontWeight:700,fontSize:12,marginBottom:6 }}>Sports & Activities</div>
                {store.sports.filter(s=>s.members.includes(studentId)).map(s=><div key={s.id} style={{ fontSize:12,color:'var(--text2)',marginBottom:3 }}>• {s.name}</div>)}
                {store.sports.filter(s=>s.members.includes(studentId)).length===0 && <div style={{ fontSize:12,color:'var(--text3)' }}>None</div>}
              </div>
            </div>
            <div style={{ borderTop:'1px solid var(--border)',paddingTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,textAlign:'center' }}>
              {['Class Teacher','Head of Department','Principal'].map(sig=>(
                <div key={sig}><div style={{ borderBottom:'1px solid var(--text3)',marginBottom:6,height:32 }} /><div style={{ fontSize:10,color:'var(--text3)' }}>{sig}</div></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
