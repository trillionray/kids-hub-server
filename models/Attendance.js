const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  student_id: { type: String, required: true },
  attendance: [
    {
      date: { type: Date, default: Date.now },
      session_number: { type: Number, required: true },
      status: { type: String, required: true },
      notes: { type: String },
      creation_date: { type: Date, default: Date.now },
      created_by: { type: String, ref: "User", required: true },
      last_modified_date: { type: Date, default: Date.now },
      updated_by: { type: String, ref: "User" }
    }
  ]
});


module.exports = mongoose.model("Attendance", attendanceSchema);
