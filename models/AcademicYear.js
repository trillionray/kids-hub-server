const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,

  creationDate: {
    type: Date,
    default: Date.now
  },
  createdBy: String,
  lastModifiedDate: {
    type: Date,
    default: Date.now
  },
  updatedBy: String
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
