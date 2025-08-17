const ProgramList = require("../models/Program");

module.exports.addProgram = async (req, res) => {
  try {
    const { name, category, description, rate, isActive } = req.body;

    // Validate required fields
    if (!name || !category || !rate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProgram = new ProgramList({
      name,
      category,
      description,
      rate,
      isActive: isActive ?? true,
      created_by: req.user.id,
      updated_by: req.user.id // Initialize updated_by same as created_by
    });

    const savedProgram = await newProgram.save();
    res.status(201).json({
      success: true,
      message: "Program added successfully",
      program: savedProgram
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add program", error: error.message });
  }
};

module.exports.getPrograms = async (req, res) => {
  try {
    const programs = await ProgramList.find();
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch programs", error: error.message });
  }
};
