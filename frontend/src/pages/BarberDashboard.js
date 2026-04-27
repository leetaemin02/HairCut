import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI, authAPI, paymentAPI, reviewAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

function BarberDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingInfo, setRatingInfo] = useState({ avgRating: 5.0, reviewCount: 0 });
  const navigate = useNavigate();

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", phone: "", specialty: "", profileImage: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutApt, setCheckoutApt] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser?.role !== "barber" && parsedUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    // Set initial user data from local storage
    setUser(parsedUser);

    // Fetch full profile from DB
    const fetchFullProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify({ ...parsedUser, ...res.data }));
        setProfileData({
          name: res.data.name || "",
          phone: res.data.phone || "",
          specialty: res.data.specialty ? (Array.isArray(res.data.specialty) ? res.data.specialty.join(", ") : res.data.specialty) : "",
          profileImage: res.data.profileImage || ""
        });

        // Fetch rating info
        const statsRes = await reviewAPI.getBarberRatingStats();
        const myStats = statsRes.data[String(res.data._id || res.data.id)];
        if (myStats) {
          setRatingInfo(myStats);
        }
      } catch (err) {
        console.error("Error fetching full profile:", err);
        setProfileData({
          name: parsedUser.name || "",
          phone: "",
          specialty: "",
          profileImage: ""
        });
      }
    };

    fetchFullProfile();
    fetchAppointments(parsedUser);
  }, [navigate]);

  const fetchAppointments = async (currentUser) => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();

      // Backend already filters by barberId for role 'barber', 
      // but just to be safe if admin logs in and opens this page:
      const currentId = currentUser._id || currentUser.id;
      const myAppointments = response.data.filter((apt) => {
        const aptBarberId = apt.barberId?._id || apt.barberId;
        return String(aptBarberId) === String(currentId);
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Upcoming: today or future, AND not completed/cancelled
      const upcoming = myAppointments
        .filter((apt) => new Date(apt.appointmentDate) >= today && apt.status !== "completed" && apt.status !== "cancelled")
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

      // History: past date OR completed/cancelled
      const past = myAppointments
        .filter((apt) => new Date(apt.appointmentDate) < today || apt.status === "completed" || apt.status === "cancelled")
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

      setAppointments(upcoming);
      setHistory(past);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setUpdateMsg("");
    try {
      const res = await authAPI.updateProfile(profileData);
      // Assuming res.data.user has the updated data
      const updatedUser = { ...user, ...profileData, ...(res.data.user || {}) };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      setUpdateMsg("Profile updated successfully!");
      setTimeout(() => setUpdateMsg(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateMsg("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateAptStatus = async (id, status) => {
    try {
      if (status === "completed") {
        // Should checkout instead of generic update directly
        const apt = appointments.find(a => a._id === id);
        setCheckoutApt(apt);
        setVoucherCode("");
        setPaymentMethod("cash");
        setCheckoutError("");
        setShowCheckout(true);
        return;
      }
      await appointmentAPI.updateAppointment(id, { status });
      fetchAppointments(user);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      if (paymentMethod === "cash") {
        await appointmentAPI.updateAppointment(checkoutApt._id, {
          status: "completed",
          paymentStatus: "completed",
          voucherCode: voucherCode || undefined
        });
        setShowCheckout(false);
        fetchAppointments(user);
      } else if (paymentMethod === "vnpay") {
        // Apply voucher first if any, then create payment
        if (voucherCode) {
          await appointmentAPI.updateAppointment(checkoutApt._id, { voucherCode });
        }
        const res = await paymentAPI.createPayment({ appointmentId: checkoutApt._id });
        if (res.data?.payUrl) {
          window.location.href = res.data.payUrl;
        } else {
          setCheckoutError("Không thể tạo link thanh toán VNPAY.");
        }
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(err.response?.data?.message || "Lỗi khi thanh toán.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#ffb599]/20 text-[#ffb599] border-[#ffb599]/30";
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-[#b4c5ff]/20 text-[#b4c5ff] border-[#b4c5ff]/30";
      case "cancelled":
        return "bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]/30";
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/30";
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#111621] min-h-screen text-[#e2e2ec] font-sans pb-20">
      {/* App Bar */}
      <header className="px-6 py-5 bg-[#111621] border-b border-[#282a31] sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2
            onClick={() => navigate("/dashboard")}
            className="text-3xl font-logo text-white tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
          >
            The Blue Blade
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Replace "Obsidian Groom" text to right side or omit it in favor of right alignment */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#c3c6d6] uppercase tracking-widest">Barber Portal</p>
            <h1 className="text-sm font-bold text-white">Welcome, {user.name}</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-[#282a31] bg-[#1c2230] rounded-lg hover:bg-[#282a31] text-white font-bold text-sm ml-4 transition-all"
          >
            Về Website
          </button>
          <button
            onClick={handleLogout}
            className="text-[#ffb4ab] text-sm font-bold bg-[#ffb4ab]/10 px-4 py-2 rounded-lg hover:bg-[#ffb4ab]/20 transition-colors ml-4"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 mt-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: PROFILE */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-[#1c2230] rounded-xl p-6 border border-[#282a31]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Profile</h2>
              {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="text-[#1754cf] text-sm font-bold hover:underline">Edit</button>
              )}
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1754cf]/30 bg-[#111621] mb-4">
                <img
                  src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {!isEditingProfile && (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <p className="text-[#1754cf] font-medium text-sm mt-1">{Array.isArray(user.specialty) ? user.specialty.join(", ") : (user.specialty || "Professional Barber")}</p>
                  <p className="text-[#c3c6d6] text-sm mt-2">{user.phone || "No phone added"}</p>

                  {/* Star Rating Display */}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < Math.floor(ratingInfo.avgRating) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-bold text-sm ml-1">{ratingInfo.avgRating}</span>
                    <span className="text-[#c3c6d6] text-xs ml-1">({ratingInfo.reviewCount})</span>
                  </div>
                </div>
              )}
            </div>

            {isEditingProfile && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-1">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-[#111621] border border-[#282a31] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1754cf]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-1">Phone</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-[#111621] border border-[#282a31] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1754cf]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-1">Specialty</label>
                  <input
                    type="text"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                    className="w-full bg-[#111621] border border-[#282a31] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1754cf]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={profileData.profileImage}
                    onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                    className="w-full bg-[#111621] border border-[#282a31] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1754cf]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-[#282a31] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#33343c]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 bg-[#1754cf] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#1754cf]/80 disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}

            {updateMsg && (
              <p className={`text-center text-sm font-bold mt-4 ${updateMsg.includes('Failed') ? 'text-[#ffb4ab]' : 'text-green-400'}`}>
                {updateMsg}
              </p>
            )}
          </div>
        </section>

        {/* MIDDLE COLUMN: QR & UPCOMING */}
        <section className="lg:col-span-5 flex flex-col gap-8">
          {/* Primary Action Widget */}
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/scanner")}
              className="w-full aspect-[21/9] rounded-2xl bg-gradient-to-br from-[#1754cf] to-[#003ea7] flex space-y-2 flex-col items-center justify-center  border border-[#b4c5ff]/20"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Scan QR to Check-in</span>
            </motion.button>
          </div>

          {/* Upcoming Schedule */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upcoming</h2>
              <span className="bg-[#1c2230] text-[#c3c6d6] px-3 py-1 rounded-full text-xs font-bold border border-[#282a31]">
                Today & Future
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1754cf]"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-[#1c2230] rounded-xl p-8 text-center border border-[#282a31]">
                <div className="text-4xl mb-4">☕</div>
                <p className="text-[#c3c6d6] font-medium">No upcoming appointments.</p>
                <p className="text-[#c3c6d6]/60 text-sm mt-1">Take a break or walk-ins may arrive.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={apt._id}
                    className="bg-[#1c2230] rounded-xl p-5 border border-[#282a31] hover:border-[#1754cf]/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[#1754cf] font-bold text-lg">
                          {new Date(apt.appointmentDate).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-[#c3c6d6] text-xs font-medium">
                          {new Date(apt.appointmentDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="border-t border-[#282a31] pt-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {apt.customerId?.name || "Walk-in Customer"}
                      </h3>
                      <p className="text-[#c3c6d6] text-sm mb-3 opacity-80">
                        {apt.serviceId?.name || "General Service"}
                      </p>

                      {apt.notes && (
                        <div className="bg-[#111621] p-3 rounded-lg border border-[#282a31]/50 text-sm text-[#ffb599] font-medium italic mb-3">
                          "{apt.notes}"
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 items-center flex-wrap">
                        <select
                          value={apt.status}
                          onChange={(e) => updateAptStatus(apt._id, e.target.value)}
                          className="bg-[#111621] text-xs font-bold text-[#c3c6d6] border border-[#282a31] rounded-lg px-3 py-2 outline-none focus:border-[#1754cf] hover:border-[#434654] transition-colors appearance-none cursor-pointer"
                          style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #c3c6d6 50%), linear-gradient(135deg, #c3c6d6 50%, transparent 50%)', backgroundPosition: 'calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">✔ Hoàn thành (Thanh toán)</option>
                        </select>
                        <button
                          onClick={() => updateAptStatus(apt._id, "completed")}
                          className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/20 transition-colors ml-auto"
                        >
                          Thanh toán &rarr;
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: HISTORY */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">History</h2>
            <span className="bg-[#1c2230] text-[#c3c6d6] px-3 py-1 rounded-full text-xs font-bold border border-[#282a31]">
              Past & Done
            </span>
          </div>

          <div className="bg-[#1c2230] rounded-xl border border-[#282a31] flex-1 overflow-hidden flex flex-col max-h-[800px]">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1754cf]"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center m-auto">
                <p className="text-[#c3c6d6] font-medium">No history yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1">
                {history.map((apt) => (
                  <div key={apt._id} className="p-4 bg-[#111621] rounded-lg border border-[#282a31]/50 hover:border-[#282a31] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-bold text-sm">{apt.customerId?.name || "Walk-in"}</h4>
                        <p className="text-[#c3c6d6] text-xs mt-0.5">{apt.serviceId?.name || "General"}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#c3c6d6]/60 font-medium">
                      {new Date(apt.appointmentDate).toLocaleString('vi-VN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && checkoutApt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1c2230] border border-[#282a31] rounded-2xl w-full max-w-md  overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-[#1754cf] to-[#003ea7] flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Thanh Toán Dịch Vụ</h3>
                <button onClick={() => setShowCheckout(false)} className="text-white/60 hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Apt Info */}
                <div className="flex justify-between items-center bg-[#111621] p-4 rounded-xl border border-[#282a31]/50">
                  <div>
                    <p className="text-[#c3c6d6] text-xs font-bold uppercase mb-1">Khách hàng</p>
                    <p className="text-white font-bold">{checkoutApt.customerId?.name || "Khách Vãng Lai"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#c3c6d6] text-xs font-bold uppercase mb-1">Tổng tiền</p>
                    <p className="text-[#1754cf] font-bold text-lg">{Number(checkoutApt.totalPrice || checkoutApt.serviceId?.price).toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>

                {/* Voucher Code */}
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-2 uppercase">Mã giảm giá (Nếu có)</label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher..."
                    className="w-full bg-[#111621] border border-[#282a31] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1754cf] placeholder:text-[#c3c6d6]/40"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] mb-2 uppercase">Phương thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'cash' ? 'bg-[#1754cf]/10 border-[#1754cf] text-[#1754cf]' : 'bg-[#111621] border-[#282a31] text-[#c3c6d6] hover:border-[#c3c6d6]'}`}
                    >
                      <span className="text-xl">💵</span>
                      <span className="font-bold text-xs">Tiền mặt</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("vnpay")}
                      className={`py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'vnpay' ? 'bg-[#1754cf]/10 border-[#1754cf] text-[#1754cf]' : 'bg-[#111621] border-[#282a31] text-[#c3c6d6] hover:border-[#c3c6d6]'}`}
                    >
                      <span className="text-xl">💳</span>
                      <span className="font-bold text-xs">VNPAY</span>
                    </button>
                  </div>
                </div>

                {checkoutError && (
                  <div className="text-[#ffb4ab] text-sm font-bold bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 px-3 py-2 rounded-lg">
                    {checkoutError}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#282a31] flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  disabled={checkoutLoading}
                  className="flex-1 bg-transparent border border-[#282a31] text-white py-3 rounded-xl font-bold hover:bg-[#282a31]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="flex-1 bg-gradient-to-r from-[#1754cf] to-[#003ea7] hover:from-[#1349b8] hover:to-[#003185] text-white py-3 rounded-xl font-bold  /20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global styles for custom scrollbar if needed */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111621;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #282a31;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #434654;
        }
      `}</style>
    </div>
  );
}

export default BarberDashboard;