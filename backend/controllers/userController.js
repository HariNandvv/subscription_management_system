
const db = require("../config/db");

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY id DESC
        `);

        res.status(200).json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};
