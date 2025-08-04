const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      required: true,
      trim: true
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
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
    miscellaneous_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MiscellaneousGroup',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', "enrolled - not fully paid", "enrolled - fully paid", 'completed', 'cancelled'],
      default: 'pending'
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
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
