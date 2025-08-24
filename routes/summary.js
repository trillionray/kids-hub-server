const express = require("express");
const router = express.Router();
const userController = require("../controllers/summary");

const { verify, verifyAdmin, verifyTeacher, verifyCashier } = require("../auth");

// GET /users/teachers → return all teachers
router.get("/teachers", verify, verifyAdmin, userController.getAllTeachers);

module.exports = router;