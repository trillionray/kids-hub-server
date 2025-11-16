const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema(
  {
    FullDueDate: {
      type: Number,
    },

    FullPenaltyAmount: {
      type: Number,
    },

    ShortPenaltyAmount: {
      type: Number,
    },

    Active: {
      type: Boolean,
      default: true,   // new records are active by default
    }
  },
  {
    timestamps: {
      createdAt: 'creation_date',
      updatedAt: 'last_modified_date',
    },
  }
);

module.exports = mongoose.model('Penalty', penaltySchema);
