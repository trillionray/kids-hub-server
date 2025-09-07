const express = require("express");
const router = express.Router();

const branchController = require("../controllers/branch");

// Add a new branch
router.post("/add", branchController.addBranch);
// Get all branches
router.get("/all", branchController.getAllBranches);

// Edit a branch
router.put("/edit/:id", branchController.editBranch);

// Get branch by ID
router.get("/:id", branchController.getBranchById);

router.get("/findByName/:branch_name", branchController.getBranchByName);


module.exports = router;
