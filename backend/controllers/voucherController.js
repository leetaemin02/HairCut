const Voucher = require("../models/Voucher");

// Get all vouchers (Admin)
exports.getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new voucher
exports.createVoucher = async (req, res) => {
    try {
        const { code, discountPercent, usageLimit, isActive } = req.body;
        const newVoucher = new Voucher({ code, discountPercent, usageLimit, isActive });
        await newVoucher.save();
        res.status(201).json(newVoucher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a voucher
exports.updateVoucher = async (req, res) => {
    try {
        const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedVoucher) return res.status(404).json({ message: "Voucher not found" });
        res.status(200).json(updatedVoucher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a voucher
exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findByIdAndDelete(req.params.id);
        if (!voucher) return res.status(404).json({ message: "Voucher not found" });
        res.status(200).json({ message: "Voucher deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate a voucher (Customer checkout)
exports.validateVoucher = async (req, res) => {
    try {
        const { code } = req.body;
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
        }
        if (!voucher.isActive) {
            return res.status(400).json({ message: "Mã giảm giá đã bị khóa." });
        }
        if (voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng." });
        }

        res.status(200).json({ discountPercent: voucher.discountPercent, message: "Áp dụng mã giảm giá thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
