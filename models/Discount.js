const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    discount_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);
