require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const lookbookRoutes = require("./routes/lookbookRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const securityRoutes = require("./routes/securityRoutes");
const app = express();

// Tin tưởng Proxy của Vercel/Nginx để Morgan ghi đúng IP thật của người dùng
// thay vì ghi IP của Vercel CDN (x-forwarded-for header)
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(helmet()); // Bảo mật HTTP headers bằng cách thiết lập các tiêu đề HTTP phù hợp
app.use(express.json({ limit: "10kb" })); // Giới hạn body payload ở mức 10kb để chống DoS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize()); // Loại bỏ các ký tự độc hại ($ và .) để chống NoSQL Injection
app.use(morgan("combined")); // Ghi log (nhật ký) hệ thống chi tiết cho mọi request

// Global Rate Limiting: Giới hạn số lượng request từ 1 IP để chống DDoS/Spam
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Thời gian: 15 phút
  max: 200, // Mỗi IP tối đa 200 requests / 15 phút
  message: { message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter); // Áp dụng cho toàn bộ /api

// Auth Rate Limiting: Giới hạn khắt khe hơn cho chức năng Đăng nhập để chống Brute-force mật khẩu
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Thời gian: 15 phút
  max: 10, // Mỗi IP tối đa 10 lần gọi API auth / 15 phút
  message: { message: "Bạn đã đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút" },
});
app.use("/api/auth", authLimiter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/lookbook", lookbookRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/security", securityRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
