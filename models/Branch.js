const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    branch_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    contact_number: {
      type: String,
    },
    email: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true, // optional, but usually good to have a default
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
