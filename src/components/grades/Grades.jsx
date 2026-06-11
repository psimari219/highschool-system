import React, { useState, useMemo } from 'react';
import { Plus, Award, TrendingUp, Search } from 'lucide-react';
import Topbar from '../layout/Topbar';
import { generateId, scoreToGrade, calculateGPA, GRADE_SCALE } from '../../data/store';
import { v4 as uuidv4 } from 'uuid';

function GradeModal({ store, onSave, onClose }) {
  const [form, setForm] = useState({
    studentId: '', subject: '', term: store.school.currentTerm, year: store.school.currentYear,
    score: '', examType: 'End of Term', teacherId: '', classId: ''
  });
  function set(f, v) { setForm(x => ({ ...x, [f]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    const score = parseFloat(form.score);
    if (isNaN(score) || score < 0 || score > 100) { alert('Score must be 0–100'); return; }
    const gs = scoreToGrade(score);
    onSave({ ...form, id: uuidv4(), score, grade: gs.grade });
  }

  const selectedStudent = store.students.find(s => s.id === form.studentId);
  const cls = selectedStudent ? store.classes.find(c => c.grade === selectedStudent.grade && c.stream === selectedStudent.stream) : null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Record Grade</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select className="form-control" value={form.studentId} onChange={e => {
                set('studentId', e.target.value);
                const s = store.students.find(x => x.id === e.target.value);
                const c = s ? store.classes.find(x => x.grade === s.grade && x.stream === s.stream) : null;
                setForm(f => ({ ...f, studentId: e.target.value, classId: c?.id || '' }));
              }} required>
                <option value="">Select student</option>
                {store.students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (Grade {s.grade}{s.stream})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)} required>
                  <option value="">Select subject</option>
                  {(cls?.subjects || ['Mathematics','English Language','Physics','Chemistry','History','Computer Science']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Score (0–100) *</label>
                <input type="number" className="form-control" value={form.score} onChange={e => set('score', e.target.value)} min={0} max={100} step={0.5} required />
              </div>
            </div>
            {form.score !== '' && !isNaN(parseFloat(form.score)) && (
              <div className="alert alert-info" style={{ marginBottom: 12 }}>
                {(() => { const gs = scoreToGrade(parseFloat(form.score)); return `Grade: ${gs.grade} · Points: ${gs.points} · ${gs.description}`; })()}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Term</label>
                <select className="form-control" value={form.term} onChange={e => set('term', e.target.value)}>
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <select className="form-control" value={form.examType} onChange={e => set('examType', e.target.value)}>
                  <option>End of Term</option><option>Mid-Term</option><option>Class Test</option>
                  <option>Assignment</option><option>Mock Exam</option><option>Practical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Teacher</label>
              <select className="form-control" value={form.teacherId} onChange={e => set('teacherId', e.target.value)}>
                <option value="">Select teacher</option>
                {store.teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Grade</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Grades({ store, onUpdate }) {
  const [tab, setTab] = useState('grades');
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  function handleSave(grade) {
    onUpdate({ ...store, grades: [...store.grades, grade] });
    setModal(false);
  }

  const filtered = useMemo(() => {
    return store.grades.filter(g => {
      const student = store.students.find(s => s.id === g.studentId);
      if (!student) return false;
      const q = search.toLowerCase();
      const matchSearch = !q || student.firstName.toLowerCase().includes(q) || student.lastName.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q);
      const matchTerm = !termFilter || g.term === termFilter;
      const matchGrade = !gradeFilter || student.grade === gradeFilter;
      return matchSearch && matchTerm && matchGrade;
    });
  }, [store.grades, store.students, search, termFilter, gradeFilter]);

  // GPA table per student
  const studentGPAs = useMemo(() => {
    const byStudent = {};
    store.grades.forEach(g => {
      if (!byStudent[g.studentId]) byStudent[g.studentId] = [];
      byStudent[g.studentId].push(g);
    });
    return Object.entries(byStudent).map(([studentId, grades]) => {
      const student = store.students.find(s => s.id === studentId);
      const gpa = parseFloat(calculateGPA(grades));
      const gs = scoreToGrade(grades.reduce((a, g) => a + g.score, 0) / grades.length);
      return { student, grades, gpa, letterGrade: gs.grade };
    }).filter(x => x.student).sort((a, b) => b.gpa - a.gpa);
  }, [store.grades, store.students]);

  return (
    <div>
      <Topbar
        title="Grades & GPA"
        subtitle="Academic performance records"
        school={store.school}
        actions={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Record Grade</button>}
      />
      <div className="page-content animate-in">
        <div className="tabs">
          {['grades', 'gpa', 'gradeScale'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'gradeScale' ? 'Grade Scale' : t === 'gpa' ? 'GPA Rankings' : 'Grade Records'}
            </button>
          ))}
        </div>

        {tab === 'grades' && (
          <>
            <div className="filters-row">
              <div className="search-bar">
                <Search size={15} color="var(--text3)" />
                <input placeholder="Search student or subject..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-control" style={{ width: 'auto' }} value={termFilter} onChange={e => setTermFilter(e.target.value)}>
                <option value="">All Terms</option>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
              <select className="form-control" style={{ width: 'auto' }} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                <option value="">All Grades</option>
                <option value="9">Grade 9</option><option value="10">Grade 10</option>
                <option value="11">Grade 11</option><option value="12">Grade 12</option>
              </select>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Points</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No grades found</td></tr>
                    ) : filtered.map(g => {
                      const student = store.students.find(s => s.id === g.studentId);
                      const gs = scoreToGrade(g.score);
                      return (
                        <tr key={g.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{student?.firstName} {student?.lastName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Grade {student?.grade}{student?.stream}</div>
                          </td>
                          <td style={{ fontWeight: 500, color: 'var(--text2)' }}>{g.subject}</td>
                          <td style={{ color: 'var(--text3)' }}>{g.term}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, color: g.score >= 80 ? 'var(--success)' : g.score >= 60 ? 'var(--warning)' : 'var(--danger)', fontFamily: 'var(--font-display)' }}>{g.score}%</span>
                              <div className="progress-bar" style={{ width: 50 }}>
                                <div className={`progress-fill ${g.score >= 80 ? 'progress-green' : g.score >= 60 ? 'progress-amber' : 'progress-red'}`} style={{ width: `${g.score}%` }} />
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge ${g.score >= 80 ? 'badge-success' : g.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>{gs.grade}</span></td>
                          <td style={{ fontWeight: 700, color: 'var(--text)' }}>{gs.points}</td>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>{g.examType}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'gpa' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Grade</th><th>GPA</th><th>Letter</th><th>Subjects</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {studentGPAs.map((item, i) => {
                    const gpaClass = item.gpa >= 3.5 ? 'gpa-excellent' : item.gpa >= 3.0 ? 'gpa-good' : item.gpa >= 2.0 ? 'gpa-average' : 'gpa-poor';
                    return (
                      <tr key={item.student.id}>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: i < 3 ? 'var(--accent2)' : 'var(--text3)' }}>#{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.student.firstName} {item.student.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.student.id}</div>
                        </td>
                        <td><span className="badge badge-primary">Grade {item.student.grade}{item.student.stream}</span></td>
                        <td>
                          <div className={`gpa-badge ${gpaClass}`} style={{ width: 44, height: 44, fontSize: 14 }}>{item.gpa.toFixed(2)}</div>
                        </td>
                        <td><span className={`badge ${item.gpa >= 3.5 ? 'badge-success' : item.gpa >= 3.0 ? 'badge-primary' : item.gpa >= 2.0 ? 'badge-warning' : 'badge-danger'}`}>{item.letterGrade}</span></td>
                        <td style={{ color: 'var(--text3)' }}>{item.grades.length} recorded</td>
                        <td><span className={`badge ${item.gpa >= 2.0 ? 'badge-success' : 'badge-danger'}`}>{item.gpa >= 2.0 ? 'Passing' : 'Failing'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'gradeScale' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Grade</th><th>Range</th><th>GPA Points</th><th>Description</th></tr></thead>
                <tbody>
                  {GRADE_SCALE.map(gs => (
                    <tr key={gs.grade}>
                      <td><span className={`badge ${gs.points >= 3.7 ? 'badge-success' : gs.points >= 2.7 ? 'badge-primary' : gs.points >= 1.7 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 14, fontWeight: 800 }}>{gs.grade}</span></td>
                      <td style={{ fontWeight: 600 }}>{gs.min}% – {gs.max}%</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: gs.points >= 3.5 ? 'var(--success)' : gs.points >= 2.5 ? 'var(--primary)' : gs.points >= 1.5 ? 'var(--warning)' : 'var(--danger)' }}>{gs.points.toFixed(1)}</td>
                      <td style={{ color: 'var(--text3)' }}>{gs.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && <GradeModal store={store} onSave={handleSave} onClose={() => setModal(false)} />}
    </div>
  );
}
