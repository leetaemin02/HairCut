const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  getBarbers,
  getBarberById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminStats,
  getBarberStats,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/barbers", getBarbers);
router.get("/barbers/:id", getBarberById);

// Admin routes
router.get("/admin/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.get("/admin/stats", authMiddleware, roleMiddleware(["admin"]), getAdminStats);
router.get("/admin/barber-stats", authMiddleware, roleMiddleware(["admin"]), getBarberStats);
router.put("/admin/users/:id/role", authMiddleware, roleMiddleware(["admin"]), updateUserRole);
router.delete("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

module.exports = router;
