import React, { useState } from 'react';
import { Plus, Trophy, Users, MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

function SportModal({ mode, sport, store, onSave, onClose }) {
  const [form, setForm] = useState(sport || {
    name: '', type: 'Team', season: store.school.currentYear,
    coach: '', members: [], schedule: '', venue: '', status: 'Active'
  });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  function toggleMember(id) {
    setForm(x => ({ ...x, members: x.members.includes(id) ? x.members.filter(m => m !== id) : [...x.members, id] }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Create Sport/Club' : 'Edit Sport/Club'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Football, Chess Club" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option>Team</option><option>Individual</option><option>Club</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Coach/Supervisor</label>
                <input className="form-control" value={form.coach} onChange={e => set('coach', e.target.value)} placeholder="Coach name" />
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input className="form-control" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Main Field" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Schedule</label>
                <input className="form-control" value={form.schedule} onChange={e => set('schedule', e.target.value)} placeholder="e.g. Tuesdays 15:30" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option>Active</option><option>Inactive</option><option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Members ({form.members.length} selected)</label>
              <div style={{ maxHeight: 260, overflowY: 'auto', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                {store.students.filter(s => s.status === 'Active').map(student => (
                  <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', cursor: 'pointer', borderRadius: 6, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <input type="checkbox" checked={form.members.includes(student.id)} onChange={() => toggleMember(student.id)}
                      style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                    <div className="avatar avatar-blue" style={{ width: 28, height: 28, fontSize: 11 }}>{student.firstName[0]}{student.lastName[0]}</div>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{student.firstName} {student.lastName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>Grade {student.grade}{student.stream}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Create' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const SPORT_ICONS = { Football: '⚽', Basketball: '🏀', Athletics: '🏃', Swimming: '🏊', Volleyball: '🏐', Cricket: '🏏', Tennis: '🎾', Chess: '♟️', default: '🏆' };

export default function Sports({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.sports = [...store.sports, { ...data, id: generateId('SP') }];
    } else {
      updated.sports = store.sports.map(s => s.id === data.id ? data : s);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this sport/club?')) return;
    onUpdate({ ...store, sports: store.sports.filter(s => s.id !== id) });
  }

  const filtered = store.sports.filter(s =>
    !filter || s.type === filter
  );

  const totalParticipants = new Set(store.sports.flatMap(s => s.members)).size;

  return (
    <div>
      <Topbar
        title="Sports & Clubs"
        subtitle={`${store.sports.length} activities · ${totalParticipants} participants`}
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Sport/Club</button>}
      />
      <div className="page-content animate-in">
        {/* Summary stats */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
          <div className="stat-card amber">
            <div className="stat-icon amber"><Trophy size={20} /></div>
            <div className="stat-value">{store.sports.length}</div>
            <div className="stat-label">Total Activities</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><Users size={20} /></div>
            <div className="stat-value">{totalParticipants}</div>
            <div className="stat-label">Participants</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><Trophy size={20} /></div>
            <div className="stat-value">{store.sports.filter(s => s.type === 'Team').length}</div>
            <div className="stat-label">Team Sports</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><Trophy size={20} /></div>
            <div className="stat-value">{store.sports.filter(s => s.type === 'Individual').length}</div>
            <div className="stat-label">Individual Sports</div>
          </div>
        </div>

        <div className="filters-row">
          {['', 'Team', 'Individual', 'Club'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
              {f || 'All'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(sport => {
            const icon = SPORT_ICONS[sport.name] || SPORT_ICONS.default;
            const members = store.students.filter(s => sport.members.includes(s.id));
            return (
              <div key={sport.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>{sport.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                      <span className={`badge ${sport.type === 'Team' ? 'badge-primary' : sport.type === 'Club' ? 'badge-purple' : 'badge-info'}`}>{sport.type}</span>
                      <span className={`badge ${sport.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{sport.status}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setSelected(sport); setModal('edit'); }}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(sport.id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <Users size={13} color="var(--text3)" />
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}>Coach:</span>
                    {sport.coach || <span style={{ color: 'var(--text3)' }}>Not assigned</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <Clock size={13} color="var(--text3)" />
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}>Schedule:</span>
                    {sport.schedule || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <MapPin size={13} color="var(--text3)" />
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}>Venue:</span>
                    {sport.venue || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>MEMBERS ({members.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {members.slice(0, 6).map((m, i) => (
                      <div key={m.id} className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`} style={{ width: 30, height: 30, fontSize: 11 }} title={`${m.firstName} ${m.lastName}`}>
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                    ))}
                    {members.length > 6 && (
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text3)' }}>
                        +{members.length - 6}
                      </div>
                    )}
                    {members.length === 0 && <span style={{ fontSize: 12, color: 'var(--text3)' }}>No members yet</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <SportModal mode={modal} sport={selected} store={store} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />
      )}
    </div>
  );
}
