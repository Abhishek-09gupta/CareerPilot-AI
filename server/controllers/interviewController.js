const Progress = require('../models/Progress');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// @desc    Generate mock interview questions
// @route   POST /api/interview/generate
// @access  Private
exports.generateQuestions = async (req, res) => {
  const { company, type } = req.body;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Please specify interview type (HR or Technical)',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const candidateSkills = user ? user.skills.join(', ') : '';

    const questions = await geminiService.generateInterviewQuestions(
      company || 'General Partner Company',
      type,
      candidateSkills
    );

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit mock interview responses for AI evaluation
// @route   POST /api/interview/submit
// @access  Private
exports.submitInterview = async (req, res) => {
  const { company, type, responses } = req.body; // responses is [{ questionId, question, answer }]

  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide interview questions and answers in an array',
    });
  }

  try {
    // Send answers to Gemini for evaluation
    const evaluation = await geminiService.evaluateInterviewResponse(responses);

    // Save progress
    const progress = await Progress.create({
      userId: req.user._id,
      testType: 'interview',
      score: evaluation.overallScore || 0,
      accuracy: evaluation.overallScore || 0, // Using overall score as accuracy
      timeTaken: Math.floor(Math.random() * 600) + 120, // Simulated session time
      details: {
        company: company || 'General',
        type: type || 'Technical',
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        suggestedImprovements: evaluation.suggestedImprovements,
        questionEvaluations: evaluation.questionEvaluations,
        qaSummary: responses,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        progressId: progress._id,
        overallScore: evaluation.overallScore,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        suggestedImprovements: evaluation.suggestedImprovements,
        questionEvaluations: evaluation.questionEvaluations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get past interview attempts
// @route   GET /api/interview/history
// @access  Private
exports.getInterviewHistory = async (req, res) => {
  try {
    const history = await Progress.find({
      userId: req.user._id,
      testType: 'interview',
    }).sort({ date: -1 });

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
