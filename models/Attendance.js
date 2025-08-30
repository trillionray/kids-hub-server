const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  student_id: {
      type: String,               // ✅ Store formatted ID like "SN202500001"
      required: true,
    },
  attendance: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      session_number: {
        type: Number,
        required: true
      },
      creation_date: {
        type: Date,
        default: Date.now
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      last_modified_date: {
        type: Date,
        default: Date.now
      },
      updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
