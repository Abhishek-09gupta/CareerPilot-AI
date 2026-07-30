const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const Progress = require('../models/Progress');
const geminiService = require('../services/geminiService');

// Helper function to stream upload to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary keys are configured properly
    if (
      !process.env.CLOUDINARY_CLOUD_NAME || 
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name'
    ) {
      console.warn('Cloudinary not configured. Mocking upload.');
      return resolve({
        secure_url: `https://res.cloudinary.com/demo/image/upload/v12345/${fileName || 'resume.pdf'}`,
        public_id: 'mock_resume_id',
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'careerpilot_resumes',
        resource_type: 'raw', // Support PDF, Docx
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`, // Strip extension
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Upload Resume file
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a resume file (PDF, DOC, or DOCX)',
    });
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Save Cloudinary URL to user profile
    const user = await User.findById(req.user._id);
    user.resume = uploadResult.secure_url;
    user.resumeName = req.file.originalname;
    await user.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: uploadResult.secure_url,
        resumeName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to upload resume: ${error.message}`,
    });
  }
};

// @desc    Analyze uploaded resume using Gemini AI
// @route   POST /api/resume/analyze
// @access  Private
exports.analyzeResume = async (req, res) => {
  try {
    let analysisResult;
    const user = await User.findById(req.user._id);

    if (req.file) {
      // Analyze the uploaded file directly
      const textFallback = req.file.buffer.toString('utf-8'); // basic raw fallback text
      analysisResult = await geminiService.analyzeResume(
        req.file.buffer,
        req.file.mimetype,
        textFallback
      );
    } else if (req.body.resumeText) {
      // Analyze text input
      analysisResult = await geminiService.analyzeResume(
        null,
        null,
        req.body.resumeText
      );
    } else if (user && user.resume) {
      // Analyze already uploaded resume by fetching it or using mock fallback
      console.log('Analyzing existing user resume URL:', user.resume);
      analysisResult = await geminiService.analyzeResume(
        null,
        null,
        `Resume URL: ${user.resume}. Skills listed on user profile: ${user.skills.join(', ')}`
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded, text provided, or saved resume found to analyze.',
      });
    }

    // Save analysis results to User Skills if extracted
    if (analysisResult.extractedSkills && Array.isArray(analysisResult.extractedSkills) && user) {
      // Merge unique skills
      const updatedSkills = Array.from(new Set([...user.skills, ...analysisResult.extractedSkills]));
      user.skills = updatedSkills;
      await user.save();
    }

    // Log progress / score history
    await Progress.create({
      userId: req.user._id,
      testType: 'resume',
      score: analysisResult.atsScore || 0,
      accuracy: analysisResult.atsScore || 0, // Score acts as accuracy for ATS analysis
      details: {
        atsScore: analysisResult.atsScore,
        grammarSuggestions: analysisResult.grammarSuggestions,
        skillGapDetection: analysisResult.skillGapDetection,
        keywordSuggestions: analysisResult.keywordSuggestions,
        resumeImprovementTips: analysisResult.resumeImprovementTips,
        resumeName: user ? user.resumeName : 'pasted_text',
      },
    });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to analyze resume: ${error.message}`,
    });
  }
};
