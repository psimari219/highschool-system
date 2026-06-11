import React from 'react';

export default function StudentResources({ store, student }) {
  const studentClass = store.classes.find(c => c.grade === student?.grade && c.stream === student?.stream);
  const classId = studentClass?.id;

  const files = (store.uploadedFiles || []).filter(f => {
    if (!f.audience || f.audience === 'all') return true;
    if (f.audience === classId) return true;
    // support other audience types in future
    return false;
  }).slice().reverse();

  return (
    <div>
      <div className="card">
        <div className="card-title">Resources & Homework</div>
        <div style={{ padding: 12 }}>
          {files.length === 0 && <div style={{ color: 'var(--text3)' }}>No resources available.</div>}
          {files.map(f => (
            <div key={f.id} style={{ padding: 10, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{f.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{f.filename} · {(f.size/1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleString()}</div>
              </div>
              <a className="btn" href={f.data} download={f.filename}>Download</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
