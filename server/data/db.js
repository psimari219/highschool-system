// In-memory database (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [
    { id: 'admin-1', username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin', name: 'System Admin', email: 'admin@school.edu' },
    { id: 'teacher-1', username: 'jsmith', password: bcrypt.hashSync('teacher123', 10), role: 'teacher', name: 'John Smith', email: 'jsmith@school.edu', teacherId: 'T001' },
    { id: 'student-1', username: 'astudent', password: bcrypt.hashSync('student123', 10), role: 'student', name: 'Alice Johnson', email: 'alice@school.edu', studentId: 'S001' }
  ],
  students: [
    { id: 'S001', firstName: 'Alice', lastName: 'Johnson', dob: '2007-03-15', gender: 'Female', grade: '10', section: 'A', email: 'alice@school.edu', phone: '555-0101', address: '123 Main St', parentName: 'Bob Johnson', parentPhone: '555-0100', enrollmentDate: '2023-09-01', status: 'Active', photo: null },
    { id: 'S002', firstName: 'Marcus', lastName: 'Williams', dob: '2007-07-22', gender: 'Male', grade: '10', section: 'A', email: 'marcus@school.edu', phone: '555-0102', address: '456 Oak Ave', parentName: 'Diana Williams', parentPhone: '555-0103', enrollmentDate: '2023-09-01', status: 'Active', photo: null },
    { id: 'S003', firstName: 'Sofia', lastName: 'Garcia', dob: '2006-11-08', gender: 'Female', grade: '11', section: 'B', email: 'sofia@school.edu', phone: '555-0104', address: '789 Pine Rd', parentName: 'Carlos Garcia', parentPhone: '555-0105', enrollmentDate: '2022-09-01', status: 'Active', photo: null },
    { id: 'S004', firstName: 'James', lastName: 'Chen', dob: '2006-02-14', gender: 'Male', grade: '11', section: 'A', email: 'james@school.edu', phone: '555-0106', address: '321 Elm St', parentName: 'Wei Chen', parentPhone: '555-0107', enrollmentDate: '2022-09-01', status: 'Active', photo: null },
    { id: 'S005', firstName: 'Priya', lastName: 'Patel', dob: '2008-05-30', gender: 'Female', grade: '9', section: 'C', email: 'priya@school.edu', phone: '555-0108', address: '654 Maple Dr', parentName: 'Raj Patel', parentPhone: '555-0109', enrollmentDate: '2024-09-01', status: 'Active', photo: null },
    { id: 'S006', firstName: 'Ethan', lastName: 'Brown', dob: '2005-09-18', gender: 'Male', grade: '12', section: 'A', email: 'ethan@school.edu', phone: '555-0110', address: '987 Cedar Ln', parentName: 'Mary Brown', parentPhone: '555-0111', enrollmentDate: '2021-09-01', status: 'Active', photo: null }
  ],
  teachers: [
    { id: 'T001', firstName: 'John', lastName: 'Smith', email: 'jsmith@school.edu', phone: '555-1001', subjects: ['Mathematics', 'Physics'], grades: ['10', '11'], qualification: 'M.Sc Mathematics', hireDate: '2018-08-15', status: 'Active', salary: 55000 },
    { id: 'T002', firstName: 'Sarah', lastName: 'Davis', email: 'sdavis@school.edu', phone: '555-1002', subjects: ['English Literature', 'Creative Writing'], grades: ['9', '10', '11', '12'], qualification: 'M.A. English', hireDate: '2016-08-10', status: 'Active', salary: 52000 },
    { id: 'T003', firstName: 'Michael', lastName: 'Thompson', email: 'mthompson@school.edu', phone: '555-1003', subjects: ['Chemistry', 'Biology'], grades: ['11', '12'], qualification: 'Ph.D Chemistry', hireDate: '2020-01-05', status: 'Active', salary: 60000 },
    { id: 'T004', firstName: 'Lisa', lastName: 'Martinez', email: 'lmartinez@school.edu', phone: '555-1004', subjects: ['History', 'Geography'], grades: ['9', '10'], qualification: 'M.A. History', hireDate: '2019-08-20', status: 'Active', salary: 50000 },
    { id: 'T005', firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@school.edu', phone: '555-1005', subjects: ['Physical Education', 'Health'], grades: ['9', '10', '11', '12'], qualification: 'B.Ed Physical Education', hireDate: '2017-08-12', status: 'Active', salary: 48000 }
  ],
  classes: [
    { id: 'CLS001', name: 'Mathematics 10A', subject: 'Mathematics', grade: '10', section: 'A', teacherId: 'T001', schedule: 'Mon/Wed/Fri 08:00-09:00', room: '101', capacity: 30, enrolledCount: 2 },
    { id: 'CLS002', name: 'English 10A', subject: 'English Literature', grade: '10', section: 'A', teacherId: 'T002', schedule: 'Tue/Thu 09:00-10:30', room: '202', capacity: 30, enrolledCount: 2 },
    { id: 'CLS003', name: 'Chemistry 11B', subject: 'Chemistry', grade: '11', section: 'B', teacherId: 'T003', schedule: 'Mon/Wed 10:00-11:30', room: 'Lab1', capacity: 25, enrolledCount: 1 },
    { id: 'CLS004', name: 'History 9C', subject: 'History', grade: '9', section: 'C', teacherId: 'T004', schedule: 'Tue/Thu 08:00-09:30', room: '305', capacity: 30, enrolledCount: 1 },
    { id: 'CLS005', name: 'Physics 11A', subject: 'Physics', grade: '11', section: 'A', teacherId: 'T001', schedule: 'Mon/Wed/Fri 11:00-12:00', room: 'Lab2', capacity: 25, enrolledCount: 1 }
  ],
  grades: [
    { id: uuidv4(), studentId: 'S001', classId: 'CLS001', subject: 'Mathematics', term: 'Term 1', score: 88, maxScore: 100, letterGrade: 'B+', date: '2024-03-15', type: 'Exam' },
    { id: uuidv4(), studentId: 'S001', classId: 'CLS002', subject: 'English Literature', term: 'Term 1', score: 92, maxScore: 100, letterGrade: 'A', date: '2024-03-16', type: 'Exam' },
    { id: uuidv4(), studentId: 'S002', classId: 'CLS001', subject: 'Mathematics', term: 'Term 1', score: 75, maxScore: 100, letterGrade: 'B', date: '2024-03-15', type: 'Exam' },
    { id: uuidv4(), studentId: 'S003', classId: 'CLS003', subject: 'Chemistry', term: 'Term 1', score: 95, maxScore: 100, letterGrade: 'A+', date: '2024-03-17', type: 'Exam' },
    { id: uuidv4(), studentId: 'S001', classId: 'CLS001', subject: 'Mathematics', term: 'Term 1', score: 82, maxScore: 100, letterGrade: 'B+', date: '2024-02-10', type: 'CAT' },
    { id: uuidv4(), studentId: 'S004', classId: 'CLS005', subject: 'Physics', term: 'Term 1', score: 79, maxScore: 100, letterGrade: 'B', date: '2024-03-18', type: 'Exam' },
    { id: uuidv4(), studentId: 'S006', classId: 'CLS002', subject: 'English Literature', term: 'Term 1', score: 91, maxScore: 100, letterGrade: 'A', date: '2024-03-16', type: 'Exam' }
  ],
  attendance: [
    { id: uuidv4(), studentId: 'S001', classId: 'CLS001', date: '2024-03-18', status: 'Present', notes: '' },
    { id: uuidv4(), studentId: 'S002', classId: 'CLS001', date: '2024-03-18', status: 'Absent', notes: 'Sick' },
    { id: uuidv4(), studentId: 'S001', classId: 'CLS001', date: '2024-03-19', status: 'Present', notes: '' },
    { id: uuidv4(), studentId: 'S002', classId: 'CLS001', date: '2024-03-19', status: 'Present', notes: '' },
    { id: uuidv4(), studentId: 'S003', classId: 'CLS003', date: '2024-03-18', status: 'Present', notes: '' },
    { id: uuidv4(), studentId: 'S004', classId: 'CLS005', date: '2024-03-18', status: 'Late', notes: 'Bus delay' }
  ],
  sports: [
    { id: 'SP001', name: 'Basketball', season: 'Winter', coach: 'Robert Wilson', coachId: 'T005', members: ['S001', 'S002', 'S006'], schedule: 'Tue/Thu 15:00-17:00', venue: 'Main Gym', status: 'Active', wins: 8, losses: 3 },
    { id: 'SP002', name: 'Soccer', season: 'Fall', coach: 'Robert Wilson', coachId: 'T005', members: ['S003', 'S004', 'S005'], schedule: 'Mon/Wed 15:30-17:30', venue: 'Football Field', status: 'Active', wins: 5, losses: 5 },
    { id: 'SP003', name: 'Track & Field', season: 'Spring', coach: 'Robert Wilson', coachId: 'T005', members: ['S001', 'S003', 'S006'], schedule: 'Fri 15:00-17:00', venue: 'Athletics Track', status: 'Active', wins: 0, losses: 0 },
    { id: 'SP004', name: 'Swimming', season: 'Year-round', coach: 'Robert Wilson', coachId: 'T005', members: ['S002', 'S005'], schedule: 'Mon/Wed/Fri 07:00-08:00', venue: 'Swimming Pool', status: 'Active', wins: 12, losses: 2 }
  ],
  schemes: [
    { id: 'SCH001', subject: 'Mathematics', grade: '10', teacherId: 'T001', term: 'Term 1', year: '2024', topics: [
      { week: 1, topic: 'Algebra Fundamentals', subtopics: ['Variables', 'Expressions', 'Equations'], objectives: 'Students will solve linear equations', resources: 'Textbook Ch.1', assessment: 'Quiz' },
      { week: 2, topic: 'Quadratic Equations', subtopics: ['Factoring', 'Quadratic Formula', 'Graphing'], objectives: 'Students will solve quadratic equations', resources: 'Textbook Ch.2', assessment: 'Homework' },
      { week: 3, topic: 'Systems of Equations', subtopics: ['Substitution', 'Elimination', 'Graphical Method'], objectives: 'Students will solve systems of equations', resources: 'Textbook Ch.3', assessment: 'CAT' }
    ]},
    { id: 'SCH002', subject: 'English Literature', grade: '10', teacherId: 'T002', term: 'Term 1', year: '2024', topics: [
      { week: 1, topic: 'Introduction to Poetry', subtopics: ['Meter', 'Rhyme Scheme', 'Imagery'], objectives: 'Students will analyze poetic devices', resources: 'Poetry Anthology', assessment: 'Essay' },
      { week: 2, topic: "Shakespeare's Macbeth", subtopics: ['Plot Summary', 'Themes', 'Characters'], objectives: 'Students will interpret Shakespearean drama', resources: 'Macbeth Text', assessment: 'Discussion' }
    ]}
  ],
  events: [
    { id: 'EV001', title: 'Annual Science Fair', date: '2024-04-15', time: '09:00', venue: 'School Hall', type: 'Academic', description: 'Annual science exhibition', status: 'Upcoming' },
    { id: 'EV002', title: 'Basketball Championship', date: '2024-04-20', time: '14:00', venue: 'Main Gym', type: 'Sports', description: 'Inter-school basketball finals', status: 'Upcoming' },
    { id: 'EV003', title: 'Parent-Teacher Meeting', date: '2024-04-10', time: '18:00', venue: 'Classrooms', type: 'Meeting', description: 'Term 1 progress reports', status: 'Upcoming' },
    { id: 'EV004', title: 'Graduation Ceremony', date: '2024-06-30', time: '10:00', venue: 'Auditorium', type: 'Ceremony', description: 'Grade 12 graduation', status: 'Upcoming' }
  ],
  announcements: [
    { id: 'ANN001', title: 'Term 2 Registration Open', content: 'Registration for Term 2 electives is now open. Please see your guidance counselor.', date: '2024-03-15', author: 'Admin', priority: 'High', audience: 'All' },
    { id: 'ANN002', title: 'School Closed - Public Holiday', content: 'School will be closed on Monday, April 8th for the national holiday.', date: '2024-03-18', author: 'Admin', priority: 'Medium', audience: 'All' },
    { id: 'ANN003', title: 'Math Olympiad Registration', content: 'Students interested in the Math Olympiad should register by March 25th.', date: '2024-03-17', author: 'John Smith', priority: 'Low', audience: 'Students' }
  ]
};

module.exports = { db, uuidv4 };
