const express = require('express');
const router = express.Router();
const { getCodingQuestions, getCodingQuestionById, submitCodingAnswer } = require('../controllers/codingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/questions', getCodingQuestions);
router.get('/questions/:id', getCodingQuestionById);
router.post('/questions/:id/submit', submitCodingAnswer);

module.exports = router;
