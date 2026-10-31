
const db = require("../config/db");

// GET all discounts
exports.getDiscounts = async (req, res) => {
    try {
        const [discounts] = await db.query(
            "SELECT * FROM discounts ORDER BY id DESC"
        );
        res.status(200).json(discounts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch discounts",
            error: error.message
        });
    }
};

// GET discount by ID, including linked products
exports.getDiscountById = async (req, res) => {
    try {
        const [discounts] = await db.query(
            "SELECT * FROM discounts WHERE id = ?",
            [req.params.id]
        );

        if (discounts.length === 0) {
            return res.status(404).json({ message: "Discount not found" });
        }

        const [products] = await db.query(
            `SELECT product_id FROM discount_products
             WHERE discount_id = ?`,
            [req.params.id]
        );

        res.status(200).json({
            ...discounts[0],
            product_ids: products.map(item => item.product_id)
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch discount",
            error: error.message
        });
    }
};

// CREATE discount
exports.createDiscount = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            name,
            discount_type,
            discount_value,
            minimum_purchase,
            minimum_quantity,
            start_date,
            end_date,
            usage_limit,
            applies_to,
            product_ids = []
        } = req.body;

        if (!name || !["fixed", "percentage"].includes(discount_type) ||
            discount_value === undefined || Number(discount_value) < 0 ||
            !["product", "subscription"].includes(applies_to)) {
            return res.status(400).json({
                message: "Valid name, discount_type, discount_value and applies_to are required"
            });
        }

        if (!Array.isArray(product_ids)) {
            return res.status(400).json({
                message: "product_ids must be an array"
            });
        }

        if (discount_type === "percentage" && Number(discount_value) > 100) {
            return res.status(400).json({
                message: "Percentage discount cannot exceed 100"
            });
        }

        if (applies_to === "product" && product_ids.length === 0) {
            return res.status(400).json({
                message: "Select at least one product for a product discount"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO discounts
            (name, discount_type, discount_value, minimum_purchase,
             minimum_quantity, start_date, end_date, usage_limit, applies_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                discount_type,
                discount_value,
                minimum_purchase ?? 0,
                minimum_quantity ?? 1,
                start_date || null,
                end_date || null,
                usage_limit ?? null,
                applies_to
            ]
        );

        const discountId = result.insertId;

        for (const productId of product_ids) {
            await connection.query(
                `INSERT INTO discount_products (discount_id, product_id)
                 VALUES (?, ?)`,
                [discountId, productId]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Discount created successfully",
            discountId
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            message: "Failed to create discount",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// UPDATE discount
exports.updateDiscount = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const {
            name,
            discount_type,
            discount_value,
            minimum_purchase,
            minimum_quantity,
            start_date,
            end_date,
            usage_limit,
            applies_to,
            product_ids = []
        } = req.body;

        if (!name || !["fixed", "percentage"].includes(discount_type) ||
            discount_value === undefined || Number(discount_value) < 0 ||
            !["product", "subscription"].includes(applies_to) ||
            !Array.isArray(product_ids)) {
            return res.status(400).json({
                message: "Please provide valid discount details"
            });
        }

        if (discount_type === "percentage" && Number(discount_value) > 100) {
            return res.status(400).json({
                message: "Percentage discount cannot exceed 100"
            });
        }

        if (applies_to === "product" && product_ids.length === 0) {
            return res.status(400).json({
                message: "Select at least one product for a product discount"
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `UPDATE discounts SET
             name = ?, discount_type = ?, discount_value = ?,
             minimum_purchase = ?, minimum_quantity = ?,
             start_date = ?, end_date = ?, usage_limit = ?, applies_to = ?
             WHERE id = ?`,
            [
                name,
                discount_type,
                discount_value,
                minimum_purchase ?? 0,
                minimum_quantity ?? 1,
                start_date || null,
                end_date || null,
                usage_limit ?? null,
                applies_to,
                id
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Discount not found" });
        }

        await connection.query(
            "DELETE FROM discount_products WHERE discount_id = ?",
            [id]
        );

        for (const productId of product_ids) {
            await connection.query(
                `INSERT INTO discount_products (discount_id, product_id)
                 VALUES (?, ?)`,
                [id, productId]
            );
        }

        await connection.commit();

        res.status(200).json({ message: "Discount updated successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            message: "Failed to update discount",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// DELETE discount
exports.deleteDiscount = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM discounts WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete discount",
            error: error.message
        });
    }
};
