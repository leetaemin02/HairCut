const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  getBarbers,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/barbers", getBarbers);

module.exports = router;
