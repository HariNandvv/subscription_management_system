
const db = require("../config/db");

// Get all payments (Admin: all, Customer: own payments)
exports.getPayments = async (req, res) => {
    try {
        let query = `
            SELECT p.*, i.invoice_number, i.customer_id
            FROM payments p
            JOIN invoices i ON p.invoice_id = i.id
        `;

        const params = [];

        if (req.user.role !== "admin") {
            query += " WHERE i.customer_id = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY p.id DESC";

        const [payments] = await db.query(query, params);

        res.status(200).json(payments);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch payments"
        });
    }
};


// Get payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        let query = `
            SELECT p.*, i.invoice_number, i.customer_id
            FROM payments p
            JOIN invoices i ON p.invoice_id = i.id
            WHERE p.id = ?
        `;

        const params = [req.params.id];

        if (req.user.role !== "admin") {
            query += " AND i.customer_id = ?";
            params.push(req.user.id);
        }

        const [payments] = await db.query(query, params);

        if (payments.length === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json(payments[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch payment"
        });
    }
};


// Create payment (Admin only through routes)
exports.createPayment = async (req, res) => {
    try {
        const {
            invoice_id,
            payment_method,
            amount,
            payment_date,
            note
        } = req.body;

        if (!invoice_id || amount === undefined || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Valid invoice ID and positive amount are required"
            });
        }

        const [invoice] = await db.query(
            "SELECT id, total, status FROM invoices WHERE id = ?",
            [invoice_id]
        );

        if (invoice.length === 0) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        if (invoice[0].status === "cancelled") {
            return res.status(400).json({
                message: "Cannot pay a cancelled invoice"
            });
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
        console.error(error);
        res.status(500).json({
            message: "Failed to create payment"
        });
    }
};


// Delete payment (Admin only through routes)
exports.deletePayment = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM payments WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            message: "Payment deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete payment"
        });
    }
};
