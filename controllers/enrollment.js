const mongoose = require("mongoose"); // ✅ Add this at the top
const Enrollment = require("../models/Enrollment");
const Program = require("../models/Program");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
const AcademicYear = require("../models/AcademicYear");
const Student = require("../models/Student");

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
    const enrollments = await Enrollment.find()
      // .populate("student_id") 
      .sort({ last_modified_date: -1 }) // newest first
      .lean();
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments", error: error.message });
  }
};

// ✅ Get a single enrollment by ID
module.exports.getEnrollmentById = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("student_id")   // optional if you want student details
      .populate("program_id");  // optional if you want program details

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json(enrollment);
  } catch (error) {
    console.error("❌ Error fetching enrollment:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.searchEnrollments = async (req, res) => {
  try {
    const { branch, academic_year_id, program_id, student_name, student_id } = req.body;

    const pipeline = [
      // 🔹 Ensure program_id is an ObjectId if stored as string
      {
        $addFields: {
          program_id: {
            $cond: [
              { $eq: [{ $type: "$program_id" }, "string"] },
              { $toObjectId: "$program_id" },
              "$program_id"
            ]
          }
        }
      },

      // Lookup student
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      // Lookup program
      {
        $lookup: {
          from: "programs",
          localField: "program_id",
          foreignField: "_id",
          as: "program"
        }
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },

      // Lookup academic year
      {
        $lookup: {
          from: "academicyears",
          localField: "academic_year_id",
          foreignField: "_id",
          as: "academic_year"
        }
      },
      { $unwind: { path: "$academic_year", preserveNullAndEmptyArrays: true } },
    ];

    // Dynamic filters
    const match = {};
    if (branch) match.branch = branch;
    if (program_id) match.program_id = new mongoose.Types.ObjectId(program_id);
    if (academic_year_id) match.academic_year_id = new mongoose.Types.ObjectId(academic_year_id);

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    // 🔎 Search by student name OR student_id
    if (student_name || student_id) {
      const regex = new RegExp(student_name || student_id, "i");
      pipeline.push({
        $match: {
          $or: [
            { "student.first_name": regex },
            { "student.middle_name": regex },
            { "student.last_name": regex },
            { "student_id": regex } // ✅ allow searching by student_id string
          ]
        }
      });
    }

    // 🔹 Sort newest first
    pipeline.push({ $sort: { createdAt: -1 } });

    // Execute aggregation
    const enrollments = await Enrollment.aggregate(pipeline);

    // Map readable fields
    const enriched = enrollments.map(e => ({
      ...e,
      student_name: `${e.student.first_name} ${e.student.middle_name || ""} ${e.student.last_name}`.trim(),
      program_name: e.program?.name || "N/A",
      academic_year_name: e.academic_year
        ? `${new Date(e.academic_year.startDate).getFullYear()} - ${new Date(e.academic_year.endDate).getFullYear()}`
        : "N/A"
    }));

    res.status(200).json(enriched);

  } catch (error) {
    console.error("searchEnrollments error:", error);
    res.status(500).json({ message: "Failed to search enrollments", error: error.message });
  }
};

module.exports.updateEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params; // ID from URL
     console.log(enrollmentId)
    const {
      branch,
      program_id,
      num_of_sessions,
      duration,
      academic_year_id,
      status,
    } = req.body;

    // 1️⃣ Find existing enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // 2️⃣ If program changed, recalculate total
    let total = enrollment.total;
    let miscellaneous_group_id = enrollment.miscellaneous_group_id;

    if (program_id) {
      const program = await Program.findById(program_id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      let miscs_total = 0;
      if (program.miscellaneous_group_id) {
        const miscPackage = await MiscellaneousPackage.findById(program.miscellaneous_group_id);
        if (!miscPackage) {
          return res.status(404).json({ message: "Miscellaneous package not found" });
        }
        miscs_total = miscPackage.miscs_total || 0;
      }

      total = (program.rate || 0) + miscs_total;
      miscellaneous_group_id = program.miscellaneous_group_id;
    }

    // 3️⃣ Update fields (student_id excluded)
    if (branch) enrollment.branch = branch;
    if (program_id) enrollment.program_id = program_id;
    if (num_of_sessions !== undefined) enrollment.num_of_sessions = num_of_sessions;
    if (duration !== undefined) enrollment.duration = duration;
    if (academic_year_id !== undefined) enrollment.academic_year_id = academic_year_id;
    if (status) enrollment.status = status;

    enrollment.total = total;
    enrollment.miscellaneous_group_id = miscellaneous_group_id;
    enrollment.updated_by = req.user?.id || "system"; // fallback

    // 4️⃣ Save updates
    const updated = await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      enrollment: updated,
    });

  } catch (error) {
    console.error("updateEnrollment error:", error);
    res.status(500).json({ message: "Failed to update enrollment", error: error.message });
  }
};

// ✅ Get enrollment count by program_id
module.exports.getEnrollCountByProgram = async (req, res) => {
  try {
    const { program_id } = req.params; // program_id from URL

    if (!program_id) {
      return res.status(400).json({ message: "Program ID is required" });
    }

    // Convert to ObjectId if needed
    const programObjectId = new mongoose.Types.ObjectId(program_id);

    const count = await Enrollment.countDocuments({ program_id: programObjectId });

    res.status(200).json({
      success: true,
      program_id,
      enrollment_count: count,
    });
  } catch (error) {
    console.error("getEnrollCountByProgram error:", error);
    res.status(500).json({ message: "Failed to get enrollment count", error: error.message });
  }
};

// ✅ Get enrollments by Program and Academic Year
module.exports.getEnrollmentsByProgramAndYear = async (req, res) => {
  try {
    const { program_id, academic_year_id } = req.params;

    if (!program_id || !academic_year_id) {
      return res.status(400).json({
        message: "Both program_id and academic_year_id are required",
      });
    }

    // Convert to ObjectIds for matching
    const programObjectId = new mongoose.Types.ObjectId(program_id);
    const academicYearObjectId = new mongoose.Types.ObjectId(academic_year_id);

    // Find enrollments with matching program and academic year
    const enrollments = await Enrollment.find({
      program_id: programObjectId,
      academic_year_id: academicYearObjectId,
    })
      .populate("student_id") // ✅ get student details
      .populate("program_id") // ✅ get program details
      .populate("academic_year_id") // ✅ get academic year details
      .sort({ creation_date: -1 })
      .lean();

    if (!enrollments.length) {
      return res.status(404).json({
        message: "No enrollments found for this program and academic year",
      });
    }

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("getEnrollmentsByProgramAndYear error:", error);
    res.status(500).json({
      message: "Failed to fetch enrollments by program and academic year",
      error: error.message,
    });
  }
};