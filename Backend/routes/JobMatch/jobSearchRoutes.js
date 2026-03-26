const express = require('express');
const router = express.Router();
const { searchJobs } = require('../../controllers/JobMatch/jobSearchController');

// GET /api/job-match/search
router.get('/search', searchJobs);

module.exports = router;
