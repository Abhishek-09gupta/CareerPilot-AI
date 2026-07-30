const AptitudeQuestion = require('../models/AptitudeQuestion');
const Progress = require('../models/Progress');

// @desc    Get aptitude questions by category and/or difficulty
// @route   GET /api/aptitude/questions
// @access  Private
exports.getQuestions = async (req, res) => {
  const { category, difficulty } = req.query;
  const filter = {};
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;

  try {
    const questions = await AptitudeQuestion.find(filter);
    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit answers for evaluation & progress logging
// @route   POST /api/aptitude/submit
// @access  Private
exports.submitTest = async (req, res) => {
  const { answers, timeTaken, category } = req.body; // answers is an array of { questionId, selectedOption }

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of answers',
    });
  }

  try {
    let score = 0;
    let correctCount = 0;
    const totalQuestions = answers.length;
    
    // Detailed summary of correctness for individual questions
    const summary = [];

    for (const ans of answers) {
      const question = await AptitudeQuestion.findById(ans.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer.toString().trim() === ans.selectedOption.toString().trim();
      if (isCorrect) {
        score += question.marks;
        correctCount++;
      }

      summary.push({
        questionId: question._id,
        questionText: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: ans.selectedOption,
        isCorrect,
      });
    }

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Log progress
    const progress = await Progress.create({
      userId: req.user._id,
      testType: 'aptitude',
      score,
      accuracy,
      timeTaken: timeTaken || 0,
      details: {
        totalQuestions,
        correctCount,
        category: category || 'Aptitude Test',
        summary,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        score,
        totalQuestions,
        correctCount,
        accuracy,
        timeTaken,
        progressId: progress._id,
        summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get past aptitude test attempts
// @route   GET /api/aptitude/history
// @access  Private
exports.getTestHistory = async (req, res) => {
  try {
    const attempts = await Progress.find({
      userId: req.user._id,
      testType: 'aptitude',
    }).sort({ date: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
