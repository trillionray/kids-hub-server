const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      required: true,
      trim: true
    },
    student_id: { type: String, ref: "Student" },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
    },
    miscellaneous_group_id:{
      type: String
    },
    num_of_sessions: {
      type: Number,
      default: null
    },
    duration: {
      type: String,
      required: false,
      trim: true
    },
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      default: null
    },
    status: {
      type: String,
      default: 'pending'
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    }
  },
  {
    timestamps: {
      createdAt: 'creation_date',
      updatedAt: 'last_modified_date'
    }
  }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
