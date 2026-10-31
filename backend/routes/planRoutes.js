const express = require("express");
const router = express.Router();

const {
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
} = require("../controllers/planController");

router.get("/", getPlans);
router.get("/:id", getPlanById);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

module.exports = router;