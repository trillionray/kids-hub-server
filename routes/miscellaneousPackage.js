const express = require("express");
const router = express.Router();
const packageController = require("../controllers/miscellaneousPackage");
const {verify,verifyAdmin} = require("../auth");

router.post("/", verify, verifyAdmin, packageController.addMiscellaneousPackage);
router.get("/", verify, verifyAdmin, packageController.getMiscellaneousPackage);

module.exports = router;
