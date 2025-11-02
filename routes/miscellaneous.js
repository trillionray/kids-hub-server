//[SECTION] Dependencies and Modules
const express = require("express");
const router = express.Router(); // ✅ This line defines `router`
const {verify,verifyAdmin} = require("../auth");
const miscController = require("../controllers/miscellaneous");

router.post("/", verify, verifyAdmin, miscController.addMisc);              //CREATE
router.get("/", verify, verifyAdmin, miscController.readMisc);              //READ
router.put("/:id", verify, verifyAdmin, miscController.updateMisc);     // UPDATE
router.delete("/:id", verify, verifyAdmin, miscController.deleteMisc);     // DELETE
router.get("/check-usage/:id", verify, verifyAdmin, miscController.checkMiscUsage); //READ 

router.post("/getSpecificMiscs", miscController.getSpecificMiscs);

// Activate the product
// router.patch(
//     "/activate/:productId", 
//     verify, 
//     verifyAdmin, 
//     productController.activateProduct 
// )
// router.post("/register", adminController.registerUser);
// router.post("/login", adminController.loginUser);
// router.get("/details", verify, adminController.getProfile);
//[SECTION] Export the router so it can be used in app.js
module.exports = router;