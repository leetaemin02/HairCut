const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const QRCode = require("../models/QRCode");
const QRCodeLib = require("qrcode");

const checkAvailability = async (barberId, appointmentDate, duration) => {
  try {
    const requestedStart = new Date(appointmentDate);
    if (isNaN(requestedStart.getTime())) return { available: false, error: "Invalid start date" };

    requestedStart.setSeconds(0, 0);
    const safeDuration = duration || 30;
    const requestedEnd = new Date(requestedStart.getTime() + safeDuration * 60000);

    // Query: find any non-cancelled appointment for this barber
    const startOfDay = new Date(requestedStart);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedStart);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      barberId: barberId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ["cancelled"] },
    });

    for (const appointment of existingAppointments) {
      const existingStart = new Date(appointment.appointmentDate);
      if (isNaN(existingStart.getTime())) continue; // Skip invalid dates in DB

      existingStart.setSeconds(0, 0);
      const apptDuration = appointment.duration || 30; // fallback 30 min
      const existingEnd = new Date(existingStart.getTime() + apptDuration * 60000);

      // Check overlap: (StartA < EndB) AND (EndA > StartB)
      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        return {
          available: false,
          conflictingAppointment: appointment,
        };
      }
    }

    return { available: true };
  } catch (err) {
    console.error("[checkAvailability] Error:", err.message);
    return { available: false, error: err.message };
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { barberId, serviceId, appointmentDate, notes } = req.body;
    const customerId = req.user.id;

    // Check if appointment date is in the past
    if (new Date(appointmentDate) < new Date()) {
      return res.status(400).json({ message: "Cannot book an appointment in the past" });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check availability before creating appointment (Step C: Server-side check)
    const availabilityCheck = await checkAvailability(
      barberId,
      appointmentDate,
      service.duration
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({
        message: "Barber đã có lịch vào giờ này (Hệ thống vừa cập nhật)",
        conflictingAppointment: availabilityCheck.conflictingAppointment,
      });
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

// Get available time slots for a specific barber and date
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { barberId, date, serviceId } = req.query;

    if (!barberId || !date || !serviceId) {
      return res.status(400).json({
        message: "barberId, date, and serviceId are required",
      });
    }

    // Get service details for duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Step A: Parse YYYY-MM-DD as LOCAL date (not UTC)
    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day); // Local midnight

    console.log("[getAvailableTimeSlots] Received date:", date, "-> parsed:", selectedDate.toString());
    console.log("[getAvailableTimeSlots] barberId:", barberId, "serviceId:", serviceId);
    console.log("[getAvailableTimeSlots] service duration:", service.duration, "minutes");

    const businessHours = { start: 9, end: 18 };
    const slotDuration = 45; // minutes - matching original slot intervals

    const now = new Date();
    console.log("[getAvailableTimeSlots] Current time:", now.toString());

    const allTimeSlots = [];
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(year, month - 1, day, hour, minute, 0, 0);
        allTimeSlots.push(slotTime);
      }
    }

    console.log("[getAvailableTimeSlots] Generated", allTimeSlots.length, "total slots");

    const availableSlots = [];
    for (const slot of allTimeSlots) {
      const isPast = slot <= now;
      let isAvailable = true;

      console.log(`[getAvailableTimeSlots] processing slot ${slot.toISOString()}, isPast: ${isPast}`);

      if (!isPast) {
        const availability = await checkAvailability(barberId, slot, service.duration);
        isAvailable = availability.available;
      } else {
        isAvailable = false; // Past slots are not available
      }

      availableSlots.push({
        time: slot,
        formattedTime: slot.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isAvailable: isAvailable,
        isPast: isPast
      });
    }

    const availableCount = availableSlots.filter(s => s.isAvailable).length;
    console.log("[getAvailableTimeSlots] Result:", availableSlots.length, "total,", availableCount, "available");

    res.status(200).json({
      date: selectedDate,
      barberId,
      serviceId,
      availableSlots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
