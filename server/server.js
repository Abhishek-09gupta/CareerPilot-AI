require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Schemas for Seeding
const AptitudeQuestion = require('./models/AptitudeQuestion');
const CodingQuestion = require('./models/CodingQuestion');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
const codingRoutes = require('./routes/codingRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to Database
connectDB().then(() => {
  // Pre-seed Questions after DB connection
  seedAptitudeQuestions();
  seedCodingQuestions();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CareerPilot AI API' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- Database Seed Utilities ---

async function seedAptitudeQuestions() {
  try {
    const count = await AptitudeQuestion.countDocuments();
    if (count > 0) return;

    const questions = [
      {
        question: 'A train 120 m long passes a telegraph post in 6 seconds. Find the speed of the train in km/hr.',
        options: ['60 km/hr', '72 km/hr', '80 km/hr', '90 km/hr'],
        correctAnswer: '1', // Index 1: 72 km/hr (120/6 = 20 m/s = 72 km/hr)
        category: 'Quantitative Aptitude',
        difficulty: 'Easy',
        marks: 1
      },
      {
        question: 'If A is the brother of B; B is the sister of C; and C is the father of D, how is A related to D?',
        options: ['Father', 'Brother', 'Uncle', 'Grandfather'],
        correctAnswer: '2', // Index 2: Uncle
        category: 'Logical Reasoning',
        difficulty: 'Easy',
        marks: 1
      },
      {
        question: 'Select the synonym for: "ADVERSITY"',
        options: ['Fortune', 'Misfortune', 'Capacity', 'Activity'],
        correctAnswer: '1', // Index 1: Misfortune
        category: 'Verbal Ability',
        difficulty: 'Easy',
        marks: 1
      },
      {
        question: 'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?',
        options: ['10%', '12.5%', '15%', '20%'],
        correctAnswer: '1', // Index 1: 12.5%
        category: 'Quantitative Aptitude',
        difficulty: 'Medium',
        marks: 2
      },
      {
        question: 'Find the missing number in the series: 3, 5, 9, 17, 33, ?',
        options: ['44', '50', '65', '80'],
        correctAnswer: '2', // Index 2: 65 (pattern: *2 - 1)
        category: 'Logical Reasoning',
        difficulty: 'Medium',
        marks: 2
      }
    ];

    await AptitudeQuestion.insertMany(questions);
    console.log('Seeded baseline Aptitude questions.');
  } catch (error) {
    console.error('Error seeding aptitude questions:', error);
  }
}

async function seedCodingQuestions() {
  try {
    const count = await CodingQuestion.countDocuments();
    if (count > 0) return;

    const questions = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        sampleInput: 'nums = [2,7,11,15], target = 9',
        sampleOutput: '[0,1]',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        solution: '// JavaScript O(n) Hash Map solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}'
      },
      {
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
        difficulty: 'Easy',
        tags: ['String', 'Two Pointers'],
        sampleInput: 's = ["h","e","l","l","o"]',
        sampleOutput: '["o","l","l","e","h"]',
        constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
        solution: 'function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    const temp = s[left];\n    s[left] = s[right];\n    s[right] = temp;\n    left++;\n    right--;\n  }\n}'
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        difficulty: 'Medium',
        tags: ['Stack', 'String'],
        sampleInput: 's = "()[]{}"',
        sampleOutput: 'true',
        constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
        solution: 'function isValid(s) {\n  const stack = [];\n  const mapping = {\n    ")": "(",\n    "}": "{",\n    "]": "["\n  };\n  for (let i = 0; i < s.length; i++) {\n    const char = s[i];\n    if (mapping[char]) {\n      const topElement = stack.length > 0 ? stack.pop() : \'#\';\n      if (topElement !== mapping[char]) {\n        return false;\n      }\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}'
      }
    ];

    await CodingQuestion.insertMany(questions);
    console.log('Seeded baseline Coding questions.');
  } catch (error) {
    console.error('Error seeding coding questions:', error);
  }
}
