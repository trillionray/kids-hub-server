const Student = require("../models/Student");
const { errorHandler } = require("../auth");

module.exports.addStudent = async (req, res) => {
  try {
    const { firstName, lastName, middleName, suffix, gender, birthdate, address, contact } = req.body;

    const year = new Date().getFullYear();

    // Find the last student for the current year
    const lastStudent = await Student.findOne({ _id: new RegExp(`^SN${year}`) })
      .sort({ _id: -1 })
      .exec();

    let newIncrement = 1;

    if (lastStudent) {
      // Extract the last 5 digits and increment
      const lastNumber = parseInt(lastStudent._id.slice(-5));
      newIncrement = lastNumber + 1;
    }

    // Format to 5 digits with leading zeros
    const newId = `SN${year}${String(newIncrement).padStart(5, "0")}`;

    const newStudent = new Student({
      _id: newId,
      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      birthdate,
      address,
      contact
    });

    await newStudent.save();

    res.status(201).json({ student: newStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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

// Get student by ID or name (from req.body)
module.exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Query required" });
    }

    // Split input into words
    const terms = query.trim().split(/\s+/);

    // Build query: each term must match at least one name field
    const mongoQuery = {
      studentType: "old", // optional: only old students
      $and: terms.map(term => ({
        $or: [
          { firstName: { $regex: term, $options: "i" } },
          { middleName: { $regex: term, $options: "i" } },
          { lastName: { $regex: term, $options: "i" } },
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

module.exports.getStudentById = async(req, res) => {
  try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: "Student ID is required" });
      }

      const student = await Student.findById(id).lean();

      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      return res.status(200).json({ success: true, student });
    } catch (error) {
      console.error("Get Student By ID Error:", error);
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

