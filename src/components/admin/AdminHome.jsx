import React, { useMemo } from 'react';
import { APP_VERSION } from '../../config/appConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserCheck, BookOpen, Trophy, TrendingUp,
  ChevronRight, Award, Activity, DollarSign, UserCog
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { calculateGPA, scoreToGrade } from '../../data/store';

const COLORS = ['#3b82f6', '#06d6a0', '#a78bfa', '#f59e0b', '#ef4444'];

export default function AdminHome({ store, onUpdate }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const base = '/admin';

  const activeStudents = store.students.filter(s => s.status === 'Active').length;
  const activeTeachers = store.teachers.filter(t => t.status === 'Active').length;
  const totalCollected = (store.feePayments || []).reduce((a, p) => a + p.amount, 0);
  const pendingEnrollments = (store.enrollmentRequests || []).filter(r => r.status === 'Pending').length;

  const gradeDistribution = useMemo(() => {
    const counts = { '9': 0, '10': 0, '11': 0, '12': 0 };
    store.students.forEach(s => { if (counts[s.grade] !== undefined) counts[s.grade]++; });
    return Object.entries(counts).map(([grade, count]) => ({ name: `Gr ${grade}`, value: count }));
  }, [store.students]);

  const subjectPerf = useMemo(() => {
    const by = {};
    store.grades.forEach(g => {
      if (!by[g.subject]) by[g.subject] = [];
      by[g.subject].push(g.score);
    });
    return Object.entries(by).map(([s, scores]) => ({
      subject: s.length > 10 ? s.slice(0, 10) + '…' : s,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));
  }, [store.grades]);

  const attendanceData = [
    { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 97 },
    { day: 'Wed', rate: 91 }, { day: 'Thu', rate: 95 }, { day: 'Fri', rate: 89 },
  ];

  const announcements = store.announcements || [];
  const upcomingEvents = [...store.events]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="page-content animate-in">
      <div style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">App Install & Updates</div>
          <div style={{ padding: 12 }}>
            <div style={{ color: 'var(--text3)', marginBottom: 8 }}>Install this app on Android or Desktop via the browser's Install/Add to Home screen option.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => alert('To install: open browser menu → Install app / Add to Home screen')}>How to Install</button>
              <button className="btn" onClick={() => { window.location.reload(); }}>Reload App</button>
            </div>
            <div style={{ marginTop: 8, color: 'var(--text3)' }}>App version: <strong>{APP_VERSION}</strong></div>
            {typeof window !== 'undefined' && (
              <div style={{ marginTop: 8 }}>
                <small style={{ color: 'var(--text3)' }}>When a new version is available the app cache updates; use <strong>Reload App</strong> to activate.</small>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Stat cards */}
      <div className="stat-grid">
        {[
          { label: 'Total Students', val: activeStudents, sub: `${store.students.filter(s=>s.grade==='12').length} in Grade 12`, color: 'blue', Icon: Users, path: `${base}/students` },
          { label: 'Teachers', val: activeTeachers, sub: `${store.staff?.length || 0} support staff`, color: 'green', Icon: UserCheck, path: `${base}/teachers` },
          { label: 'Classes', val: store.classes.length, sub: 'Grades 9–12', color: 'purple', Icon: BookOpen, path: `${base}/classes` },
          { label: 'Sports & Clubs', val: store.sports.length, sub: `${store.sports.reduce((a,s)=>a+s.members.length,0)} participants`, color: 'amber', Icon: Trophy, path: `${base}/sports` },
          { label: 'Fees Collected', val: `$${totalCollected.toLocaleString()}`, sub: `${store.feePayments?.length||0} transactions`, color: 'cyan', Icon: DollarSign, path: `${base}/fees` },
          { label: 'Pending Enrollment', val: pendingEnrollments, sub: 'Awaiting review', color: pendingEnrollments > 0 ? 'red' : 'green', Icon: Activity, path: `${base}/enrollment`, badge: pendingEnrollments > 0 },
        ].map(({ label, val, sub, color, Icon, path, badge }) => (
          <div key={label} className={`stat-card ${color}`} style={{ cursor: 'pointer' }} onClick={() => navigate(path)}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Attendance Rate</div>
            <span className="badge badge-success">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
              <XAxis dataKey="day" stroke="#5a7a99" tick={{ fontSize: 11 }} />
              <YAxis stroke="#5a7a99" tick={{ fontSize: 11 }} domain={[80, 100]} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="url(#aGrad)" strokeWidth={2} name="Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Subject Averages</div>
            <span className="badge badge-primary">Term 1</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subjectPerf} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
              <XAxis dataKey="subject" stroke="#5a7a99" tick={{ fontSize: 9 }} />
              <YAxis stroke="#5a7a99" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" fill="#06d6a0" radius={[4, 4, 0, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">By Grade</div></div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                {gradeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {gradeDistribution.map((g, i) => (
              <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text2)' }}>
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
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/students`)}>View All <ChevronRight size={12} /></button>
          </div>
          {store.students.slice(-5).reverse().map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{s.firstName[0]}{s.lastName[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.firstName} {s.lastName}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Grade {s.grade}{s.stream} · {s.id}</div>
              </div>
              <span className="badge badge-success">{s.status}</span>
            </div>
          ))}
        </div>

        {/* Upcoming events + announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Events</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/events`)}>View All <ChevronRight size={12} /></button>
          </div>
          {upcomingEvents.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--primary-glow)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', lineHeight: 1 }}>{new Date(ev.date).getDate()}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{new Date(ev.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{ev.description}</div>
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20, fontSize: 13 }}>No upcoming events</div>}

          {announcements.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Announcements</div>
              {announcements.slice(0, 2).map(a => (
                <div key={a.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{a.body.slice(0, 80)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger zone: Clear all data */}
      {/* Remote license controls moved to Owner dashboard */}
      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">Danger Zone</div>
          <div style={{ padding: 12 }}>
            <div style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>Clear all data</div>
            <div style={{ color: 'var(--text3)', marginBottom: 12 }}>This will remove all students, teachers, classes, grades, payments and other data — keeping only your administrator account. Use when preparing a fresh demo for a new school.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(store)); alert('Backup copied to clipboard'); }}>Backup (copy JSON)</button>
              <button className="btn btn-danger" onClick={() => {
                if (!currentUser) { alert('No admin user found'); return; }
                if (!window.confirm('Are you sure? This action cannot be undone.')) return;
                const adminUser = (store.users || []).find(u => u.id === currentUser.id) || currentUser;
                const cleared = {
                  school: store.school || { name: 'New School' },
                  users: [adminUser],
                  staff: [],
                  students: [],
                  teachers: [],
                  classes: [],
                  subjects: [],
                  subjectAssignments: [],
                  grades: [],
                  attendance: [],
                  feeStructure: [],
                  feePayments: [],
                  events: [],
                  schemes: [],
                  enrollmentRequests: [],
                  timetables: {},
                  periods: store.periods || [],
                  examTimetables: {},
                  requests: [],
                  uploadedFiles: [],
                  notifications: [],
                  personalizedPlans: [],
                  announcements: [],
                };
                try { onUpdate(cleared); alert('System cleared — only current admin retained'); } catch (e) { alert('Failed to clear: ' + e.message); }
              }}>Clear All Data (keep admin)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
