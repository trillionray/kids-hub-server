const ProgramList = require("../models/Program");
const mongoose = require("mongoose");
const MiscellaneousPackage = require("../models/MiscellaneousPackage");
const Program = require('../models/Program'); 

module.exports.addProgram = async (req, res) => {
  try {
    const { name, category, description, rate, miscellaneous_group_id, isActive } = req.body;

    if (!name || !category || !rate || !miscellaneous_group_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProgram = new ProgramList({
      name,
      category,
      description,
      rate,
      miscellaneous_group_id,
      isActive: isActive ?? true,
      created_by: req.user.id,  // ✅ convert
      updated_by: req.user.id  // ✅ convert
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


// GET Programs with computed total
module.exports.getProgramsWithTotal = async (req, res) => {
  try {
    // fetch programs
    const programs = await Program.find().lean(); // lean for plain JS objects

    // fetch all misc packages in one query to avoid multiple DB hits
    const miscPackages = await MiscellaneousPackage.find().lean();
    const miscMap = miscPackages.reduce((acc, pkg) => {
      acc[pkg._id.toString()] = pkg;
      return acc;
    }, {});

    // attach computed total
    const programsWithTotal = programs.map((program) => {
      const miscGroup = miscMap[program.miscellaneous_group_id?.toString()];
      const miscTotal = miscGroup ? miscGroup.miscs_total : 0;

      return {
        ...program,
        total: Number(program.rate) + Number(miscTotal),
        miscellaneous_group: miscGroup || null
      };
    });

    res.status(200).json({
      success: true,
      programs: programsWithTotal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch programs", error: error.message });
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