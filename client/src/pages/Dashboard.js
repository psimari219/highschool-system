import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data));
    api.get('/announcements').then(r => setAnnouncements(r.data.slice(0, 3)));
    api.get('/events').then(r => setEvents(r.data.slice(0, 4)));
  }, []);

  if (!stats) return <div style={{padding:'32px',color:'var(--text2)'}}>Loading dashboard...</div>;

  const gradeData = Object.entries(stats.gradeDistribution).map(([g, c]) => ({ name: `Grade ${g}`, students: c }));
  const gpaColor = g => g >= 3.5 ? 'var(--green)' : g >= 2.5 ? 'var(--accent2)' : g >= 1.5 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's what's happening at your school today.</p>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-label">Teachers</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon yellow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-label">Active Classes</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <div className="stat-value" style={{color:gpaColor(parseFloat(stats.avgGPA))}}>{stats.avgGPA}</div>
            <div className="stat-label">School Avg GPA</div>
          </div>
          <div className="stat-card pink">
            <div className="stat-icon pink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
            <div className="stat-value">{stats.sportsTeams}</div>
            <div className="stat-label">Sports Teams</div>
          </div>
        </div>

        <div className="grid-2" style={{marginBottom:'24px'}}>
          <div className="card">
            <div className="card-title">Students by Grade</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeData}>
                <XAxis dataKey="name" tick={{fill:'var(--text2)',fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'var(--text2)',fontSize:12}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text)'}}/>
                <Bar dataKey="students" fill="var(--accent)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">Upcoming Events</div>
            {events.map(ev => (
              <div key={ev.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:'40px',textAlign:'center',flexShrink:0}}>
                  <div style={{fontSize:'18px',fontWeight:'800',color:'var(--accent2)',fontFamily:'JetBrains Mono'}}>{new Date(ev.date).getDate()}</div>
                  <div style={{fontSize:'10px',color:'var(--text3)',textTransform:'uppercase'}}>{new Date(ev.date).toLocaleString('default',{month:'short'})}</div>
                </div>
                <div>
                  <div style={{fontSize:'14px',fontWeight:'600'}}>{ev.title}</div>
                  <div style={{fontSize:'12px',color:'var(--text3)'}}>{ev.time} · {ev.venue}</div>
                </div>
                <span className={`badge badge-${ev.type==='Sports'?'green':ev.type==='Academic'?'blue':ev.type==='Meeting'?'yellow':'purple'}`} style={{marginLeft:'auto'}}>{ev.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recent Announcements</div>
          {announcements.map(ann => (
            <div key={ann.id} style={{padding:'14px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:'16px',alignItems:'flex-start'}}>
              <span className={`badge badge-${ann.priority==='High'?'red':ann.priority==='Medium'?'yellow':'gray'}`} style={{flexShrink:0,marginTop:'2px'}}>{ann.priority}</span>
              <div>
                <div style={{fontWeight:'600',marginBottom:'4px'}}>{ann.title}</div>
                <div style={{fontSize:'13px',color:'var(--text2)'}}>{ann.content}</div>
                <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'6px'}}>{ann.date} · {ann.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
