import React, { useState } from 'react';
import { X } from 'lucide-react';

const emptyStudent = {
  firstName: '', lastName: '', dob: '', gender: '', grade: '', stream: 'A',
  status: 'Active', parentName: '', parentPhone: '', address: '', nationalId: '', photo: null
};

export default function StudentModal({ mode, student, onSave, onClose }) {
  const [form, setForm] = useState(student || emptyStudent);
  const [errors, setErrors] = useState({});

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.dob) errs.dob = 'Required';
    if (!form.gender) errs.gender = 'Required';
    if (!form.grade) errs.grade = 'Required';
    if (!form.parentName.trim()) errs.parentName = 'Required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{mode === 'add' ? 'Add New Student' : 'Edit Student'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" />
                {errors.firstName && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.firstName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
                {errors.lastName && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.lastName}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" value={form.dob} onChange={e => set('dob', e.target.value)} />
                {errors.dob && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.dob}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                {errors.gender && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.gender}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade *</label>
                <select className="form-control" value={form.grade} onChange={e => set('grade', e.target.value)}>
                  <option value="">Select grade</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
                {errors.grade && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.grade}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Stream</label>
                <select className="form-control" value={form.stream} onChange={e => set('stream', e.target.value)}>
                  <option value="A">Stream A</option>
                  <option value="B">Stream B</option>
                  <option value="C">Stream C</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">National ID</label>
              <input className="form-control" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} placeholder="National ID number" />
            </div>
            <div className="form-group">
              <label className="form-label">Home Address</label>
              <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Home address" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Parent/Guardian Name *</label>
                <input className="form-control" value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="Parent or guardian name" />
                {errors.parentName && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.parentName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Parent Phone</label>
                <input className="form-control" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="+1 555-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Graduated</option>
                <option>Transferred</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {mode === 'add' ? 'Add Student' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
