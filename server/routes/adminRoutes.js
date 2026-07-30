const express = require('express');
const router = express.Router();
const {
  getUsers,
  addAptitudeQuestion,
  addCodingQuestion,
  deleteQuestion,
  getGlobalAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // Restrict all these endpoints to Admins only

router.get('/users', getUsers);
router.get('/analytics', getGlobalAnalytics);
router.post('/aptitude', addAptitudeQuestion);
router.post('/coding', addCodingQuestion);
router.delete('/questions/:type/:id', deleteQuestion);

module.exports = router;
