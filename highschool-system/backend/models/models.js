const mongoose = require('mongoose');

// ─── CLASS ───────────────────────────────────────────────────────────────────
const ClassSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  grade:         { type: String, enum: ['Form 1','Form 2','Form 3','Form 4','Form 5','Form 6'], required: true },
  section:       { type: String, default: 'A' },
  classTeacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  students:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  subjects:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  capacity:      { type: Number, default: 40 },
  room:          { type: String },
  academicYear:  { type: String },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

// ─── SUBJECT ─────────────────────────────────────────────────────────────────
const SubjectSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  code:         { type: String, required: true, unique: true },
  description:  { type: String },
  grade:        [{ type: String }],
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  creditHours:  { type: Number, default: 1 },
  type:         { type: String, enum: ['Core', 'Elective', 'Co-curricular'], default: 'Core' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

// ─── GRADE / RESULT ──────────────────────────────────────────────────────────
const GradeSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  term:        { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  academicYear: { type: String, required: true },
  assessments: {
    classwork:   { type: Number, default: 0, min: 0, max: 100 },
    homework:    { type: Number, default: 0, min: 0, max: 100 },
    midterm:     { type: Number, default: 0, min: 0, max: 100 },
    finalExam:   { type: Number, default: 0, min: 0, max: 100 },
    project:     { type: Number, default: 0, min: 0, max: 100 },
  },
  totalScore:  { type: Number, default: 0 },
  grade:       { type: String },
  gradePoints: { type: Number, default: 0 },
  remarks:     { type: String },
}, { timestamps: true });

GradeSchema.pre('save', function(next) {
  const a = this.assessments;
  this.totalScore = ((a.classwork * 0.10) + (a.homework * 0.10) + (a.midterm * 0.20) + (a.finalExam * 0.50) + (a.project * 0.10));
  const s = this.totalScore;
  if (s >= 90)       { this.grade = 'A+'; this.gradePoints = 4.0; }
  else if (s >= 80)  { this.grade = 'A';  this.gradePoints = 4.0; }
  else if (s >= 75)  { this.grade = 'B+'; this.gradePoints = 3.5; }
  else if (s >= 70)  { this.grade = 'B';  this.gradePoints = 3.0; }
  else if (s >= 65)  { this.grade = 'C+'; this.gradePoints = 2.5; }
  else if (s >= 60)  { this.grade = 'C';  this.gradePoints = 2.0; }
  else if (s >= 55)  { this.grade = 'D';  this.gradePoints = 1.5; }
  else if (s >= 50)  { this.grade = 'E';  this.gradePoints = 1.0; }
  else               { this.grade = 'F';  this.gradePoints = 0.0; }
  next();
});

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────
const AttendanceSchema = new mongoose.Schema({
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  date:        { type: Date, required: true },
  records:     [{
    student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status:    { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], default: 'Present' },
    remark:    { type: String },
  }],
  academicYear: { type: String },
  term:        { type: String },
}, { timestamps: true });

// ─── SPORT ───────────────────────────────────────────────────────────────────
const SportSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['Team', 'Individual'], default: 'Team' },
  coach:       { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  season:      { type: String },
  schedule:    [{ day: String, time: String, venue: String }],
  achievements: [{ title: String, date: Date, description: String }],
  budget:      { type: Number, default: 0 },
  equipment:   [{ name: String, quantity: Number, condition: String }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ─── SCHEME OF WORK ──────────────────────────────────────────────────────────
const SchemeSchema = new mongoose.Schema({
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  grade:       { type: String, required: true },
  term:        { type: String, required: true },
  academicYear: { type: String, required: true },
  title:       { type: String, required: true },
  weeks:       [{
    weekNumber: Number,
    topic:      String,
    subtopics:  [String],
    objectives: [String],
    activities: [String],
    resources:  [String],
    assessment: String,
    duration:   String,
    status:     { type: String, enum: ['Planned', 'In Progress', 'Completed'], default: 'Planned' },
  }],
  status:      { type: String, enum: ['Draft', 'Approved', 'Active'], default: 'Draft' },
}, { timestamps: true });

// ─── TIMETABLE ───────────────────────────────────────────────────────────────
const TimetableSchema = new mongoose.Schema({
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYear: { type: String, required: true },
  term:        { type: String, required: true },
  schedule:    [{
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
    periods:   [{
      periodNumber: Number,
      startTime: String,
      endTime:   String,
      subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      room:      String,
      type:      { type: String, enum: ['Lesson','Break','Assembly','Sport','Free'], default: 'Lesson' },
    }]
  }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ─── FEE ─────────────────────────────────────────────────────────────────────
const FeeSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  academicYear: { type: String, required: true },
  term:        { type: String, required: true },
  feeStructure: [{
    name:      String,
    amount:    Number,
    dueDate:   Date,
  }],
  totalAmount: { type: Number, default: 0 },
  amountPaid:  { type: Number, default: 0 },
  balance:     { type: Number, default: 0 },
  payments:    [{
    amount:    Number,
    date:      Date,
    method:    { type: String, enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque'] },
    reference: String,
    receivedBy: String,
  }],
  status:      { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'Overdue'], default: 'Unpaid' },
}, { timestamps: true });

// ─── EVENT ───────────────────────────────────────────────────────────────────
const EventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  type:        { type: String, enum: ['Academic', 'Sports', 'Cultural', 'Meeting', 'Holiday', 'Exam', 'Other'], default: 'Other' },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date },
  location:    { type: String },
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  participants: { type: String, enum: ['All', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6', 'Staff'], default: 'All' },
  isPublic:    { type: Boolean, default: true },
  color:       { type: String, default: '#4F46E5' },
}, { timestamps: true });

module.exports = {
  Class:      mongoose.model('Class', ClassSchema),
  Subject:    mongoose.model('Subject', SubjectSchema),
  Grade:      mongoose.model('Grade', GradeSchema),
  Attendance: mongoose.model('Attendance', AttendanceSchema),
  Sport:      mongoose.model('Sport', SportSchema),
  Scheme:     mongoose.model('Scheme', SchemeSchema),
  Timetable:  mongoose.model('Timetable', TimetableSchema),
  Fee:        mongoose.model('Fee', FeeSchema),
  Event:      mongoose.model('Event', EventSchema),
};
