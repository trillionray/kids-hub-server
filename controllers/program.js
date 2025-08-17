const ProgramList = require("../models/Program");
    

module.exports.addProgram = async (req, res) => {
  try {
    const { name, category, description, rate, miscellaneous_group_id, isActive } = req.body;

    // ✅ Validate required fields
    if (!name || !category || !rate || !miscellaneous_group_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProgram = new ProgramList({
      name,
      category,
      description,
      rate,
      miscellaneous_group_id,   // ✅ added here
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

// Update a program
module.exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      rate,
      miscellaneous_group_id,
      isActive,
      updated_by
    } = req.body;

    // Validate required fields
    if (!name || !category || !rate || !miscellaneous_group_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedProgram = await ProgramList.findByIdAndUpdate(
      id,
      {
        name,
        category,
        description,
        rate,
        miscellaneous_group_id,
        isActive,
        updated_by
      },
      { new: true } // Return the updated document
    );

    if (!updatedProgram) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      program: updatedProgram
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update program", error: error.message });
  }
};