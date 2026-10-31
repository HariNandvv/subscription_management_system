const db = require("../config/db");

const validStatuses = [
    "draft",
    "quotation",
    "confirmed",
    "active",
    "paused",
    "closed"
];

// Get all subscriptions
exports.getSubscriptions = async (req, res) => {
    try {
        const [subscriptions] = await db.query(`
            SELECT s.*, p.name AS plan_name, p.price AS plan_price
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            ORDER BY s.id DESC
        `);

        res.json(subscriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch subscriptions"
        });
    }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
    try {
        const [subscriptions] = await db.query(
            `SELECT s.*, p.name AS plan_name, p.price AS plan_price
             FROM subscriptions s
             JOIN plans p ON s.plan_id = p.id
             WHERE s.id = ?`,
            [req.params.id]
        );

        if (subscriptions.length === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.json(subscriptions[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch subscription"
        });
    }
};

// Create subscription
exports.createSubscription = async (req, res) => {
    try {
        const {
            subscription_number,
            customer_id,
            plan_id,
            start_date,
            expiry_date,
            status = "draft"
        } = req.body;

        if (!customer_id || !plan_id) {
            return res.status(400).json({
                message: "Customer ID and Plan ID are required"
            });
        }

        if (!Number.isInteger(Number(customer_id)) ||
            Number(customer_id) < 1 ||
            !Number.isInteger(Number(plan_id)) ||
            Number(plan_id) < 1) {
            return res.status(400).json({
                message: "Customer ID and Plan ID must be valid positive integers"
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid subscription status"
            });
        }

        if (start_date && expiry_date && expiry_date < start_date) {
            return res.status(400).json({
                message: "Expiry date cannot be before start date"
            });
        }

        // Check that the customer exists
        const [customers] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Check that the plan exists
        const [plans] = await db.query(
            "SELECT id FROM plans WHERE id = ?",
            [plan_id]
        );

        if (plans.length === 0) {
            return res.status(404).json({
                message: "Plan not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO subscriptions
            (subscription_number, customer_id, plan_id,
             start_date, expiry_date, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                subscription_number || null,
                customer_id,
                plan_id,
                start_date || null,
                expiry_date || null,
                status
            ]
        );

        res.status(201).json({
            message: "Subscription created successfully",
            subscriptionId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create subscription"
        });
    }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
    try {
        const {
            subscription_number,
            customer_id,
            plan_id,
            start_date,
            expiry_date,
            status
        } = req.body;

        if (!customer_id || !plan_id || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Valid customer ID, plan ID and status are required"
            });
        }

        if (!Number.isInteger(Number(customer_id)) ||
            Number(customer_id) < 1 ||
            !Number.isInteger(Number(plan_id)) ||
            Number(plan_id) < 1) {
            return res.status(400).json({
                message: "Customer ID and Plan ID must be valid positive integers"
            });
        }

        if (start_date && expiry_date && expiry_date < start_date) {
            return res.status(400).json({
                message: "Expiry date cannot be before start date"
            });
        }

        const [result] = await db.query(
            `UPDATE subscriptions
             SET subscription_number = ?, customer_id = ?, plan_id = ?,
                 start_date = ?, expiry_date = ?, status = ?
             WHERE id = ?`,
            [
                subscription_number || null,
                customer_id,
                plan_id,
                start_date || null,
                expiry_date || null,
                status,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.json({
            message: "Subscription updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update subscription"
        });
    }
};

// Change subscription status
exports.changeSubscriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid subscription status"
            });
        }

        const [result] = await db.query(
            "UPDATE subscriptions SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.json({
            message: `Subscription status changed to ${status}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to change subscription status"
        });
    }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM subscriptions WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        res.json({
            message: "Subscription deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not delete subscription. It may be linked to other records."
        });
    }
};