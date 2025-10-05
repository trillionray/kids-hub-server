const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollment");
const { verify, verifyAdmin } = require("../auth");

// POST - Add Enrollment
router.post("/enroll", verify, verifyAdmin, enrollmentController.enroll);

// GET - Fetch All Enrollments
router.get("/", verify, verifyAdmin, enrollmentController.getEnrollments);
router.get("/:enrollmentId", verify, verifyAdmin, enrollmentController.getEnrollmentById);

// POST - Search Enrollments (branch → academic year → program → student name)
router.post("/search", verify, verifyAdmin, enrollmentController.searchEnrollments);

router.put("/:enrollmentId", verify, verifyAdmin, enrollmentController.updateEnrollment);

router.get("/count/:program_id", verify, enrollmentController.getEnrollCountByProgram); 

module.exports = router;