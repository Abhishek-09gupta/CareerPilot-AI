const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  testType: {
    type: String,
    required: [true, 'Please specify the test type'],
    enum: ['aptitude', 'coding', 'interview', 'resume'],
  },
  score: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number, // percentage (e.g. 80)
    default: 0,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // flexible storage for question answers, ATS details, interview responses, etc.
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Progress', ProgressSchema);
