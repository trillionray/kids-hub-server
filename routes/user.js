//[SECTION] Dependencies and Modules
const express = require("express");
const router = express.Router(); // ✅ This line defines `router`

const userController = require("../controllers/user");
const auth = require("../auth");
const { verify, verifyAdmin, verifyTeacher, verifyCashier } = auth;

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getProfile);
router.get("/", verify, verifyAdmin, userController.getAllUsers);
router.get("/findname", verify, userController.getAllTeachers);
router.get("/change-password", verify, userController.changePassword);


//[SECTION] Export the router so it can be used in app.js
module.exports = router;
