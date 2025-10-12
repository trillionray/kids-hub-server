const Class = require("../models/Class");
const student = require("../models/User");
const AcademicYear = require("../models/AcademicYear");
const Student = require("../models/Student");
const mongoose = require("mongoose")
// Create a new class section
module.exports.createClass = async (req, res) => {
  try {
    const { sectionName,teacher_id,program_id } = req.body;

    if (!sectionName || !teacher_id || !program_id) {
      return res.status(400).json({ message: "Section name, teacher, program are required" });
    }

    const latestAcademicYear = await AcademicYear.findOne().sort({ createdAt: -1 });

    if (!latestAcademicYear) {
      return res.status(400).json({
        message: "No academic year found. Please add one first.",
      });
    }

    const newClass = new Class({
      sectionName,
      teacher_id,
      program_id,
      school_year_id: latestAcademicYear._id, // ✅ here
    });

    await newClass.save();

    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign a teacher to a class
module.exports.assignTeacher = async (req, res) => {
  try {
    const { classId } = req.params;
    const { teacher_id } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const foundClass = await Class.findById(classId);
    if (!foundClass) return res.status(404).json({ message: "Class not found" });

    foundClass.teacher_id = teacher_id;
    await foundClass.save();

    res.status(200).json({ message: "Teacher assigned successfully", class: foundClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign students to a class
exports.assignStudents = async (req, res) => {
  try {

    const { classId } = req.params; // classId
    const { students } = req.body; // array of student IDs or numbers
    console.log(students)

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    // console.log(classDoc)

    // Convert student numbers or strings to actual ObjectIds
    const validStudents = [];
    for (const s of students) {
      classDoc.students.push(s)
      await classDoc.save();
      res.json({ class: classDoc });
    }

    

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("program_id", "name category") // Program document
      .populate("_id", "firstName lastName") // User Document
      .populate("school_year_id", "name"); // AcademicYear
    // Add a count field to each class
    const classesWithCount = classes.map((cls) => ({
      ...cls.toObject(),
      studentCount: cls.students?.length || 0, // ✅ safe fallback
    }));

    res.status(200).json(classesWithCount);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific class section by ID
module.exports.getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const foundClass = await Class.findById(classId);

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(foundClass);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove a student from a class
module.exports.removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const updatedStudents = foundClass.students.filter(
      (id) => id !== studentId
    );

    if (updatedStudents.length === foundClass.students.length) {
      return res.status(404).json({ message: "Student not found in this class" });
    }

    foundClass.students = updatedStudents;
    await foundClass.save();

    res.status(200).json({
      message: "Student removed successfully",
      class: foundClass,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove teacher from a class
module.exports.removeTeacher = async (req, res) => {
  try {
    const { classId } = req.params;

    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!foundClass.teacher_id) {
      return res.status(404).json({ message: "No teacher assigned to this class" });
    }

    foundClass.teacher_id = undefined; // clear teacher field
    await foundClass.save();

    res.status(200).json({
      message: "Teacher removed successfully",
      class: foundClass,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update class info (section name, teacher, program)
module.exports.updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { sectionName, teacher_id, program_id } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { sectionName, teacher_id, program_id },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const foundClass = await Class.findById(classId).populate("students"); 
    // assumes Class schema has: students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(foundClass.students); // return only the students array
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
