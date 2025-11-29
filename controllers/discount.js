// controllers/discountController.js
const mongoose = require("mongoose"); 
const Discount = require("../models/Discount");

// Add Discount
module.exports.addDiscount = async (req, res) => {
  try {
    const { discount_name, description, percentage, is_active } = req.body;

    const newDiscount = await Discount.create({
      discount_name,
      description,
      percentage,
      is_active
    });

    return res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: newDiscount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding discount",
      error: error.message
    });
  }
};

// Get All Discounts
module.exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: discounts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching discounts",
      error: error.message
    });
  }
};

// Get Specific Discount
module.exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount ID"
      });
    }

    const discount = await Discount.findById(id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: discount
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching discount",
      error: error.message
    });
  }
};

