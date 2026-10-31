
const express = require("express");
const router = express.Router();

const {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
} = require("../controllers/paymentController");

router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.delete("/:id", deletePayment);

module.exports = router;
