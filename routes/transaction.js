const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction');
const { verify, verifyAdmin } = require("../auth");

router.get('/', verify, verifyAdmin, transactionController.getTransaction);

module.exports = router;
