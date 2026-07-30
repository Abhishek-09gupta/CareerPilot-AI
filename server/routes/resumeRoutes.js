const express = require('express');
const router = express.Router();
const { uploadResume, analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', upload.single('resume'), analyzeResume);

module.exports = router;
