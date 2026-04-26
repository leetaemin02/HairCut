import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, serviceAPI, appointmentAPI, lookbookAPI, voucherAPI, reviewAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

const CATEGORIES = ["Cắt tóc", "Thư giãn", "Hóa chất", "Dịch vụ khác"];

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalBarbers: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalOrders: 0,
    todayRevenue: 0,
    todayAppointments: 0,
    revenueByMonth: [],
    appointmentsByStatus: []
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [lookbooks, setLookbooks] = useState([]);
  const [barberStats, setBarberStats] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Views Option
  const [isCalendarView, setIsCalendarView] = useState(false);

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    image: "",
    category: CATEGORIES[0]
  });

  // Lookbook Modal State
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [editingLookbookId, setEditingLookbookId] = useState(null);
  const [lookbookForm, setLookbookForm] = useState({
    title: "",
    image: "",
    category: "General",
    description: ""
  });

  // Voucher Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountPercent: 10,
    usageLimit: 100,
    isActive: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchData();
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await authAPI.getStats();
        setStats(res.data);
      } else if (activeTab === "users") {
        const res = await authAPI.getAllUsers();
        setUsers(res.data);
      } else if (activeTab === "services") {
        const res = await serviceAPI.getServices();
        setServices(res.data);
      } else if (activeTab === "appointments") {
        const res = await appointmentAPI.getAppointments();
        setAppointments(res.data);
      } else if (activeTab === "lookbooks") {
        const res = await lookbookAPI.getLookbook();
        setLookbooks(res.data);
      } else if (activeTab === "kpi") {
        const res = await authAPI.getBarberStats();
        setBarberStats(res.data);
      } else if (activeTab === "vouchers") {
        const res = await voucherAPI.getVouchers();
        setVouchers(res.data);
      } else if (activeTab === "reviews") {
        const res = await reviewAPI.getReviews();
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- Handlers ---
  const handleUpdateRole = async (id, newRole) => {
    if (window.confirm(`Thay đổi vai trò thành ${newRole}?`)) {
      try {
        await authAPI.updateUserRole(id, { role: newRole });
        fetchData();
      } catch (err) { alert("Lỗi cập nhật vai trò"); }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await authAPI.deleteUser(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa người dùng"); }
    }
  };

  const openAddServiceModal = () => {
    setEditingServiceId(null);
    setServiceForm({ name: "", price: "", duration: "", description: "", image: "", category: CATEGORIES[0] });
    setIsServiceModalOpen(true);
  };
  const openEditServiceModal = (s) => {
    setEditingServiceId(s._id);
    setServiceForm({ name: s.name, price: s.price, duration: s.duration, description: s.description || "", image: s.image || "", category: s.category || CATEGORIES[0] });
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) await serviceAPI.updateService(editingServiceId, serviceForm);
      else await serviceAPI.createService(serviceForm);
      setIsServiceModalOpen(false);
      fetchData();
    } catch (err) { alert("Lỗi khi lưu dịch vụ"); }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Xóa dịch vụ này?")) {
      try {
        await serviceAPI.deleteService(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa dịch vụ"); }
    }
  };

  const openAddLookbookModal = () => {
    setEditingLookbookId(null);
    setLookbookForm({ title: "", image: "", category: "Khách hàng dạo phố", description: "" });
    setIsLookbookModalOpen(true);
  };
  const openEditLookbookModal = (lb) => {
    setEditingLookbookId(lb._id);
    setLookbookForm({ title: lb.title, image: lb.image, category: lb.category || "General", description: lb.description || "" });
    setIsLookbookModalOpen(true);
  };

  const handleLookbookSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLookbookId) await lookbookAPI.updateLookbook(editingLookbookId, lookbookForm);
      else await lookbookAPI.createLookbook(lookbookForm);
      setIsLookbookModalOpen(false);
      fetchData();
    } catch (err) { alert("Lỗi khi lưu Lookbook"); }
  };

  const handleDeleteLookbook = async (id) => {
    if (window.confirm("Xóa ảnh Lookbook này?")) {
      try {
        await lookbookAPI.deleteLookbook(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa Lookbook"); }
    }
  };

  const openAddVoucherModal = () => {
    setEditingVoucherId(null);
    setVoucherForm({ code: "", discountPercent: 10, usageLimit: 100, isActive: true });
    setIsVoucherModalOpen(true);
  };
  const openEditVoucherModal = (v) => {
    setEditingVoucherId(v._id);
    setVoucherForm({ code: v.code, discountPercent: v.discountPercent, usageLimit: v.usageLimit, isActive: v.isActive });
    setIsVoucherModalOpen(true);
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucherId) await voucherAPI.updateVoucher(editingVoucherId, voucherForm);
      else await voucherAPI.createVoucher(voucherForm);
      setIsVoucherModalOpen(false);
      fetchData();
    } catch (err) { alert("Lỗi khi lưu voucher (Mã code có thể bị trùng)"); }
  };

  const handleDeleteVoucher = async (id) => {
    if (window.confirm("Xóa voucher này vĩnh viễn?")) {
      try {
        await voucherAPI.deleteVoucher(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa voucher"); }
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Xóa đánh giá này?")) {
      try {
        await reviewAPI.deleteReview(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa đánh giá"); }
    }
  };

  const handleUpdateAppointment = async (id, newStatus, newPaymentStatus) => {
    try {
      const payload = {};
      if (newStatus) payload.status = newStatus;
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;
      await appointmentAPI.updateAppointment(id, payload);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi cập nhật lịch hẹn";
      alert(msg);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "bg-[#ffb599]/20 text-[#ffb599] border border-[#ffb599]/30";
      case "confirmed": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "completed": return "bg-[#b4c5ff]/20 text-[#b4c5ff] border border-[#b4c5ff]/30";
      case "cancelled": return "bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30";
      default: return "bg-[#282a31] text-[#c3c6d6]";
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin": return "bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30";
      case "barber": return "bg-[#1754cf]/20 text-[#1754cf] border border-[#1754cf]/30";
      default: return "bg-green-500/20 text-green-400 border border-green-500/30";
    }
  };

  // --- Calendar Render Logic ---
  const renderCalendar = () => {
    const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    // Get unique barbers from today's appointments or just general appointments
    // Filtering for today for simplicity
    const todayAppointments = appointments.filter(a => {
      const d = new Date(a.appointmentDate);
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    const barbersMap = new Map();
    todayAppointments.forEach(a => {
      if (a.barberId) {
        barbersMap.set(a.barberId._id, a.barberId.name);
      }
    });

    const uniqueBarbers = Array.from(barbersMap.entries()).map(([id, name]) => ({ id, name }));

    if (uniqueBarbers.length === 0) {
      return <div className="text-center py-20 text-[#c3c6d6]">Không có lịch hẹn nào cho ngày hôm nay.</div>
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex border-b border-[#282a31]">
            <div className="w-32 py-4 px-2 text-center text-[#c3c6d6] text-xs font-bold uppercase shrink-0 sticky left-0 bg-[#111621] z-10 border-r border-[#282a31]">Khung Giờ</div>
            {uniqueBarbers.map(barber => (
              <div key={barber.id} className="flex-1 py-4 px-4 text-center text-white font-bold text-sm border-r border-[#282a31] last:border-0">{barber.name}</div>
            ))}
          </div>
          {/* Time Slots */}
          {hours.map(hour => {
            const [h] = hour.split(':');
            return (
              <div key={hour} className="flex border-b border-[#282a31]/50 group hover:bg-[#282a31]/10">
                <div className="w-32 py-4 text-center text-[#c3c6d6] text-sm shrink-0 sticky left-0 bg-[#111621] z-10 border-r border-[#282a31] font-bold">
                  {hour}
                </div>
                {uniqueBarbers.map(barber => {
                  // Find appointment exactly at this hour
                  const apt = todayAppointments.find(a => {
                    return a.barberId?._id === barber.id && new Date(a.appointmentDate).getHours() === parseInt(h);
                  });

                  return (
                    <div key={barber.id} className="flex-1 p-2 border-r border-[#282a31] last:border-0 relative h-20">
                      {apt && (
                        <div className="absolute inset-2 bg-[#1754cf]/20 border border-[#1754cf]/50 rounded-lg p-2 flex flex-col justify-center overflow-hidden hover:bg-[#1754cf]/30 cursor-pointer transition-colors">
                          <span className="text-white text-xs font-bold truncate">{apt.customerId?.name || "Khách"}</span>
                          <span className={`text-[10px] mt-1 font-bold ${apt.status === 'completed' ? 'text-green-400' : 'text-[#c3c6d6]'}`}>{apt.status}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-[#111621] min-h-screen text-[#e2e2ec] font-sans">
      <aside className="w-64 bg-[#111621] border-r border-[#282a31] flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-[#282a31]">
          <h1 className="text-2xl font-bold font-logo text-white tracking-widest cursor-pointer">The Blue Blade</h1>
          <p className="text-xs font-bold text-[#1754cf] uppercase tracking-[0.2em] mt-1">Admin Portal</p>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarLink label="Quản lý Người dùng" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <SidebarLink label="Quản lý Dịch vụ" active={activeTab === "services"} onClick={() => setActiveTab("services")} />
          <SidebarLink label="Quản lý Lịch hẹn" active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")} />
          <SidebarLink label="Quản lý LookBook" active={activeTab === "lookbooks"} onClick={() => setActiveTab("lookbooks")} />

          <div className="h-[1px] bg-[#282a31] my-4 mx-2"></div>
          <SidebarLink label="Báo cáo KPI" active={activeTab === "kpi"} onClick={() => setActiveTab("kpi")} />

          <div className="h-[1px] bg-[#282a31] my-4 mx-2"></div>
          <div className="px-4 text-[10px] font-bold text-[#c3c6d6] uppercase tracking-widest mb-2">Marketing & CRM</div>
          <SidebarLink label="Khuyến mãi (Voucher)" active={activeTab === "vouchers"} onClick={() => setActiveTab("vouchers")} />
          <SidebarLink label="Đánh giá Dịch vụ" active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
        </nav>
        <div className="p-4 border-t border-[#282a31]">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-[#ffb4ab] font-bold hover:bg-[#ffb4ab]/10 flex items-center gap-3">
            <span></span> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-grow p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white capitalize">
            {activeTab === 'dashboard' ? 'Overview' :
              activeTab === 'users' ? 'Quản lý người dùng' :
                activeTab === 'services' ? 'Quản lý dịch vụ' :
                  activeTab === 'appointments' ? 'Quản lý lịch hẹn' :
                    activeTab === 'kpi' ? 'Báo cáo KPI Nhân sự' :
                      activeTab === 'vouchers' ? 'Chương trình Khuyến mãi' :
                        activeTab === 'reviews' ? 'Phản hồi Khách hàng' : 'Quản lý LookBook (Galley)'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-[#c3c6d6] text-sm">Xin chào, <b className="text-white text-base">{user?.name}</b></span>
            <button onClick={() => navigate("/")} className="px-5 py-2 border border-[#282a31] bg-[#1c2230] rounded-lg hover:bg-[#282a31] text-white font-bold text-sm">Về Website</button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1754cf]"></div></div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">

            {activeTab === "dashboard" && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  <StatCard label="Doanh thu tổng" value={`${Number(stats.totalRevenue).toLocaleString()}đ`} color="text-[#1754cf]" />
                  <StatCard label="Doanh thu hôm nay" value={`${Number(stats.todayRevenue).toLocaleString()}đ`} color="text-green-400" />
                  <StatCard label="Lịch hẹn hôm nay" value={stats.todayAppointments} />
                  <StatCard label="Tổng đơn hàng" value={stats.totalOrders} />
                  <StatCard label="Khách hàng" value={stats.totalCustomers} subtext={`${stats.totalBarbers} Thợ`} />
                  <StatCard label="Dịch vụ" value={stats.totalServices} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 bg-[#1c2230] p-6 rounded-2xl border border-[#282a31] shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                      <span className="text-blue-500"></span> Doanh thu theo tháng
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.revenueByMonth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#282a31" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#c3c6d6', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#c3c6d6', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                          <Tooltip cursor={{ fill: '#282a31' }} contentStyle={{ backgroundColor: '#111621', borderColor: '#282a31', borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#1754cf', fontWeight: 'bold' }} formatter={(value) => [`${Number(value).toLocaleString()}đ`, 'Doanh thu']} />
                          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                            {stats.revenueByMonth.map((entry, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1754cf" : "#434654"} />))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart: Appointment Status */}
                  <div className="bg-[#1c2230] p-6 rounded-2xl border border-[#282a31] shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                      <span className="text-orange-500"></span> Tình trạng lịch hẹn
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.appointmentsByStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {stats.appointmentsByStatus.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.status === 'completed' ? '#22c55e' :
                                    entry.status === 'cancelled' ? '#ef4444' :
                                      entry.status === 'confirmed' ? '#1754cf' : '#f97316'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#111621', borderColor: '#282a31', borderRadius: '8px', border: 'none' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              // (Existing Users View - unchanged UI)
              <div className="bg-[#1c2230] rounded-2xl border border-[#282a31] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#111621]"><tr className="border-b border-[#282a31] text-xs font-bold text-[#c3c6d6] uppercase tracking-wider"><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">Email</th><th className="py-4 px-6">Vai trò</th><th className="py-4 px-6 text-right">Thao tác</th></tr></thead>
                  <tbody>{users.map(u => (
                    <tr key={u._id} className="border-b border-[#282a31]/50 hover:bg-[#282a31]/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{u.name}</td><td className="py-4 px-6 text-[#c3c6d6]">{u.email}</td>
                      <td className="py-4 px-6"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <select className="bg-[#111621] border border-[#282a31] rounded-md p-1.5 outline-none text-[#e2e2ec] font-medium text-sm focus:border-[#1754cf]" value={u.role} onChange={(e) => handleUpdateRole(u._id, e.target.value)}>
                          <option value="customer">Khách hàng</option><option value="barber">Thợ cắt</option><option value="admin">Quản trị</option>
                        </select>
                        <button onClick={() => handleDeleteUser(u._id)} className="text-[#ffb4ab] hover:underline text-sm font-bold">Xóa</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center bg-[#1c2230] p-6 rounded-2xl border border-[#282a31]">
                  <div><h3 className="text-xl font-bold text-white">Danh sách dịch vụ</h3><p className="text-[#c3c6d6] text-sm mt-1">Quản lý các gói cắt và thư giãn</p></div>
                  <button onClick={openAddServiceModal} className="bg-[#1754cf] hover:bg-[#1754cf]/80 text-white px-6 py-3 rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">+ Thêm dịch vụ</button>
                </div>
                {CATEGORIES.map(cat => {
                  const filtered = services.filter(s => (s.category || "Dịch vụ khác") === cat);
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-6">
                      <div className="flex items-center gap-4"><h4 className="text-[#1754cf] font-bold uppercase tracking-widest text-sm bg-[#1c2230] px-4 py-2 rounded-lg border border-[#282a31]">{cat}</h4><div className="h-[1px] flex-grow bg-[#282a31]"></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(s => (
                          <div key={s._id} className="p-5 bg-[#1c2230] rounded-2xl border border-[#282a31] hover:border-[#1754cf]/50 group flex flex-col">
                            {s.image ? <img src={s.image} alt={s.name} className="w-full h-40 object-cover rounded-xl mb-4" /> : <div className="w-full h-40 bg-[#111621] rounded-xl border border-[#282a31] mb-4 flex items-center justify-center text-[#c3c6d6]/30 text-xs font-bold uppercase tracking-widest">No Image</div>}
                            <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3><p className="text-[#c3c6d6] text-sm mb-4 line-clamp-2 flex-grow">{s.description || "Chưa có mô tả..."}</p>
                            <div className="flex justify-between items-center bg-[#111621] border border-[#282a31] p-3 rounded-lg mb-4 mt-auto"><span className="text-[#1754cf] font-bold">{Number(s.price).toLocaleString()}đ</span><span className="text-[#c3c6d6] text-xs font-bold uppercase tracking-wider">⏱ {s.duration} phút</span></div>
                            <div className="flex gap-2"><button onClick={() => openEditServiceModal(s)} className="flex-1 bg-[#282a31] hover:bg-[#434654] text-sm font-bold rounded-lg py-2">Sửa</button><button onClick={() => handleDeleteService(s._id)} className="flex-1 text-[#ffb4ab] bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 text-sm font-bold rounded-lg py-2">Xóa</button></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1c2230] p-6 rounded-2xl border border-[#282a31]">
                  <div>
                    <h3 className="text-xl font-bold text-white">Bộ Lọc Lịch Hẹn</h3>
                    <p className="text-[#c3c6d6] text-sm mt-1">Hôm nay có {appointments.filter(a => new Date(a.appointmentDate).getDate() === new Date().getDate()).length} đơn đặt lịch</p>
                  </div>
                  <div className="flex bg-[#111621] p-1 rounded-lg border border-[#282a31]">
                    <button onClick={() => setIsCalendarView(false)} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${!isCalendarView ? 'bg-[#282a31] text-white' : 'text-[#c3c6d6] hover:text-white'}`}>List View</button>
                    <button onClick={() => setIsCalendarView(true)} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${isCalendarView ? 'bg-[#282a31] text-white' : 'text-[#c3c6d6] hover:text-white'}`}>Calendar View</button>
                  </div>
                </div>

                {!isCalendarView ? (
                  <div className="bg-[#1c2230] rounded-2xl border border-[#282a31] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#111621]"><tr className="border-b border-[#282a31] text-xs font-bold text-[#c3c6d6] uppercase tracking-wider"><th className="py-4 px-6">Thời gian</th><th className="py-4 px-6">Khách hàng & Barber</th><th className="py-4 px-6">Dịch vụ</th><th className="py-4 px-6">Lịch hẹn</th><th className="py-4 px-6">Thanh toán</th><th className="py-4 px-6 text-right">Thao tác</th></tr></thead>
                      <tbody>{appointments.map(a => (
                        <tr key={a._id} className="border-b border-[#282a31]/50 hover:bg-[#282a31]/30 transition-colors">
                          <td className="py-4 px-6"><div className="text-white font-bold text-sm">{new Date(a.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div><div className="text-[#c3c6d6] text-xs">{new Date(a.appointmentDate).toLocaleDateString('vi-VN')}</div></td>
                          <td className="py-4 px-6"><div className="text-base font-bold text-white mb-1">{a.customerId?.name || "Khách Vãng Lai"}</div><div className="text-xs text-[#c3c6d6] uppercase tracking-wider font-bold">Thợ: <span className="text-[#1754cf]">{a.barberId?.name || "Chưa rỏ"}</span></div></td>
                          <td className="py-4 px-6"><div className="text-sm font-bold text-[#e2e2ec] mb-1">{a.serviceId?.name || "Gói cơ bản"}</div><div className="text-xs text-[#1754cf] font-bold">{Number(a.totalPrice || 0).toLocaleString()}đ</div></td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${getStatusBadge(a.status)}`}>{a.status}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-xs font-bold ${a.paymentStatus === 'paid' ? 'text-green-400' : a.paymentStatus === 'cancelled' ? 'text-red-400' : 'text-orange-400'}`}>
                              {a.paymentStatus === 'paid' ? '✅ Đã TT' : a.paymentStatus === 'cancelled' ? '❌ Hủy' : '⏳ Chưa TT'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-2 justify-end flex-wrap">
                              <select className="bg-[#111621] border border-[#282a31] rounded-md p-1.5 outline-none text-[#e2e2ec] font-bold text-xs uppercase tracking-wider focus:border-[#1754cf]" value={a.status} onChange={(e) => handleUpdateAppointment(a._id, e.target.value, null)}>
                                <option value="pending">Chờ XN</option><option value="confirmed">Đã CF</option><option value="completed">Hoàn Tất</option><option value="cancelled">Đã Hủy</option>
                              </select>
                              <select className="bg-[#111621] border border-[#282a31] rounded-md p-1.5 outline-none font-bold text-xs focus:border-green-500" value={a.paymentStatus || 'pending'} onChange={(e) => handleUpdateAppointment(a._id, null, e.target.value)}>
                                <option value="pending">Chưa TT</option>
                                <option value="paid">Đã TT</option>
                                <option value="cancelled">Hủy TT</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-[#1c2230] rounded-2xl border border-[#282a31] p-6 shadow-sm">
                    <h4 className="text-white font-bold text-lg mb-6">Lịch Hẹn Hôm Nay - Ngày {new Date().toLocaleDateString('vi-VN')}</h4>
                    {renderCalendar()}
                  </div>
                )}
              </div>
            )}

            {/* KPI TAB */}
            {activeTab === "kpi" && (
              <div className="space-y-6">
                <div className="bg-[#1754cf]/10 border border-[#1754cf]/30 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1754cf] mb-1">Hiệu Suất Nội Bộ Barber</h3>
                    <p className="text-[#c3c6d6] text-sm">Bảng vinh danh và thống kê doanh số do các Barber trực tiếp thực hiện, dựa trên các lịch hẹn đã <b className="text-white">Hoàn Tất</b>.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{barberStats.filter(b => b.completedAppointments > 0).length}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#1754cf]">Thợ đang chạy kpi</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {barberStats.map((barber, index) => (
                    <div key={barber._id} className="relative bg-[#1c2230] border border-[#282a31] p-6 rounded-2xl overflow-hidden hover:border-[#1754cf]/50 transition-colors group">
                      {index === 0 && <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">Ngôi Sao Tháng</div>}
                      <div className="flex items-center gap-4 mb-6">
                        {barber.profileImage ? (
                          <img src={barber.profileImage} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#282a31] group-hover:border-[#1754cf] transition-colors" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#111621] border-2 border-[#282a31] flex items-center justify-center text-xl font-bold text-[#1754cf]">
                            {barber.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-white">{barber.name}</h4>
                          <p className="text-xs font-bold text-[#c3c6d6] uppercase tracking-wider">{barber.specialty || "Master Barber"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#111621] p-3 rounded-xl border border-[#282a31]">
                          <span className="text-xs font-bold text-[#c3c6d6] uppercase tracking-wider">Số ca hoàn thành</span>
                          <span className="text-lg font-bold text-white">{barber.completedAppointments}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#111621] p-3 rounded-xl border border-[rgba(23,84,207,0.3)] bg-[rgba(23,84,207,0.05)]">
                          <span className="text-xs font-bold text-[#1754cf] uppercase tracking-wider">Doanh thu tạo ra</span>
                          <span className="text-lg font-bold text-[#1754cf]">{Number(barber.totalRevenue).toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOOKBOOK GALLERY TAB */}
            {activeTab === "lookbooks" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-[#1c2230] p-6 rounded-2xl border border-[#282a31]">
                  <div>
                    <h3 className="text-xl font-bold text-white">Phòng Trưng Bày (LookBook)</h3>
                    <p className="text-[#c3c6d6] text-sm mt-1">Cập nhật kiểu tóc nổi bật để khách hàng tham khảo trên Trang Chủ.</p>
                  </div>
                  <button onClick={openAddLookbookModal} className="bg-[#1754cf] hover:bg-[#1754cf]/80 text-white px-6 py-3 rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">+ Thêm Ảnh Mới</button>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                  {lookbooks.map(lb => (
                    <div key={lb._id} className="break-inside-avoid relative group rounded-2xl overflow-hidden border border-[#282a31]">
                      <img src={lb.image} alt={lb.title} className="w-full object-cover bg-[#1c2230] min-h-[200px]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                        <span className="text-[#1754cf] text-xs font-bold uppercase tracking-widest mb-1">{lb.category}</span>
                        <h4 className="text-white font-bold text-lg leading-tight mb-2">{lb.title}</h4>
                        <p className="text-[#c3c6d6] text-xs line-clamp-2 mb-4">{lb.description}</p>
                        <div className="flex gap-2">
                          <button onClick={() => openEditLookbookModal(lb)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded uppercase tracking-widest backdrop-blur-sm">Sửa</button>
                          <button onClick={() => handleDeleteLookbook(lb._id)} className="flex-1 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold py-2 rounded uppercase tracking-widest backdrop-blur-sm">Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {lookbooks.length === 0 && (
                  <div className="text-center py-20 bg-[#1c2230] border border-[#282a31] rounded-2xl border-dashed">
                    <span className="text-4xl block mb-4">📸</span>
                    <p className="text-[#c3c6d6] font-bold">Chưa có ảnh LookBook nào được đăng.</p>
                  </div>
                )}
              </div>
            )}

            {/* VOUCHERS TAB */}
            {activeTab === "vouchers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1c2230] p-6 rounded-2xl border border-[#282a31]">
                  <div>
                    <h3 className="text-xl font-bold text-white">Quản lý Voucher Khuyến mãi</h3>
                    <p className="text-[#c3c6d6] text-sm mt-1">Hệ thống tạo mã giảm giá tự động kích cầu nội bộ.</p>
                  </div>
                  <button onClick={openAddVoucherModal} className="bg-[#1754cf] hover:bg-[#1754cf]/80 text-white px-6 py-3 rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">+ Tạo Voucher Mới</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vouchers.map(v => (
                    <div key={v._id} className="relative bg-[#1c2230] rounded-2xl border border-[#282a31] p-6 hover:border-[#1754cf]/50 transition-colors group overflow-hidden">
                      {!v.isActive && <div className="absolute inset-0 bg-[#111621]/80 backdrop-blur-[2px] z-10 flex items-center justify-center"><span className="text-[#ffb4ab] font-bold uppercase tracking-widest border-2 border-[#ffb4ab] px-4 py-2 rounded-lg rotate-12 bg-[#111621]">Đã vô hiệu hóa</span></div>}
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#1754cf]/10 border border-[#1754cf]/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="text-xl">🏷️</span>
                          <span className="text-[#1754cf] font-bold text-lg uppercase tracking-widest">{v.code}</span>
                        </div>
                        <span className="text-2xl font-bold text-green-400">-{v.discountPercent}%</span>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm"><span className="text-[#c3c6d6]">Lượt khả dụng:</span><span className="text-white font-bold">{v.usageLimit - v.usedCount} lượt</span></div>
                        <div className="flex justify-between text-sm"><span className="text-[#c3c6d6]">Đã dùng:</span><span className="text-[#1754cf] font-bold">{v.usedCount} lượt</span></div>
                      </div>
                      <div className="flex gap-2 relative z-20">
                        <button onClick={() => openEditVoucherModal(v)} className="flex-1 bg-[#282a31] hover:bg-[#434654] text-white text-sm font-bold py-2 rounded-lg transition-colors">Sửa</button>
                        <button onClick={() => handleDeleteVoucher(v._id)} className="flex-1 text-[#ffb4ab] bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 text-sm font-bold py-2 rounded-lg transition-colors">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="bg-[#1c2230] p-6 rounded-2xl border border-[#282a31]">
                  <h3 className="text-xl font-bold text-white">Đánh Giá Dịch Vụ Từ Khách Hàng</h3>
                  <p className="text-[#c3c6d6] text-sm mt-1">Phản hồi của khách để cải thiện chất lượng của thợ cắt.</p>
                </div>

                <div className="bg-[#1c2230] rounded-2xl border border-[#282a31] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#111621]"><tr className="border-b border-[#282a31] text-xs font-bold text-[#c3c6d6] uppercase tracking-wider"><th className="py-4 px-6">Thợ được Review</th><th className="py-4 px-6">Tài khoản Khách</th><th className="py-4 px-6">Đánh giá & Bình luận</th><th className="py-4 px-6 text-right">Quản trị</th></tr></thead>
                    <tbody>
                      {reviews.map(r => (
                        <tr key={r._id} className="border-b border-[#282a31]/50 hover:bg-[#282a31]/30 transition-colors align-top">
                          <td className="py-4 px-6"><div className="font-bold text-[#1754cf]">{r.barberId?.name || "N/A"}</div><div className="text-[10px] text-[#c3c6d6]">{new Date(r.createdAt).toLocaleDateString()}</div></td>
                          <td className="py-4 px-6 font-bold text-white">{r.customerId?.name || "Khách"}</td>
                          <td className="py-4 px-6">
                            <div className="text-yellow-400 mb-1">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                            <p className="text-sm text-[#c3c6d6] max-w-md italic">{r.comment || "(Không để lại bình luận)"}</p>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={() => handleDeleteReview(r._id)} className="text-[#ffb4ab] hover:underline text-sm font-bold">Xóa vi phạm</button>
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr><td colSpan="4" className="py-10 text-center text-[#c3c6d6]">Chưa có đánh giá nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c2230] w-full max-w-xl rounded-2xl shadow-2xl border border-[#282a31] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#282a31] flex justify-between items-center bg-[#111621]">
              <h3 className="text-xl font-bold text-white tracking-wide">{editingServiceId ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-[#c3c6d6] hover:text-white text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleServiceSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Tên dịch vụ</label>
                <input required type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Danh mục</label>
                <select className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Giá (VND)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Thời gian (phút)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} />
                </div>
              </div>
              <div><label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">URL Hình ảnh</label><input type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl" value={serviceForm.image} onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Mô tả</label><textarea rows="3" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}></textarea></div>
              <div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-3 bg-[#282a31] hover:bg-[#33343c] text-white rounded-xl font-bold">Hủy</button><button type="submit" className="flex-1 py-3 bg-[#1754cf] text-white rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">Lưu lại</button></div>
            </form>
          </div>
        </div>
      )}

      {/* LOOKBOOK MODAL */}
      {isLookbookModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c2230] w-full max-w-xl rounded-2xl shadow-2xl border border-[#282a31] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#282a31] flex justify-between items-center bg-[#111621]">
              <h3 className="text-xl font-bold text-white tracking-wide">{editingLookbookId ? "Chỉnh sửa LookBook" : "Thêm ảnh LookBook"}</h3>
              <button onClick={() => setIsLookbookModalOpen(false)} className="text-[#c3c6d6] hover:text-white text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleLookbookSubmit} className="p-6 space-y-5">
              {lookbookForm.image && (
                <div className="bg-[#111621] rounded-xl p-2 border border-[#282a31] mb-2">
                  <img src={lookbookForm.image} className="w-full h-40 object-cover rounded-lg" alt="Preview" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Tiêu đề / Tên kiểu tóc</label>
                <input required type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={lookbookForm.title} onChange={(e) => setLookbookForm({ ...lookbookForm, title: e.target.value })} placeholder="Undercut Hiện Đại..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Danh mục Phong cách</label>
                  <input type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={lookbookForm.category} onChange={(e) => setLookbookForm({ ...lookbookForm, category: e.target.value })} placeholder="VD: Gốc Tóc Xanh..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Link Ảnh Trực Tiếp</label>
                  <input required type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={lookbookForm.image} onChange={(e) => setLookbookForm({ ...lookbookForm, image: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div><label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Cảm hứng / Thông tin thêm</label><textarea rows="3" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl" value={lookbookForm.description} onChange={(e) => setLookbookForm({ ...lookbookForm, description: e.target.value })} placeholder="Chi tiết..."></textarea></div>
              <div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsLookbookModalOpen(false)} className="flex-1 py-3 bg-[#282a31] hover:bg-[#33343c] text-white rounded-xl font-bold">Hủy</button><button type="submit" className="flex-1 py-3 bg-[#1754cf] text-white rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">Đăng Tải</button></div>
            </form>
          </div>
        </div>
      )}

      {/* VOUCHER MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c2230] w-full max-w-md rounded-2xl shadow-2xl border border-[#282a31] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#282a31] flex justify-between items-center bg-[#111621]">
              <h3 className="text-xl font-bold text-white tracking-wide">{editingVoucherId ? "Cập nhật Voucher" : "Tạo Mã Mới"}</h3>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-[#c3c6d6] hover:text-white text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleVoucherSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Mã Khuyến Mãi (Mã Code)</label>
                <input required type="text" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf] uppercase font-bold tracking-widest" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} placeholder="SALE50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Mức Giảm (%)</label>
                  <input required type="number" min="1" max="100" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={voucherForm.discountPercent} onChange={(e) => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c3c6d6] uppercase tracking-wider mb-2">Số Lượng Tối Đa</label>
                  <input required type="number" min="1" className="w-full px-4 py-3 bg-[#111621] border border-[#282a31] text-white rounded-xl outline-none focus:border-[#1754cf]" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#111621] border border-[#282a31] p-4 rounded-xl cursor-pointer" onClick={() => setVoucherForm({ ...voucherForm, isActive: !voucherForm.isActive })}>
                <div className={`w-5 h-5 rounded border ${voucherForm.isActive ? 'bg-[#1754cf] border-[#1754cf]' : 'border-[#434654]'} flex items-center justify-center`}>
                  {voucherForm.isActive && <span className="text-white text-xs">✓</span>}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Cho phép sử dụng mã này</div>
                  <div className="text-[10px] text-[#c3c6d6]">Bật để khách hàng có thể áp dụng mã lúc đặt lịch.</div>
                </div>
              </div>

              <div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsVoucherModalOpen(false)} className="flex-1 py-3 bg-[#282a31] hover:bg-[#33343c] text-white rounded-xl font-bold">Hủy</button><button type="submit" className="flex-1 py-3 bg-[#1754cf] text-white rounded-xl font-bold shadow-[0_5px_15px_rgba(23,84,207,0.3)]">Phát Hành Của Hàng</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 border ${active ? "bg-[#1c2230] text-white border-[#1754cf] shadow-[0_5px_15px_rgba(23,84,207,0.15)]" : "bg-transparent text-[#c3c6d6] border-transparent hover:bg-[#1c2230] hover:text-white"}`} >
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-[15px]">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1754cf]"></div>}
    </button>
  );
}

function StatCard({ label, value, subtext, color = "text-white" }) {
  return (
    <div className="bg-[#1c2230] p-5 rounded-2xl border border-[#282a31] flex flex-col gap-2 group relative overflow-hidden hover:border-[#1754cf]/50 transition-colors shadow-sm">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#1754cf]/5 blur-[35px] rounded-full group-hover:bg-[#1754cf]/10 transition-colors pointer-events-none"></div>
      <span className="text-[10px] font-bold text-[#c3c6d6] uppercase tracking-widest z-10">{label}</span>
      <div className="flex items-baseline gap-2 z-10">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {subtext && <span className="text-[10px] text-[#c3c6d6] font-medium grow text-right">{subtext}</span>}
      </div>
    </div>
  );
}

export default AdminDashboard;
