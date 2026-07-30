const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyDetails } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCompanies);
router.get('/:id', getCompanyDetails);

module.exports = router;
