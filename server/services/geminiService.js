const { GoogleGenAI, GoogleGen } = require('@google/generative-ai');

// Function to get the Gemini model
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    console.warn('WARNING: GEMINI_API_KEY is not configured or using default placeholder. Fallback mocks will be used.');
    return null;
  }
  
  // Note: the modern SDK uses:
  // const { GoogleGenerativeAI } = require('@google/generative-ai');
  // const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    return null;
  }
};

/**
 * Analyze Resume using Gemini (supports base64 PDF upload or text analysis)
 * @param {Buffer} fileBuffer - File buffer if uploading PDF
 * @param {string} mimeType - e.g. "application/pdf"
 * @param {string} rawText - fallback string content
 */
exports.analyzeResume = async (fileBuffer, mimeType, rawText = '') => {
  const model = getGeminiModel();
  
  const prompt = `
    You are an expert ATS (Applicant Tracking System) Analyzer and Career Coach. 
    Analyze the provided resume and return a structured JSON response. 
    The response MUST be a valid JSON object matching this exact format:
    {
      "atsScore": 85, // out of 100
      "grammarSuggestions": ["Suggestion 1...", "Suggestion 2..."],
      "skillGapDetection": ["Identified skill gaps..."],
      "keywordSuggestions": ["Keywords to add..."],
      "resumeImprovementTips": ["General improvement tips..."],
      "extractedSkills": ["React", "Node.js", "MongoDB", "Python"] // Extracted skills list
    }
    Do not wrap the response in markdown blocks or output anything else. Only output the JSON object.
  `;

  if (!model) {
    // Return high-quality mock data if API key is not present
    return getMockResumeAnalysis(rawText);
  }

  try {
    let result;
    if (fileBuffer) {
      // Send file buffer as inline base64 data to Gemini
      const filePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType || 'application/pdf',
        },
      };
      result = await model.generateContent([filePart, prompt]);
    } else {
      result = await model.generateContent([rawText, prompt]);
    }

    const text = result.response.text();
    // Parse the output (clean any JSON markdown formatting if present)
    const cleanJSONStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJSONStr);
  } catch (error) {
    console.error('Gemini Resume Analysis failed, using mock data:', error);
    return getMockResumeAnalysis(rawText);
  }
};

/**
 * Generate Interview Questions (HR or Technical)
 * @param {string} company - e.g. "TCS", "Google"
 * @param {string} type - "Technical" or "HR"
 * @param {string} candidateSkills - skills list or profile overview
 */
exports.generateInterviewQuestions = async (company, type, candidateSkills = '') => {
  const model = getGeminiModel();
  const prompt = `
    You are an interviewer for ${company}. Generate 5 interview questions of type "${type}" 
    relevant for a candidate with the following skills: "${candidateSkills}".
    The questions should range from Easy to Hard.
    Return the response as a valid JSON array of objects with the exact structure:
    [
      {
        "id": 1,
        "question": "Question text...",
        "difficulty": "Easy",
        "category": "Data Structures" // or "Behavioral"
      },
      ...
    ]
    Do not wrap the response in markdown blocks or output anything else. Only output the JSON array.
  `;

  if (!model) {
    return getMockInterviewQuestions(company, type, candidateSkills);
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJSONStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJSONStr);
  } catch (error) {
    console.error('Gemini question generation failed, using mock questions:', error);
    return getMockInterviewQuestions(company, type, candidateSkills);
  }
};

/**
 * Evaluate Interview Answers
 * @param {Array} qaList - [{ question: "...", answer: "..." }]
 */
exports.evaluateInterviewResponse = async (qaList) => {
  const model = getGeminiModel();
  const prompt = `
    You are an expert technical and HR interviewer. Evaluate the candidate's answers to the following questions.
    Questions and Answers:
    ${JSON.stringify(qaList, null, 2)}

    Evaluate the performance and return a valid JSON object matching this exact format:
    {
      "overallScore": 78, // out of 100
      "communicationScore": 82, // out of 100
      "confidenceScore": 75, // out of 100
      "suggestedImprovements": [
        "Improve explanation of time complexity in Question 2.",
        "Use the STAR method for answering behavioral questions."
      ],
      "questionEvaluations": [
        {
          "questionId": 1,
          "correctnessScore": 90,
          "feedback": "Excellent definition of concepts."
        },
        ...
      ]
    }
    Do not wrap the response in markdown blocks or output anything else. Only output the JSON object.
  `;

  if (!model) {
    return getMockInterviewEvaluation(qaList);
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJSONStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJSONStr);
  } catch (error) {
    console.error('Gemini evaluation failed, using mock evaluation:', error);
    return getMockInterviewEvaluation(qaList);
  }
};

// --- MOCK FALLBACKS ---

function getMockResumeAnalysis(text) {
  return {
    atsScore: 72,
    grammarSuggestions: [
      "Change passive voice to active voice (e.g. use 'Created systems' instead of 'Systems were created').",
      "Correct minor punctuation inconsistencies in your projects section."
    ],
    skillGapDetection: [
      "Lack of cloud deployment experience (AWS/GCP/Azure) mentioned.",
      "Consider adding Docker/Containerization to align with DevOps trends."
    ],
    keywordSuggestions: [
      "RESTful API",
      "NoSQL Database",
      "Agile Methodology",
      "CI/CD Pipeline"
    ],
    resumeImprovementTips: [
      "Quantify your results using numbers (e.g. 'Improved efficiency by 25%').",
      "Ensure your contact details are prominently displayed at the top.",
      "Limit your resume to 1 page if you have less than 3 years of experience."
    ],
    extractedSkills: ["Javascript", "React", "Node.js", "Express.js", "HTML", "CSS", "Git"]
  };
}

function getMockInterviewQuestions(company, type, skills) {
  if (type === 'HR') {
    return [
      { id: 1, question: `Why do you want to join ${company}?`, difficulty: "Easy", category: "Behavioral" },
      { id: 2, question: "Describe a challenge you faced in a team project and how you resolved it.", difficulty: "Medium", category: "Behavioral" },
      { id: 3, question: "Where do you see yourself in 5 years?", difficulty: "Easy", category: "Career Path" },
      { id: 4, question: "How do you handle tight deadlines or stressful project phases?", difficulty: "Medium", category: "Stress Management" },
      { id: 5, question: "Tell me about a time you made a mistake. What did you learn?", difficulty: "Hard", category: "Problem Solving" }
    ];
  } else {
    // Technical mock questions based on skills or generic MERN/OOP
    return [
      { id: 1, question: "Explain the difference between Virtual DOM and Real DOM in React.", difficulty: "Easy", category: "React" },
      { id: 2, question: "What is the difference between SQL and NoSQL databases, and when would you use MongoDB?", difficulty: "Medium", category: "Databases" },
      { id: 3, question: "Describe the JavaScript Event Loop and asynchronous task queues.", difficulty: "Hard", category: "Javascript Engine" },
      { id: 4, question: "What is Middleware in Express, and how does error-handling middleware differ from standard route middleware?", difficulty: "Medium", category: "Node/Express" },
      { id: 5, question: "How do you secure your REST APIs (mention JWT, salting/hashing, etc.)?", difficulty: "Hard", category: "Security" }
    ];
  }
}

function getMockInterviewEvaluation(qaList) {
  const feedbackList = qaList.map((qa, index) => {
    // Simple mock evaluations based on answer length
    const answerLen = qa.answer ? qa.answer.trim().length : 0;
    let score = 50;
    let fb = "Answer was too brief. Expand more on key terminology and theoretical foundations.";
    if (answerLen > 150) {
      score = 90;
      fb = "Excellent, detailed answer explaining both core principles and practical examples.";
    } else if (answerLen > 50) {
      score = 75;
      fb = "Good understanding shown. Try to structure with key bullet points or structural stages.";
    }
    return {
      questionId: index + 1,
      correctnessScore: score,
      feedback: fb
    };
  });

  const sumScores = feedbackList.reduce((acc, q) => acc + q.correctnessScore, 0);
  const avgCorrectness = Math.round(sumScores / qaList.length);

  return {
    overallScore: Math.round(avgCorrectness * 0.9 + 8),
    communicationScore: Math.round(avgCorrectness * 0.85 + 10),
    confidenceScore: Math.round(avgCorrectness * 0.8 + 15),
    suggestedImprovements: [
      "Avoid repeating questions back to the interviewer; start directly with structuring your solution.",
      "In technical answers, provide a quick code structure or algorithmic outline if applicable.",
      "In HR answers, structure response using Situation-Task-Action-Result (STAR) methodology."
    ],
    questionEvaluations: feedbackList
  };
}
