
const express = require("express");
const router = express.Router();

const discountController = require("../controllers/discountController");

// Get all discounts
router.get("/", discountController.getDiscounts);

// Create discount
router.post("/", discountController.createDiscount);

module.exports = router;
