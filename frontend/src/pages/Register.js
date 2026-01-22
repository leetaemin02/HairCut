import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-medium"
      >
        ← Back to Website
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Create Account
          </h1>
          <p className="text-slate-400 text-xs">Join The Blue Blade community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-200 p-3 rounded-lg mb-4 border border-red-500/20 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
              placeholder="Enter your full name"
            />
          </div>
          <div className="mb-3">
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
              placeholder="Enter your phone number"
            />
          </div>
          <div className="mb-3">
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-600"
              placeholder="••••••••"
            />
          </div>
          <div className="mb-5">
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              Register as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="customer">Customer</option>
              <option value="barber">Barber</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400 text-xs">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
