const Branch = require("../models/Branch");

// Add Branch
exports.addBranch = async (req, res) => {
  try {
    const { branch_name, address, contact_number, email, is_active } = req.body;

    if (!branch_name) {
      return res.status(400).json({ message: "Branch name is required" });
    }

    const newBranch = new Branch({
      branch_name,
      address,
      contact_number,
      email,
      is_active: is_active !== undefined ? is_active : true,
    });

    const savedBranch = await newBranch.save();
    return res.status(201).json({ success: true, branch: savedBranch });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Edit Branch
exports.editBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_name, address, contact_number, email, is_active } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // Update fields
    if (branch_name !== undefined) branch.branch_name = branch_name;
    if (address !== undefined) branch.address = address;
    if (contact_number !== undefined) branch.contact_number = contact_number;
    if (email !== undefined) branch.email = email;
    if (is_active !== undefined) branch.is_active = is_active;

    const updatedBranch = await branch.save();
    return res.status(200).json({ success: true, branch: updatedBranch });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get All Branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find(); // fetch all branches
    return res.status(200).json({ success: true, branches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    return res.status(200).json({ success: true, branch });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get Branch by Branch Name
// Get Branch by Branch Name
exports.getBranchByName = async (req, res) => {
  try {
    const { branch_name } = req.params;

    if (!branch_name) {
      return res.status(400).json({ success: false, message: "Branch name is required" });
    }

    const branch = await Branch.findOne({ branch_name });

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // return branch document directly
    return res.status(200).json(branch);
  } catch (err) {
    console.error("Error fetching branch by name:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

