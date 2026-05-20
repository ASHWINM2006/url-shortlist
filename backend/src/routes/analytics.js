const express = require('express');
const { getUrlAnalytics, getOverviewAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverviewAnalytics);
router.get('/:urlId', getUrlAnalytics);

module.exports = router;
