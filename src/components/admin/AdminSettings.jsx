import React, { useState } from 'react';
import { Save, Building2, AlertTriangle, RotateCcw } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { resetStore } from '../../data/store';

export default function AdminSettings({ store, onUpdate }) {
  const [school, setSchool] = useState({ ...store.school });
  const [saved, setSaved] = useState(false);
  function set(f, v) { setSchool(x => ({ ...x, [f]: v })); }

  function handleSave(e) {
    e.preventDefault();
    onUpdate({ ...store, school });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!window.confirm('⚠️ RESET ALL DATA to demo data? This cannot be undone.')) return;
    const fresh = resetStore();
    onUpdate(fresh);
    window.location.reload();
  }

  const counts = [
    ['Students', store.students.length], ['Teachers', store.teachers.length],
    ['Classes', store.classes.length], ['Grade Records', store.grades.length],
    ['Attendance', store.attendance.length], ['Sports', store.sports.length],
    ['Schemes', store.schemes.length], ['Events', store.events.length],
    ['User Accounts', store.users?.length || 0],
  ];

  return (
    <div>
      <Topbar title="Settings & School Profile" subtitle="System configuration" school={store.school} />
      <div className="page-content animate-in" style={{ maxWidth: 720 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--primary)" /> School Profile
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">School Name</label><input className="form-control" value={school.name} onChange={e=>set('name',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Principal</label><input className="form-control" value={school.principal} onChange={e=>set('principal',e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Motto</label><input className="form-control" value={school.motto} onChange={e=>set('motto',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={school.address} onChange={e=>set('address',e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={school.phone} onChange={e=>set('phone',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={school.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Academic Year</label><input className="form-control" value={school.currentYear} onChange={e=>set('currentYear',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Current Term</label>
                <select className="form-control" value={school.currentTerm} onChange={e=>set('currentTerm',e.target.value)}>
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary"><Save size={14} /> Save Changes</button>
              {saved && <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ Saved</span>}
            </div>
          </form>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Data Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {counts.map(([label, val]) => (
              <div key={label} style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <div className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>Reset all data to demo state. All records you created will be permanently deleted.</p>
          <button className="btn btn-danger" onClick={handleReset}><RotateCcw size={13} /> Reset to Demo Data</button>
        </div>
      </div>
    </div>
  );
}
