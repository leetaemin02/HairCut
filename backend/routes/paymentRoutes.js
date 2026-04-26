const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/auth");

// Create VNPAY payment URL (requires login)
router.post("/create", authMiddleware, paymentController.createPayment);

// Return URL handler - VNPAY redirects user back here (no auth)
router.get("/vnpay-return", paymentController.handleReturn);

// IPN URL - VNPAY server-to-server callback (no auth)
router.get("/ipn", paymentController.handleIPN);

module.exports = router;
