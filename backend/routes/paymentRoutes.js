
const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// Get all payments
router.get("/", paymentController.getPayments);

// Create payment
router.post("/", paymentController.createPayment);

module.exports = router;
