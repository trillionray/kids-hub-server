const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Program = require("../models/Program");
const { errorHandler } = require("../auth");

module.exports.addStudent = async (req, res) => {
  try {
    console.log("📥 Incoming data:", req.body);

    const {
      _id,
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      birthdate,
      address,
      mother,
      father,
      emergency
    } = req.body;

    
    // ✅ Check for at least one valid contact
    const hasValidPerson = [mother, father, emergency].some(person => {
      if (!person) return false;

      const hasContact =
        (person.contacts?.mobile_number && person.contacts.mobile_number.trim() !== "") ||
        (person.contacts?.messenger_account && person.contacts.messenger_account.trim() !== "");

      const hasAddress =
        person.address &&
        (
          person.address.block_or_lot?.trim() ||
          person.address.street?.trim() ||
          person.address.barangay?.trim() ||
          person.address.municipality_or_city?.trim()
        );

      return hasContact && hasAddress; // ✅ must have both
    });

    if (!hasValidPerson) {
      return res.status(400).json({
        message: "At least one person (father, mother, or emergency) must have both contact and address.",
      });
    }

    if (_id) {
      // ✅ UPDATE EXISTING STUDENT
      const updatedStudent = await Student.findByIdAndUpdate(
        _id,
        {
          first_name,
          middle_name,
          last_name,
          suffix,
          gender,
          birthdate,
          address,
          mother,
          father,
          emergency
        },
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res
        .status(200)
        .json({ student: updatedStudent, message: "Student updated successfully" });
    }

    // ✅ CREATE NEW STUDENT
    const year = new Date().getFullYear();

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
      address,
      mother,
      father,
      emergency
    });

    await newStudent.save();

    res
      .status(201)
      .json({ student: newStudent, message: "Student created successfully" });
  } catch (error) {
    console.error("❌ addStudent Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.updateStudentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      middle_name,
      last_name,
      suffix,
      gender,
      birthdate,
      address,
      mother,
      father,
      emergency
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const hasValidPerson = [mother, father, emergency].some(person => {
      if (!person) return false;

      const hasContact =
        (person.contacts?.mobile_number && person.contacts.mobile_number.trim() !== "") ||
        (person.contacts?.messenger_account && person.contacts.messenger_account.trim() !== "");

      const hasAddress =
        person.address &&
        (
          person.address.block_or_lot?.trim() ||
          person.address.street?.trim() ||
          person.address.barangay?.trim() ||
          person.address.municipality_or_city?.trim()
        );

      return hasContact && hasAddress; // ✅ must have both
    });

    if (!hasValidPerson) {
      return res.status(400).json({
        message: "At least one person (father, mother, or emergency) must have both contact and address.",
      });
    }

    // ✅ Perform update
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        first_name,
        middle_name,
        last_name,
        suffix,
        gender,
        birthdate,
        address,
        mother,
        father,
        emergency
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student information updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error("❌ updateStudentInfo Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating student info",
      error: error.message
    });
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

// Search student by name in enrollment module old student
module.exports.searchOldStudent = async (req, res) => {
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

    // For each student, check if they have pending enrollment
    const studentsWithStatus = await Promise.all(
      students.map(async (student) => {
        const pendingEnrollment = await Enrollment.findOne({
          student_id: student._id,
          status: "pending"
        }).lean();

        return {
          ...student,
          hasPendingEnrollment: !!pendingEnrollment // true/false
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: studentsWithStatus.length,
      students: studentsWithStatus,
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

// Search student by name that has a balance
module.exports.searchStudentWithBalance = async (req, res) => {
  try {
    const { query } = req.body;

    let mongoQuery = {};
    if (query && query.trim()) {
      const terms = query.trim().split(/\s+/);
      mongoQuery = {
        $and: terms.map(term => ({
          $or: [
            { first_name: { $regex: term, $options: "i" } },
            { middle_name: { $regex: term, $options: "i" } },
            { last_name: { $regex: term, $options: "i" } }
          ]
        }))
      };
    }

    const students = await Student.find(mongoQuery).lean();

    const result = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({
          student_id: student._id,
          status: { $in: ["pending", "ongoing"] }
        }).lean();

        if (enrollments.length === 0) return null;

        // Prepare program type options: category + program name, value = enrollmentId
        const programOptions = await Promise.all(
          enrollments.map(async (enroll) => {
            const program = await Program.findById(enroll.program_id).lean();
            if (!program) return null;
            const label = (program.category === "long" ? "Full Program" : "Short Program") + " - " + program.name;
            return { value: enroll._id, label };
          })
        );

        return {
          ...student,
          enrollments,
          programOptions: programOptions.filter(Boolean)
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: result.filter(Boolean).length,
      students: result.filter(Boolean)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while searching students",
      error: error.message
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


// ✅ Update student info



