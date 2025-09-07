const express = require("express");
const router = express.Router();
const packageController = require("../controllers/miscellaneousPackage");
const {verify,verifyAdmin} = require("../auth");

router.post("/add", verify, verifyAdmin, packageController.addMiscellaneousPackage);
router.get("/read", verify, verifyAdmin, packageController.getMiscellaneousPackage);
router.put("/update/:id", verify, verifyAdmin, packageController.updateMiscellaneousPackage);
router.delete("/delete/:id", verify, verifyAdmin, packageController.deleteMiscellaneousPackage);
router.get("/:id", verify, verifyAdmin,  packageController.getMiscellaneousPackageById);

module.exports = router;
