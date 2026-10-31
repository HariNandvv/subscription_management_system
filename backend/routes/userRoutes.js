const express = require("express");
const router = express.Router();

const { verifyToken, checkRole } =
    require("../middleware/authMiddleware");

// Accessible to all logged-in users
router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Profile accessed successfully",
        user: req.user
    });
});

// Accessible only to admin
router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin!"
    });
});

module.exports = router;