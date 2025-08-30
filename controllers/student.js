const Student = require("../models/Student");
const { errorHandler } = require("../auth");

// Add a new student
module.exports.addStudent = async (req, res) => {
  try {
    const { firstName, lastName, middleName, suffix, gender, birthdate, address, contacts } = req.body;

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
      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      birthdate,
      address,
      contacts // ✅ now expects array of contact objects
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

// Get student by ID
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

// ✅ Add a contact to a student
module.exports.addContact = async (req, res) => {
  try {
    const { studentId } = req.params;
    const contact = req.body; // expects { firstName, lastName, relationship, contact_number }

    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    if (student.contacts.length >= 3) {
      return res.status(400).json({ success: false, message: "Maximum of 3 contacts allowed" });
    }

    student.contacts.push(contact);
    await student.save();

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Add Contact Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Remove a contact from student
module.exports.removeContact = async (req, res) => {
  try {
    const { studentId, contactId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    student.contacts = student.contacts.filter(c => c._id.toString() !== contactId);

    await student.save();

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Remove Contact Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
