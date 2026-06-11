import React, { useState } from 'react';
import { Save, Building2, AlertTriangle, RotateCcw } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { resetStore } from '../../data/store';

export default function Settings({ store, onUpdate }) {
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
    if (!window.confirm('⚠️ This will DELETE ALL DATA and restore the demo data. Are you sure?')) return;
    const fresh = resetStore();
    onUpdate(fresh);
    window.location.reload();
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="School profile and system configuration" school={store.school} />
      <div className="page-content animate-in" style={{ maxWidth: 700 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--primary)" /> School Profile
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input className="form-control" value={school.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Principal</label>
                <input className="form-control" value={school.principal} onChange={e => set('principal', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Motto</label>
              <input className="form-control" value={school.motto} onChange={e => set('motto', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" value={school.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={school.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={school.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input className="form-control" value={school.currentYear} onChange={e => set('currentYear', e.target.value)} placeholder="e.g. 2024/2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Current Term</label>
                <select className="form-control" value={school.currentTerm} onChange={e => set('currentTerm', e.target.value)}>
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" className="btn btn-primary"><Save size={14} /> Save Changes</button>
              {saved && <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ Saved successfully</span>}
            </div>
          </form>
        </div>

        {/* Data stats */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Data Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Students', val: store.students.length },
              { label: 'Teachers', val: store.teachers.length },
              { label: 'Classes', val: store.classes.length },
              { label: 'Grade Records', val: store.grades.length },
              { label: 'Attendance Records', val: store.attendance.length },
              { label: 'Sports/Clubs', val: store.sports.length },
              { label: 'Schemes of Work', val: store.schemes.length },
              { label: 'Events', val: store.events.length },
              { label: 'Enrollments', val: (store.enrollmentRequests || []).length },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{item.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <div className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
            Reset the system to demo data. This will permanently delete all records you've created.
          </p>
          <button className="btn btn-danger" onClick={handleReset}>
            <RotateCcw size={14} /> Reset to Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
