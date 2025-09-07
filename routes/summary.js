const express = require("express");
const router = express.Router();
const userController = require("../controllers/summary");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// GET /users/teachers → return all teachers
router.get("/findstudent/:id", userController.findStudentById );
router.get("/findprogram/:id",  userController.findProgramById);
router.get("/findacademicyear/:id", userController.findAcademicYearById);
router.get("/findmisc/miscPackages/:id", verify, verifyAdmin, userController.findMiscPackageById);


module.exports = router;