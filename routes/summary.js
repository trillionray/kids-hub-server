const express = require("express");
const router = express.Router();
const userController = require("../controllers/summary");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// GET /users/teachers → return all teachers
router.get("/findname/:db", verify, verifyAdmin, userController.findNames);
router.get("/findprogram/:db", verify, verifyAdmin, userController.findPrograms);
router.get("/academicyear/:db", verify, verifyAdmin, userController.findAcademicYear);

module.exports = router;