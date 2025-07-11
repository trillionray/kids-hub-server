const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student");
const { verify, verifyPrincipal, verifyTeacher, verifyCashier } = require("../auth");

// [POST] /student/register
router.post("/register", verify, verifyTeacher, studentController.registerStudent);

router.get('/all', verify, verifyTeacher, studentController.getAllStudents);


module.exports = router;