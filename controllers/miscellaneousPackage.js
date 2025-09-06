const Package = require('../models/MiscellaneousPackage');
const Misc = require('../models/Miscellaneous');

// 🔄 Helper function: recalc miscs_total
async function calculateMiscsTotal(miscs) {
  if (!miscs || miscs.length === 0) return 0;

  const miscDocs = await Misc.find({ _id: { $in: miscs } });
  return miscDocs.reduce((sum, item) => sum + (item.price || 0), 0);
}

// ➕ Add Miscellaneous Package
module.exports.addMiscellaneousPackage = async (req, res) => {
  try {
    const { 
      package_name,
      package_description, 
      package_price, 
      is_active,
      miscs,
      created_by, 
      last_updated_by 
    } = req.body;

    // Validate miscs
    const existingMiscs = await Misc.find({ _id: { $in: miscs } });
    if (existingMiscs.length !== miscs.length) {
      return res.status(400).json({ message: "One or more misc IDs are invalid." });
    }

    // Compute total from miscs
    const miscs_total = await calculateMiscsTotal(miscs);

    const newPackage = new Package({
      package_name,
      package_description, 
      package_price, 
      is_active,
      miscs,
      miscs_total,
      created_by, 
      last_updated_by 
    });

    const saved = await newPackage.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      result: saved
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to create package", error: error.message });
  }
};

// 📦 Get All Packages
module.exports.getMiscellaneousPackage = async (req, res) =>{
    try {
        const packageList = await Package.find(); // Fetch all tasks
        res.status(200).json(packageList);     // Send as JSON
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Miscellaneous", error });
    }
}

// ✏️ Update Miscellaneous Package
module.exports.updateMiscellaneousPackage = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      package_name,
      package_description,
      package_price,
      is_active,
      miscs,
      last_updated_by
    } = req.body;

    let miscs_total = 0;
    if (miscs && miscs.length > 0) {
      const existingMiscs = await Misc.find({ _id: { $in: miscs } });
      if (existingMiscs.length !== miscs.length) {
        return res.status(400).json({ message: "One or more misc IDs are invalid." });
      }
      miscs_total = await calculateMiscsTotal(miscs);
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      {
        package_name,
        package_description,
        package_price,
        is_active,
        miscs,
        miscs_total,
        last_updated_by,
        last_updated: new Date()
      },
      { new: true, runValidators: true } 
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      result: updatedPackage
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update package", error: error.message });
  }
};

// ❌ Delete Miscellaneous Package
module.exports.deleteMiscellaneousPackage = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
      result: deletedPackage
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete package", error: error.message });
  }
};
