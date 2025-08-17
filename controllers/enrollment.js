const Enrollment = require("../models/Enrollment");

module.exports.enroll = async (req, res) => {
  try {
    const {
      branch,
      student_id,
      program_id,
      num_of_sessions,
      duration,
      academic_year_id,
      status,
      total
    } = req.body;

    // Validate required fields
    if (!branch || !student_id || !program_id || total == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEnrollment = new Enrollment({
      branch,
      student_id,
      program_id,
      num_of_sessions,
      duration,
      academic_year_id,
      status: status || "pending",
      total,
      created_by: req.user.id,
      updated_by: req.user.id
    });

    const savedEnrollment = await newEnrollment.save();

    res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      enrollment: savedEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add enrollment", error: error.message });
  }
};

module.exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find();
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments", error: error.message });
  }
};
