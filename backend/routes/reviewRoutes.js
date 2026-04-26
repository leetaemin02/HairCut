const express = require("express");
const { createReview, getReviews, deleteReview, getBarberRatingStats } = require("../controllers/reviewController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

// Public - Get average rating stats for all barbers (for Dashboard display)
router.get("/barber-stats", getBarberRatingStats);

// Public / General Get
router.get("/", getReviews);

// Customer Post
router.post("/", authMiddleware, createReview);

// Admin Delete
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteReview);

module.exports = router;
