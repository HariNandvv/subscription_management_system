const express = require("express");
const router = express.Router();

const {
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
} = require("../controllers/planController");

const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// View plans (admin and customer)
router.get("/", verifyToken, getPlans);
router.get("/:id", verifyToken, getPlanById);

// Manage plans (admin only)
router.post("/", verifyToken, checkRole("admin"), createPlan);
router.put("/:id", verifyToken, checkRole("admin"), updatePlan);
router.delete("/:id", verifyToken, checkRole("admin"), deletePlan);

module.exports = router;