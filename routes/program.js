const express = require('express');
const router = express.Router();
const programController = require("../controllers/program");
const { verify, verifyAdmin} = require("../auth");

router.post("/", verify, verifyAdmin, programController.addProgram);
router.get("/", programController.getPrograms);

module.exports = router;