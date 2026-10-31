
const express = require("express");
const router = express.Router();

const {
    getDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount
} = require("../controllers/discountController");

router.get("/", getDiscounts);
router.get("/:id", getDiscountById);
router.post("/", createDiscount);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);

module.exports = router;
