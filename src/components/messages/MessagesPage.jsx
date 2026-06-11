import React, { useMemo, useState } from 'react';
import Topbar from '../layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { sendNotification } from '../../utils/notifications';
import { generateId } from '../../data/store';
import { MessageSquare, Send, Mail, CheckCircle2 } from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Administrator',
  teacher: 'Teacher',
  accountant: 'Accountant',
};

export default function MessagesPage({ store, onUpdate }) {
  const { currentUser } = useAuth();
  const [toRole, setToRole] = useState('teacher');
  const [selectedIds, setSelectedIds] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const recipients = useMemo(() => {
    return (store.users || []).filter(u => u.role === toRole);
  }, [store.users, toRole]);

  const visibleNotifications = useMemo(() => {
    return (store.notifications || []).filter(note => {
      if (!currentUser) return false;
      const toIds = note.toIds || [];
      if (note.toRole === 'all') return true;
      if (toIds.includes(currentUser.id)) return true;
      if (note.toRole === currentUser.role && toIds.length === 0) return true;
      return false;
    });
  }, [store.notifications, currentUser]);

  const unreadCount = visibleNotifications.filter(note => !(note.readBy || []).includes(currentUser?.id)).length;

  function toggleRecipient(userId) {
    setSelectedIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }

  function sendMessage(event) {
    event.preventDefault();
    if (!body.trim()) {
      alert('Write a message before sending');
      return;
    }
    const note = {
      id: generateId('N'),
      createdAt: new Date().toISOString(),
      fromRole: currentUser.role,
      fromId: currentUser.id,
      fromName: currentUser.name,
      toRole,
      toIds: selectedIds,
      channel: 'sms',
      subject: subject.trim(),
      body: body.trim(),
      status: 'sent',
      readBy: [],
    };
    sendNotification(store, onUpdate, note);
    setSelectedIds([]);
    setSubject('');
    setBody('');
    alert('Message sent');
  }

  function markAsRead(messageId) {
    const updatedNotifications = (store.notifications || []).map(note => {
      if (note.id !== messageId) return note;
      const readBy = Array.isArray(note.readBy) ? note.readBy : [];
      if (readBy.includes(currentUser.id)) return note;
      return { ...note, readBy: [...readBy, currentUser.id] };
    });
    onUpdate({ ...store, notifications: updatedNotifications });
  }

  function markAllRead() {
    const updatedNotifications = (store.notifications || []).map(note => {
      const readBy = Array.isArray(note.readBy) ? note.readBy : [];
      if (readBy.includes(currentUser.id)) return note;
      return { ...note, readBy: [...readBy, currentUser.id] };
    });
    onUpdate({ ...store, notifications: updatedNotifications });
  }

  return (
    <div>
      <Topbar title="Messages" subtitle="In-app SMS-style communication" school={store.school} />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ marginBottom: 18 }}>
          <div className="stat-card blue">
            <div className="stat-icon blue"><MessageSquare size={20} /></div>
            <div className="stat-value">{visibleNotifications.length}</div>
            <div className="stat-label">Visible Messages</div>
            <div className="stat-sub">{unreadCount} unread</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><Send size={20} /></div>
            <div className="stat-value">{recipients.length}</div>
            <div className="stat-label">Recipients</div>
            <div className="stat-sub">{ROLE_LABELS[toRole] || toRole}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-title">Compose SMS Message</div>
          <form onSubmit={sendMessage} style={{ display: 'grid', gap: 14, padding: 14 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 180, flex: 1 }}>
                <label className="form-label">Recipient Role</label>
                <select className="form-control" value={toRole} onChange={e => { setToRole(e.target.value); setSelectedIds([]); }}>
                  <option value="teacher">Teachers</option>
                  <option value="accountant">Accountants</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
              <div style={{ minWidth: 180, flex: 2 }}>
                <label className="form-label">Subject (optional)</label>
                <input className="form-control" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Optional message subject" />
              </div>
            </div>

            <div>
              <label className="form-label">Recipients (leave blank to message all)</label>
              <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--border)', padding: 10, borderRadius: 8, background: 'var(--bg3)' }}>
                {recipients.length === 0 && <div style={{ color: 'var(--text3)' }}>No recipients found for this role.</div>}
                {recipients.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--text)' }}>
                    <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleRecipient(u.id)} />
                    <span>{u.name || u.username} <small style={{ color: 'var(--text3)' }}>({u.id})</small></span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Message</label>
              <textarea className="form-control" value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Write the SMS-style message here..." />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="submit">Send Message</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setSubject(''); setBody(''); setSelectedIds([]); }}>Clear</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div className="card-title">Inbox</div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Mark all read
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Channel</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleNotifications.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 24, color: 'var(--text3)' }}>No messages</td></tr>
                )}
                {visibleNotifications.slice().reverse().map(note => {
                  const isUnread = !(note.readBy || []).includes(currentUser.id);
                  return (
                    <tr key={note.id} style={isUnread ? { background: 'rgba(59,130,246,0.05)' } : {}}>
                      <td>{note.fromName || note.fromId} <div style={{ fontSize: 11, color: 'var(--text3)' }}>{note.fromRole}</div></td>
                      <td>{note.channel?.toUpperCase()}</td>
                      <td style={{ maxWidth: 420 }}>
                        {note.subject && <div style={{ fontWeight: 700, marginBottom: 4 }}>{note.subject}</div>}
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{note.body}</div>
                      </td>
                      <td style={{ color: 'var(--text3)' }}>{new Date(note.createdAt).toLocaleString()}</td>
                      <td>{isUnread ? 'Unread' : 'Read'}</td>
                      <td>
                        {isUnread && <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(note.id)}>Mark read</button>}
                      </td>
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
