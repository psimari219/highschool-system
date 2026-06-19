const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { query, uuidv4 } = require('../models/data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Setup file upload using a writable temp directory for serverless deployment
const uploadsDir = path.join(os.tmpdir(), 'highschool-ai-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const safeUnlink = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents allowed'));
    }
  },
});

/**
 * POST /api/ai-tools/teaching-notes
 * Generate teaching notes from syllabus
 */
router.post('/teaching-notes', auth, upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured' });

    const { subjectId, classId, pacing } = req.body;
    const teacherId = req.body.teacherId || req.user?.id;

    // Extract text from file
    let fileContent = '';
    if (req.file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      fileContent = pdfData.text;
    } else {
      // For Word docs, we'd need additional parser; for now, return error
      return res.status(400).json({ error: 'Word document parsing not yet supported. Please use PDF.' });
    }

    // Call Gemini to generate teaching notes
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert teacher. Based on this syllabus, generate comprehensive daily teaching notes for each topic.
    
Syllabus:
${fileContent}

${pacing ? `Pacing guideline: ${pacing}` : 'Default pacing: 2 topics per week'}

Generate teaching notes in the following format:
- Topic name
- Key concepts
- Teaching points
- Activities/exercises
- Assessment questions

Make the notes practical and ready for classroom use.`;

    const response = await model.generateContent(prompt);
    if (!response || !response.response) {
      throw new Error('AI response was empty or malformed');
    }
    const notesContent = response.response.text();

    // Save to database
    const id = uuidv4();
    await query(
      `INSERT INTO teaching_notes (id, teacher_id, subject_id, class_id, title, syllabus_file_name, pacing, notes_content, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, teacherId, subjectId, classId, `Notes-${new Date().toISOString().split('T')[0]}`, req.file.filename, pacing, notesContent, 'completed']
    );

    // Clean up uploaded file
    safeUnlink(req.file?.path);

    res.json({ id, message: 'Teaching notes generated successfully', notes: notesContent });
  } catch (error) {
    // Clean up on error
    safeUnlink(req.file?.path);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-tools/marking-scheme
 * Generate marking scheme from test/exercise
 */
router.post('/marking-scheme', auth, upload.single('test'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured' });

    const { subjectId, classId, testTitle } = req.body;
    const teacherId = req.body.teacherId || req.user?.id;

    // Extract text from file
    let fileContent = '';
    if (req.file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      fileContent = pdfData.text;
    } else {
      return res.status(400).json({ error: 'Word document parsing not yet supported. Please use PDF.' });
    }

    // Call Gemini to generate marking scheme
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an experienced teacher creating a marking scheme. Based on this test/exercise, generate a detailed marking scheme.

Test/Exercise:
${fileContent}

Generate a marking scheme with:
1. Expected answers for each question
2. Point allocation for each question
3. Total marks
4. Marking guidelines (for subjective questions)
5. Common mistakes and how to handle them

Format the output clearly so it can be easily understood by teachers marking student work.`;

    const response = await model.generateContent(prompt);
    if (!response || !response.response) {
      throw new Error('AI response was empty or malformed');
    }
    const schemeContent = response.response.text();

    // Extract total marks if mentioned
    const marksMatch = schemeContent.match(/total.*?(\d+)/i);
    const maxScore = marksMatch ? parseInt(marksMatch[1]) : 100;

    // Save to database
    const id = uuidv4();
    await query(
      `INSERT INTO marking_schemes (id, teacher_id, subject_id, class_id, test_title, test_file_name, scheme_content, max_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, teacherId, subjectId, classId, testTitle, req.file.filename, schemeContent, maxScore, 'completed']
    );

    // Clean up uploaded file
    safeUnlink(req.file?.path);

    res.json({ id, message: 'Marking scheme generated successfully', scheme: schemeContent, maxScore });
  } catch (error) {
    safeUnlink(req.file?.path);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-tools/auto-mark
 * Auto-mark student work using OCR and AI
 */
router.post('/auto-mark', auth, upload.single('studentWork'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured' });

    const { studentId, subjectId, classId, schemeId } = req.body;
    const teacherId = req.body.teacherId || req.user?.id;

    // Get marking scheme
    const schemeResult = await query('SELECT * FROM marking_schemes WHERE id = $1', [schemeId]);
    if (!schemeResult.rows.length) return res.status(404).json({ error: 'Marking scheme not found' });
    const scheme = schemeResult.rows[0];

    // Extract text from student work
    let workContent = '';
    if (req.file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      workContent = pdfData.text;
    } else {
      return res.status(400).json({ error: 'Word document parsing not yet supported. Please use PDF.' });
    }

    // Call Gemini to mark the work
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an experienced teacher marking student work. Use this marking scheme to mark the student's work.

Marking Scheme:
${scheme.scheme_content}

Student's Work (OCR extracted):
${workContent}

Provide:
1. Score for each question/section
2. Total score
3. Detailed feedback for the student
4. Areas of improvement
5. Positive points

Format: Start with "TOTAL_SCORE: X" where X is the numeric score. Then provide detailed feedback.`;

    const response = await model.generateContent(prompt);
    if (!response || !response.response) {
      throw new Error('AI response was empty or malformed');
    }
    const feedbackContent = response.response.text();

    // Extract score
    const scoreMatch = feedbackContent.match(/TOTAL_SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    // Save to database
    const id = uuidv4();
    await query(
      `INSERT INTO marked_work (id, teacher_id, student_id, subject_id, class_id, marking_scheme_id, work_file_name, work_type, extracted_text, score, total_marks, ai_feedback, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, teacherId, studentId, subjectId, classId, schemeId, req.file.filename, 'assessment', workContent, score, scheme.max_score, feedbackContent, 'pending_review']
    );

    // Clean up uploaded file
    safeUnlink(req.file?.path);

    res.json({ 
      id, 
      message: 'Work marked successfully',
      score,
      totalMarks: scheme.max_score,
      feedback: feedbackContent,
      status: 'pending_review'
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-tools/teaching-notes
 * Get all teaching notes for a teacher
 */
router.get('/teaching-notes', auth, async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.user?.id;
    const { rows } = await query(
      `SELECT * FROM teaching_notes WHERE teacher_id = $1 ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-tools/marking-schemes
 * Get all marking schemes for a teacher
 */
router.get('/marking-schemes', auth, async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.user?.id;
    const { rows } = await query(
      `SELECT * FROM marking_schemes WHERE teacher_id = $1 ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-tools/marked-work
 * Get marked work for review
 */
router.get('/marked-work', auth, async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.user?.id;
    const { rows } = await query(
      `SELECT mw.*, s.first_name, s.last_name, sub.name as subject_name
       FROM marked_work mw
       LEFT JOIN students s ON mw.student_id = s.id
       LEFT JOIN subjects sub ON mw.subject_id = sub.id
       WHERE mw.teacher_id = $1
       ORDER BY mw.created_at DESC`,
      [teacherId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai-tools/approve-marking/:id
 * Approve and save marking to grades table
 */
router.post('/approve-marking/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustedScore, teacherFeedback } = req.body;

    // Get the marked work
    const workResult = await query('SELECT * FROM marked_work WHERE id = $1', [id]);
    if (!workResult.rows.length) return res.status(404).json({ error: 'Marked work not found' });

    const work = workResult.rows[0];
    const finalScore = adjustedScore !== undefined ? adjustedScore : work.score;

    // Update marked work status
    await query(
      `UPDATE marked_work SET is_approved = true, status = $1, teacher_feedback = $2 WHERE id = $3`,
      ['approved', teacherFeedback || '', id]
    );

    // Add to grades table
    const gradeId = uuidv4();
    const gpaPoints = (finalScore / work.total_marks) * 4; // Convert to 4.0 scale
    const letterGrade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : finalScore >= 60 ? 'D' : 'F';

    await query(
      `INSERT INTO grades (id, student_id, subject_id, class_id, score, gpa_points, grade, term, year, teacher_id, recorded_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        gradeId,
        work.student_id,
        work.subject_id,
        work.class_id,
        finalScore,
        gpaPoints.toFixed(2),
        letterGrade,
        'current',
        new Date().getFullYear(),
        work.teacher_id,
        new Date(),
      ]
    );

    res.json({ message: 'Marking approved and grade saved', gradeId, score: finalScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
