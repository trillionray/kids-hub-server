const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["short", "long"],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    // down_payment: {
    //   type: Number
    // },
    miscellaneous_group_id: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    created_by: {
      type: String,
      required: true
    },
    updated_by: {
      type: String
    }

  },
  {
    timestamps: {
      createdAt: "creation_date",
      updatedAt: "last_modified_date"
    }
  }
);

module.exports = mongoose.model("Program", programSchema);
