const db = require("../config/db");

const validIntervals = ["daily", "weekly", "monthly", "yearly"];

// Get all plans
exports.getPlans = async (req, res) => {
    try {
        const [plans] = await db.query(
            "SELECT * FROM plans ORDER BY id DESC"
        );

        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch plans" });
    }
};

// Get plan by ID
exports.getPlanById = async (req, res) => {
    try {
        const [plans] = await db.query(
            "SELECT * FROM plans WHERE id = ?",
            [req.params.id]
        );

        if (plans.length === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json(plans[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch plan" });
    }
};

// Create plan
exports.createPlan = async (req, res) => {
    try {
        const {
            name,
            price,
            billing_interval,
            minimum_quantity = 1,
            available_from = null,
            available_until = null,
            auto_close = 0,
            allow_early_close = 1,
            allow_pause = 1,
            allow_renew = 1
        } = req.body;

        if (!name || price === undefined || price === null ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                message: "A valid plan name and non-negative price are required"
            });
        }

        if (billing_interval &&
            !validIntervals.includes(billing_interval)) {
            return res.status(400).json({
                message: "Invalid billing interval"
            });
        }

        if (!Number.isInteger(Number(minimum_quantity)) ||
            Number(minimum_quantity) < 1) {
            return res.status(400).json({
                message: "Minimum quantity must be at least 1"
            });
        }

        if (available_from && available_until &&
            available_until < available_from) {
            return res.status(400).json({
                message: "Available until must not be before available from"
            });
        }

        const [result] = await db.query(
            `INSERT INTO plans
            (name, price, billing_interval, minimum_quantity,
             available_from, available_until, auto_close,
             allow_early_close, allow_pause, allow_renew)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                Number(price),
                billing_interval || null,
                Number(minimum_quantity),
                available_from,
                available_until,
                auto_close ? 1 : 0,
                allow_early_close ? 1 : 0,
                allow_pause ? 1 : 0,
                allow_renew ? 1 : 0
            ]
        );

        res.status(201).json({
            message: "Plan created successfully",
            planId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create plan" });
    }
};

// Update plan
exports.updatePlan = async (req, res) => {
    try {
        const {
            name,
            price,
            billing_interval,
            minimum_quantity,
            available_from,
            available_until,
            auto_close,
            allow_early_close,
            allow_pause,
            allow_renew
        } = req.body;

        if (!name || price === undefined || price === null ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                message: "A valid plan name and non-negative price are required"
            });
        }

        if (billing_interval &&
            !validIntervals.includes(billing_interval)) {
            return res.status(400).json({
                message: "Invalid billing interval"
            });
        }

        if (!Number.isInteger(Number(minimum_quantity)) ||
            Number(minimum_quantity) < 1) {
            return res.status(400).json({
                message: "Minimum quantity must be at least 1"
            });
        }

        if (available_from && available_until &&
            available_until < available_from) {
            return res.status(400).json({
                message: "Available until must not be before available from"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM plans WHERE id = ?",
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        await db.query(
            `UPDATE plans SET
            name = ?, price = ?, billing_interval = ?,
            minimum_quantity = ?, available_from = ?,
            available_until = ?, auto_close = ?,
            allow_early_close = ?, allow_pause = ?, allow_renew = ?
            WHERE id = ?`,
            [
                name,
                Number(price),
                billing_interval || null,
                Number(minimum_quantity),
                available_from || null,
                available_until || null,
                auto_close ? 1 : 0,
                allow_early_close ? 1 : 0,
                allow_pause ? 1 : 0,
                allow_renew ? 1 : 0,
                req.params.id
            ]
        );

        res.json({ message: "Plan updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update plan" });
    }
};

// Delete plan
exports.deletePlan = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM plans WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json({ message: "Plan deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not delete plan. It may be linked to subscriptions."
        });
    }
};