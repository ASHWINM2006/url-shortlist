const express = require('express');
const { body } = require('express-validator');
const {
  createUrl, getUrls, getUrl, updateUrl,
  deleteUrl, getDashboardStats, bulkCreateUrls
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const createUrlValidation = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please enter a valid URL starting with http:// or https://')
];

router.get('/stats/overview', getDashboardStats);
router.get('/', getUrls);
router.post('/', createUrlValidation, createUrl);
router.post('/bulk', bulkCreateUrls);   // ← new bulk endpoint
router.get('/:id', getUrl);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
