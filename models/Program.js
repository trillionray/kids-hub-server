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
    isActive: {
      type: Boolean,
      default: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
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
