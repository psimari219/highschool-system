require('dotenv').config();
const pool = require('./config/postgres');

const schema = `
-- Users table (all logins)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'teacher', 'student', 'accountant')),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  linked_id VARCHAR(50),
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School configuration
CREATE TABLE IF NOT EXISTS school (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  motto VARCHAR(255),
  address VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(200),
  principal VARCHAR(200),
  current_year VARCHAR(20),
  current_term VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  class_id VARCHAR(50),
  enrollment_status VARCHAR(20) DEFAULT 'active',
  admission_date DATE,
  national_id VARCHAR(50),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  qualification VARCHAR(255),
  hire_date DATE,
  national_id VARCHAR(50),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff (non-teaching)
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  hire_date DATE,
  national_id VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(200),
  salary DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  department VARCHAR(100),
  credit_hours INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  stream VARCHAR(50),
  year INT,
  capacity INT,
  teacher_id VARCHAR(50) REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50) REFERENCES classes(id),
  subject_id VARCHAR(50) REFERENCES subjects(id),
  teacher_id VARCHAR(50) REFERENCES teachers(id),
  day VARCHAR(20),
  period INT,
  start_time VARCHAR(10),
  end_time VARCHAR(10),
  room VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollment
CREATE TABLE IF NOT EXISTS enrollment (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  class_id VARCHAR(50) REFERENCES classes(id),
  subject_id VARCHAR(50) REFERENCES subjects(id),
  year INT,
  term VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) REFERENCES subjects(id),
  class_id VARCHAR(50) REFERENCES classes(id),
  score DECIMAL(5, 2),
  gpa_points NUMERIC(3,2),
  grade VARCHAR(5),
  term VARCHAR(20),
  year INT,
  teacher_id VARCHAR(50) REFERENCES teachers(id),
  recorded_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  class_id VARCHAR(50) REFERENCES classes(id),
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  teacher_id VARCHAR(50) REFERENCES teachers(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Structure
CREATE TABLE IF NOT EXISTS fee_structure (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  term VARCHAR(20),
  year VARCHAR(20),
  grade VARCHAR(50) DEFAULT 'all',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Payments
CREATE TABLE IF NOT EXISTS fee_payments (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  fee_id VARCHAR(50) REFERENCES fee_structure(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  method VARCHAR(50),
  reference VARCHAR(100),
  received_by VARCHAR(50) REFERENCES users(id),
  term VARCHAR(20),
  year VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports
CREATE TABLE IF NOT EXISTS sports (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coach_id VARCHAR(50) REFERENCES teachers(id),
  season VARCHAR(50),
  year INT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sport Team Members
CREATE TABLE IF NOT EXISTS sport_members (
  id VARCHAR(50) PRIMARY KEY,
  sport_id VARCHAR(50) REFERENCES sports(id) ON DELETE CASCADE,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  position VARCHAR(100),
  jersey_number INT,
  joined_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schemes (uniform/fee schemes)
CREATE TABLE IF NOT EXISTS schemes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2),
  term VARCHAR(20),
  year VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Upcoming',
  date DATE,
  time VARCHAR(50),
  venue VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'Normal',
  author VARCHAR(200),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(50) PRIMARY KEY,
  sender_id VARCHAR(50) REFERENCES users(id),
  recipient_id VARCHAR(50) REFERENCES users(id),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teaching Notes (AI-generated from syllabus)
CREATE TABLE IF NOT EXISTS teaching_notes (
  id VARCHAR(50) PRIMARY KEY,
  teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) REFERENCES subjects(id),
  class_id VARCHAR(50) REFERENCES classes(id),
  title VARCHAR(255) NOT NULL,
  syllabus_file_name VARCHAR(255),
  pacing VARCHAR(255),
  notes_content TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marking Schemes (AI-generated from test/exercise)
CREATE TABLE IF NOT EXISTS marking_schemes (
  id VARCHAR(50) PRIMARY KEY,
  teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) REFERENCES subjects(id),
  class_id VARCHAR(50) REFERENCES classes(id),
  test_title VARCHAR(255) NOT NULL,
  test_file_name VARCHAR(255),
  scheme_content TEXT,
  max_score INT,
  status VARCHAR(20) DEFAULT 'pending',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-marked Student Work
CREATE TABLE IF NOT EXISTS marked_work (
  id VARCHAR(50) PRIMARY KEY,
  teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE CASCADE,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) REFERENCES subjects(id),
  class_id VARCHAR(50) REFERENCES classes(id),
  marking_scheme_id VARCHAR(50) REFERENCES marking_schemes(id),
  work_file_name VARCHAR(255),
  work_type VARCHAR(50),
  extracted_text TEXT,
  score INT,
  total_marks INT,
  ai_feedback TEXT,
  teacher_feedback TEXT,
  status VARCHAR(20) DEFAULT 'pending_review',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
-- Ensure GPA points column exists for older databases
ALTER TABLE grades ADD COLUMN IF NOT EXISTS gpa_points NUMERIC(3,2);
`;

async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database...');
    
    // Split the schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✓ Database schema initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    // Only exit when the script is run directly; don't terminate the hosting process when required as a module
    if (require.main === module) {
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().then(() => process.exit(0));
}

module.exports = initializeDatabase;
