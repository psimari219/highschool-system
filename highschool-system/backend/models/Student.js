const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId:       { type: String, unique: true, required: true },
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName:       { type: String, required: true, trim: true },
  lastName:        { type: String, required: true, trim: true },
  dateOfBirth:     { type: Date, required: true },
  gender:          { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  nationalId:      { type: String },
  photo:           { type: String, default: '' },
  address:         { street: String, city: String, state: String, zipCode: String },
  contactPhone:    { type: String },
  email:           { type: String },
  class:           { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  grade:           { type: String, enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'] },
  enrollmentDate:  { type: Date, default: Date.now },
  status:          { type: String, enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Suspended'], default: 'Active' },
  bloodGroup:      { type: String },
  medicalNotes:    { type: String },
  parent: {
    fatherName:    String,
    motherName:    String,
    guardianName:  String,
    guardianPhone: String,
    guardianEmail: String,
    relationship:  String,
  },
  sports:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
  feeBalance:      { type: Number, default: 0 },
  gpa:             { type: Number, default: 0 },
  academicYear:    { type: String },
  previousSchool:  { type: String },
  documents:       [{ name: String, url: String, uploadedAt: Date }],
}, { timestamps: true });

StudentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

StudentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);
