const mongoose = require('mongoose');

const AptitudeQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question text'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Please add at least 2 options'],
    validate: [
      (val) => val.length >= 2,
      'A question must have at least 2 options',
    ],
  },
  correctAnswer: {
    type: String, // String representation or index (e.g. "0", "1", or text match)
    required: [true, 'Please specify the correct answer'],
  },
  category: {
    type: String,
    required: [true, 'Please specify the category'],
    enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify the difficulty'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  marks: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AptitudeQuestion', AptitudeQuestionSchema);
