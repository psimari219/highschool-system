// In-memory database with seeded data
const { v4: uuidv4 } = require('uuid');

const db = {
  users: [],
  students: [],
  teachers: [],
  classes: [],
  subjects: [],
  grades: [],
  attendance: [],
  sports: [],
  sportTeams: [],
  sportMembers: [],
  schemes: [],
  enrollments: [],
  timetable: [],
  fees: [],
  feePayments: [],
};

// Seed default admin user
db.users.push({
  id: 'admin-1',
  username: 'admin',
  password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // "password"
  role: 'admin',
  name: 'System Administrator',
  email: 'admin@highschool.edu',
});

// Seed subjects
const subjectList = [
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
db.subjects.push(...subjectList);

// Seed classes
const classList = [
  { id: 'c1', name: 'Form 1A', grade: 'Form 1', stream: 'A', year: 2024, capacity: 35, teacherId: 't1' },
  { id: 'c2', name: 'Form 1B', grade: 'Form 1', stream: 'B', year: 2024, capacity: 35, teacherId: 't2' },
  { id: 'c3', name: 'Form 2A', grade: 'Form 2', stream: 'A', year: 2024, capacity: 35, teacherId: 't3' },
  { id: 'c4', name: 'Form 2B', grade: 'Form 2', stream: 'B', year: 2024, capacity: 35, teacherId: 't4' },
  { id: 'c5', name: 'Form 3A', grade: 'Form 3', stream: 'A', year: 2024, capacity: 35, teacherId: 't1' },
  { id: 'c6', name: 'Form 4A', grade: 'Form 4', stream: 'A', year: 2024, capacity: 35, teacherId: 't2' },
  { id: 'c7', name: 'Form 5A', grade: 'Form 5', stream: 'A', year: 2024, capacity: 30, teacherId: 't3' },
  { id: 'c8', name: 'Form 6A', grade: 'Form 6', stream: 'A', year: 2024, capacity: 25, teacherId: 't4' },
];
db.classes.push(...classList);

// Seed teachers
const teacherList = [
  { id: 't1', employeeId: 'TCH001', firstName: 'John', lastName: 'Mukamuri', email: 'j.mukamuri@school.edu', phone: '+263771234567', subjects: ['s1', 's3'], classId: 'c1', department: 'Sciences', qualification: 'B.Sc Mathematics', joinDate: '2018-01-15', status: 'active', salary: 85000 },
  { id: 't2', employeeId: 'TCH002', firstName: 'Sarah', lastName: 'Chikwanda', email: 's.chikwanda@school.edu', phone: '+263772345678', subjects: ['s2', 's6'], classId: 'c2', department: 'Languages', qualification: 'B.A English', joinDate: '2019-03-01', status: 'active', salary: 80000 },
  { id: 't3', employeeId: 'TCH003', firstName: 'Peter', lastName: 'Ndlovu', email: 'p.ndlovu@school.edu', phone: '+263773456789', subjects: ['s4', 's5'], classId: 'c3', department: 'Sciences', qualification: 'B.Sc Chemistry', joinDate: '2017-07-10', status: 'active', salary: 88000 },
  { id: 't4', employeeId: 'TCH004', firstName: 'Grace', lastName: 'Moyo', email: 'g.moyo@school.edu', phone: '+263774567890', subjects: ['s7', 's8'], classId: 'c4', department: 'Technology', qualification: 'B.Sc Computer Science', joinDate: '2020-01-20', status: 'active', salary: 90000 },
  { id: 't5', employeeId: 'TCH005', firstName: 'David', lastName: 'Sibanda', email: 'd.sibanda@school.edu', phone: '+263775678901', subjects: ['s9', 's10'], classId: null, department: 'Arts', qualification: 'B.A Fine Arts', joinDate: '2021-05-15', status: 'active', salary: 75000 },
];
db.teachers.push(...teacherList);

// Add teacher users
teacherList.forEach(t => {
  db.users.push({
    id: `user-${t.id}`,
    username: t.email.split('@')[0],
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role: 'teacher',
    name: `${t.firstName} ${t.lastName}`,
    email: t.email,
    teacherId: t.id,
  });
});

// Seed students
const firstNames = ['Tendai', 'Chipo', 'Farai', 'Takudzwa', 'Blessing', 'Tanaka', 'Ruvimbo', 'Tapiwa', 'Simba', 'Nyasha', 'Tatenda', 'Vimbai', 'Tafadzwa', 'Kudakwashe', 'Rufaro'];
const lastNames = ['Moyo', 'Dube', 'Ncube', 'Mpofu', 'Sibanda', 'Ndlovu', 'Phiri', 'Chirwa', 'Banda', 'Mwale', 'Chikwanda', 'Nkosi', 'Zulu', 'Mthembu', 'Sithole'];

let studentCount = 0;
classList.forEach((cls, ci) => {
  const count = Math.floor(Math.random() * 8) + 25;
  for (let i = 0; i < count; i++) {
    studentCount++;
    const id = `stu${studentCount}`;
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const year = parseInt(cls.grade.replace('Form ', ''));
    const birthYear = 2024 - 13 - year;
    db.students.push({
      id,
      studentId: `STU${String(studentCount).padStart(4, '0')}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${studentCount}@student.school.edu`,
      phone: `+26377${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      dateOfBirth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      classId: cls.id,
      parentName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${ln}`,
      parentPhone: `+26377${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      parentEmail: `parent${studentCount}@gmail.com`,
      address: `${Math.floor(Math.random() * 100) + 1} Main Street, Harare`,
      enrollmentDate: `2024-01-15`,
      status: 'active',
      nationality: 'Zimbabwean',
    });
  }
});

// Seed grades
db.students.forEach(student => {
  subjectList.forEach(subject => {
    const score = Math.floor(Math.random() * 40) + 55;
    db.grades.push({
      id: uuidv4(),
      studentId: student.id,
      subjectId: subject.id,
      classId: student.classId,
      term: 'Term 1',
      year: 2024,
      ca1: Math.floor(Math.random() * 20) + 10,
      ca2: Math.floor(Math.random() * 20) + 10,
      exam: Math.floor(Math.random() * 60) + 30,
      total: score,
      grade: getLetterGrade(score),
      gpaPoints: getGPAPoints(score),
    });
  });
});

function getLetterGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

function getGPAPoints(score) {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.7;
  if (score >= 75) return 3.3;
  if (score >= 70) return 3.0;
  if (score >= 65) return 2.7;
  if (score >= 60) return 2.3;
  if (score >= 55) return 2.0;
  return 0.0;
}

// Seed attendance
const today = new Date();
for (let d = 0; d < 30; d++) {
  const date = new Date(today);
  date.setDate(date.getDate() - d);
  if (date.getDay() === 0 || date.getDay() === 6) continue;
  const dateStr = date.toISOString().split('T')[0];
  db.students.forEach(student => {
    const rand = Math.random();
    db.attendance.push({
      id: uuidv4(),
      studentId: student.id,
      classId: student.classId,
      date: dateStr,
      status: rand > 0.1 ? 'present' : rand > 0.05 ? 'late' : 'absent',
      note: '',
    });
  });
}

// Seed sports
const sportsData = [
  { id: 'sp1', name: 'Football', category: 'Team Sport', coach: 't5', season: '2024', venue: 'Main Field', schedule: 'Tuesday & Thursday 3PM' },
  { id: 'sp2', name: 'Basketball', category: 'Team Sport', coach: 't1', season: '2024', venue: 'Court A', schedule: 'Monday & Wednesday 4PM' },
  { id: 'sp3', name: 'Athletics', category: 'Individual Sport', coach: 't5', season: '2024', venue: 'Track', schedule: 'Daily 5:30AM' },
  { id: 'sp4', name: 'Swimming', category: 'Individual Sport', coach: 't2', season: '2024', venue: 'Pool', schedule: 'Monday, Wednesday, Friday 6AM' },
  { id: 'sp5', name: 'Netball', category: 'Team Sport', coach: 't3', season: '2024', venue: 'Court B', schedule: 'Tuesday & Friday 3PM' },
  { id: 'sp6', name: 'Tennis', category: 'Individual Sport', coach: 't4', season: '2024', venue: 'Tennis Courts', schedule: 'Wednesday & Saturday 8AM' },
];
db.sports.push(...sportsData);

// Seed sport members
db.students.forEach(student => {
  if (Math.random() > 0.6) {
    const sport = sportsData[Math.floor(Math.random() * sportsData.length)];
    if (!db.sportMembers.find(m => m.studentId === student.id && m.sportId === sport.id)) {
      db.sportMembers.push({
        id: uuidv4(),
        studentId: student.id,
        sportId: sport.id,
        position: 'Player',
        joinDate: '2024-02-01',
        status: 'active',
      });
    }
  }
});

// Seed schemes of work
const schemeList = [
  { id: 'sch1', subjectId: 's1', teacherId: 't1', classId: 'c1', term: 'Term 1', year: 2024, title: 'Algebra Fundamentals', weeks: [
    { week: 1, topic: 'Introduction to Algebra', objectives: 'Students will understand variables and expressions', resources: 'Textbook Ch.1', assessment: 'Class exercise' },
    { week: 2, topic: 'Linear Equations', objectives: 'Solve single variable equations', resources: 'Textbook Ch.2, worksheets', assessment: 'Quiz 1' },
    { week: 3, topic: 'Simultaneous Equations', objectives: 'Solve two equations simultaneously', resources: 'Textbook Ch.3', assessment: 'Group work' },
    { week: 4, topic: 'Quadratic Equations', objectives: 'Factorize and solve quadratics', resources: 'Textbook Ch.4', assessment: 'CA Test 1' },
  ]},
  { id: 'sch2', subjectId: 's2', teacherId: 't2', classId: 'c2', term: 'Term 1', year: 2024, title: 'Essay Writing & Comprehension', weeks: [
    { week: 1, topic: 'Essay Structure', objectives: 'Understand introduction, body, conclusion', resources: 'Handouts', assessment: 'Short essay' },
    { week: 2, topic: 'Comprehension Skills', objectives: 'Extract meaning from passages', resources: 'Comprehension book', assessment: 'Comprehension test' },
    { week: 3, topic: 'Argumentative Writing', objectives: 'Write persuasive arguments', resources: 'Sample essays', assessment: 'Essay submission' },
  ]},
];
db.schemes.push(...schemeList);

// Seed timetable
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
  { period: 1, start: '07:00', end: '07:45' },
  { period: 2, start: '07:45', end: '08:30' },
  { period: 3, start: '08:30', end: '09:15' },
  { period: 4, start: '09:30', end: '10:15' },
  { period: 5, start: '10:15', end: '11:00' },
  { period: 6, start: '11:15', end: '12:00' },
  { period: 7, start: '12:00', end: '12:45' },
  { period: 8, start: '13:30', end: '14:15' },
];

classList.forEach(cls => {
  days.forEach(day => {
    const daySubjects = [...subjectList].sort(() => Math.random() - 0.5).slice(0, 8);
    daySubjects.forEach((subj, idx) => {
      if (idx >= periods.length) return;
      const teacher = teacherList.find(t => t.subjects.includes(subj.id)) || teacherList[0];
      db.timetable.push({
        id: uuidv4(),
        classId: cls.id,
        subjectId: subj.id,
        teacherId: teacher.id,
        day,
        period: periods[idx].period,
        startTime: periods[idx].start,
        endTime: periods[idx].end,
        room: `Room ${Math.floor(Math.random() * 20) + 1}`,
      });
    });
  });
});

// Seed fees
db.students.forEach(student => {
  const paid = Math.random() > 0.3;
  const partial = !paid && Math.random() > 0.5;
  db.fees.push({
    id: uuidv4(),
    studentId: student.id,
    year: 2024,
    term: 'Term 1',
    tuitionFee: 50000,
    sportsFee: 5000,
    labFee: 3000,
    libraryFee: 2000,
    totalDue: 60000,
    totalPaid: paid ? 60000 : partial ? Math.floor(Math.random() * 30000) + 10000 : 0,
    status: paid ? 'paid' : partial ? 'partial' : 'unpaid',
    dueDate: '2024-02-28',
  });
});

module.exports = db;
module.exports.getLetterGrade = getLetterGrade;
module.exports.getGPAPoints = getGPAPoints;
