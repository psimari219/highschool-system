const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  teacherId:       { type: String, unique: true, required: true },
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName:       { type: String, required: true },
  lastName:        { type: String, required: true },
  dateOfBirth:     { type: Date },
  gender:          { type: String, enum: ['Male', 'Female', 'Other'] },
  email:           { type: String, required: true },
  phone:           { type: String },
  photo:           { type: String, default: '' },
  address:         { street: String, city: String, state: String },
  qualification:   { type: String },
  specialization:  [{ type: String }],
  subjects:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  classes:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  hireDate:        { type: Date, default: Date.now },
  status:          { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Retired'], default: 'Active' },
  salary:          { type: Number },
  isClassTeacher:  { type: Boolean, default: false },
  classTeacherOf:  { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  bio:             { type: String },
  achievements:    [{ type: String }],
}, { timestamps: true });

TeacherSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
TeacherSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
