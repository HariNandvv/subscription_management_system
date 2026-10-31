
const db = require("../config/db");

// Get all users (Admin only)
const getAllUsers = (req, res) => {
    const sql = `
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch users"
            });
        }

        res.status(200).json(results);
    });
};

module.exports = { getAllUsers };
