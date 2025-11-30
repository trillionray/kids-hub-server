const Penalty = require("../models/Penalty");

module.exports.addPenalty = async (req, res) => {
  try {
    const {
      penalty_name,
      penalty_description,
      program_type,
      due_date,
      penalty_amount
    } = req.body;

    const userId = req.user?.id || req.user?._id;   // depends on your auth setup

    const newPenalty = new Penalty({
      penalty_name,
      penalty_description,
      program_type,
      due_date,
      penalty_amount,
      created_by: userId,
      updated_by: userId
    });

    await newPenalty.save();

    return res.status(201).json({
      success: true,
      message: "Penalty added successfully",
      data: newPenalty
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

module.exports.getPenalties = async (req, res) => {
  try {
    const penalties = await Penalty.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: penalties
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};