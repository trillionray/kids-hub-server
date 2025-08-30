const Attendance = require("../models/Attendance");

// Add attendance
// const Attendance = require("../models/Attendance");

module.exports.addAttendance = async (req, res) => {
  try {
    const { class_id, student_id, session_number, date } = req.body;
    const created_by = req.user.id
    if (!class_id || !student_id || !session_number || !created_by) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find if attendance document already exists for this student in the class
    let attendanceDoc = await Attendance.findOne({ class_id, student_id });

    const newAttendance = {
      session_number,
      created_by,
      updated_by: created_by,
      date: date ? new Date(date) : new Date(), // ✅ allow custom date if provided
      creation_date: new Date(),
      last_modified_date: new Date()
    };

    if (attendanceDoc) {
      // Push new record into existing document
      attendanceDoc.attendance.push(newAttendance);
      await attendanceDoc.save();
      return res.status(200).json({
        message: "Attendance added successfully",
        attendance: attendanceDoc,
      });
    } else {
      // Create a new attendance document
      attendanceDoc = new Attendance({
        class_id,
        student_id,
        attendance: [newAttendance],
      });
      await attendanceDoc.save();
      return res.status(201).json({
        message: "Attendance document created successfully",
        attendance: attendanceDoc,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports.getAllAttendance = async (req, res) => {
  try {
    // Populate student & class details if you want them visible
    const records = await Attendance.find()
      .populate("class_id", "sectionName")     // populate class info
      .populate("student_id", "firstName lastName"); // populate student info

    res.status(200).json({ attendance: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;     // from /student/:studentId
    const { class_id } = req.body;        // from request body

    if (!class_id) {
      return res.status(400).json({ message: "class_id is required" });
    }

    const record = await Attendance.findOne({ student_id: studentId, class_id });

    if (!record) {
      return res.status(404).json({ message: "No attendance found for this student in this class" });
    }

    res.status(200).json({ attendance: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const records = await Attendance.find({ class_id: classId })
      .populate("class_id", "sectionName")
      .populate("student_id", "firstName lastName");

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No attendance found for this class" });
    }

    res.status(200).json({ attendances: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};