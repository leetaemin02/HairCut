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
        title: {
            type: String,
            required: true,
            default: "Mã Khuyến Mãi"
        },
        description: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            enum: ['DISCOUNT', 'GIFT', 'VIP'],
            default: 'DISCOUNT'
        },
        targetAudience: {
            type: String,
            enum: ['all', 'new_user', 'vip', 'staff'],
            default: 'all'
        },
        expiryDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
