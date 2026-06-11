import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'educore_data';

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
  students: [
    { id: 'S001', firstName: 'Amara', lastName: 'Osei', dob: '2008-03-15', gender: 'Female', grade: '10', stream: 'A', enrollmentDate: '2022-09-01', status: 'Active', parentName: 'Kwame Osei', parentPhone: '+1 555-1001', address: '45 Maple St', photo: null, nationalId: 'NID2008001' },
    { id: 'S002', firstName: 'Tariq', lastName: 'Hassan', dob: '2007-07-22', gender: 'Male', grade: '11', stream: 'B', enrollmentDate: '2021-09-01', status: 'Active', parentName: 'Fatima Hassan', parentPhone: '+1 555-1002', address: '78 Oak Ave', photo: null, nationalId: 'NID2007002' },
    { id: 'S003', firstName: 'Sofia', lastName: 'Reyes', dob: '2009-01-10', gender: 'Female', grade: '9', stream: 'A', enrollmentDate: '2023-09-01', status: 'Active', parentName: 'Carlos Reyes', parentPhone: '+1 555-1003', address: '12 Pine Rd', photo: null, nationalId: 'NID2009003' },
    { id: 'S004', firstName: 'James', lastName: 'Mutamba', dob: '2007-11-30', gender: 'Male', grade: '11', stream: 'A', enrollmentDate: '2021-09-01', status: 'Active', parentName: 'Grace Mutamba', parentPhone: '+1 555-1004', address: '33 Elm Blvd', photo: null, nationalId: 'NID2007004' },
    { id: 'S005', firstName: 'Priya', lastName: 'Sharma', dob: '2008-05-18', gender: 'Female', grade: '10', stream: 'B', enrollmentDate: '2022-09-01', status: 'Active', parentName: 'Raj Sharma', parentPhone: '+1 555-1005', address: '90 Cedar Ln', photo: null, nationalId: 'NID2008005' },
    { id: 'S006', firstName: 'Luca', lastName: 'Ferreira', dob: '2009-09-02', gender: 'Male', grade: '9', stream: 'B', enrollmentDate: '2023-09-01', status: 'Active', parentName: 'Maria Ferreira', parentPhone: '+1 555-1006', address: '56 Birch Way', photo: null, nationalId: 'NID2009006' },
    { id: 'S007', firstName: 'Zoe', lastName: 'Nakamura', dob: '2006-12-25', gender: 'Female', grade: '12', stream: 'A', enrollmentDate: '2020-09-01', status: 'Active', parentName: 'Hiro Nakamura', parentPhone: '+1 555-1007', address: '21 Willow Dr', photo: null, nationalId: 'NID2006007' },
    { id: 'S008', firstName: 'Kofi', lastName: 'Adu', dob: '2006-04-14', gender: 'Male', grade: '12', stream: 'B', enrollmentDate: '2020-09-01', status: 'Active', parentName: 'Abena Adu', parentPhone: '+1 555-1008', address: '67 Aspen Ct', photo: null, nationalId: 'NID2006008' },
  ],
  teachers: [
    { id: 'T001', firstName: 'David', lastName: 'Chirwa', dob: '1982-04-12', gender: 'Male', qualification: 'BSc Mathematics, PGCE', subjects: ['Mathematics', 'Further Mathematics'], hireDate: '2015-01-10', status: 'Active', phone: '+1 555-2001', email: 'david.chirwa@westlakehigh.edu', nationalId: 'TNID1982001' },
    { id: 'T002', firstName: 'Ama', lastName: 'Serwaa', dob: '1988-09-22', gender: 'Female', qualification: 'BA English Literature, PGCE', subjects: ['English Language', 'English Literature'], hireDate: '2017-08-15', status: 'Active', phone: '+1 555-2002', email: 'ama.serwaa@westlakehigh.edu', nationalId: 'TNID1988002' },
    { id: 'T003', firstName: 'Peter', lastName: 'Nkosi', dob: '1979-02-28', gender: 'Male', qualification: 'BSc Physics, MSc Applied Physics', subjects: ['Physics', 'Science'], hireDate: '2010-03-01', status: 'Active', phone: '+1 555-2003', email: 'peter.nkosi@westlakehigh.edu', nationalId: 'TNID1979003' },
    { id: 'T004', firstName: 'Grace', lastName: 'Mokoena', dob: '1990-07-05', gender: 'Female', qualification: 'BSc Chemistry, PGCE', subjects: ['Chemistry', 'Biology'], hireDate: '2019-01-07', status: 'Active', phone: '+1 555-2004', email: 'grace.mokoena@westlakehigh.edu', nationalId: 'TNID1990004' },
    { id: 'T005', firstName: 'Samuel', lastName: 'Boateng', dob: '1985-11-17', gender: 'Male', qualification: 'BA History, MA History', subjects: ['History', 'Geography'], hireDate: '2013-09-02', status: 'Active', phone: '+1 555-2005', email: 'samuel.boateng@westlakehigh.edu', nationalId: 'TNID1985005' },
    { id: 'T006', firstName: 'Lindiwe', lastName: 'Dlamini', dob: '1992-03-30', gender: 'Female', qualification: 'BSc Computer Science, PGCE', subjects: ['Computer Science', 'ICT'], hireDate: '2020-09-01', status: 'Active', phone: '+1 555-2006', email: 'lindiwe.dlamini@westlakehigh.edu', nationalId: 'TNID1992006' },
  ],
  classes: [
    { id: 'C001', name: 'Grade 9A', grade: '9', stream: 'A', classTeacherId: 'T002', capacity: 35, room: 'Room 101', subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'History', 'Computer Science'] },
    { id: 'C002', name: 'Grade 9B', grade: '9', stream: 'B', classTeacherId: 'T003', capacity: 35, room: 'Room 102', subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'History', 'Computer Science'] },
    { id: 'C003', name: 'Grade 10A', grade: '10', stream: 'A', classTeacherId: 'T001', capacity: 35, room: 'Room 201', subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'History', 'Computer Science'] },
    { id: 'C004', name: 'Grade 10B', grade: '10', stream: 'B', classTeacherId: 'T004', capacity: 35, room: 'Room 202', subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Computer Science'] },
    { id: 'C005', name: 'Grade 11A', grade: '11', stream: 'A', classTeacherId: 'T005', capacity: 32, room: 'Room 301', subjects: ['Mathematics', 'English Literature', 'Physics', 'Chemistry', 'History', 'Computer Science'] },
    { id: 'C006', name: 'Grade 11B', grade: '11', stream: 'B', classTeacherId: 'T006', capacity: 32, room: 'Room 302', subjects: ['Mathematics', 'English Literature', 'Physics', 'Chemistry', 'Biology', 'Computer Science'] },
    { id: 'C007', name: 'Grade 12A', grade: '12', stream: 'A', classTeacherId: 'T001', capacity: 30, room: 'Room 401', subjects: ['Mathematics', 'English Literature', 'Further Mathematics', 'Physics', 'Computer Science'] },
    { id: 'C008', name: 'Grade 12B', grade: '12', stream: 'B', classTeacherId: 'T002', capacity: 30, room: 'Room 402', subjects: ['Mathematics', 'English Literature', 'Biology', 'Chemistry', 'History'] },
  ],
  grades: [
    { id: uuidv4(), studentId: 'S001', subject: 'Mathematics', term: 'Term 1', year: '2024/2025', score: 88, grade: 'B+', teacherId: 'T001', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'English Language', term: 'Term 1', year: '2024/2025', score: 92, grade: 'A', teacherId: 'T002', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'Physics', term: 'Term 1', year: '2024/2025', score: 75, grade: 'B', teacherId: 'T003', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S001', subject: 'Chemistry', term: 'Term 1', year: '2024/2025', score: 80, grade: 'B+', teacherId: 'T004', classId: 'C003', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S002', subject: 'Mathematics', term: 'Term 1', year: '2024/2025', score: 95, grade: 'A+', teacherId: 'T001', classId: 'C005', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S002', subject: 'Physics', term: 'Term 1', year: '2024/2025', score: 91, grade: 'A', teacherId: 'T003', classId: 'C005', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'Mathematics', term: 'Term 1', year: '2024/2025', score: 78, grade: 'B', teacherId: 'T001', classId: 'C007', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'Further Mathematics', term: 'Term 1', year: '2024/2025', score: 70, grade: 'B-', teacherId: 'T001', classId: 'C007', examType: 'End of Term' },
    { id: uuidv4(), studentId: 'S007', subject: 'English Literature', term: 'Term 1', year: '2024/2025', score: 88, grade: 'B+', teacherId: 'T002', classId: 'C007', examType: 'End of Term' },
  ],
  attendance: [
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-03', status: 'Present', subject: 'Mathematics' },
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-04', status: 'Present', subject: 'English Language' },
    { id: uuidv4(), studentId: 'S001', classId: 'C003', date: '2025-02-05', status: 'Absent', subject: 'Physics' },
    { id: uuidv4(), studentId: 'S002', classId: 'C005', date: '2025-02-03', status: 'Present', subject: 'Mathematics' },
    { id: uuidv4(), studentId: 'S002', classId: 'C005', date: '2025-02-04', status: 'Late', subject: 'Physics' },
  ],
  sports: [
    { id: 'SP001', name: 'Football', type: 'Team', season: '2024/2025', coach: 'Mr. James Banda', members: ['S002', 'S004', 'S006', 'S008'], schedule: 'Tuesdays & Thursdays 15:30', venue: 'Main Field', status: 'Active' },
    { id: 'SP002', name: 'Basketball', type: 'Team', season: '2024/2025', coach: 'Ms. Thandiwe Moyo', members: ['S001', 'S003', 'S007'], schedule: 'Mondays & Wednesdays 15:30', venue: 'Indoor Gymnasium', status: 'Active' },
    { id: 'SP003', name: 'Athletics', type: 'Individual', season: '2024/2025', coach: 'Mr. Peter Nkosi', members: ['S005', 'S001', 'S007', 'S008'], schedule: 'Fridays 14:00', venue: 'Track Field', status: 'Active' },
    { id: 'SP004', name: 'Swimming', type: 'Individual', season: '2024/2025', coach: 'Ms. Ruth Phiri', members: ['S003', 'S005'], schedule: 'Wednesdays 14:00', venue: 'Aquatics Centre', status: 'Active' },
    { id: 'SP005', name: 'Volleyball', type: 'Team', season: '2024/2025', coach: 'Mr. David Chirwa', members: ['S001', 'S005', 'S007'], schedule: 'Fridays 15:30', venue: 'Hall B', status: 'Active' },
  ],
  schemes: [
    {
      id: 'SCH001', subject: 'Mathematics', grade: '10', term: 'Term 2', year: '2024/2025', teacherId: 'T001',
      weeks: [
        { week: 1, topic: 'Quadratic Equations', subtopics: ['Factorisation', 'Quadratic Formula', 'Completing the Square'], objectives: 'Students will solve quadratic equations using multiple methods', resources: 'Textbook Pg 45-67, Graphing Calculator', assessment: 'Class exercise + quiz' },
        { week: 2, topic: 'Functions and Graphs', subtopics: ['Domain & Range', 'Linear Functions', 'Quadratic Graphs'], objectives: 'Students will draw and interpret various function graphs', resources: 'Textbook Pg 70-89, Graph paper', assessment: 'Practical assignment' },
        { week: 3, topic: 'Trigonometry', subtopics: ['Sine, Cosine, Tangent', 'Unit Circle', 'Trig Identities'], objectives: 'Students will apply trigonometric ratios to solve problems', resources: 'Textbook Pg 100-125', assessment: 'End of week test' },
      ]
    },
    {
      id: 'SCH002', subject: 'English Language', grade: '9', term: 'Term 2', year: '2024/2025', teacherId: 'T002',
      weeks: [
        { week: 1, topic: 'Narrative Writing', subtopics: ['Story Structure', 'Character Development', 'Setting'], objectives: 'Students will write compelling narratives with clear structure', resources: 'Writing Handbook, Sample texts', assessment: 'Short story submission' },
        { week: 2, topic: 'Comprehension Skills', subtopics: ['Main Idea', 'Inference', 'Vocabulary in Context'], objectives: 'Students will extract meaning from complex texts', resources: 'Anthology Book 2', assessment: 'Comprehension exercise' },
      ]
    },
  ],
  events: [
    { id: 'EV001', title: 'Inter-House Sports Day', date: '2025-03-15', type: 'Sports', description: 'Annual inter-house athletics and field events competition', organizer: 'Sports Department' },
    { id: 'EV002', title: 'Science Fair', date: '2025-04-10', type: 'Academic', description: 'Annual science fair showcasing student projects', organizer: 'Science Department' },
    { id: 'EV003', title: 'Prize Giving Ceremony', date: '2025-06-20', type: 'Ceremony', description: 'End of year prize giving and graduation ceremony', organizer: 'Administration' },
    { id: 'EV004', title: 'Mid-Term Break', date: '2025-03-28', type: 'Holiday', description: 'Mid-term holiday break', organizer: 'Administration' },
  ],
  enrollmentRequests: [],
  timetables: {
    'C003': {
      Monday: [
        { period: 1, time: '07:30-08:30', subject: 'Mathematics', teacherId: 'T001', room: 'Room 201' },
        { period: 2, time: '08:30-09:30', subject: 'English Language', teacherId: 'T002', room: 'Room 201' },
        { period: 3, time: '09:30-10:30', subject: 'Physics', teacherId: 'T003', room: 'Lab 1' },
        { period: 4, time: '11:00-12:00', subject: 'Chemistry', teacherId: 'T004', room: 'Lab 2' },
        { period: 5, time: '12:00-13:00', subject: 'History', teacherId: 'T005', room: 'Room 201' },
        { period: 6, time: '14:00-15:00', subject: 'Computer Science', teacherId: 'T006', room: 'Computer Lab' },
      ],
      Tuesday: [
        { period: 1, time: '07:30-08:30', subject: 'Physics', teacherId: 'T003', room: 'Lab 1' },
        { period: 2, time: '08:30-09:30', subject: 'Mathematics', teacherId: 'T001', room: 'Room 201' },
        { period: 3, time: '09:30-10:30', subject: 'Chemistry', teacherId: 'T004', room: 'Lab 2' },
        { period: 4, time: '11:00-12:00', subject: 'English Language', teacherId: 'T002', room: 'Room 201' },
        { period: 5, time: '12:00-13:00', subject: 'Computer Science', teacherId: 'T006', room: 'Computer Lab' },
        { period: 6, time: '14:00-15:00', subject: 'History', teacherId: 'T005', room: 'Room 201' },
      ],
    }
  }
};

export function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    }
    return JSON.parse(raw);
  } catch {
    return seedData;
  }
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
}

export function generateId(prefix = 'ID') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

export const GRADE_SCALE = [
  { min: 90, max: 100, grade: 'A+', points: 4.0, description: 'Outstanding' },
  { min: 85, max: 89, grade: 'A', points: 4.0, description: 'Excellent' },
  { min: 80, max: 84, grade: 'A-', points: 3.7, description: 'Very Good' },
  { min: 75, max: 79, grade: 'B+', points: 3.3, description: 'Good' },
  { min: 70, max: 74, grade: 'B', points: 3.0, description: 'Above Average' },
  { min: 65, max: 69, grade: 'B-', points: 2.7, description: 'Average' },
  { min: 60, max: 64, grade: 'C+', points: 2.3, description: 'Below Average' },
  { min: 55, max: 59, grade: 'C', points: 2.0, description: 'Satisfactory' },
  { min: 50, max: 54, grade: 'C-', points: 1.7, description: 'Pass' },
  { min: 40, max: 49, grade: 'D', points: 1.0, description: 'Poor' },
  { min: 0, max: 39, grade: 'F', points: 0.0, description: 'Fail' },
];

export function scoreToGrade(score) {
  const entry = GRADE_SCALE.find(g => score >= g.min && score <= g.max);
  return entry || GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function calculateGPA(grades) {
  if (!grades || grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => {
    const entry = GRADE_SCALE.find(gs => gs.grade === g.grade);
    return sum + (entry ? entry.points : 0);
  }, 0);
  return (total / grades.length).toFixed(2);
}
