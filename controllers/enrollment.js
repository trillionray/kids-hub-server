const Enrollment = require("../models/Enrollment");
const Program = require("../models/Program");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");

module.exports.enroll = async (req, res) => {
  try {
    const {
      branch,
      student_id,
      program_id,
      num_of_sessions,
      duration,
      academic_year_id,
      status
    } = req.body;

    // Validate required fields
    if (!branch || !student_id || !program_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Find the program
    const program = await Program.findById(program_id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // 2. Get misc package using program.miscellaneous_group_id
    let miscs_total = 0;
    if (program.miscellaneous_group_id) {
      const miscPackage = await MiscellaneousPackage.findById(program.miscellaneous_group_id);
      if (!miscPackage) {
        return res.status(404).json({ message: "Miscellaneous package not found" });
      }
      miscs_total = miscPackage.miscs_total || 0; // ✅ use correct field
    }

    // 3. Compute total
    const total = (program.rate || 0) + miscs_total;

    // 4. Create enrollment
    const newEnrollment = new Enrollment({
      branch,
      student_id,
      program_id,
      miscellaneous_group_id: program.miscellaneous_group_id,
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
    console.error("Enrollment error:", error);
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
