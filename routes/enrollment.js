const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollment");
const { verify, verifyAdmin } = require("../auth");

// POST - Add Enrollment
router.post("/enroll", verify, verifyAdmin, enrollmentController.enroll);

// GET - Fetch All Enrollments
router.get("/", verify, verifyAdmin, enrollmentController.getEnrollments);

module.exports = router;
