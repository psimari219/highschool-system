import React, { useState, useEffect } from 'react';

const TeacherAITools = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Teaching Notes
  const [notes, setNotes] = useState([]);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [notesForm, setNotesForm] = useState({
    pacing: '2 topics per week',
    subjectId: '',
    classId: '',
  });

  // Marking Schemes
  const [schemes, setSchemes] = useState([]);
  const [testFile, setTestFile] = useState(null);
  const [schemeForm, setSchemeForm] = useState({
    testTitle: '',
    subjectId: '',
    classId: '',
  });

  // Marked Work
  const [markedWork, setMarkedWork] = useState([]);
  const [studentWorkFile, setStudentWorkFile] = useState(null);
  const [markForm, setMarkForm] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    schemeId: '',
  });
  const [reviewWork, setReviewWork] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadTeachingNotes();
    loadMarkingSchemes();
    loadMarkedWork();
  }, []);

  const loadTeachingNotes = async () => {
    try {
      const res = await fetch('/api/ai-tools/teaching-notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const loadMarkingSchemes = async () => {
    try {
      const res = await fetch('/api/ai-tools/marking-schemes');
      const data = await res.json();
      setSchemes(data);
    } catch (err) {
      console.error('Error loading schemes:', err);
    }
  };

  const loadMarkedWork = async () => {
    try {
      const res = await fetch('/api/ai-tools/marked-work');
      const data = await res.json();
      setMarkedWork(data);
    } catch (err) {
      console.error('Error loading marked work:', err);
    }
  };

  // Generate Teaching Notes
  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    if (!syllabusFile) {
      setMessage('Please select a syllabus file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('syllabus', syllabusFile);
    formData.append('pacing', notesForm.pacing);
    formData.append('subjectId', notesForm.subjectId);
    formData.append('classId', notesForm.classId);

    try {
      const res = await fetch('/api/ai-tools/teaching-notes', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✓ Teaching notes generated successfully!');
        setSyllabusFile(null);
        loadTeachingNotes();
        setNotesForm({ pacing: '2 topics per week', subjectId: '', classId: '' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate Marking Scheme
  const handleGenerateScheme = async (e) => {
    e.preventDefault();
    if (!testFile) {
      setMessage('Please select a test file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('test', testFile);
    formData.append('testTitle', schemeForm.testTitle);
    formData.append('subjectId', schemeForm.subjectId);
    formData.append('classId', schemeForm.classId);

    try {
      const res = await fetch('/api/ai-tools/marking-scheme', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✓ Marking scheme generated successfully!');
        setTestFile(null);
        loadMarkingSchemes();
        setSchemeForm({ testTitle: '', subjectId: '', classId: '' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-mark Student Work
  const handleAutoMark = async (e) => {
    e.preventDefault();
    if (!studentWorkFile) {
      setMessage('Please select a student work file');
      return;
    }
    if (!markForm.schemeId) {
      setMessage('Please select a marking scheme');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('studentWork', studentWorkFile);
    formData.append('studentId', markForm.studentId);
    formData.append('subjectId', markForm.subjectId);
    formData.append('classId', markForm.classId);
    formData.append('schemeId', markForm.schemeId);

    try {
      const res = await fetch('/api/ai-tools/auto-mark', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✓ Work marked! Score: ${data.score}/${data.totalMarks}`);
        setStudentWorkFile(null);
        loadMarkedWork();
        setMarkForm({ studentId: '', subjectId: '', classId: '', schemeId: '' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Approve Marking
  const handleApproveMark = async (workId, adjustedScore) => {
    try {
      const res = await fetch(`/api/ai-tools/approve-marking/${workId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustedScore }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✓ Marking approved and grade saved!');
        loadMarkedWork();
        setReviewWork(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🤖 AI Teaching Tools</h2>
        <p>Automated notes, marking schemes, and student work evaluation</p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'notes' ? styles.active : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Teaching Notes
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'schemes' ? styles.active : ''}`}
          onClick={() => setActiveTab('schemes')}
        >
          ✅ Marking Schemes
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'marking' ? styles.active : ''}`}
          onClick={() => setActiveTab('marking')}
        >
          🔍 Auto-Mark Work
        </button>
      </div>

      {/* Teaching Notes Tab */}
      {activeTab === 'notes' && (
        <div className={styles.tabContent}>
          <h3>Generate Teaching Notes from Syllabus</h3>
          <form onSubmit={handleGenerateNotes} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Syllabus File (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSyllabusFile(e.target.files[0])}
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Pacing (e.g., "2 topics per week")</label>
              <input
                type="text"
                value={notesForm.pacing}
                onChange={(e) => setNotesForm({ ...notesForm, pacing: e.target.value })}
                placeholder="e.g., 2 topics per week"
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? 'Generating...' : 'Generate Notes'}
            </button>
          </form>

          <h4>Previous Notes</h4>
          <div className={styles.list}>
            {notes.map((note) => (
              <div key={note.id} className={styles.listItem}>
                <div>
                  <strong>{note.title}</strong>
                  <p>{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => window.open(`data:text/plain;base64,${btoa(note.notes_content)}`, '_blank')} className={styles.btnSmall}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marking Schemes Tab */}
      {activeTab === 'schemes' && (
        <div className={styles.tabContent}>
          <h3>Generate Marking Scheme from Test</h3>
          <form onSubmit={handleGenerateScheme} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Test File (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setTestFile(e.target.files[0])}
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Test Title</label>
              <input
                type="text"
                value={schemeForm.testTitle}
                onChange={(e) => setSchemeForm({ ...schemeForm, testTitle: e.target.value })}
                placeholder="e.g., Term 1 Final Exam"
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? 'Generating...' : 'Generate Scheme'}
            </button>
          </form>

          <h4>Marking Schemes</h4>
          <div className={styles.list}>
            {schemes.map((scheme) => (
              <div key={scheme.id} className={styles.listItem}>
                <div>
                  <strong>{scheme.test_title}</strong>
                  <p>Max Score: {scheme.max_score} | {new Date(scheme.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => window.open(`data:text/plain;base64,${btoa(scheme.scheme_content)}`, '_blank')} className={styles.btnSmall}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Mark Tab */}
      {activeTab === 'marking' && (
        <div className={styles.tabContent}>
          {!reviewWork ? (
            <>
              <h3>Auto-Mark Student Work</h3>
              <form onSubmit={handleAutoMark} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Student Work File (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setStudentWorkFile(e.target.files[0])}
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Select Marking Scheme</label>
                  <select
                    value={markForm.schemeId}
                    onChange={(e) => setMarkForm({ ...markForm, schemeId: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">-- Choose scheme --</option>
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.test_title} (Max: {s.max_score})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? 'Marking...' : 'Auto-Mark'}
                </button>
              </form>

              <h4>Pending Review</h4>
              <div className={styles.list}>
                {markedWork.filter((w) => !w.is_approved).map((work) => (
                  <div key={work.id} className={styles.listItem}>
                    <div>
                      <strong>{work.first_name} {work.last_name}</strong>
                      <p>Score: {work.score}/{work.total_marks} | {new Date(work.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setReviewWork(work)} className={styles.btnSmall}>
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.reviewCard}>
                <h3>Review Marking</h3>
                <p><strong>Student:</strong> {reviewWork.first_name} {reviewWork.last_name}</p>
                <p><strong>AI Score:</strong> {reviewWork.score}/{reviewWork.total_marks}</p>
                <div className={styles.feedback}>
                  <h4>AI Feedback:</h4>
                  <p>{reviewWork.ai_feedback}</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Adjust Score (if needed)</label>
                  <input
                    type="number"
                    defaultValue={reviewWork.score}
                    id="adjustedScore"
                    max={reviewWork.total_marks}
                    min="0"
                  />
                </div>
                <button
                  onClick={() => handleApproveMark(reviewWork.id, parseInt(document.getElementById('adjustedScore').value))}
                  className={styles.btn}
                >
                  Approve & Save Grade
                </button>
                <button onClick={() => setReviewWork(null)} className={`${styles.btn} ${styles.secondary}`}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAITools;
