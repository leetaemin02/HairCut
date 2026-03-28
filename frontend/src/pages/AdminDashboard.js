import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, serviceAPI, appointmentAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const CATEGORIES = ["Cắt tóc", "Thư giãn", "Hóa chất", "Dịch vụ khác"];

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalOrders: 0,
    revenueByMonth: []
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Modal State
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
    setServiceForm({
      name: s.name,
      price: s.price,
      duration: s.duration,
      description: s.description || "",
      image: s.image || "",
      category: s.category || CATEGORIES[0]
    });
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await serviceAPI.updateService(editingServiceId, serviceForm);
      } else {
        await serviceAPI.createService(serviceForm);
      }
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

  const handleUpdateAppointment = async (id, newStatus) => {
    try {
      await appointmentAPI.updateAppointment(id, { status: newStatus });
      fetchData();
    } catch (err) { alert("Lỗi cập nhật lịch hẹn"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-[#1E293B] flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Blue Blade<br /><span className="text-blue-400">Admin</span></h1>
        </div>
        <nav className="flex-grow px-4 space-y-2">
          <SidebarLink icon="📊" label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarLink icon="👥" label="Quản lý người dùng" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <SidebarLink icon="✂️" label="Quản lý dịch vụ" active={activeTab === "services"} onClick={() => setActiveTab("services")} />
          <SidebarLink icon="📅" label="Quản lý lịch hẹn" active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")} />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-3"><span>🚪</span> Đăng xuất</button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto bg-white p-10">
        <header className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-900 capitalize text-black">
            {activeTab === 'dashboard' ? 'Dashboard Tổng Quan' :
              activeTab === 'users' ? 'Quản lý người dùng' :
                activeTab === 'services' ? 'Quản lý dịch vụ' : 'Quản lý lịch hẹn'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Xin chào, <b className="text-black">{user?.name}</b></span>
            <button onClick={() => navigate("/")} className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors text-black font-medium">Về Website</button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="space-y-8">
            {activeTab === "dashboard" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Tổng doanh thu" value={`${Number(stats.totalRevenue).toLocaleString()}đ`} />
                  <StatCard label="Tổng đơn hàng" value={stats.totalOrders} />
                  <StatCard label="Người dùng" value={stats.totalUsers} />
                  <StatCard label="Dịch vụ" value={stats.totalServices} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
                  <h3 className="text-xl font-bold mb-6 text-slate-800">Doanh thu theo tháng</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${Number(value).toLocaleString()}đ`, 'Doanh thu']} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                          {stats.revenueByMonth.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#6366f1"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-black text-black">
                <table className="w-full text-left">
                  <thead className="bg-slate-50"><tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider"><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">Email</th><th className="py-4 px-6">Vai trò</th><th className="py-4 px-6 text-right">Thao tác</th></tr></thead>
                  <tbody>{users.map(u => (
                    <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-700">{u.name}</td>
                      <td className="py-4 px-6 text-slate-600">{u.email}</td>
                      <td className="py-4 px-6"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'barber' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{u.role}</span></td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <select className="bg-white border text-sm rounded-md p-1 outline-none text-black" value={u.role} onChange={(e) => handleUpdateRole(u._id, e.target.value)}>
                          <option value="customer">Khách hàng</option><option value="barber">Thợ cắt</option><option value="admin">Quản trị</option>
                        </select>
                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:underline text-sm font-medium text-black">Xóa</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Danh sách dịch vụ</h3>
                  <button onClick={openAddServiceModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    + Thêm dịch vụ
                  </button>
                </div>

                {/* Grouping by Category */}
                {CATEGORIES.map(cat => {
                  const filtered = services.filter(s => (s.category || "Dịch vụ khác") === cat);
                  if (filtered.length === 0 && activeTab === 'services') return null;
                  return (
                    <div key={cat} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h4 className="text-lg font-bold text-slate-700 min-w-max uppercase tracking-widest text-sm">{cat}</h4>
                        <div className="h-[1px] w-full bg-slate-100"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(s => (
                          <div key={s._id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-black group hover:shadow-md transition-shadow relative text-black">
                            {s.image && <img src={s.image} alt={s.name} className="w-full h-40 object-cover rounded-xl mb-4" />}
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{s.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{s.description}</p>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mb-4">
                              <span className="text-blue-600 font-bold">{Number(s.price).toLocaleString()}đ</span>
                              <span className="text-slate-400 text-sm">⏱ {s.duration} phút</span>
                            </div>
                            <div className="flex justify-end gap-4 border-t border-slate-50 pt-4">
                              <button onClick={() => openEditServiceModal(s)} className="text-blue-500 hover:text-blue-700 text-sm font-bold text-black border-slate-100 border-2 rounded-lg p-2">Chỉnh sửa</button>
                              <button onClick={() => handleDeleteService(s._id)} className="text-red-500 hover:text-red-700 text-sm font-bold text-black border-slate-100 border-2 rounded-lg p-2">Xóa</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-black text-black">
                <table className="w-full text-left text-black">
                  <thead className="bg-slate-50"><tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-black"><th className="py-4 px-6 text-black">Ngày đặt</th><th className="py-4 px-6 text-black">Khách hàng</th><th className="py-4 px-6 text-black">Dịch vụ</th><th className="py-4 px-6 text-black">Trạng thái</th><th className="py-4 px-6 text-right text-black">Cập nhật</th></tr></thead>
                  <tbody>{appointments.map(a => (
                    <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-600">{new Date(a.appointmentDate).toLocaleString('vi-VN')}</td>
                      <td className="py-4 px-6 font-medium text-slate-700">{a.customerId?.name}</td>
                      <td className="py-4 px-6 text-slate-600">{a.serviceId?.name}</td>
                      <td className="py-4 px-6"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : a.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : a.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{a.status}</span></td>
                      <td className="py-4 px-6 text-right">
                        <select className="bg-white border text-sm rounded-md p-1 outline-none text-black" value={a.status} onChange={(e) => handleUpdateAppointment(a._id, e.target.value)}>
                          <option value="pending">Chờ xn</option><option value="confirmed">Đã confirm</option><option value="completed">Hoàn tất</option>
                        </select>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-black">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingServiceId ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên dịch vụ</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Danh mục</label>
                <select className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Giá (VND)</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Thời gian (phút)</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">URL Hình ảnh</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.image} onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả</label>
                <textarea rows="3" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold hover:bg-slate-50 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`} >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-[16px]">{label}</span>
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default AdminDashboard;
