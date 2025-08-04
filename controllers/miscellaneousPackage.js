const Package = require('../models/MiscellaneousPackage');
const Misc = require('../models/Miscellaneous'); // ✅ You need this import

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

    //Validate referenced Misc IDs
    const existingMiscs = await Misc.find({ _id: { $in: miscs } });

    if (existingMiscs.length !== miscs.length) {
      return res.status(400).json({ message: "One or more misc IDs are invalid." });
    }

    //Save package after validation
    const newPackage = new Package({
      package_name,
      package_description, 
      package_price, 
      is_active,
      miscs,
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

module.exports.getMiscellaneousPackage = async (req, res) =>{
    try {
        const packageList = await Package.find(); // Fetch all tasks
        res.status(200).json(packageList);     // Send as JSON
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Miscellaneous", error });
    }
}