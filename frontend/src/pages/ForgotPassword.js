import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Vui lòng nhập email");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      const res = await authAPI.forgotPassword({ email });
      setMessage(res.data.message || "Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
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
            Quên Mật Khẩu
          </h2>
          <p className="text-[#c3c6d6] mt-2">
            Nhập email của bạn để nhận link khôi phục mật khẩu.
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

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-[#c3c6d6] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111621] border border-[#282a31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all"
                placeholder="Ví dụ: theblueblade@gmail.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#1754cf] hover:bg-[#1349b8] text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-[#1754cf]/25"
            >
              {status === "loading" ? "Đang gửi..." : "Gửi link khôi phục"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm relative z-10">
          <Link to="/login" className="text-[#c3c6d6] hover:text-white transition-colors">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
