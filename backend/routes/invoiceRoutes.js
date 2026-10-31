
const express = require("express");
const router = express.Router();

const {
    getInvoices,
    getInvoiceById,
    createInvoice
} = require("../controllers/invoiceController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

// Admin and customer can view invoices.
// Customers only see their own invoices.
router.get("/", verifyToken, getInvoices);
router.get("/:id", verifyToken, getInvoiceById);

// Only admins can create invoices.
router.post("/", verifyToken, checkRole("admin"), createInvoice);

module.exports = router;
