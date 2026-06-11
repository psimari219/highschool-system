import React, { useState } from 'react';
import { generateId } from '../../data/store';
import { useAuth } from '../../context/AuthContext';

export default function TeacherResources({ store, onUpdate, teacherId, myClasses }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('all');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const classOptions = myClasses || [];

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  }

  async function handleUpload() {
    if (!file) return alert('Select a file to upload');
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      const entry = {
        id: generateId('F'),
        title: title || file.name,
        description,
        filename: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        uploadedBy: currentUser?.id || 'unknown',
        teacherId: teacherId || null,
        audience, // 'all' or classId or 'grade:10' etc.
        createdAt: new Date().toISOString(),
        data, // base64 string (data:...)
      };
      const updated = { ...store, uploadedFiles: [...(store.uploadedFiles||[]), entry] };
      onUpdate(updated);
      setTitle(''); setDescription(''); setFile(null);
      alert('Uploaded successfully');
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally { setUploading(false); }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Post Resource / Homework</div>
        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={audience} onChange={e=>setAudience(e.target.value)}>
                <option value="all">All students</option>
                {classOptions.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="file" onChange={handleFileChange} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-title">Your Posted Resources</div>
          <div style={{ padding: 12 }}>
            {(store.uploadedFiles||[]).filter(f => f.teacherId === teacherId).slice().reverse().map(f => (
              <div key={f.id} style={{ padding: 8, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{f.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{f.filename} · {(f.size/1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleString()}</div>
                </div>
                <a className="btn" href={f.data} download={f.filename}>Download</a>
              </div>
            ))}
            {(store.uploadedFiles||[]).filter(f => f.teacherId === teacherId).length === 0 && <div style={{ color: 'var(--text3)' }}>No resources uploaded yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
