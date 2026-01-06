const express = require("express");
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  scanQRCode,
} = require("../controllers/appointmentController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createAppointment);
router.get("/", authMiddleware, getAppointments);
router.get("/:id", authMiddleware, getAppointmentById);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, cancelAppointment);
router.post(
  "/scan-qr",
  authMiddleware,
  roleMiddleware(["barber", "admin"]),
  scanQRCode
);

module.exports = router;
