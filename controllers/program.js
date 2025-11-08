const ProgramList = require("../models/Program");
const mongoose = require("mongoose");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
const Program = require('../models/Program'); 

// Add Program
module.exports.addProgram = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description, 
      rate, 
      down_payment, 
      miscellaneous_group_id, 
      initial_evaluation_price,
      capacity,
      isActive 
    } = req.body;

    console.log(req.body)
    // 🧩 Basic validation
    if (!name || !category || !rate) {
      return res.status(400).json({ message: "Name, category, and rate are required." });
    }

    // 🧩 Category-specific validation
    if (category === "short" && !initial_evaluation_price) {
      return res.status(400).json({ message: "Initial Evaluation Price is required for short programs." });
    }

    if (category === "long") {
      if (!miscellaneous_group_id) {
        return res.status(400).json({ message: "Miscellaneous group is required for long programs." });
      }
      if (capacity == null) {
        return res.status(400).json({ message: "Capacity is required for long programs." });
      }
    }

    // 🧩 Create new program
    const newProgram = new ProgramList({
      name,
      category,
      description,
      rate,
      down_payment,
      miscellaneous_group_id,
      initial_evaluation_price,
      capacity,
      isActive: isActive ?? true,
      created_by: req.user.id,
      updated_by: req.user.id
    });

    const savedProgram = await newProgram.save();

    return res.status(201).json({
      success: true,
      message: "Program added successfully",
      program: savedProgram
    });

  } catch (error) {
    console.error("Error adding program:", error);
    return res.status(500).json({
      message: "Failed to add program",
      error: error.message
    });
  }
};



// GET Programs with computed total
module.exports.getProgramsWithTotal = async (req, res) => {
  try {
    const programs = await Program.find().lean();

    // 👇 Populate the 'miscs' array so IDs become full objects
    const miscPackages = await MiscellaneousPackage.find()
      .populate('miscs')  // ✅ this is the key line
      .lean();

    console.log("Showing Misc Packages:");
    console.log(miscPackages);

    const miscMap = miscPackages.reduce((acc, pkg) => {
      acc[pkg._id.toString()] = pkg;
      return acc;
    }, {});

    const programsWithTotal = programs.map((program) => {
      const miscGroup = miscMap[program.miscellaneous_group_id?.toString()];
      const miscTotal = miscGroup ? miscGroup.miscs_total : 0;

      return {
        ...program,
        total: Number(program.rate) + Number(miscTotal),
        miscellaneous_group: miscGroup || null,
      };
    });

    res.status(200).json({
      success: true,
      programs: programsWithTotal,
      miscs: miscPackages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch programs",
      error: error.message,
    });
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

// 📝 Update Program
module.exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      rate,
      down_payment,
      miscellaneous_group_id,
      capacity,           // ✅ NEW
      isActive,
      updated_by
    } = req.body;

    if (!name || !category || !rate || !miscellaneous_group_id || capacity == null) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedProgram = await ProgramList.findByIdAndUpdate(
      id,
      {
        name,
        category,
        description,
        rate,
        down_payment,
        miscellaneous_group_id,
        capacity,        // ✅ NEW
        isActive,
        updated_by
      },
      { new: true }
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