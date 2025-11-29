const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discount");
const { verify, verifyAdmin, verifyTeacher } = require("../auth");


// Get all sections
router.post("/", verify, verifyAdmin, discountController.addDiscount);

router.get("/", verify, verifyAdmin, discountController.getDiscounts);


router.get("/:id", discountController.getDiscountById);

module.exports = router;