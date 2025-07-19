const express = require("express");
const router = express.Router();

const enrollmentController  = require("../controllers/enrollment");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// [POST] /student/register
router.post("/", verify, verifyAdmin, enrollmentController.enroll);

router.get('/all', verify, verifyAdmin, enrollmentController.getAllEnrollments);


module.exports = router;