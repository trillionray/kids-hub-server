const express = require("express");
const router = express.Router(); 
const tuitionFeeController = require('../controllers/tuitionFee');
const { verify, verifyAdmin } = require("../auth");

router.post("/generate-tuition", tuitionFeeController.generateTuitionFees);
router.get("/", tuitionFeeController.getTuitionFees);
router.patch("/attach-penalty", verify, verifyAdmin, tuitionFeeController.attachPenalty);

module.exports = router;