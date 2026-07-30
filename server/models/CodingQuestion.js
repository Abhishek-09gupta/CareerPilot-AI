const mongoose = require('mongoose');

const CodingQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify the difficulty'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tags: {
    type: [String],
    default: [],
  },
  sampleInput: {
    type: String,
    default: '',
  },
  sampleOutput: {
    type: String,
    default: '',
  },
  constraints: {
    type: String,
    default: '',
  },
  solution: {
    type: String, // Editorial solution
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CodingQuestion', CodingQuestionSchema);
