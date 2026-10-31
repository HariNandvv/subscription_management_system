
const express = require("express");
const router = express.Router();

const {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
} = require("../controllers/paymentController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

router.get("/", verifyToken, getPayments);
router.get("/:id", verifyToken, getPaymentById);

router.post("/", verifyToken, checkRole("admin"), createPayment);
router.delete("/:id", verifyToken, checkRole("admin"), deletePayment);

module.exports = router;
