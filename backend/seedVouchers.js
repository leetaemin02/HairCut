const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Voucher = require('./models/Voucher');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB Connected. Seeding Vouchers...');
        
        await Voucher.deleteMany({}); // Optional: clear existing to strictly match the image
        
        const vouchersData = [
            { code: "SALE20", discountPercent: 20, usageLimit: 20, usedCount: 2, isActive: true, title: "Sale Cuối Tuần 20%", description: "Giảm 20% cho dịch vụ cơ bản.", type: "DISCOUNT", targetAudience: "all", expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            { code: "QUOCKHANH", discountPercent: 30, usageLimit: 20, usedCount: 0, isActive: true, title: "Lễ Quốc Khánh", description: "Giảm 30% tri ân khách hàng.", type: "DISCOUNT", targetAudience: "all", expiryDate: new Date('2026-09-05') },
            { code: "VIPMEMBER", discountPercent: 10, usageLimit: 100, usedCount: 0, isActive: true, title: "Đặc Quyền Thành Viên VIP", description: "Giảm 10% trọn đời. Dành riêng cho khách hàng đã sử dụng dịch vụ trên 5 lần.", type: "VIP", targetAudience: "vip" },
            { code: "NHANVIEN", discountPercent: 90, usageLimit: 50, usedCount: 0, isActive: true, title: "Phúc Lợi Nhân Viên", description: "Giảm 90% cho nhân viên.", type: "GIFT", targetAudience: "staff" },
            { code: "CHAOMUNG", discountPercent: 30, usageLimit: 17, usedCount: 3, isActive: true, title: "Chào Mừng Người Mới", description: "Giảm 30% cho lần sử dụng dịch vụ đầu tiên.", type: "DISCOUNT", targetAudience: "new_user", expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        ];

        await Voucher.insertMany(vouchersData);
        console.log('Vouchers Seeded successfully!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
