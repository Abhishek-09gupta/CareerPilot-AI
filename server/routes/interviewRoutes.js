const express = require('express');
const router = express.Router();
const { generateQuestions, submitInterview, getInterviewHistory } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateQuestions);
router.post('/submit', submitInterview);
router.get('/history', getInterviewHistory);

module.exports = router;
