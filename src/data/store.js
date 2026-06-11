import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'educore_data_v3';

/* ─── helpers ─────────────────────────────────────── */
export function generateId(prefix = 'ID') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

export function generatePassword(name) {
  const words = ['school', 'edu', 'learn', 'west', 'lake'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}${num}`;
}

export const GRADE_SCALE = [
  { min: 90, max: 100, grade: 'A+', points: 4.0, description: 'Outstanding' },
  { min: 85, max: 89,  grade: 'A',  points: 4.0, description: 'Excellent' },
  { min: 80, max: 84,  grade: 'A-', points: 3.7, description: 'Very Good' },
  { min: 75, max: 79,  grade: 'B+', points: 3.3, description: 'Good' },
  { min: 70, max: 74,  grade: 'B',  points: 3.0, description: 'Above Average' },
  { min: 65, max: 69,  grade: 'B-', points: 2.7, description: 'Average' },
  { min: 60, max: 64,  grade: 'C+', points: 2.3, description: 'Below Average' },
  { min: 55, max: 59,  grade: 'C',  points: 2.0, description: 'Satisfactory' },
  { min: 50, max: 54,  grade: 'C-', points: 1.7, description: 'Pass' },
  { min: 40, max: 49,  grade: 'D',  points: 1.0, description: 'Poor' },
  { min: 0,  max: 39,  grade: 'F',  points: 0.0, description: 'Fail' },
];

export function scoreToGrade(score) {
  return GRADE_SCALE.find(g => score >= g.min && score <= g.max) || GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function calculateGPA(grades) {
  if (!grades || grades.length === 0) return '0.00';
  const total = grades.reduce((sum, g) => {
    const entry = GRADE_SCALE.find(gs => gs.grade === g.grade);
    return sum + (entry ? entry.points : 0);
  }, 0);
  return (total / grades.length).toFixed(2);
}

/* ─── seed data ─────────────────────────────────────── */
const seedData = {
  school: {
    name: 'Westlake High School',
    motto: 'Excellence in Education',
    address: '123 Academy Drive, Springfield',
    phone: '+1 (555) 234-5678',
    email: 'admin@westlakehigh.edu',
    principal: 'Dr. Patricia Moyo',
    currentYear: '2024/2025',
    currentTerm: 'Term 2',
  },

  /* ── users (all logins go through here) ── */
  users: [
    { id: 'OWN001', role: 'owner',      username: 'OWN001', password: 'owner2026',   name: 'Product Owner',       email: 'owner@thedigital5.com',             linkedId: null,    mustChangePassword: false },
    { id: 'ADM001', role: 'admin',      username: 'ADM001', password: 'admin2024',   name: 'Dr. Patricia Moyo',   email: 'patricia.moyo@westlakehigh.edu',   linkedId: null,    mustChangePassword: false },
    { id: 'ACC001', role: 'accountant', username: 'ACC001', password: 'acc2024',     name: 'Mr. Robert Banda',    email: 'robert.banda@westlakehigh.edu',    linkedId: 'ST001', mustChangePassword: false },
    { id: 'T001',   role: 'teacher',    username: 'T001',   password: 'teach1234',   name: 'David Chirwa',        email: 'david.chirwa@westlakehigh.edu',    linkedId: 'T001',  mustChangePassword: false },
    { id: 'T002',   role: 'teacher',    username: 'T002',   password: 'teach1234',   name: 'Ama Serwaa',          email: 'ama.serwaa@westlakehigh.edu',      linkedId: 'T002',  mustChangePassword: false },
    { id: 'T003',   role: 'teacher',    username: 'T003',   password: 'teach1234',   name: 'Peter Nkosi',         email: 'peter.nkosi@westlakehigh.edu',     linkedId: 'T003',  mustChangePassword: false },
    { id: 'T004',   role: 'teacher',    username: 'T004',   password: 'teach1234',   name: 'Grace Mokoena',       email: 'grace.mokoena@westlakehigh.edu',   linkedId: 'T004',  mustChangePassword: false },
    { id: 'T005',   role: 'teacher',    username: 'T005',   password: 'teach1234',   name: 'Samuel Boateng',      email: 'samuel.boateng@westlakehigh.edu',  linkedId: 'T005',  mustChangePassword: false },
    { id: 'T006',   role: 'teacher',    username: 'T006',   password: 'teach1234',   name: 'Lindiwe Dlamini',     email: 'lindiwe.dlamini@westlakehigh.edu', linkedId: 'T006',  mustChangePassword: false },
    { id: 'S001',   role: 'student',    username: 'S001',   password: 'student2024', name: 'Amara Osei',          email: '',                                 linkedId: 'S001',  mustChangePassword: false },
    { id: 'S002',   role: 'student',    username: 'S002',   password: 'student2024', name: 'Tariq Hassan',        email: '',                                 linkedId: 'S002',  mustChangePassword: false },
    { id: 'S003',   role: 'student',    username: 'S003',   password: 'student2024', name: 'Sofia Reyes',         email: '',                                 linkedId: 'S003',  mustChangePassword: false },
    { id: 'S004',   role: 'student',    username: 'S004',   password: 'student2024', name: 'James Mutamba',       email: '',                                 linkedId: 'S004',  mustChangePassword: false },
    { id: 'S005',   role: 'student',    username: 'S005',   password: 'student2024', name: 'Priya Sharma',        email: '',                                 linkedId: 'S005',  mustChangePassword: false },
    { id: 'S006',   role: 'student',    username: 'S006',   password: 'student2024', name: 'Luca Ferreira',       email: '',                                 linkedId: 'S006',  mustChangePassword: false },
    { id: 'S007',   role: 'student',    username: 'S007',   password: 'student2024', name: 'Zoe Nakamura',        email: '',                                 linkedId: 'S007',  mustChangePassword: false },
    { id: 'S008',   role: 'student',    username: 'S008',   password: 'student2024', name: 'Kofi Adu',            email: '',                                 linkedId: 'S008',  mustChangePassword: false },
  ],

  /* ── staff (non-teacher employees) ── */
  staff: [
    { id: 'ST001', firstName: 'Robert', lastName: 'Banda', role: 'Accountant', department: 'Finance', hireDate: '2018-01-15', status: 'Active', phone: '+1 555-3001', email: 'robert.banda@westlakehigh.edu', nationalId: 'SNID1980001', salary: 3500 },
    { id: 'ST002', firstName: 'Agnes',  lastName: 'Phiri', role: 'Secretary',  department: 'Admin',   hireDate: '2019-03-10', status: 'Active', phone: '+1 555-3002', email: 'agnes.phiri@westlakehigh.edu',  nationalId: 'SNID1985002', salary: 2800 },
    { id: 'ST003', firstName: 'John',   lastName: 'Mwale', role: 'Librarian',  department: 'Library', hireDate: '2016-08-01', status: 'Active', phone: '+1 555-3003', email: 'john.mwale@westlakehigh.edu',   nationalId: 'SNID1978003', salary: 2600 },
  ],

  /* ── fees ── */
  feeStructure: [
    { id: 'FS001', name: 'Tuition Fee',      amount: 500, term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
    { id: 'FS002', name: 'Tuition Fee',      amount: 500, term: 'Term 2', year: '2024/2025', grade: 'all', dueDate: '2025-01-15' },
    { id: 'FS003', name: 'Tuition Fee',      amount: 500, term: 'Term 3', year: '2024/2025', grade: 'all', dueDate: '2025-04-15' },
    { id: 'FS004', name: 'Sports Levy',      amount: 50,  term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
    { id: 'FS005', name: 'Library Fee',      amount: 30,  term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
    { id: 'FS006', name: 'Exam Fee',         amount: 80,  term: 'Term 3', year: '2024/2025', grade: 'all', dueDate: '2025-05-01' },
    { id: 'FS007', name: 'Development Fund', amount: 100, term: 'Term 1', year: '2024/2025', grade: 'all', dueDate: '2024-09-15' },
  ],

  feePayments: [
    { id: uuidv4(), studentId: 'S001', feeId: 'FS001', amount: 500, date: '2024-09-10', method: 'Bank Transfer', reference: 'REF001', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025' },
    { id: uuidv4(), studentId: 'S001', feeId: 'FS002', amount: 500, date: '2025-01-08', method: 'Cash',          reference: 'REF002', receivedBy: 'ACC001', term: 'Term 2', year: '2024/2025' },
    { id: uuidv4(), studentId: 'S002', feeId: 'FS001', amount: 500, date: '2024-09-12', method: 'Cheque',        reference: 'REF003', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025' },
    { id: uuidv4(), studentId: 'S003', feeId: 'FS001', amount: 250, date: '2024-09-20', method: 'Cash',          reference: 'REF004', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025', note: 'Partial payment' },
    { id: uuidv4(), studentId: 'S004', feeId: 'FS001', amount: 500, date: '2024-09-05', method: 'Bank Transfer', reference: 'REF005', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025' },
    { id: uuidv4(), studentId: 'S007', feeId: 'FS001', amount: 500, date: '2024-09-11', method: 'Cash',          reference: 'REF006', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025' },
    { id: uuidv4(), studentId: 'S008', feeId: 'FS001', amount: 500, date: '2024-09-13', method: 'Bank Transfer', reference: 'REF007', receivedBy: 'ACC001', term: 'Term 1', year: '2024/2025' },
  ],

  /* ── subjects ── */
  subjects: [
    { id: 'SUB001', name: 'Mathematics',       code: 'MATH',  department: 'Sciences',    isCore: true  },
    { id: 'SUB002', name: 'Further Mathematics',code: 'FMATH',department: 'Sciences',    isCore: false },
    { id: 'SUB003', name: 'English Language',  code: 'ENGL',  department: 'Languages',   isCore: true  },
    { id: 'SUB004', name: 'English Literature',code: 'ENLIT', department: 'Languages',   isCore: false },
    { id: 'SUB005', name: 'Physics',           code: 'PHYS',  department: 'Sciences',    isCore: true  },
    { id: 'SUB006', name: 'Chemistry',         code: 'CHEM',  department: 'Sciences',    isCore: true  },
    { id: 'SUB007', name: 'Biology',           code: 'BIO',   department: 'Sciences',    isCore: false },
    { id: 'SUB008', name: 'Science',           code: 'SCI',   department: 'Sciences',    isCore: false },
    { id: 'SUB009', name: 'History',           code: 'HIST',  department: 'Humanities',  isCore: false },
    { id: 'SUB010', name: 'Geography',         code: 'GEO',   department: 'Humanities',  isCore: false },
    { id: 'SUB011', name: 'Computer Science',  code: 'CS',    department: 'Technology',  isCore: false },
    { id: 'SUB012', name: 'ICT',              code: 'ICT',   department: 'Technology',  isCore: false },
    { id: 'SUB013', name: 'Art',              code: 'ART',   department: 'Arts',        isCore: false },
    { id: 'SUB014', name: 'Music',            code: 'MUS',   department: 'Arts',        isCore: false },
    { id: 'SUB015', name: 'Physical Education',code: 'PE',   department: 'Sports',      isCore: false },
    { id: 'SUB016', name: 'Business Studies', code: 'BUS',   department: 'Commerce',    isCore: false },
  ],

  students: [
    { id: 'S001', firstName: 'Amara',  lastName: 'Osei',     dob: '2008-03-15', gender: 'Female', grade: '10', stream: 'A', enrollmentDate: '2022-09-01', status: 'Active', parentName: 'Kwame Osei',     parentPhone: '+1 555-1001', address: '45 Maple St',  nationalId: 'NID2008001' },
    { id: 'S002', firstName: 'Tariq',  lastName: 'Hassan',   dob: '2007-07-22', gender: 'Male',   grade: '11', stream: 'B', enrollmentDate: '2021-09-01', status: 'Active', parentName: 'Fatima Hassan',  parentPhone: '+1 555-1002', address: '78 Oak Ave',   nationalId: 'NID2007002' },
    { id: 'S003', firstName: 'Sofia',  lastName: 'Reyes',    dob: '2009-01-10', gender: 'Female', grade: '9',  stream: 'A', enrollmentDate: '2023-09-01', status: 'Active', parentName: 'Carlos Reyes',   parentPhone: '+1 555-1003', address: '12 Pine Rd',   nationalId: 'NID2009003' },
    { id: 'S004', firstName: 'James',  lastName: 'Mutamba',  dob: '2007-11-30', gender: 'Male',   grade: '11', stream: 'A', enrollmentDate: '2021-09-01', status: 'Active', parentName: 'Grace Mutamba',  parentPhone: '+1 555-1004', address: '33 Elm Blvd',  nationalId: 'NID2007004' },
    { id: 'S005', firstName: 'Priya',  lastName: 'Sharma',   dob: '2008-05-18', gender: 'Female', grade: '10', stream: 'B', enrollmentDate: '2022-09-01', status: 'Active', parentName: 'Raj Sharma',     parentPhone: '+1 555-1005', address: '90 Cedar Ln',  nationalId: 'NID2008005' },
    { id: 'S006', firstName: 'Luca',   lastName: 'Ferreira', dob: '2009-09-02', gender: 'Male',   grade: '9',  stream: 'B', enrollmentDate: '2023-09-01', status: 'Active', parentName: 'Maria Ferreira', parentPhone: '+1 555-1006', address: '56 Birch Way', nationalId: 'NID2009006' },
    { id: 'S007', firstName: 'Zoe',    lastName: 'Nakamura', dob: '2006-12-25', gender: 'Female', grade: '12', stream: 'A', enrollmentDate: '2020-09-01', status: 'Active', parentName: 'Hiro Nakamura',  parentPhone: '+1 555-1007', address: '21 Willow Dr', nationalId: 'NID2006007' },
    { id: 'S008', firstName: 'Kofi',   lastName: 'Adu',      dob: '2006-04-14', gender: 'Male',   grade: '12', stream: 'B', enrollmentDate: '2020-09-01', status: 'Active', parentName: 'Abena Adu',      parentPhone: '+1 555-1008', address: '67 Aspen Ct',  nationalId: 'NID2006008' },
  ],

  teachers: [
    { id: 'T001', firstName: 'David',   lastName: 'Chirwa',  dob: '1982-04-12', gender: 'Male',   qualification: 'BSc Mathematics, PGCE',       subjects: ['Mathematics', 'Further Mathematics'], hireDate: '2015-01-10', status: 'Active', phone: '+1 555-2001', email: 'david.chirwa@westlakehigh.edu',   nationalId: 'TNID1982001', salary: 4000 },
    { id: 'T002', firstName: 'Ama',     lastName: 'Serwaa',  dob: '1988-09-22', gender: 'Female', qualification: 'BA English Literature, PGCE',  subjects: ['English Language', 'English Literature'], hireDate: '2017-08-15', status: 'Active', phone: '+1 555-2002', email: 'ama.serwaa@westlakehigh.edu', nationalId: 'TNID1988002', salary: 3800 },
    { id: 'T003', firstName: 'Peter',   lastName: 'Nkosi',   dob: '1979-02-28', gender: 'Male',   qualification: 'BSc Physics, MSc Applied Physics', subjects: ['Physics', 'Science'],      hireDate: '2010-03-01', status: 'Active', phone: '+1 555-2003', email: 'peter.nkosi@westlakehigh.edu',    nationalId: 'TNID1979003', salary: 4200 },
    { id: 'T004', firstName: 'Grace',   lastName: 'Mokoena', dob: '1990-07-05', gender: 'Female', qualification: 'BSc Chemistry, PGCE',          subjects: ['Chemistry', 'Biology'],       hireDate: '2019-01-07', status: 'Active', phone: '+1 555-2004', email: 'grace.mokoena@westlakehigh.edu',  nationalId: 'TNID1990004', salary: 3600 },
    { id: 'T005', firstName: 'Samuel',  lastName: 'Boateng', dob: '1985-11-17', gender: 'Male',   qualification: 'BA History, MA History',       subjects: ['History', 'Geography'],       hireDate: '2013-09-02', status: 'Active', phone: '+1 555-2005', email: 'samuel.boateng@westlakehigh.edu', nationalId: 'TNID1985005', salary: 3700 },
    { id: 'T006', firstName: 'Lindiwe', lastName: 'Dlamini', dob: '1992-03-30', gender: 'Female', qualification: 'BSc Computer Science, PGCE',   subjects: ['Computer Science', 'ICT'],    hireDate: '2020-09-01', status: 'Active', phone: '+1 555-2006', email: 'lindiwe.dlamini@westlakehigh.edu', nationalId: 'TNID1992006', salary: 3500 },
  ],

  classes: [
    { id: 'C001', name: 'Grade 9A',  grade: '9',  stream: 'A', classTeacherId: 'T002', capacity: 35, room: 'Room 101', subjects: ['Mathematics','English Language','Physics','Chemistry','History','Computer Science'] },
    { id: 'C002', name: 'Grade 9B',  grade: '9',  stream: 'B', classTeacherId: 'T003', capacity: 35, room: 'Room 102', subjects: ['Mathematics','English Language','Physics','Chemistry','History','Computer Science'] },
    { id: 'C003', name: 'Grade 10A', grade: '10', stream: 'A', classTeacherId: 'T001', capacity: 35, room: 'Room 201', subjects: ['Mathematics','English Language','Physics','Chemistry','History','Computer Science'] },
    { id: 'C004', name: 'Grade 10B', grade: '10', stream: 'B', classTeacherId: 'T004', capacity: 35, room: 'Room 202', subjects: ['Mathematics','English Language','Physics','Chemistry','Biology','Computer Science'] },
    { id: 'C005', name: 'Grade 11A', grade: '11', stream: 'A', classTeacherId: 'T005', capacity: 32, room: 'Room 301', subjects: ['Mathematics','English Literature','Physics','Chemistry','History','Computer Science'] },
    { id: 'C006', name: 'Grade 11B', grade: '11', stream: 'B', classTeacherId: 'T006', capacity: 32, room: 'Room 302', subjects: ['Mathematics','English Literature','Physics','Chemistry','Biology','Computer Science'] },
    { id: 'C007', name: 'Grade 12A', grade: '12', stream: 'A', classTeacherId: 'T001', capacity: 30, room: 'Room 401', subjects: ['Mathematics','English Literature','Further Mathematics','Physics','Computer Science'] },
    { id: 'C008', name: 'Grade 12B', grade: '12', stream: 'B', classTeacherId: 'T002', capacity: 30, room: 'Room 402', subjects: ['Mathematics','English Literature','Biology','Chemistry','History'] },
  ],

  /* subject-teacher-class assignments */
  subjectAssignments: [
    { id: 'SA001', teacherId: 'T001', classId: 'C003', subject: 'Mathematics' },
    { id: 'SA002', teacherId: 'T001', classId: 'C007', subject: 'Mathematics' },
    { id: 'SA003', teacherId: 'T001', classId: 'C007', subject: 'Further Mathematics' },
    { id: 'SA004', teacherId: 'T002', classId: 'C001', subject: 'English Language' },
    { id: 'SA005', teacherId: 'T002', classId: 'C003', subject: 'English Language' },
    { id: 'SA006', teacherId: 'T003', classId: 'C001', subject: 'Physics' },
    { id: 'SA007', teacherId: 'T003', classId: 'C003', subject: 'Physics' },
    { id: 'SA008', teacherId: 'T004', classId: 'C004', subject: 'Chemistry' },
    { id: 'SA009', teacherId: 'T004', classId: 'C004', subject: 'Biology' },
    { id: 'SA010', teacherId: 'T005', classId: 'C005', subject: 'History' },
    { id: 'SA011', teacherId: 'T006', classId: 'C006', subject: 'Computer Science' },
  ],

  grades: [
    { id: uuidv4(), studentId: 'S001', subject: 'Mathematics',    term: 'Term 1', year: '2024/2025', score: 88, grade: 'B+', teacherId: 'T001', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'English Language',term: 'Term 1', year: '2024/2025', score: 92, grade: 'A',  teacherId: 'T002', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'Physics',         term: 'Term 1', year: '2024/2025', score: 75, grade: 'B+', teacherId: 'T003', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'Chemistry',       term: 'Term 1', year: '2024/2025', score: 80, grade: 'A-', teacherId: 'T004', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S002', subject: 'Mathematics',     term: 'Term 1', year: '2024/2025', score: 95, grade: 'A+', teacherId: 'T001', classId: 'C005', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S002', subject: 'Physics',         term: 'Term 1', year: '2024/2025', score: 91, grade: 'A',  teacherId: 'T003', classId: 'C005', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'Mathematics',     term: 'Term 1', year: '2024/2025', score: 78, grade: 'B+', teacherId: 'T001', classId: 'C007', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'Further Mathematics', term: 'Term 1', year: '2024/2025', score: 70, grade: 'B', teacherId: 'T001', classId: 'C007', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'English Literature',  term: 'Term 1', year: '2024/2025', score: 88, grade: 'B+', teacherId: 'T002', classId: 'C007', examType: 'End of Term' },
  ],

  attendance: [
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-03', status: 'Present', subject: 'Mathematics' },
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-04', status: 'Present', subject: 'English Language' },
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-05', status: 'Absent',  subject: 'Physics' },
    { id: uuidv4(), studentId: 'S002', classId: 'C005', date: '2025-02-03', status: 'Present', subject: 'Mathematics' },
    { id: uuidv4(), studentId: 'S002', classId: 'C005', date: '2025-02-04', status: 'Late',    subject: 'Physics' },
  ],

  sports: [
    { id: 'SP001', name: 'Football',   type: 'Team',       season: '2024/2025', coach: 'Mr. James Banda',    members: ['S002','S004','S006','S008'], schedule: 'Tuesdays & Thursdays 15:30', venue: 'Main Field',       status: 'Active' },
    { id: 'SP002', name: 'Basketball', type: 'Team',       season: '2024/2025', coach: 'Ms. Thandiwe Moyo',  members: ['S001','S003','S007'],        schedule: 'Mondays & Wednesdays 15:30', venue: 'Indoor Gymnasium', status: 'Active' },
    { id: 'SP003', name: 'Athletics',  type: 'Individual', season: '2024/2025', coach: 'Mr. Peter Nkosi',    members: ['S005','S001','S007','S008'],  schedule: 'Fridays 14:00',             venue: 'Track Field',      status: 'Active' },
    { id: 'SP004', name: 'Swimming',   type: 'Individual', season: '2024/2025', coach: 'Ms. Ruth Phiri',     members: ['S003','S005'],               schedule: 'Wednesdays 14:00',          venue: 'Aquatics Centre',  status: 'Active' },
    { id: 'SP005', name: 'Volleyball', type: 'Team',       season: '2024/2025', coach: 'Mr. David Chirwa',   members: ['S001','S005','S007'],        schedule: 'Fridays 15:30',             venue: 'Hall B',           status: 'Active' },
  ],

  schemes: [
    { id: 'SCH001', subject: 'Mathematics', grade: '10', term: 'Term 2', year: '2024/2025', teacherId: 'T001',
      weeks: [
        { week: 1, topic: 'Quadratic Equations',  subtopics: ['Factorisation','Quadratic Formula','Completing the Square'], objectives: 'Solve quadratic equations using multiple methods', resources: 'Textbook Pg 45-67', assessment: 'Class exercise + quiz' },
        { week: 2, topic: 'Functions and Graphs',  subtopics: ['Domain & Range','Linear Functions','Quadratic Graphs'],     objectives: 'Draw and interpret various function graphs', resources: 'Textbook Pg 70-89, Graph paper', assessment: 'Practical assignment' },
      ]
    },
  ],

  events: [
    { id: 'EV001', title: 'Inter-House Sports Day', date: '2025-03-15', type: 'Sports',    description: 'Annual inter-house athletics',             organizer: 'Sports Department' },
    { id: 'EV002', title: 'Science Fair',           date: '2025-04-10', type: 'Academic',  description: 'Annual science fair',                      organizer: 'Science Department' },
    { id: 'EV003', title: 'Prize Giving Ceremony',  date: '2025-06-20', type: 'Ceremony',  description: 'End of year prize giving and graduation', organizer: 'Administration' },
    { id: 'EV004', title: 'Mid-Term Break',         date: '2025-03-28', type: 'Holiday',   description: 'Mid-term holiday break',                   organizer: 'Administration' },
  ],

  enrollmentRequests: [],
  timetables: {},
  /* Period definitions used by the timetable editor (editable) */
  periods: [
    { period: 1, time: '07:30–08:30' },
    { period: 2, time: '08:30–09:30' },
    { period: 3, time: '09:30–10:30' },
    { period: 4, time: '11:00–12:00' },
    { period: 5, time: '12:00–13:00' },
    { period: 6, time: '14:00–15:00' },
  ],
  /* Exam timetables per class (or global) */
  examTimetables: {
    // classId: [{ date: '2025-05-10', start: '09:00', end: '11:00', subject: 'Mathematics', venue: 'Hall', invigilator: 'T001' }]
  },
  /* Requests from admins to teachers/accountant */
  requests: [
    /* Example:
    { id: 'R1', type: 'scheme'|'file', fromRole:'admin', fromId:'ADM001', toRole:'teacher'|'accountant', toIds: ['T001'] or [], message: 'Please submit scheme for Term 2', createdAt:'2025-02-10', status:'pending', response: null }
    */
  ],
  /* Uploaded files metadata (accountant responses) */
  uploadedFiles: [],
  /* In-app notifications (simulated emails/SMS) */
  notifications: [],
  /* Personalized learning plans generated by AI prototype */
  personalizedPlans: [],
  announcements: [
    { id: 'AN001', title: 'Term 2 Exams Schedule', body: 'End of Term 2 exams will begin on 15th March. All students must be in full uniform.', date: '2025-02-01', postedBy: 'ADM001', audience: 'all' },
    { id: 'AN002', title: 'Fee Payment Reminder',  body: 'Term 2 fees are due by 15th January. Please ensure all payments are made on time.', date: '2025-01-10', postedBy: 'ACC001', audience: 'all' },
  ],
  /* Tenants created by owner — each tenant represents a school installation */
  tenants: [
    /* Example:
    { id: 'TNT001', name: 'School A', adminId: 'ADM001', createdAt: '2026-06-10T00:00:00Z', blocked: false, userCount: 1 }
    */
  ],
};

export function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData)); return seedData; }
    const parsed = JSON.parse(raw);
    // Ensure an owner account exists so the product owner can manage system settings.
    try {
      const hasOwner = (parsed.users || []).some(u => u.role === 'owner' || u.id === 'OWN001');
      if (!hasOwner) {
        const ownerUser = { id: 'OWN001', role: 'owner', username: 'OWN001', password: 'owner2026', name: 'Product Owner', email: 'owner@thedigital5.com', linkedId: null, mustChangePassword: false };
        parsed.users = [ownerUser, ...(parsed.users || [])];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore and return parsed
    }
    return parsed;
  } catch { return seedData; }
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
}

export function wipeStoreExceptOwner(currentStore) {
  const ownerUser = (currentStore?.users || []).find(u => u.role === 'owner' || u.id === 'OWN001') || seedData.users.find(u => u.role === 'owner');
  const ownerCopy = ownerUser ? { ...ownerUser, role: 'owner', id: ownerUser.id || 'OWN001', username: ownerUser.username || 'OWN001', mustChangePassword: !!ownerUser.mustChangePassword } : { id: 'OWN001', role: 'owner', username: 'OWN001', password: 'owner2026', name: 'Product Owner', email: 'owner@thedigital5.com', linkedId: null, mustChangePassword: false };
  const kept = {
    school: { ...seedData.school },
    users: [ownerCopy],
    staff: [],
    feeStructure: [],
    feePayments: [],
    subjects: [],
    students: [],
    teachers: [],
    classes: [],
    subjectAssignments: [],
    grades: [],
    attendance: [],
    sports: [],
    schemes: [],
    events: [],
    enrollmentRequests: [],
    timetables: {},
    periods: seedData.periods,
    examTimetables: {},
    requests: [],
    uploadedFiles: [],
    notifications: [],
    personalizedPlans: [],
    announcements: [],
    tenants: [],
  };
  return kept;
}
