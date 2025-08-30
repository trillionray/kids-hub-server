const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance");
const {verify, verifyTeacher} = require("../auth");
// POST /attendance/add

router.post("/add", verify, verifyTeacher, attendanceController.addAttendance);
router.post("/", verify, verifyTeacher, attendanceController.getAllAttendance);
router.post("/student/:studentId", verify, verifyTeacher, attendanceController.getAttendanceByStudent);
router.get("/class/:classId", verify, verifyTeacher, attendanceController.getAttendanceByClass);


module.exports = router;