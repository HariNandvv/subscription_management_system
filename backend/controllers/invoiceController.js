const db = require("../config/db");

// Get all invoices
exports.getInvoices = async (req, res) => {
    try {
        const [invoices] = await db.query(`
            SELECT i.*, u.id AS customer_reference
            FROM invoices i
            LEFT JOIN users u ON i.customer_id = u.id
            ORDER BY i.id DESC
        `);

        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
};

// Get invoice by ID with items
exports.getInvoiceById = async (req, res) => {
    try {
        const [invoices] = await db.query(
            "SELECT * FROM invoices WHERE id = ?",
            [req.params.id]
        );

        if (invoices.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const [items] = await db.query(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [req.params.id]
        );

        res.json({
            ...invoices[0],
            items
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch invoice" });
    }
};

// Create invoice with invoice items
exports.createInvoice = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            invoice_number,
            subscription_id,
            customer_id,
            billing_period_start,
            billing_period_end,
            tax_amount = 0,
            discount_amount = 0,
            due_date,
            items
        } = req.body;

        if (!subscription_id || !customer_id ||
            !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Subscription ID, customer ID and invoice items are required"
            });
        }

        let subtotal = 0;

        for (const item of items) {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unit_price);
            const taxRate = Number(item.tax_rate || 0);

            if (!Number.isInteger(quantity) || quantity < 1 ||
                !Number.isFinite(unitPrice) || unitPrice < 0 ||
                !Number.isFinite(taxRate) || taxRate < 0) {
                return res.status(400).json({
                    message: "Each item must have valid quantity, unit price and tax rate"
                });
            }

            subtotal += quantity * unitPrice;
        }

        const tax = Number(tax_amount);
        const discount = Number(discount_amount);

        if (!Number.isFinite(tax) || tax < 0 ||
            !Number.isFinite(discount) || discount < 0 ||
            discount > subtotal + tax) {
            return res.status(400).json({
                message: "Invalid tax or discount amount"
            });
        }

        const total = subtotal + tax - discount;

        await connection.beginTransaction();

        const [invoiceResult] = await connection.query(
            `INSERT INTO invoices
            (invoice_number, subscription_id, customer_id,
             billing_period_start, billing_period_end,
             subtotal, tax_amount, discount_amount,
             total, due_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                invoice_number || null,
                subscription_id,
                customer_id,
                billing_period_start || null,
                billing_period_end || null,
                subtotal,
                tax,
                discount,
                total,
                due_date || null
            ]
        );

        for (const item of items) {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unit_price);
            const taxRate = Number(item.tax_rate || 0);

            const amount = quantity * unitPrice;

            await connection.query(
                `INSERT INTO invoice_items
                (invoice_id, product_id, description,
                 quantity, unit_price, tax_rate, amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    invoiceResult.insertId,
                    item.product_id || null,
                    item.description || null,
                    quantity,
                    unitPrice,
                    taxRate,
                    amount
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Invoice created successfully",
            invoiceId: invoiceResult.insertId,
            subtotal,
            tax_amount: tax,
            discount_amount: discount,
            total
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        res.status(500).json({
            message: "Failed to create invoice"
        });
    } finally {
        connection.release();
    }
};