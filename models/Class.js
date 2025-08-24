const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    teacher_id: {
      type: String, // or mongoose.Schema.Types.ObjectId if you want populate
      ref: "Teacher",
      required: false,
    },
    students: [
      {
        type: String, // or mongoose.Schema.Types.ObjectId if you want populate
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
