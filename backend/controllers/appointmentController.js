const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const QRCode = require("../models/QRCode");
const QRCodeLib = require("qrcode");

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { barberId, serviceId, appointmentDate, notes } = req.body;
    const customerId = req.user.id;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const appointmentId = `APT-${Date.now()}`;

    const appointment = new Appointment({
      appointmentId,
      customerId,
      barberId,
      serviceId,
      appointmentDate,
      duration: service.duration,
      notes,
      totalPrice: service.price,
    });

    await appointment.save();

    // Generate QR code
    const qrCodeData = {
      appointmentId: appointment._id,
      appointmentCode: appointmentId,
      timestamp: new Date().getTime(),
    };

    const qrCodeImage = await QRCodeLib.toDataURL(JSON.stringify(qrCodeData));

    const qrCode = new QRCode({
      appointmentId: appointment._id,
      code: appointmentId,
    });

    await qrCode.save();

    appointment.qrCode = qrCodeImage;
    await appointment.save();

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: {
        ...appointment.toObject(),
        qrCode: qrCodeImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    // If customer, show their own appointments
    // If barber, show appointments assigned to them
    if (req.user.role === "customer") {
      query = { customerId: req.user.id };
    } else if (req.user.role === "barber") {
      query = { barberId: req.user.id };
    } else if (req.user.role === "admin") {
      // Admin sees all appointments
      query = {};
    }

    const appointments = await Appointment.find(query)
      .populate("customerId", "name email phone")
      .populate("barberId", "name email phone")
      .populate("serviceId", "name price duration")
      .sort({ appointmentDate: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("barberId", "name email phone")
      .populate("serviceId", "name price duration");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate("barberId", "name email phone");

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Scan QR code
exports.scanQRCode = async (req, res) => {
  try {
    const { appointmentCode } = req.body;
    const barberId = req.user.id;

    const qrCode = await QRCode.findOne({ code: appointmentCode });
    if (!qrCode) {
      return res.status(404).json({ message: "Invalid QR code" });
    }

    if (qrCode.isScanned) {
      return res.status(400).json({ message: "QR code already scanned" });
    }

    qrCode.isScanned = true;
    qrCode.scannedAt = new Date();
    qrCode.scannedBy = barberId;
    await qrCode.save();

    const appointment = await Appointment.findByIdAndUpdate(
      qrCode.appointmentId,
      { status: "confirmed" },
      { new: true }
    ).populate("customerId", "name email phone");

    res.status(200).json({
      message: "QR code scanned successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
