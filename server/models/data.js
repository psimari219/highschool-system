const pool = require('../config/postgres');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function query(text, params = []) {
  return pool.query(text, params);
}

function getLetterGrade(score) {
  const n = Number(score);
  if (n >= 90) return 'A+';
  if (n >= 80) return 'A';
  if (n >= 75) return 'B+';
  if (n >= 70) return 'B';
  if (n >= 65) return 'C+';
  if (n >= 60) return 'C';
  if (n >= 55) return 'D';
  return 'F';
}

function getGPAPoints(score) {
  const n = Number(score);
  if (n >= 90) return 4.0;
  if (n >= 80) return 3.7;
  if (n >= 75) return 3.3;
  if (n >= 70) return 3.0;
  if (n >= 65) return 2.7;
  if (n >= 60) return 2.3;
  if (n >= 55) return 2.0;
  return 0.0;
}

function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapStudentRow(row, gpa = '0.00', attendanceRate = '0.0') {
  return {
    id: row.id,
    studentId: row.student_id || row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    dateOfBirth: formatDate(row.date_of_birth),
    gender: row.gender || '',
    classId: row.class_id || null,
    className: row.class_name || '',
    grade: row.grade || '',
    section: row.section || row.stream || '',
    status: row.enrollment_status || 'active',
    enrollmentDate: formatDate(row.admission_date),
    parentName: row.parent_name || '',
    parentPhone: row.parent_phone || '',
    nationality: row.nationality || '',
    gpa: typeof gpa === 'number' ? gpa.toFixed(2) : gpa,
    attendanceRate: typeof attendanceRate === 'number' ? attendanceRate.toFixed(1) : attendanceRate,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

function mapGradeRow(row) {
  const score = safeNumber(row.score);
  const maxScore = safeNumber(row.max_score, 100);
  const total = safeNumber(row.total, score);
  const letterGrade = row.grade || row.letter_grade || getLetterGrade(total);
  const gpaPoints = safeNumber(row.gpa_points, getGPAPoints(total));

  return {
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    subject: row.subject_name || row.subject || row.subject_id || '',
    term: row.term || '',
    year: row.year || null,
    score,
    maxScore,
    type: row.type || 'Exam',
    date: formatDate(row.recorded_date || row.created_at),
    grade: letterGrade,
    letterGrade,
    gpaPoints,
    total,
  };
}

function mapAttendanceRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    date: formatDate(row.attendance_date),
    status: row.status,
    note: row.note || row.remarks || '',
    student: row.student_name || undefined,
    teacherId: row.teacher_id || undefined,
  };
}

function mapClassRow(row) {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject || row.subject_name || row.name || '',
    grade: row.grade || '',
    section: row.section || row.stream || '',
    teacherId: row.teacher_id || null,
    teacherName: row.teacher_name || '',
    capacity: row.capacity || 0,
    schedule: row.schedule || '',
    room: row.room || '',
    enrolledCount: Number.isFinite(Number(row.enrolled_count)) ? Number(row.enrolled_count) : 0,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

function mapSportRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    coach: row.coach_name || '',
    season: row.season || '',
    venue: row.venue || '',
    schedule: row.schedule || '',
    status: row.status || 'active',
    memberCount: Number.isFinite(Number(row.member_count)) ? Number(row.member_count) : 0,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

function mapSchemeRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    amount: safeNumber(row.amount),
    term: row.term || '',
    year: row.year || '',
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

function mapEventRow(row) {
  return {
    id: row.id,
    title: row.title || '',
    type: row.type || 'General',
    status: row.status || 'Upcoming',
    date: formatDate(row.date),
    time: row.time || '',
    venue: row.venue || '',
    description: row.description || '',
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

function mapAnnouncementRow(row) {
  return {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    priority: row.priority || 'Normal',
    author: row.author || 'System',
    date: formatDate(row.date),
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

module.exports = {
  pool,
  query,
  bcrypt,
  uuidv4,
  getLetterGrade,
  getGPAPoints,
  formatDate,
  mapStudentRow,
  mapGradeRow,
  mapAttendanceRow,
  mapClassRow,
  mapSportRow,
  mapSchemeRow,
  mapEventRow,
  mapAnnouncementRow,
  safeNumber,
};
