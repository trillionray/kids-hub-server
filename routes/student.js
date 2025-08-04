const express = require("express");
const router = express.Router();

const studentController  = require("../controllers/student");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// [POST] /student/register
router.post("/", verify, verifyAdmin, studentController.addStudent);

router.get('/', verify, verifyAdmin, studentController.getAllStudents);


module.exports = router;