const Misc = require("../models/Miscellaneous");
const MiscPackage = require("../models/MiscellaneousPackage");


module.exports.addMisc = async (req, res) => {
  try {
    const { name, price, school_year_id, is_active, created_by, last_updated_by } = req.body;

    const existingMisc = await Misc.findOne({
    name: req.body.name,
    school_year_id: req.body.school_year_id
    });

    if (existingMisc) {
    return res.status(409).send({ message: "Miscellaneous already exists for this academic year." });
    }

    //Create new record
    const newMisc = new Misc({
      name,
      school_year_id,
      price,
      is_active,
      created_by,
      last_updated_by
    });

    const result = await newMisc.save();

    res.status(201).json({
      success: true,
      message: "Miscellaneous added successfully.",
      result
    });

  } catch (error) {
    console.error("Error adding miscellaneous:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding miscellaneous.",
      error: error.message
    });
  }
};

module.exports.readMisc = async (req, res) => {
  try {
    const miscList = await Misc.find()
      .populate("school_year_id", "startDate endDate")
      .sort({ creation_date: -1 });

    // ✅ Map and format academic year as a readable string
    const formattedList = miscList.map((item) => {
      const sy = item.school_year_id;
      const academicYear = sy
        ? `${new Date(sy.startDate).getFullYear()}–${new Date(sy.endDate).getFullYear()}`
        : "N/A";

      return {
        ...item.toObject(),
        academicYear,
      };
    });

    res.status(200).json(formattedList);
  } catch (error) {
    console.error("Error fetching miscellaneous:", error);
    res.status(500).json({
      message: "Failed to fetch Miscellaneous",
      error: error.message,
    });
  }
};

module.exports.checkMiscUsage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find if misc is referenced in any package
    const usedInPackages = await MiscPackage.find({ miscs: id });

    if (usedInPackages.length > 0) {
      return res.status(200).json({
        used: true,
        packages: usedInPackages.map((p) => p.package_name),
      });
    }

    return res.status(200).json({ used: false });
  } catch (error) {
    console.error("Error checking misc usage:", error);
    res.status(500).json({ message: "Server error while checking misc usage." });
  }
};

module.exports.updateMisc = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      price,
      effective_date,
      is_active,
      created_by,
      last_updated_by,
      school_year_id,
    } = req.body;

    //Check if another Misc with same name and school_year_id exists
    const existingMisc = await Misc.findOne({
      name,
      school_year_id,
      _id: { $ne: id }, // exclude the current record being updated
    });

    if (existingMisc) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Miscellaneous with the same name already exists for this academic year.",
        });
    }

    const updatedMisc = await Misc.findByIdAndUpdate(
      id,
      {
        name,
        price,
        effective_date,
        is_active,
        created_by,
        last_updated_by,
        school_year_id, 
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMisc) {
      return res
        .status(404)
        .json({ success: false, message: "Miscellaneous not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Miscellaneous updated successfully.",
      result: updatedMisc,
    });
  } catch (error) {
    console.error("Error updating miscellaneous:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while updating miscellaneous." });
  }
};


module.exports.deleteMisc = async (req, res) =>{ //687fbf88690f541009735eca
    try {
        const id = req.params.id;

        // Delete the task
        const deleteMisc = await Misc.findByIdAndDelete(id);

        if (!deleteMisc) {
            return res.status(404).json({ message: "Miscellaneous not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Miscellaneous deleted successfully",
            result: deleteMisc
        });
    } catch (error) {
          return res.status(500).json({ message: "Something is wrong cannot be update." });
    }
}

module.exports.getSpecificMiscs = async (req, res) => {
    try {
        const { ids } = req.body; // expecting array of IDs

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Please provide an array of IDs." });
        }

        // Fetch `name` and `price` fields
        const miscs = await Misc.find(
            { _id: { $in: ids } },
            { name: 1, price: 1 } // project name and price
        );

        if (!miscs || miscs.length === 0) {
            return res.status(404).json({ message: "No Miscellaneous records found." });
        }

        // Map to plain objects containing name and price
        const result = miscs.map(misc => ({
            _id: misc._id,
            name: misc.name,
            price: misc.price
        }));

        return res.status(200).json({
            success: true,
            count: result.length,
            miscs: result
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch specific Miscellaneous items.", error });
    }
};


