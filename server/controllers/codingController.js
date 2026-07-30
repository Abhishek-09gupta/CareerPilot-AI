const CodingQuestion = require('../models/CodingQuestion');
const Progress = require('../models/Progress');

// @desc    Get all coding questions
// @route   GET /api/coding/questions
// @access  Private
exports.getCodingQuestions = async (req, res) => {
  const { difficulty, tag } = req.query;
  const filter = {};

  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = { $in: [tag] };

  try {
    const questions = await CodingQuestion.find(filter).select('-solution'); // Hide solution list
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

// @desc    Get coding question by ID (includes solution hints/editorial)
// @route   GET /api/coding/questions/:id
// @access  Private
exports.getCodingQuestionById = async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found',
      });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mock Compile & Submit coding answer
// @route   POST /api/coding/questions/:id/submit
// @access  Private
exports.submitCodingAnswer = async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Please provide code for execution',
    });
  }

  try {
    const question = await CodingQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Modern Mock Compiler Engine Logic
    // We check if code is empty, has basic syntax, or contains common errors
    let status = 'Accepted';
    let errorMessage = '';
    let testCasesPassed = 5;
    let score = 100;

    // Standard static checks to simulate actual testing
    if (code.includes('SyntaxError') || code.includes('undefined') && !code.includes('typeof')) {
      status = 'Runtime Error';
      errorMessage = 'TypeError: Cannot read property of undefined';
      testCasesPassed = 0;
      score = 0;
    } else if (code.trim().length < 25) {
      status = 'Wrong Answer';
      errorMessage = 'Output does not match sample test cases.';
      testCasesPassed = 1;
      score = 20;
    } else if (code.includes('while(true)') || code.includes('for(;;)') || code.includes('while (true)')) {
      status = 'Time Limit Exceeded';
      errorMessage = 'Execution timed out (exceeded 2.0s limit)';
      testCasesPassed = 2;
      score = 40;
    }

    const accuracy = Math.round((testCasesPassed / 5) * 100);

    // Save Coding Progress
    await Progress.create({
      userId: req.user._id,
      testType: 'coding',
      score,
      accuracy,
      timeTaken: Math.floor(Math.random() * 300) + 60, // Mock time taken
      details: {
        questionId: question._id,
        questionTitle: question.title,
        status,
        code,
        language: language || 'javascript',
        errorMessage,
        testCasesPassed,
      },
    });

    res.json({
      success: true,
      data: {
        status,
        testCasesPassed,
        totalTestCases: 5,
        errorMessage,
        score,
        accuracy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
