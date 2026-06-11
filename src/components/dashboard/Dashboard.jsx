import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, BookOpen, Trophy, TrendingUp, Calendar,
  Clock, ChevronRight, AlertCircle, Award, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Topbar from '../layout/Topbar';

const COLORS = ['#3b82f6', '#06d6a0', '#a78bfa', '#f59e0b', '#ef4444'];

export default function Dashboard({ store }) {
  const navigate = useNavigate();
  const { students, teachers, classes, grades, sports, events, attendance } = store;

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const activeTeachers = teachers.filter(t => t.status === 'Active').length;

  const gradeDistribution = useMemo(() => {
    const counts = { '9': 0, '10': 0, '11': 0, '12': 0 };
    students.forEach(s => { if (counts[s.grade] !== undefined) counts[s.grade]++; });
    return Object.entries(counts).map(([grade, count]) => ({
      name: `Grade ${grade}`, value: count
    }));
  }, [students]);

  const subjectPerformance = useMemo(() => {
    const bySubject = {};
    grades.forEach(g => {
      if (!bySubject[g.subject]) bySubject[g.subject] = [];
      bySubject[g.subject].push(g.score);
    });
    return Object.entries(bySubject).map(([subject, scores]) => ({
      subject: subject.length > 12 ? subject.substring(0, 12) + '…' : subject,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));
  }, [grades]);

  const attendanceData = [
    { day: 'Mon', present: 94, absent: 6 },
    { day: 'Tue', present: 97, absent: 3 },
    { day: 'Wed', present: 91, absent: 9 },
    { day: 'Thu', present: 95, absent: 5 },
    { day: 'Fri', present: 89, absent: 11 },
  ];

  const upcomingEvents = events.slice(0, 4);
  const recentStudents = students.slice(-4).reverse();

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={`${store.school.currentYear} · ${store.school.currentTerm}`}
        school={store.school}
      />
      <div className="page-content animate-in">
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/students')}>
            <div className="stat-icon blue"><Users size={20} /></div>
            <div className="stat-value">{activeStudents}</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-sub">{students.filter(s => s.grade === '12').length} in Grade 12</div>
          </div>
          <div className="stat-card green" style={{ cursor: 'pointer' }} onClick={() => navigate('/teachers')}>
            <div className="stat-icon green"><UserCheck size={20} /></div>
            <div className="stat-value">{activeTeachers}</div>
            <div className="stat-label">Teachers</div>
            <div className="stat-sub">{teachers.length} departments covered</div>
          </div>
          <div className="stat-card purple" style={{ cursor: 'pointer' }} onClick={() => navigate('/classes')}>
            <div className="stat-icon purple"><BookOpen size={20} /></div>
            <div className="stat-value">{classes.length}</div>
            <div className="stat-label">Classes</div>
            <div className="stat-sub">Grades 9–12</div>
          </div>
          <div className="stat-card amber" style={{ cursor: 'pointer' }} onClick={() => navigate('/sports')}>
            <div className="stat-icon amber"><Trophy size={20} /></div>
            <div className="stat-value">{sports.length}</div>
            <div className="stat-label">Sports & Clubs</div>
            <div className="stat-sub">{sports.reduce((a, s) => a + s.members.length, 0)} participants</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-icon cyan"><Activity size={20} /></div>
            <div className="stat-value">94%</div>
            <div className="stat-label">Avg Attendance</div>
            <div className="stat-sub">This week</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><Award size={20} /></div>
            <div className="stat-value">3.24</div>
            <div className="stat-label">School GPA</div>
            <div className="stat-sub">Academic average</div>
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 16, marginBottom: 20 }}>
          {/* Attendance trend */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Weekly Attendance</div>
              <span className="badge badge-success">This Week</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
                <XAxis dataKey="day" stroke="#5a7a99" tick={{ fontSize: 11 }} />
                <YAxis stroke="#5a7a99" tick={{ fontSize: 11 }} domain={[80, 100]} />
                <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8 }} />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#colorPresent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subject performance */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Subject Averages</div>
              <span className="badge badge-primary">Term 1</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectPerformance} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
                <XAxis dataKey="subject" stroke="#5a7a99" tick={{ fontSize: 10 }} />
                <YAxis stroke="#5a7a99" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8 }} />
                <Bar dataKey="avg" fill="#06d6a0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">By Grade</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gradeDistribution.map((g, i) => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                  {g.name}: {g.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Recent students */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Students</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students')}>
                View All <ChevronRight size={13} />
              </button>
            </div>
            {recentStudents.map(student => (
              <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className={`avatar avatar-${['blue','green','purple','amber'][Math.floor(Math.random()*4)]}`}>
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{student.firstName} {student.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Grade {student.grade}{student.stream} · {student.id}</div>
                </div>
                <span className="badge badge-success">{student.status}</span>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming Events</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>
                View All <ChevronRight size={13} />
              </button>
            </div>
            {upcomingEvents.map(ev => {
              const typeColors = { Sports: 'badge-success', Academic: 'badge-primary', Ceremony: 'badge-purple', Holiday: 'badge-warning' };
              return (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', minWidth: 48 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                      {new Date(ev.date).getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{ev.description}</div>
                    <span className={`badge ${typeColors[ev.type] || 'badge-info'}`} style={{ marginTop: 4, display: 'inline-flex' }}>{ev.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
