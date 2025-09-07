const moment = require("moment");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
const Program = require("../models/Program"); // adjust path as needed
const Student = require("../models/Student"); // adjust path
const AcademicYear = require("../models/AcademicYear");

// Centralized models
const models = {
  academicYears: require("../models/AcademicYear"),
  enrollments: require("../models/Enrollment"),
  miscellaneous: require("../models/Miscellaneous"),
  miscPackages: require("../models/MiscellaneousPackage"),
  programs: require("../models/Program"),
  users: require("../models/User")
};


// in summary controller
const mongoose = require("mongoose");
/**
 * Utility function to get Model by db param
 */
function getModel(db) {
  return models[db] || null;
}

/**
 * Utility function to safely map ids to results
 */
function mapResults(ids, docs, resolver) {
  return ids.map(id => {
    const doc = docs.find(d => d._id.toString() === id);
    return { id, name: doc ? resolver(doc) : "Unknown" };
  });
}

/**
 * Controller: findNames
 * Works for Users / Students type models with personal names
 */
module.exports.findStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    // return res.send(student);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }


    const fullName = `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""}`.trim();

    return res.status(200).json({ success: true, fullName });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Controller: findPrograms
 * Works for Programs type models
 */


module.exports.findProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const doc = await Program.findById(id); // get the full document
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Controller: findAcademicYear
 * Works for AcademicYears type models
 */


module.exports.findAcademicYearById = async (req, res) => {
  try {
    const { id } = req.params; // single academic year id

    const doc = await AcademicYear.findById(id).select("startDate endDate");

    if (!doc) {
      return res.status(404).json({ success: false, message: "Academic year not found" });
    }

    const start = doc.startDate ? moment(doc.startDate).format("MMMM YYYY") : "Unknown";
    const end = doc.endDate ? moment(doc.endDate).format("MMMM YYYY") : "Unknown";

    return res.status(200).json({
      success: true,
      result: `${start} to ${end}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



module.exports.findMiscPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id)

    if (!id) {
      return res.status(400).json({ success: false, message: "No id provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id format" });
    }

    const miscPackage = await MiscellaneousPackage.findById(id);
    console.log(miscPackage);
    if (!miscPackage) {
      return res.status(404).json({ success: false, message: "Miscellaneous package not found" });
    }

    return res.json({ success: true, result: miscPackage });
  } catch (error) {
    console.error("findMiscPackageById error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

