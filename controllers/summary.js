const moment = require("moment");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
// Centralized models
const models = {
  academicYears: require("../models/AcademicYear"),
  enrollments: require("../models/Enrollment"),
  miscellaneous: require("../models/Miscellaneous"),
  miscPackages: require("../models/MiscellaneousPackage"),
  programs: require("../models/Program"),
  students: require("../models/Student"),
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
module.exports.findNames = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || [];

    const Model = getModel(db);
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    const docs = await Model.find({ _id: { $in: ids } })
      .select("name firstName middleName lastName first_name middle_name last_name");

    const results = mapResults(ids, docs, (doc) => {
      // Try different naming fields depending on model
      return (
        doc.name ||
        `${doc.firstName || ""} ${doc.middleName || ""} ${doc.lastName || ""}`.trim() ||
        `${doc.first_name || ""} ${doc.middle_name || ""} ${doc.last_name || ""}`.trim() ||
        "Unknown"
      );
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: findPrograms
 * Works for Programs type models
 */
module.exports.findPrograms = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || [];

    const Model = getModel(db);
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    const docs = await Model.find({ _id: { $in: ids } }).select("name");

    const results = mapResults(ids, docs, (doc) => {
      return doc.name?.trim() || "Unknown Program";
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: findAcademicYear
 * Works for AcademicYears type models
 */
module.exports.findAcademicYear = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || [];

    const Model = getModel(db);
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    const docs = await Model.find({ _id: { $in: ids } }).select("startDate endDate");

    const results = mapResults(ids, docs, (doc) => {
      if (!doc.startDate || !doc.endDate) return "Unknown";
      const start = moment(doc.startDate).format("MMMM YYYY");
      const end = moment(doc.endDate).format("MMMM YYYY");
      return `${start} to ${end}`;
    });

    return res.status(200).json({ success: true, results });
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

