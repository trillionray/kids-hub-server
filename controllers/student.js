const Student = require("../models/Student");
const { errorHandler } = require("../auth");

// Add a new student
module.exports.addStudent = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      birthdate,

      // ✅ New nested address
      address,

      // ✅ Parents and emergency contacts
      mother,
      father,
      emergency
    } = req.body;

    const year = new Date().getFullYear();

    // Find the last student for the current year
    const lastStudent = await Student.findOne({ _id: new RegExp(`^SN${year}`) })
      .sort({ _id: -1 })
      .exec();

    let newIncrement = 1;

    if (lastStudent) {
      const lastNumber = parseInt(lastStudent._id.slice(-5));
      newIncrement = lastNumber + 1;
    }

    const newId = `SN${year}${String(newIncrement).padStart(5, "0")}`;

    const newStudent = new Student({
      _id: newId,
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      birthdate,

      // ✅ Nested objects
      address,
      mother,
      father,
      emergency
    });

    await newStudent.save();

    res.status(201).json({ student: newStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all students
module.exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).send({
      message: "All students retrieved successfully",
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};

// Search student by name
module.exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Query required" });
    }

    const terms = query.trim().split(/\s+/);

    const mongoQuery = {
      $and: terms.map(term => ({
        $or: [
          { first_name: { $regex: term, $options: "i" } },
          { middle_name: { $regex: term, $options: "i" } },
          { last_name: { $regex: term, $options: "i" } },
        ]
      }))
    };

    const students = await Student.find(mongoQuery).lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Search Student Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching students",
      error: error.message,
    });
  }
};



// GET /api/get-student-by-id/:id
module.exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Return the student document directly
    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


