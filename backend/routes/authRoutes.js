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
} = require("../controllers/authController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/barbers", getBarbers);
router.get("/barbers/:id", getBarberById);

// Admin routes
router.get("/admin/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.get("/admin/stats", authMiddleware, roleMiddleware(["admin"]), getAdminStats);
router.put("/admin/users/:id/role", authMiddleware, roleMiddleware(["admin"]), updateUserRole);
router.delete("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

module.exports = router;
