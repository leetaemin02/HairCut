import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import Header from "../components/Header";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "barber") {
        navigate("/barber-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "barber") {
        navigate("/barber-dashboard");
      } else if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white flex flex-col">
      <Header />

      <main className="flex-grow flex justify-center items-center px-4 relative py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl w-full max-w-md backdrop-blur-sm relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Chào mừng bạn trở lại
            </h1>
            <p className="text-slate-400 text-sm">Đăng nhập để đặt lịch cắt tóc ngay nhé</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-200 p-3 rounded-lg mb-6 border border-red-500/20 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-300 font-semibold mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-8">
              <label className="block text-slate-300 font-semibold mb-2 text-sm">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <p className="text-center mt-8 text-slate-400 text-sm">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} The Blue Blade Barber Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
