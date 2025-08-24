const AcademicYear = require('../models/AcademicYear');
const Class = require("../models/Class");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Misc = require("../models/Miscellaneous");
const Package = require('../models/MiscellaneousPackage');
const User = require("../models/User");

// Get all teachers
module.exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password"); 
    // 👆 exclude password for security

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};







