const router = require('express').Router();
const { query, uuidv4 } = require('../models/data');

function parseTimeRange(time) {
  if (!time || typeof time !== 'string') return { startTime: null, endTime: null };
  const parts = time.split(/\s*[–-]\s*/);
  return {
    startTime: parts[0] || null,
    endTime: parts[1] || null,
  };
}

function normalizeTimetableRows(rows) {
  const grouped = {};
  rows.forEach(row => {
    const classId = row.class_id;
    if (!grouped[classId]) grouped[classId] = {};
    grouped[classId][row.day] = grouped[classId][row.day] || [];
    grouped[classId][row.day].push({
      id: row.id,
      classId: row.class_id,
      day: row.day,
      period: row.period,
      subject: row.subject_name || null,
      teacherId: row.teacher_id || null,
      room: row.room || '',
      startTime: row.start_time || null,
      endTime: row.end_time || null,
    });
  });
  return grouped;
}

function normalizeExamRows(rows) {
  const grouped = {};
  rows.forEach(row => {
    const classId = row.class_id;
    if (!grouped[classId]) grouped[classId] = [];
    grouped[classId].push({
      id: row.id,
      classId: row.class_id,
      date: row.date ? row.date.toISOString().split('T')[0] : null,
      start: row.start_time || '',
      end: row.end_time || '',
      subject: row.subject || '',
      venue: row.venue || '',
      invigilator: row.invigilator_id || '',
      invigilatorName: row.invigilator_name || '',
    });
  });
  return grouped;
}

async function resolveClassId(classId) {
  const { rows } = await query(
    'SELECT id FROM classes WHERE id = $1 OR LOWER(id) = LOWER($1) LIMIT 1',
    [classId]
  );
  return rows[0]?.id || null;
}

async function ensureClassExists(classId) {
  const resolved = await resolveClassId(classId);
  return !!resolved;
}

async function buildClassTimetable(classId) {
  const { rows } = await query(
    `SELECT tm.*, sub.name AS subject_name, t.first_name || ' ' || t.last_name AS teacher_name
     FROM timetable tm
     LEFT JOIN subjects sub ON tm.subject_id = sub.id
     LEFT JOIN teachers t ON tm.teacher_id = t.id
     WHERE tm.class_id = $1
     ORDER BY tm.day, tm.period`,
    [classId]
  );
  return rows.map(row => ({
    id: row.id,
    classId: row.class_id,
    day: row.day,
    period: row.period,
    subject: row.subject_name || null,
    teacherId: row.teacher_id || null,
    room: row.room || '',
    startTime: row.start_time || null,
    endTime: row.end_time || null,
  }));
}

async function buildClassExamTimetable(classId) {
  const { rows } = await query(
    `SELECT et.*, t.first_name || ' ' || t.last_name AS invigilator_name
     FROM exam_timetables et
     LEFT JOIN teachers t ON et.invigilator_id = t.id
     WHERE et.class_id = $1
     ORDER BY et.date, et.start_time`,
    [classId]
  );
  return rows.map(row => ({
    id: row.id,
    classId: row.class_id,
    date: row.date ? row.date.toISOString().split('T')[0] : null,
    start: row.start_time || '',
    end: row.end_time || '',
    subject: row.subject || '',
    venue: row.venue || '',
    invigilator: row.invigilator_id || '',
    invigilatorName: row.invigilator_name || '',
  }));
}

router.get('/', async (req, res) => {
  const { rows: timetableRows } = await query(
    `SELECT tm.*, sub.name AS subject_name, t.first_name || ' ' || t.last_name AS teacher_name
     FROM timetable tm
     LEFT JOIN subjects sub ON tm.subject_id = sub.id
     LEFT JOIN teachers t ON tm.teacher_id = t.id
     ORDER BY tm.class_id, tm.day, tm.period`
  );
  const { rows: examRows } = await query(
    `SELECT et.*, t.first_name || ' ' || t.last_name AS invigilator_name
     FROM exam_timetables et
     LEFT JOIN teachers t ON et.invigilator_id = t.id
     ORDER BY et.class_id, et.date, et.start_time`
  );

  res.json({
    timetables: normalizeTimetableRows(timetableRows),
    examTimetables: normalizeExamRows(examRows),
  });
});

router.get('/class/:classId', async (req, res) => {
  const requestedId = req.params.classId;
  const classId = await resolveClassId(requestedId);
  if (!classId) return res.status(404).json({ error: 'Class not found' });
  const timetable = await buildClassTimetable(classId);
  const examTimetable = await buildClassExamTimetable(classId);
  res.json({ timetable, examTimetable });
});

router.put('/class/:classId/cell', async (req, res) => {
  const requestedId = req.params.classId;
  const classId = await resolveClassId(requestedId);
  const { day, period, subject, teacherId, room, startTime, endTime, time } = req.body;
  if (!classId || !day || !Number.isFinite(Number(period))) {
    return res.status(400).json({ error: 'Missing class, day, or period' });
  }

  const { startTime: parsedStart, endTime: parsedEnd } = parseTimeRange(time);
  const resolvedStart = startTime || parsedStart || null;
  const resolvedEnd = endTime || parsedEnd || null;

  const action = subject ? 'save' : 'delete';
  const existing = await query(
    `SELECT id FROM timetable WHERE class_id = $1 AND day = $2 AND period = $3 LIMIT 1`,
    [classId, day, period]
  );
  const existingId = existing.rows[0]?.id;

  if (!subject) {
    if (existingId) {
      await query('DELETE FROM timetable WHERE id = $1', [existingId]);
    }
    const timetable = await buildClassTimetable(classId);
    return res.json({ action: 'deleted', timetable });
  }

  let subjectId = null;
  if (subject) {
    const { rows: subjectRows } = await query('SELECT id FROM subjects WHERE LOWER(name) = LOWER($1) LIMIT 1', [subject]);
    if (subjectRows[0]) subjectId = subjectRows[0].id;
    else return res.status(400).json({ error: `Subject '${subject}' not found in database` });
  }

  if (existingId) {
    await query(
      `UPDATE timetable SET subject_id = $1, teacher_id = $2, room = $3, start_time = $4, end_time = $5, updated_at = NOW()
       WHERE id = $6`,
      [subjectId, teacherId || null, room || null, resolvedStart, resolvedEnd, existingId]
    );
  } else {
    const id = uuidv4();
    await query(
      `INSERT INTO timetable (id, class_id, subject_id, teacher_id, day, period, start_time, end_time, room, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
      [id, classId, subjectId, teacherId || null, day, period, resolvedStart, resolvedEnd, room || null]
    );
  }

  const timetable = await buildClassTimetable(classId);
  res.json({ action: 'saved', timetable });
});

router.get('/class/:classId/exams', async (req, res) => {
  const requestedId = req.params.classId;
  const classId = await resolveClassId(requestedId);
  if (!classId) return res.status(404).json({ error: 'Class not found' });
  const examTimetable = await buildClassExamTimetable(classId);
  res.json({ examTimetable });
});

router.post('/class/:classId/exams', async (req, res) => {
  const requestedId = req.params.classId;
  const classId = await resolveClassId(requestedId);
  const { date, start, end, subject, venue, invigilator } = req.body;
  if (!classId) return res.status(404).json({ error: 'Class not found' });
  if (!date || !start || !end || !subject) {
    return res.status(400).json({ error: 'Date, start, end and subject are required' });
  }
  const id = uuidv4();
  await query(
    `INSERT INTO exam_timetables (id, class_id, date, start_time, end_time, subject, venue, invigilator_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
    [id, classId, date, start, end, subject, venue || null, invigilator || null]
  );
  const examTimetable = await buildClassExamTimetable(classId);
  res.status(201).json({ examTimetable });
});

router.delete('/class/:classId/exams/:examId', async (req, res) => {
  const requestedId = req.params.classId;
  const classId = await resolveClassId(requestedId);
  const examId = req.params.examId;
  if (!classId) return res.status(404).json({ error: 'Class not found' });
  const { rows } = await query('DELETE FROM exam_timetables WHERE id = $1 AND class_id = $2 RETURNING id', [examId, classId]);
  if (!rows[0]) return res.status(404).json({ error: 'Exam entry not found' });
  const examTimetable = await buildClassExamTimetable(classId);
  res.json({ examTimetable });
});

module.exports = router;
