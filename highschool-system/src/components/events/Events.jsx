import React, { useState } from 'react';
import { Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId } from '../../data/store';

const EVENT_TYPES = ['Academic', 'Sports', 'Ceremony', 'Holiday', 'Meeting', 'Cultural', 'Other'];
const TYPE_COLORS = {
  Academic: 'badge-primary', Sports: 'badge-success', Ceremony: 'badge-purple',
  Holiday: 'badge-warning', Meeting: 'badge-info', Cultural: 'badge-purple', Other: 'badge-info'
};

function EventModal({ mode, event, onSave, onClose }) {
  const [form, setForm] = useState(event || { title: '', date: '', type: 'Academic', description: '', organizer: '', time: '', venue: '' });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Add Event' : 'Edit Event'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Event name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-control" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Organizer</label>
                <input className="form-control" value={form.organizer} onChange={e => set('organizer', e.target.value)} placeholder="Department or person" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-control" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Location" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add Event' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Events({ store, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  function handleSave(data) {
    const updated = { ...store };
    if (modal === 'add') {
      updated.events = [...store.events, { ...data, id: generateId('EV') }];
    } else {
      updated.events = store.events.map(e => e.id === data.id ? data : e);
    }
    onUpdate(updated);
    setModal(null); setSelected(null);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    onUpdate({ ...store, events: store.events.filter(e => e.id !== id) });
  }

  const sorted = [...store.events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date();
  const upcoming = sorted.filter(e => new Date(e.date) >= today);
  const past = sorted.filter(e => new Date(e.date) < today);

  return (
    <div>
      <Topbar
        title="Events & Calendar"
        subtitle={`${upcoming.length} upcoming events`}
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={15} /> Add Event</button>}
      />
      <div className="page-content animate-in">
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(6,214,160,0.1)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>Upcoming</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {upcoming.map(ev => <EventCard key={ev.id} ev={ev} onEdit={() => { setSelected(ev); setModal('edit'); }} onDelete={() => handleDelete(ev.id)} />)}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--bg3)', color: 'var(--text3)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>Past Events</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {past.map(ev => <EventCard key={ev.id} ev={ev} past onEdit={() => { setSelected(ev); setModal('edit'); }} onDelete={() => handleDelete(ev.id)} />)}
            </div>
          </div>
        )}
        {store.events.length === 0 && (
          <div className="card empty-state">
            <Calendar size={40} />
            <h3>No Events</h3>
            <p>Add school events, ceremonies, sports days and holidays.</p>
          </div>
        )}
      </div>
      {modal && <EventModal mode={modal} event={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
    </div>
  );
}

function EventCard({ ev, past, onEdit, onDelete }) {
  const d = new Date(ev.date);
  const typeColor = TYPE_COLORS[ev.type] || 'badge-info';
  return (
    <div className="card" style={{ opacity: past ? 0.65 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ background: past ? 'var(--bg3)' : 'var(--primary-glow)', borderRadius: 12, padding: '10px 14px', textAlign: 'center', minWidth: 58, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: past ? 'var(--text3)' : 'var(--primary)', lineHeight: 1 }}>
            {d.getDate()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            {d.toLocaleString('default', { month: 'short' }).toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{d.getFullYear()}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{ev.title}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
            <span className={`badge ${typeColor}`}>{ev.type}</span>
            {ev.time && <span className="badge badge-info">{ev.time}</span>}
            {ev.organizer && <span className="badge badge-purple">{ev.organizer}</span>}
            {ev.venue && <span className="badge badge-info">📍 {ev.venue}</span>}
          </div>
          {ev.description && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text2)' }}>{ev.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onEdit}><Edit2 size={13} /></button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}
