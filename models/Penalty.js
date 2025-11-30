const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema(
  {
    
    penalty_name:{
      type: String
    },

    penalty_description:{
      type: String
    },

    program_type:{
      type: String
    },

    due_date: {
      type: Number,
    },

    penalty_amount: {
      type: Number,
    },

    active: {
      type: Boolean,
      default: true,   // new records are active by default
    },
    creation_date: {
      type: Date,
      default: Date.now
    },
    created_by: {
      type: String,
      ref: "User",
      required: true
    },
    last_modified_date: {
      type: Date,
      default: Date.now
    },
    updated_by: {
      type: String,
      ref: "User"
    }
  }
);

module.exports = mongoose.model('Penalty', penaltySchema);
