const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        usageLimit: {
            type: Number,
            default: 100
        },
        usedCount: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
