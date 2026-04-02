const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription:{ type: String },
  questions:     { type: Array, required: true },
  answers:       { type: Array, default: [] },
  status:        { type: String, enum: ['in-progress','completed'], default: 'in-progress' },
  finalScore:    { type: Number },
  createdAt:     { type: Date, default: Date.now }
});
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;