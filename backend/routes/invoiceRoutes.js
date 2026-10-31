
const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");

// Get all invoices
router.get("/", invoiceController.getInvoices);

// Get invoice by ID
router.get("/:id", invoiceController.getInvoiceById);

// Create invoice
router.post("/", invoiceController.createInvoice);

module.exports = router;
