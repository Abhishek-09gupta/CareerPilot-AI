const express = require('express');
const router = express.Router();
const { getQuestions, submitTest, getTestHistory } = require('../controllers/aptitudeController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes inside this folder are protected

router.get('/questions', getQuestions);
router.post('/submit', submitTest);
router.get('/history', getTestHistory);

module.exports = router;
