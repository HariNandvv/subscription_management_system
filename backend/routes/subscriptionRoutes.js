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

router.get("/", getSubscriptions);
router.get("/:id", getSubscriptionById);
router.post("/", createSubscription);
router.put("/:id", updateSubscription);
router.patch("/:id/status", changeSubscriptionStatus);
router.delete("/:id", deleteSubscription);

module.exports = router;