const express = require("express");
const router = express.Router();

const studentController  = require("../controllers/student");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// [POST] /student/register
router.post("/", verify, verifyAdmin, studentController.addStudent);

router.get('/', verify, verifyAdmin, studentController.getAllStudents)

// POST /students/search
router.post("/search-student",	 studentController.searchStudent);

//Enrollment Module
router.post("/search-oldstudent",	 studentController.searchOldStudent);

//Transaction Module
router.post("/search-paystudent",	 studentController.searchStudentWithBalance);

router.get("/get-student-by-id/:id",	verify, verifyAdmin, studentController.getStudentById);

router.put("/:id", verify, verifyAdmin, studentController.updateStudentInfo);

module.exports = router;