const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    scannedAt: Date,
    isScanned: {
      type: Boolean,
      default: false,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
