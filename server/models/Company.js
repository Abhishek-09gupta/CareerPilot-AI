const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a company description'],
  },
  interviewProcess: {
    type: [String], // Array of hiring stages (e.g. ["Aptitude Test", "Technical Interview", "HR Round"])
    default: [],
  },
  resources: {
    type: [{
      title: String,
      link: String,
    }],
    default: [],
  },
  salaryOverview: {
    type: String, // e.g. "INR 3.5 LPA - 7.2 LPA"
    default: '',
  },
  roadmap: {
    type: [String], // Step by step preparation steps
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Company', CompanySchema);
