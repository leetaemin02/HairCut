const User = require("../models/User");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, profileImage } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Người dùng đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "customer",
      profileImage,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Thông tin đăng nhập không chính xác" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, profileImage },
      { new: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all barbers
exports.getBarbers = async (req, res) => {
  try {
    const { specialty } = req.query;
    let query = { role: "barber", isActive: true };

    if (specialty) {
      // Use case-insensitive regex to match specialty, even if it's an array in MongoDB
      query.specialty = { $regex: new RegExp("^" + specialty.trim() + "$", "i") };
    }

    const barbers = await User.find(query).select("-password");
    res.status(200).json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBarberById = async (req, res) => {
  const { id } = req.params;
  console.log("===> Đang tìm kiếm Barber với ID:", id); // Log để kiểm tra

  try {
    // Tìm kiếm thợ và log kết quả trả về từ DB
    const barber = await User.findById(id).select("-password");

    if (barber) {
      console.log(`===> Tìm thấy User: ${barber.name}, Role hiện tại: [${barber.role}]`);
    } else {
      console.log("===> Không tìm thấy bất kỳ User nào với ID này trong DB.");
    }

    // Kiểm tra role (đảm bảo so sánh chính xác)
    if (!barber || String(barber.role).toLowerCase() !== "barber") {
      return res.status(404).json({ message: "Barber not found or role mismatch" });
    }

    res.status(200).json(barber);
  } catch (error) {
    console.error("===> Lỗi khi tìm barber:", error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid Barber ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// --- Admin Controls ---
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Get Statistics ---
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalBarbers = await User.countDocuments({ role: "barber" });
    const totalServices = await Service.countDocuments({ isActive: true });

    // Total revenue from completed appointments
    const completedAppointments = await Appointment.find({ status: "completed" });
    const totalRevenue = completedAppointments.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const totalOrders = await Appointment.countDocuments();

    // Data for Pie Chart: Appointments by Status
    const statusAggregation = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const appointmentsByStatus = statusAggregation.map(item => ({
      name: item._id === "pending" ? "Chờ xác nhận" :
        item._id === "confirmed" ? "Đã xác nhận" :
          item._id === "completed" ? "Đã hoàn thành" :
            item._id === "cancelled" ? "Đã hủy" : item._id,
      value: item.count,
      status: item._id
    }));

    // Today's Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todayAppointments
      .filter(a => a.status === "completed")
      .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    // Group revenue by month using aggregation
    const revenueByMonth = await Appointment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$appointmentDate" },
            month: { $month: "$appointmentDate" }
          },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format for frontend chart
    const formattedRevenue = revenueByMonth.map(item => ({
      month: `Th. ${item._id.month}`,
      revenue: item.totalRevenue
    }));

    res.status(200).json({
      totalUsers,
      totalCustomers,
      totalBarbers,
      totalServices,
      totalRevenue,
      totalOrders,
      todayRevenue,
      todayAppointments: todayAppointments.length,
      revenueByMonth: formattedRevenue,
      appointmentsByStatus
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Barber KPIs
exports.getBarberStats = async (req, res) => {
  try {
    const barbers = await User.find({ role: "barber", isActive: true }).select("name profileImage specialty");

    const completedAppointments = await Appointment.find({ status: "completed" });

    const barberStats = barbers.map(barber => {
      const barberApts = completedAppointments.filter(
        apt => String(apt.barberId) === String(barber._id)
      );

      const totalRevenue = barberApts.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

      return {
        _id: barber._id,
        name: barber.name,
        profileImage: barber.profileImage,
        specialty: barber.specialty,
        completedAppointments: barberApts.length,
        totalRevenue: totalRevenue
      };
    });

    // Sort by revenue descending
    barberStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json(barberStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Forgot/Reset Password ---

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and set to user field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time to 15 minutes
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.\nVui lòng click vào link sau để đặt lại mật khẩu (có hiệu lực trong 15 phút):\n\n${resetUrl}`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Xin chào ${user.name},</h2>
        <p>Bạn nhận được email này vì bạn đã yêu cầu khôi phục mật khẩu TheBlueBlade.</p>
        <p>Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới (Link có hiệu lực trong 15 phút):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1754cf; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <br>
        <p>Thân mến,<br>Đội ngũ TheBlueBlade</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Yêu cầu đặt lại mật khẩu bảo mật (TheBlueBlade)",
        message,
        html: htmlMessage
      });

      res.status(200).json({ message: "Email khôi phục đã được gửi" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error("Email Error: ", error);
      return res.status(500).json({ message: "Lỗi gửi email. Vui lòng thử lại sau" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Vui lòng cung cấp mật khẩu mới" });
    }

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

