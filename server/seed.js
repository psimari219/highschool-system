require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./config/postgres');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding database...');

    // Clear existing data (optional - comment out if you want to preserve data)
    // await client.query('TRUNCATE users, students, teachers, staff, subjects, classes, enrollment, grades, attendance, fee_structure, fee_payments, sports, sport_members, schemes, messages CASCADE');

    // Seed school data
    await client.query(`
      INSERT INTO school (name, motto, address, phone, email, principal, current_year, current_term)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, ['Westlake High School', 'Excellence in Education', '123 Academy Drive, Springfield', '+1 (555) 234-5678', 'admin@westlakehigh.edu', 'Dr. Patricia Moyo', '2024/2025', 'Term 2']);

    // Seed users
    const users = [
      { id: 'OWN001', username: 'OWN001', password: 'owner2026', role: 'owner', name: 'Product Owner', email: 'owner@thedigital5.com', linkedId: null },
      { id: 'ADM001', username: 'ADM001', password: 'admin2024', role: 'admin', name: 'Dr. Patricia Moyo', email: 'patricia.moyo@westlakehigh.edu', linkedId: null },
      { id: 'ACC001', username: 'ACC001', password: 'acc2024', role: 'accountant', name: 'Mr. Robert Banda', email: 'robert.banda@westlakehigh.edu', linkedId: 'ST001' },
      { id: 'T001', username: 'T001', password: 'teach1234', role: 'teacher', name: 'David Chirwa', email: 'david.chirwa@westlakehigh.edu', linkedId: 'T001' },
      { id: 'T002', username: 'T002', password: 'teach1234', role: 'teacher', name: 'Ama Serwaa', email: 'ama.serwaa@westlakehigh.edu', linkedId: 'T002' },
      { id: 'T003', username: 'T003', password: 'teach1234', role: 'teacher', name: 'Peter Nkosi', email: 'peter.nkosi@westlakehigh.edu', linkedId: 'T003' },
      { id: 'T004', username: 'T004', password: 'teach1234', role: 'teacher', name: 'Grace Mokoena', email: 'grace.mokoena@westlakehigh.edu', linkedId: 'T004' },
      { id: 'T005', username: 'T005', password: 'teach1234', role: 'teacher', name: 'Samuel Boateng', email: 'samuel.boateng@westlakehigh.edu', linkedId: 'T005' },
      { id: 'T006', username: 'T006', password: 'teach1234', role: 'teacher', name: 'Lindiwe Dlamini', email: 'lindiwe.dlamini@westlakehigh.edu', linkedId: 'T006' },
      { id: 'S001', username: 'S001', password: 'student2024', role: 'student', name: 'Amara Osei', email: '', linkedId: 'S001' },
      { id: 'S002', username: 'S002', password: 'student2024', role: 'student', name: 'Tariq Hassan', email: '', linkedId: 'S002' },
      { id: 'S003', username: 'S003', password: 'student2024', role: 'student', name: 'Sofia Reyes', email: '', linkedId: 'S003' },
      { id: 'S004', username: 'S004', password: 'student2024', role: 'student', name: 'James Mutamba', email: '', linkedId: 'S004' },
      { id: 'S005', username: 'S005', password: 'student2024', role: 'student', name: 'Priya Sharma', email: '', linkedId: 'S005' },
      { id: 'S006', username: 'S006', password: 'student2024', role: 'student', name: 'Luca Ferreira', email: '', linkedId: 'S006' },
      { id: 'S007', username: 'S007', password: 'student2024', role: 'student', name: 'Zoe Nakamura', email: '', linkedId: 'S007' },
      { id: 'S008', username: 'S008', password: 'student2024', role: 'student', name: 'Kofi Adu', email: '', linkedId: 'S008' },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(`
        INSERT INTO users (id, username, password, role, name, email, linked_id, must_change_password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.username, hashedPassword, user.role, user.name, user.email || null, user.linkedId || null]);
    }

    // Seed subjects
    const subjects = [
      { id: 's1', name: 'Mathematics', code: 'MATH', department: 'Sciences', credit: 4 },
      { id: 's2', name: 'English Language', code: 'ENG', department: 'Languages', credit: 4 },
      { id: 's3', name: 'Physics', code: 'PHY', department: 'Sciences', credit: 3 },
      { id: 's4', name: 'Chemistry', code: 'CHEM', department: 'Sciences', credit: 3 },
      { id: 's5', name: 'Biology', code: 'BIO', department: 'Sciences', credit: 3 },
      { id: 's6', name: 'History', code: 'HIST', department: 'Humanities', credit: 3 },
      { id: 's7', name: 'Geography', code: 'GEO', department: 'Humanities', credit: 3 },
      { id: 's8', name: 'Computer Science', code: 'CS', department: 'Technology', credit: 3 },
      { id: 's9', name: 'Art', code: 'ART', department: 'Arts', credit: 2 },
      { id: 's10', name: 'Physical Education', code: 'PE', department: 'Sports', credit: 2 },
    ];

    for (const subject of subjects) {
      await client.query(`
        INSERT INTO subjects (id, name, code, department, credit_hours)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [subject.id, subject.name, subject.code, subject.department, subject.credit]);
    }

    // Seed teachers
    const teacherIds = ['T001', 'T002', 'T003', 'T004', 'T005', 'T006'];
    const teacherNames = [
      { first: 'David', last: 'Chirwa' },
      { first: 'Ama', last: 'Serwaa' },
      { first: 'Peter', last: 'Nkosi' },
      { first: 'Grace', last: 'Mokoena' },
      { first: 'Samuel', last: 'Boateng' },
      { first: 'Lindiwe', last: 'Dlamini' },
    ];

    for (let i = 0; i < teacherIds.length; i++) {
      await client.query(`
        INSERT INTO teachers (id, user_id, first_name, last_name, department, hire_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        ON CONFLICT (id) DO NOTHING
      `, [teacherIds[i], teacherIds[i], teacherNames[i].first, teacherNames[i].last, 'Academic', '2024-01-01']);
    }

    // Seed classes
    const classes = [
      { id: 'C001', name: 'Grade 9A', grade: '9', stream: 'A', year: 2024, capacity: 35, teacherId: 'T002' },
      { id: 'C002', name: 'Grade 9B', grade: '9', stream: 'B', year: 2024, capacity: 35, teacherId: 'T003' },
      { id: 'C003', name: 'Grade 10A', grade: '10', stream: 'A', year: 2024, capacity: 35, teacherId: 'T001' },
      { id: 'C004', name: 'Grade 10B', grade: '10', stream: 'B', year: 2024, capacity: 35, teacherId: 'T004' },
      { id: 'C005', name: 'Grade 11A', grade: '11', stream: 'A', year: 2024, capacity: 32, teacherId: 'T005' },
      { id: 'C006', name: 'Grade 11B', grade: '11', stream: 'B', year: 2024, capacity: 32, teacherId: 'T006' },
      { id: 'C007', name: 'Grade 12A', grade: '12', stream: 'A', year: 2024, capacity: 30, teacherId: 'T001' },
      { id: 'C008', name: 'Grade 12B', grade: '12', stream: 'B', year: 2024, capacity: 30, teacherId: 'T002' },
    ];

    for (const cls of classes) {
      await client.query(`
        INSERT INTO classes (id, name, grade, stream, year, capacity, teacher_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [cls.id, cls.name, cls.grade, cls.stream, cls.year, cls.capacity, cls.teacherId]);
    }

    // Seed the school timetable for a few periods
    await client.query(`
      INSERT INTO timetable (id, class_id, subject_id, teacher_id, day, period, start_time, end_time, room, created_at, updated_at)
      VALUES
        ('tt1', 'C001', 's1', 'T001', 'Monday', 1, '07:00', '07:45', 'Room 101', NOW(), NOW()),
        ('tt2', 'C001', 's2', 'T002', 'Monday', 2, '07:45', '08:30', 'Room 101', NOW(), NOW()),
        ('tt3', 'C002', 's3', 'T003', 'Monday', 1, '07:00', '07:45', 'Room 102', NOW(), NOW()),
        ('tt4', 'C002', 's4', 'T004', 'Monday', 2, '07:45', '08:30', 'Room 102', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed students
    const studentIds = ['S001', 'S002', 'S003', 'S004', 'S005', 'S006', 'S007', 'S008'];
    const studentNames = [
      { first: 'Amara', last: 'Osei' },
      { first: 'Tariq', last: 'Hassan' },
      { first: 'Sofia', last: 'Reyes' },
      { first: 'James', last: 'Mutamba' },
      { first: 'Priya', last: 'Sharma' },
      { first: 'Luca', last: 'Ferreira' },
      { first: 'Zoe', last: 'Nakamura' },
      { first: 'Kofi', last: 'Adu' },
    ];

    for (let i = 0; i < studentIds.length; i++) {
      const classId = classes[i % classes.length].id;
      await client.query(`
        INSERT INTO students (id, user_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_status, admission_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
        ON CONFLICT (id) DO NOTHING
      `, [studentIds[i], studentIds[i], studentNames[i].first, studentNames[i].last, '2007-05-15', 'M', classId, '2024-01-15']);
    }

    // Seed events
    const events = [
      { id: 'EV001', title: 'Open Day', type: 'School Event', status: 'Upcoming', date: '2024-10-05', time: '09:00', venue: 'Main Hall', description: 'Open day for prospective students and parents.' },
      { id: 'EV002', title: 'Science Fair', type: 'Academic', status: 'Upcoming', date: '2024-11-12', time: '10:00', venue: 'Science Block', description: 'Student science projects on display.' },
    ];
    for (const event of events) {
      await client.query(`
        INSERT INTO events (id, title, type, status, date, time, venue, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [event.id, event.title, event.type, event.status, event.date, event.time, event.venue, event.description]);
    }

    // Seed announcements
    const announcements = [
      { id: 'ANN001', title: 'Term Exams Schedule', content: 'Term exams start next month. Please review your timetable and prepare accordingly.', priority: 'High', author: 'Administration', date: '2024-09-01' },
      { id: 'ANN002', title: 'Library Closed', content: 'The library will be closed this Friday for maintenance.', priority: 'Normal', author: 'Library', date: '2024-09-08' },
    ];
    for (const announcement of announcements) {
      await client.query(`
        INSERT INTO announcements (id, title, content, priority, author, date)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [announcement.id, announcement.title, announcement.content, announcement.priority, announcement.author, announcement.date]);
    }

    // Seed fee structure
    const fees = [
      { id: 'FS001', name: 'Tuition Fee', amount: 500, term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
      { id: 'FS002', name: 'Tuition Fee', amount: 500, term: 'Term 2', year: '2024/2025', grade: 'all', dueDate: '2025-01-15' },
      { id: 'FS003', name: 'Tuition Fee', amount: 500, term: 'Term 3', year: '2024/2025', grade: 'all', dueDate: '2025-04-15' },
      { id: 'FS004', name: 'Sports Levy', amount: 50, term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
      { id: 'FS005', name: 'Library Fee', amount: 30, term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
    ];

    for (const fee of fees) {
      await client.query(`
        INSERT INTO fee_structure (id, name, amount, term, year, grade, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [fee.id, fee.name, fee.amount, fee.term, fee.year, fee.grade, fee.dueDate]);
    }

    await client.query('COMMIT');
    console.log('✓ Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
