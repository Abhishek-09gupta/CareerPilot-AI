const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    default: 'General',
  },
  type: {
    type: String,
    required: [true, 'Please specify the type (HR or Technical)'],
    enum: ['HR', 'Technical'],
  },
  question: {
    type: String,
    required: [true, 'Please add the question text'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
