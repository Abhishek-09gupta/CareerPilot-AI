const User = require('../models/User');
const Progress = require('../models/Progress');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const CodingQuestion = require('../models/CodingQuestion');

// @desc    Get all users (students)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add Aptitude Question
// @route   POST /api/admin/aptitude
// @access  Private/Admin
exports.addAptitudeQuestion = async (req, res) => {
  const { question, options, correctAnswer, category, difficulty, marks } = req.body;

  try {
    const aptQuestion = await AptitudeQuestion.create({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      marks,
    });

    res.status(201).json({
      success: true,
      message: 'Aptitude question added successfully',
      data: aptQuestion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add Coding Question
// @route   POST /api/admin/coding
// @access  Private/Admin
exports.addCodingQuestion = async (req, res) => {
  const { title, description, difficulty, tags, sampleInput, sampleOutput, constraints, solution } = req.body;

  try {
    const codingQuestion = await CodingQuestion.create({
      title,
      description,
      difficulty,
      tags,
      sampleInput,
      sampleOutput,
      constraints,
      solution,
    });

    res.status(201).json({
      success: true,
      message: 'Coding question added successfully',
      data: codingQuestion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete Question
// @route   DELETE /api/admin/questions/:type/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  const { type, id } = req.params;

  try {
    if (type === 'aptitude') {
      const q = await AptitudeQuestion.findByIdAndDelete(id);
      if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    } else if (type === 'coding') {
      const q = await CodingQuestion.findByIdAndDelete(id);
      if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid question type specified' });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Global Dashboard Analytics for Admin
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getGlobalAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalAptitudeQs = await AptitudeQuestion.countDocuments();
    const totalCodingQs = await CodingQuestion.countDocuments();

    const progressLogs = await Progress.find({});

    const totalSubmissions = progressLogs.length;
    const testTypeBreakdown = {
      aptitude: progressLogs.filter(p => p.testType === 'aptitude').length,
      coding: progressLogs.filter(p => p.testType === 'coding').length,
      interview: progressLogs.filter(p => p.testType === 'interview').length,
      resume: progressLogs.filter(p => p.testType === 'resume').length,
    };

    // Calculate averages
    const aptitudeAccuracy = progressLogs.filter(p => p.testType === 'aptitude');
    const avgAptitudeAccuracy = aptitudeAccuracy.length > 0
      ? Math.round(aptitudeAccuracy.reduce((acc, curr) => acc + curr.accuracy, 0) / aptitudeAccuracy.length)
      : 0;

    const interviewScores = progressLogs.filter(p => p.testType === 'interview');
    const avgInterviewScore = interviewScores.length > 0
      ? Math.round(interviewScores.reduce((acc, curr) => acc + curr.score, 0) / interviewScores.length)
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAptitudeQuestions: totalAptitudeQs,
        totalCodingQuestions: totalCodingQs,
        totalSubmissions,
        testTypeBreakdown,
        avgAptitudeAccuracy,
        avgInterviewScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
