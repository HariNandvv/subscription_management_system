
const db = require("../config/db");

// GET all payments
exports.getPayments = async (req, res) => {
    try {
        const [payments] = await db.query(
            "SELECT * FROM payments ORDER BY id DESC"
        );
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payments", error: error.message });
    }
};

// GET payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const [payments] = await db.query(
            "SELECT * FROM payments WHERE id = ?",
            [req.params.id]
        );

        if (payments.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(payments[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payment", error: error.message });
    }
};

// CREATE payment
exports.createPayment = async (req, res) => {
    try {
        const { invoice_id, payment_method, amount, payment_date, note } = req.body;

        if (!invoice_id || amount === undefined || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Valid invoice_id and positive amount are required"
            });
        }

        const [invoice] = await db.query(
            "SELECT id, total, status FROM invoices WHERE id = ?",
            [invoice_id]
        );

        if (invoice.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (invoice[0].status === "cancelled") {
            return res.status(400).json({ message: "Cannot pay a cancelled invoice" });
        }

        const [result] = await db.query(
            `INSERT INTO payments
            (invoice_id, payment_method, amount, payment_date, note)
            VALUES (?, ?, ?, ?, ?)`,
            [
                invoice_id,
                payment_method || null,
                amount,
                payment_date || null,
                note || null
            ]
        );

        res.status(201).json({
            message: "Payment created successfully",
            paymentId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create payment", error: error.message });
    }
};

// DELETE payment
exports.deletePayment = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM payments WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete payment", error: error.message });
    }
};
