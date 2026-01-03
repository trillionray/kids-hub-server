const Attendance = require("../models/Attendance");

// Add attendance
module.exports.addAttendance = async (req, res) => {
  try {
    const { class_id, student_id, session_number, date, status, notes } = req.body;
    const created_by = req.user?.id;

    // Validate required fields
    if (!class_id || !student_id || !session_number || !status || !created_by) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prepare new attendance record
    const newAttendance = {
      session_number: Number(session_number),
      status: String(status),
      notes: notes || "",
      created_by: String(created_by),
      updated_by: String(created_by),
      date: date ? new Date(date) : new Date(),
      creation_date: new Date(),
      last_modified_date: new Date(),
    };

    console.log("New attendance record:", newAttendance); // Debug

    // Find existing attendance document
    let attendanceDoc = await Attendance.findOne({ class_id, student_id });

    if (attendanceDoc) {
      // Ensure array exists
      attendanceDoc.attendance = attendanceDoc.attendance || [];

      // Push new record
      attendanceDoc.attendance.push(newAttendance);

      // ⚡ Only validate the new record, not existing ones
      await attendanceDoc.save({ validateModifiedOnly: true });

      return res.status(200).json({
        message: "Attendance added successfully",
        attendance: attendanceDoc,
      });
    } else {
      // Create new attendance document
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

// Get all attendance records
module.exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("class_id", "sectionName")
      .populate("student_id", "firstName lastName");

    res.status(200).json({ attendance: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get attendance for a specific student
module.exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { class_id } = req.body;

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

// Get attendance by class
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
