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
    down_payment: {
      type: Number,
      min: 0
    },
    miscellaneous_group_id: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "MiscellaneousPackage", // model name
    },
    // initial_evaluation_price: {
    //   type: Number,
    //   min: 0
    // },
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
    },
    capacity: {
      type: Number,
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
