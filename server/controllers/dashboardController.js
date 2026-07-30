const User = require('../models/User');
const Progress = require('../models/Progress');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const CodingQuestion = require('../models/CodingQuestion');

// @desc    Get dashboard metrics and recommendations
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user details
    const user = await User.findById(userId);

    // Fetch progress items for the user
    const progressList = await Progress.find({ userId }).sort({ date: -1 });

    // Aggregate statistics
    const aptitudeAttempts = progressList.filter(p => p.testType === 'aptitude');
    const codingAttempts = progressList.filter(p => p.testType === 'coding');
    const interviewAttempts = progressList.filter(p => p.testType === 'interview');
    const resumeAttempts = progressList.filter(p => p.testType === 'resume');

    // Counts
    const testsAttemptedCount = aptitudeAttempts.length;
    const codingSolvedCount = new Set(codingAttempts.map(c => c.details.questionId?.toString())).size;
    const totalCodingQuestions = await CodingQuestion.countDocuments() || 10; // Avoid division by zero
    
    // Average scores
    const avgAptitudeAccuracy = aptitudeAttempts.length > 0 
      ? Math.round(aptitudeAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / aptitudeAttempts.length)
      : 0;

    const avgInterviewScore = interviewAttempts.length > 0
      ? Math.round(interviewAttempts.reduce((acc, curr) => acc + curr.score, 0) / interviewAttempts.length)
      : 0;

    const latestResumeScore = resumeAttempts.length > 0
      ? resumeAttempts[0].score // Resume score acts as latest upload ATS rating
      : 0;

    // Recent activities (limit to 5)
    const recentActivity = progressList.slice(0, 5).map(p => {
      let desc = '';
      if (p.testType === 'aptitude') desc = `Completed ${p.details.category || 'Aptitude Test'} with score ${p.score}`;
      else if (p.testType === 'coding') desc = `Submitted coding solution for "${p.details.questionTitle || 'Coding Challenge'}" - Status: ${p.details.status}`;
      else if (p.testType === 'interview') desc = `Finished AI Mock Interview (${p.details.type}) - Score: ${p.score}/100`;
      else if (p.testType === 'resume') desc = `Analyzed resume - ATS Score: ${p.score}%`;

      return {
        _id: p._id,
        testType: p.testType,
        description: desc,
        date: p.date,
        accuracy: p.accuracy,
      };
    });

    // Dynamic AI Recommendations Engine based on student performance
    const recommendations = [];

    // Rule 1: Resume Score suggestion
    if (latestResumeScore === 0) {
      recommendations.push({
        id: 'rec_resume_1',
        title: 'Analyze your Resume',
        description: 'Upload your latest resume to check your ATS compatibility and identify technical skill gaps.',
        priority: 'High',
        action: '/resume',
      });
    } else if (latestResumeScore < 70) {
      recommendations.push({
        id: 'rec_resume_2',
        title: 'Improve your Resume',
        description: `Your current ATS Score is ${latestResumeScore}%. Incorporate recommended keywords and add project metrics to reach 80%+ rating.`,
        priority: 'Medium',
        action: '/resume',
      });
    }

    // Rule 2: Coding Practice suggestion
    const codingPercentage = Math.round((codingSolvedCount / totalCodingQuestions) * 100);
    if (codingSolvedCount === 0) {
      recommendations.push({
        id: 'rec_coding_1',
        title: 'Start Coding Practice',
        description: 'Solve your first easy coding challenge to strengthen your fundamentals in Array/String structures.',
        priority: 'High',
        action: '/coding',
      });
    } else if (codingPercentage < 50) {
      recommendations.push({
        id: 'rec_coding_2',
        title: 'Level Up Coding Skills',
        description: `You have completed ${codingSolvedCount} coding challenges. Practice medium questions to prepare for tech assessment screenings.`,
        priority: 'Medium',
        action: '/coding',
      });
    }

    // Rule 3: Aptitude performance suggestion
    if (testsAttemptedCount === 0) {
      recommendations.push({
        id: 'rec_apt_1',
        title: 'Attempt an Aptitude Quiz',
        description: 'Campus screenings start with general aptitude. Complete a Quantitative Aptitude quiz to test your speed.',
        priority: 'Medium',
        action: '/aptitude',
      });
    } else if (avgAptitudeAccuracy < 60) {
      recommendations.push({
        id: 'rec_apt_2',
        title: 'Aptitude Accuracy Drill',
        description: `Your average quiz accuracy is currently ${avgAptitudeAccuracy}%. Revise Logical Reasoning and Verbal guides before retaking.`,
        priority: 'High',
        action: '/aptitude',
      });
    }

    // Rule 4: Mock interview suggestion
    if (interviewAttempts.length === 0) {
      recommendations.push({
        id: 'rec_int_1',
        title: 'Simulate an AI Mock Interview',
        description: 'Try an AI-powered technical mock session for Javascript/Python to practice answering standard hiring questions.',
        priority: 'High',
        action: '/interview',
      });
    } else if (avgInterviewScore < 75) {
      recommendations.push({
        id: 'rec_int_2',
        title: 'Refine Interview Delivery',
        description: `Your average interview score is ${avgInterviewScore}/100. Focus on structuring responses using the STAR method.`,
        priority: 'Medium',
        action: '/interview',
      });
    }

    // Fallback recommendation if student excels at everything
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec_excellent',
        title: 'Take Company Roadmaps',
        description: 'Outstanding performance across modules! Explore company-specific guides for TCS Digital/Infosys Specialist to customize prep.',
        priority: 'Low',
        action: '/company',
      });
    }

    res.json({
      success: true,
      data: {
        testsAttempted: testsAttemptedCount,
        codingSolved: codingSolvedCount,
        totalCodingQuestions,
        codingPercentage,
        avgAptitudeAccuracy,
        avgInterviewScore,
        latestResumeScore,
        recentActivity,
        recommendations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
