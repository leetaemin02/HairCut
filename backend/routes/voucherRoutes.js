const express = require("express");
const { getVouchers, createVoucher, updateVoucher, deleteVoucher, validateVoucher } = require("../controllers/voucherController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

// Admin Routes for CRUD
router.get("/", authMiddleware, roleMiddleware(["admin"]), getVouchers);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createVoucher);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateVoucher);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteVoucher);

// Public/Customer Route for checking voucher
router.post("/validate", authMiddleware, validateVoucher);

module.exports = router;
