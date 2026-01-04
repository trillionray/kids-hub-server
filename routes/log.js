const express = require('express');
const router = express.Router();
const logConrtoller = require('../controllers/log'); // adjust path if needed

// Route to add a new log
router.post('/', logConrtoller.addLog);

module.exports = router;
