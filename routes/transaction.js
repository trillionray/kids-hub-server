
const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const transactionController = require('../controllers/transaction');
const { verify, verifyAdmin } = require("../auth");

router.get('/', verify, verifyAdmin, transactionController.getTransactions);
router.post('/downpayment', verify, verifyAdmin, transactionController.checkDownPaymentDetails);
router.post('/monthly-penalty', verify, verifyAdmin, transactionController.checkMonthlyDetails);
router.post("/create", upload.single("receiptImage"), transactionController.addTransaction);

module.exports = router;