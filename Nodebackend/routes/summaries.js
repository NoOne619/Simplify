const express = require('express');
const router = express.Router();
const { createSummary,getUserSummaries,deleteSummary } = require('../controllers/summariesController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createSummary);
router.get('/', verifyToken, getUserSummaries);
router.delete('/:summary_id', verifyToken, deleteSummary);

module.exports = router;

