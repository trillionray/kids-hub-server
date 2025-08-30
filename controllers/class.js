const Class = require("../models/Class");
const Student = require("../models/Student");

// Create a new class section
module.exports.createClass = async (req, res) => {
  try {
    const { sectionName } = req.body;

    if (!sectionName) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const newClass = new Class({ sectionName });
    await newClass.save();

    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (error) {
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
module.exports.assignStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { students } = req.body; // expect [ "studentId1", "studentId2" ]

    if (!Array.isArray(students)) {
      return res.status(400).json({ message: "Students should be an array of IDs" });
    }

    const foundClass = await Class.findById(classId);
    if (!foundClass) return res.status(404).json({ message: "Class not found" });

    for (const studentId of students) {
      // Validate student exists
      const studentDoc = await Student.findById(studentId);
      if (!studentDoc) {
        return res.status(404).json({ message: `Student not found: ${studentId}` });
      }

      // Prevent duplicates
      if (!foundClass.students.includes(studentId)) {
        foundClass.students.push(studentId);
      }
    }

    await foundClass.save();

    res.status(200).json({
      message: "Students assigned successfully",
      class: foundClass,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all class sections
module.exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
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
