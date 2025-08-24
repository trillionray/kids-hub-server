const express = require("express");
const router = express.Router();
const classController = require("../controllers/class");
const { verify, verifyAdmin } = require("../auth");


// Get all sections
router.get("/", verify, verifyAdmin, classController.getAllClasses);

// Create a new section
router.post("/", verify, verifyAdmin, classController.createClass);

// Assign a teacher to a class
router.put("/:classId/teacher",  verify, verifyAdmin, classController.assignTeacher);

// Assign students to a class
router.put("/:classId/students",  verify, verifyAdmin, classController.assignStudents);

// Get one specific section
router.get("/:classId",  verify, verifyAdmin, classController.getClassById);


router.delete("/:classId/students/:studentId",   verify, verifyAdmin,  classController.removeStudent);

router.delete("/:classId/teacher",  verify, verifyAdmin, classController.removeTeacher);

module.exports = router;