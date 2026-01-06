const Service = require("../models/Service");

// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create service (admin only)
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const service = new Service({
      name,
      description,
      price,
      duration,
    });

    await service.save();
    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service (admin only)
exports.updateService = async (req, res) => {
  try {
    const { name, description, price, duration, isActive } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, isActive },
      { new: true }
    );

    res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      message: "Service deleted successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
