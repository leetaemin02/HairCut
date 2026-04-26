import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage("Vui lòng điền đủ thông tin.");
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      setStatus("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      const res = await authAPI.resetPassword(token, { password });
      setMessage(res.data.message || "Đặt lại mật khẩu thành công!");
      setStatus("success");
      
      // Navigate to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Đã xảy ra lỗi. Token không hợp lệ hoặc đã hết hạn.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#111621] text-[#e2e2ec] flex items-center justify-center p-4">
      <div className="bg-[#1c2230] p-8 rounded-2xl w-full max-w-md border border-[#282a31] shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-[#1754cf]/20 blur-[50px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#c3c6d6] bg-clip-text text-transparent break-words">
            Tạo Mật Khẩu Mới
          </h2>
          <p className="text-[#c3c6d6] mt-2">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm ${
              status === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center mt-6">
            <p className="text-sm text-[#c3c6d6] mb-4">Đang chuyển hướng về Đăng nhập...</p>
            <Link to="/login" className="text-[#1754cf] hover:text-[#2c6bf0] font-bold transition-colors">
              Nhấp vào đây nếu trình duyệt không tự chuyển
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-[#c3c6d6] mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111621] border border-[#282a31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all"
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c3c6d6] mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#111621] border border-[#282a31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#1754cf] hover:bg-[#1349b8] text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-[#1754cf]/25"
            >
              {status === "loading" ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
