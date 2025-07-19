//[SECTION] Dependencies and Modules
const express = require("express");
const router = express.Router(); // ✅ This line defines `router`

const adminController = require("../controllers/admin");
const auth = require("../auth");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = auth;

router.post("/register", adminController.registerUser);
router.post("/login", adminController.loginUser);
router.get("/details", verify, adminController.getProfile);


//[SECTION] Export the router so it can be used in app.js
module.exports = router;
