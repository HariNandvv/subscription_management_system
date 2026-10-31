
const express = require("express");
const router = express.Router();

const {
    getSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    changeSubscriptionStatus,
    deleteSubscription
} = require("../controllers/subscriptionController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

// Both admin and customer can view subscriptions.
// Controller filters customer records using req.user.id.
router.get("/", verifyToken, getSubscriptions);
router.get("/:id", verifyToken, getSubscriptionById);

// Only admin can manage subscriptions.
router.post("/", verifyToken, checkRole("admin"), createSubscription);
router.put("/:id", verifyToken, checkRole("admin"), updateSubscription);
router.patch("/:id/status", verifyToken, checkRole("admin"), changeSubscriptionStatus);
router.delete("/:id", verifyToken, checkRole("admin"), deleteSubscription);

module.exports = router;
