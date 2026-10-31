
const express = require("express");
const router = express.Router();

const { verifyToken, checkRole } =
    require("../middleware/authMiddleware");

const { getAllUsers } =
    require("../controllers/userController");

// Admin: View all users
router.get("/", verifyToken, checkRole("admin"), getAllUsers);

// Logged-in user: View own profile
router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Profile accessed successfully",
        user: req.user
    });
});

// Admin: Test access
router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin!"
    });
});

module.exports = router;
