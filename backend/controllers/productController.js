const db = require("../config/db");

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.status(200).json(products);
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(products[0]);
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, type, sale_price, cost_price, notes } = req.body;

        if (!name || sale_price === undefined || sale_price === null) {
            return res.status(400).json({
                message: "Product name and sale price are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (name, type, sale_price, cost_price, notes)
            VALUES (?, ?, ?, ?, ?)`,
            [name, type || null, sale_price, cost_price ?? null, notes || null]
        );

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { name, type, sale_price, cost_price, notes } = req.body;

        if (!name || sale_price === undefined || sale_price === null) {
            return res.status(400).json({
                message: "Product name and sale price are required"
            });
        }

        const [result] = await db.query(
            `UPDATE products
            SET name = ?, type = ?, sale_price = ?, cost_price = ?, notes = ?
            WHERE id = ?`,
            [
                name,
                type || null,
                sale_price,
                cost_price ?? null,
                notes || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            message: "Could not delete product. It may be linked to other records."
        });
    }
};