const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penalty');
const { verify, verifyAdmin } = require("../auth");

router.post('/', verify, verifyAdmin, penaltyController.addPenalty);
router.get('/', verify, verifyAdmin, penaltyController.getPenalties);

module.exports = router;
