const AcademicYear = require("../models/AcademicYear");
const Enrollment = require("../models/Enrollment");
const Miscellaneous = require("../models/Miscellaneous");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
const Program = require("../models/Program");
const Student = require("../models/Student");
const User = require("../models/User");
const moment = require("moment");


const models = {
  academicYears: require("../models/AcademicYear"),
  enrollments: require("../models/Enrollment"),
  miscellaneous: require("../models/Miscellaneous"),
  miscPackages: require("../models/MiscellaneousPackage"),
  programs: require("../models/Program"),
  students: require("../models/Student"),
  users: require("../models/User")
};

// Users Table
module.exports.findNames = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || []; // e.g. ids=64a12,64a13

    const Model = models[db]; // dynamic lookup
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    // Fetch documents with only the name field
    const docs = await Model.find({ _id: { $in: ids } }).select("name firstName middleName lastName");

    // Map IDs to names
    const results = ids.map(id => {
      const doc = docs.find(d => d._id.toString() === id);
      if (!doc) return { id, name: "Unknown" };

      // Try different naming fields depending on model
      let displayName = doc.name || `${doc.firstName || ""} ${doc.middleName || ""} ${doc.lastName || ""}`.trim();
      return { id, name: displayName || "Unknown" };
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.findPrograms = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || []; // e.g. ids=64a12,64a13

    const Model = models[db]; // dynamic lookup
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    // Fetch documents with only the name field
    const docs = await Model.find({ _id: { $in: ids } }).select("name");

    // Map IDs to names
    const results = ids.map(id => {
      const doc = docs.find(d => d._id.toString() === id);
      if (!doc) return { id, name: "Unknown" };

      // Try different naming fields depending on model
      let programName = doc.name || `${doc.name || ""}`.trim();
      return { id, name: programName || "Unknown Program" };
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.findAcademicYear = async (req, res) => { 
  try {
    const { db } = req.params;
    const ids = req.query.ids?.split(",") || []; // e.g. ids=64a12,64a13

    const Model = models[db]; // dynamic lookup
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid db name" });
    }

    // Fetch documents with startDate & endDate
    const docs = await Model.find({ _id: { $in: ids } }).select("startDate endDate");

    // Map IDs to formatted academic year
    const results = ids.map(id => {
      const doc = docs.find(d => d._id.toString() === id);
      if (!doc) return { id, name: "Unknown" };

      const start = moment(doc.startDate).format("MMMM YYYY"); // e.g. June 2025
      const end = moment(doc.endDate).format("MMMM YYYY");     // e.g. March 2026

      return { id, name: `${start} to ${end}` };
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};