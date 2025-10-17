const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    teacher_id: {
      type: String,
      ref: "User", 
      required: true,
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program", 
      required: true,
    },
    school_year_id: {                
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: false,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
