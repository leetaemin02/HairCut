import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { appointmentAPI } from "../services/api";

function ProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Tab management
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") || "profile";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get("tab");
        if (tab) setActiveTab(tab);
    }, [location.search]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        navigate(`/profile?tab=${tab}`, { replace: true });
    };

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const [availableVouchers, setAvailableVouchers] = useState([]);

    const fetchUserVouchers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/vouchers/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                
                // Map the DB formats to match our UI mapping
                const mappedVouchers = data.map(v => {
                    let typeText = v.type || "DISCOUNT";
                    let expiryText = v.expiryDate 
                        ? `HSD: ${new Date(v.expiryDate).toLocaleDateString('vi-VN')}` 
                        : "Vĩnh viễn";

                    // Determine "new" flag if created within 7 days
                    let isNew = false;
                    if (v.createdAt) {
                        const created = new Date(v.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now - created);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        isNew = diffDays <= 7;
                    }

                    return {
                        id: v._id,
                        type: typeText,
                        code: v.code,
                        title: v.title || `Giảm ${v.discountPercent}%`,
                        desc: v.description || `Mã giảm ${v.discountPercent}% cho hóa đơn của bạn.`,
                        expiry: expiryText,
                        isNew: isNew
                    };
                });
                
                setAvailableVouchers(mappedVouchers);
            }
        } catch (err) {
            console.error("Error loading user vouchers:", err);
        }
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        fetchUserProfile();
        fetchAppointments();
        fetchUserVouchers();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, statusFilter]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                });
            } else {
                setError("Failed to load profile");
            }
        } catch (err) {
            setError("Error loading profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/appointments", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (err) {
            console.error("Error loading appointments:", err);
        }
    };

    const filterAppointments = () => {
        if (statusFilter === "all") {
            setFilteredAppointments(appointments);
        } else if (statusFilter === "upcoming") {
            const now = new Date();
            setFilteredAppointments(
                appointments.filter(
                    (apt) =>
                        new Date(apt.appointmentDate) > now &&
                        apt.status !== "cancelled" &&
                        apt.status !== "completed"
                )
            );
        } else {
            setFilteredAppointments(
                appointments.filter((apt) => apt.status === statusFilter)
            );
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setIsEditing(false);
                setSuccessMessage("Cập nhật thông tin thành công!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setError("Failed to update profile");
            }
        } catch (err) {
            setError("Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
        });
        setIsEditing(false);
        setError("");
    };

    const confirmCancelAppointment = (appointment) => {
        setAppointmentToCancel(appointment);
        setShowCancelDialog(true);
    };

    const handleCancelAppointment = async () => {
        if (!appointmentToCancel) return;

        setCancelling(true);
        try {
            await appointmentAPI.cancelAppointment(appointmentToCancel._id);
            setSuccessMessage("Đã hủy lịch hẹn thành công");
            setShowCancelDialog(false);
            setAppointmentToCancel(null);
            fetchAppointments();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError("Failed to cancel appointment");
            setTimeout(() => setError(""), 3000);
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "bg-green-500/10 text-green-400 border-green-500/30";
            case "pending":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case "completed":
                return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            case "cancelled":
                return "bg-red-500/10 text-red-400 border-red-500/30";
            default:
                return "bg-gray-500/10 text-gray-400 border-gray-500/30";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setSuccessMessage("Đã sao chép mã: " + code);
        setTimeout(() => setSuccessMessage(""), 2000);
    };

    if (loading) {
        return (
            <div className="bg-[#111621] min-h-screen text-[#e2e2ec] font-sans">
                <Header user={user} />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-white text-xl animate-pulse tracking-widest uppercase">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#111621] min-h-screen text-[#c3c6d6] font-sans selection:bg-[#1754cf]/30 selection:text-white">
            <Header user={user} />

            <main className="container mx-auto px-4 py-12 sm:px-6 md:px-10 lg:px-20">

                {/* Status Messages */}
                {successMessage && (
                    <div className="fixed top-24 right-10 z-50 p-4 bg-[#1c2230] border-l-4 border-emerald-500 rounded-r-xl text-emerald-400  animate-fade-in flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="font-medium tracking-wide">{successMessage}</span>
                    </div>
                )}
                {error && (
                    <div className="fixed top-24 right-10 z-50 p-4 bg-[#1c2230] border-l-4 border-rose-500 rounded-r-xl text-rose-400  animate-fade-in flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        <span className="font-medium tracking-wide">{error}</span>
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8  relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1754cf]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1754cf] to-[#0a235c] flex items-center justify-center text-white text-5xl font-bold  ring-4 ring-[#282a31] shrink-0 relative z-10">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2 font-serif">{user?.name}</h1>
                        <p className="text-[#a7b7ed] font-medium mb-4">{user?.email}</p>
                        <div className="inline-block px-4 py-1 bg-[#1754cf]/20 border border-[#1754cf]/30 rounded-full text-[#b4c5ff] text-xs font-bold uppercase tracking-widest shadow-inner">
                            {user?.role} Account
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl p-4  sticky top-28 space-y-2">
                            <button
                                onClick={() => switchTab("profile")}
                                className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 flex items-center gap-4 ${activeTab === 'profile' ? 'bg-[#1754cf] text-white  shadow-[#1754cf]/20' : 'text-[#c3c6d6] hover:bg-[#232a3a] hover:text-white'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span className="font-semibold tracking-wide text-sm">Hồ Sơ Cá Nhân</span>
                            </button>

                            <button
                                onClick={() => switchTab("history")}
                                className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 flex items-center gap-4 ${activeTab === 'history' ? 'bg-[#1754cf] text-white  shadow-[#1754cf]/20' : 'text-[#c3c6d6] hover:bg-[#232a3a] hover:text-white'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className="font-semibold tracking-wide text-sm">Lịch Sử Cắt Tóc</span>
                            </button>

                            <button
                                onClick={() => switchTab("voucher")}
                                className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 flex items-center justify-between gap-4 ${activeTab === 'voucher' ? 'bg-[#1754cf] text-white  shadow-[#1754cf]/20' : 'text-[#c3c6d6] hover:bg-[#232a3a] hover:text-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="font-semibold tracking-wide text-sm">Ví Voucher</span>
                                </div>
                                {availableVouchers.length > 0 && (
                                    <span className="bg-amber-500 text-[#111621] text-[10px] px-2.5 py-1 rounded-full font-black uppercase ">
                                        {availableVouchers.length} Mã
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        {/* TAB 1: PROFILE INFO */}
                        {activeTab === "profile" && (
                            <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl p-8  animate-fade-in relative">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#282a31]">
                                    <h2 className="text-[12px] sm:text-sm font-bold tracking-[0.2em] text-[#1754cf] uppercase">Thông tin chi tiết</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2.5 bg-[#1754cf] hover:bg-[#1349b8] text-white text-sm font-bold tracking-wide rounded-lg transition-colors border border-[#1754cf]/50 box- hover:shadow-[0_0_15px_rgba(23,84,207,0.4)]"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a7b7ed] uppercase tracking-widest pl-1">Họ Tên</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-[#111621] border border-[#282a31] rounded-xl text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a7b7ed] uppercase tracking-widest pl-1">Email <span className="text-white/30 truncate lowercase normal-case">(Cố định)</span></label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full px-5 py-4 bg-[#111621]/50 border border-transparent rounded-xl text-white/30 cursor-not-allowed font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a7b7ed] uppercase tracking-widest pl-1">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-[#111621] border border-[#282a31] rounded-xl text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-[#a7b7ed] uppercase tracking-widest pl-1">Địa chỉ</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-5 py-4 bg-[#111621] border border-[#282a31] rounded-xl text-white focus:outline-none focus:border-[#1754cf] focus:ring-1 focus:ring-[#1754cf] transition-all resize-none font-medium"
                                                    placeholder="Nhập địa chỉ của bạn"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6 mt-8 border-t border-[#282a31]">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-8 py-3 bg-[#1754cf] hover:bg-[#1349b8] border border-[#1754cf]/50 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(23,84,207,0.3)] min-w-[150px]"
                                            >
                                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                                className="px-8 py-3 bg-[#111621] hover:bg-[#282a31] border border-[#282a31] text-white font-bold rounded-lg transition-all"
                                            >
                                                Hủy bỏ
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
                                        <div className="bg-[#111621] p-6 rounded-xl border border-[#282a31] group hover:border-[#1754cf]/30 transition-colors">
                                            <p className="text-[10px] text-[#1754cf] uppercase tracking-widest font-bold mb-2">Họ Tên</p>
                                            <p className="text-lg text-white font-serif">{user?.name}</p>
                                        </div>
                                        <div className="bg-[#111621] p-6 rounded-xl border border-[#282a31] group hover:border-[#1754cf]/30 transition-colors">
                                            <p className="text-[10px] text-[#1754cf] uppercase tracking-widest font-bold mb-2">Email</p>
                                            <p className="text-lg text-white font-medium break-all">{user?.email}</p>
                                        </div>
                                        <div className="bg-[#111621] p-6 rounded-xl border border-[#282a31] group hover:border-[#1754cf]/30 transition-colors">
                                            <p className="text-[10px] text-[#1754cf] uppercase tracking-widest font-bold mb-2">Số điện thoại</p>
                                            <p className="text-lg text-white font-medium">{user?.phone || "Chưa cập nhật"}</p>
                                        </div>
                                        <div className="bg-[#111621] p-6 rounded-xl border border-[#282a31] group hover:border-[#1754cf]/30 transition-colors">
                                            <p className="text-[10px] text-[#1754cf] uppercase tracking-widest font-bold mb-2">Địa chỉ</p>
                                            <p className="text-lg text-white font-medium leading-relaxed">
                                                {user?.address || "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: HISTORY INFO */}
                        {activeTab === "history" && (
                            <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl p-8  animate-fade-in relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-[#282a31] gap-6">
                                    <h2 className="text-[12px] sm:text-sm font-bold tracking-[0.2em] text-[#1754cf] uppercase">Quản lý lịch hẹn</h2>

                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: "all", label: "Tất cả" },
                                            { id: "upcoming", label: "Sắp diễn ra" },
                                            { id: "completed", label: "Đã xong" }
                                        ].map(
                                            (filter) => (
                                                <button
                                                    key={filter.id}
                                                    onClick={() => setStatusFilter(filter.id)}
                                                    className={`px-4 py-2 rounded-lg text-xs tracking-widest uppercase font-bold transition-all border ${statusFilter === filter.id
                                                        ? "bg-[#1754cf] text-white border-[#1754cf]"
                                                        : "bg-[#111621] text-[#c3c6d6] border-[#282a31] hover:bg-[#282a31] hover:text-white"
                                                        }`}
                                                >
                                                    {filter.label}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {filteredAppointments.length === 0 ? (
                                        <div className="text-center py-20 bg-[#111621] rounded-2xl border border-[#282a31] border-dashed">
                                            <div className="w-16 h-16 rounded-full bg-[#1c2230] text-[#1754cf] flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            </div>
                                            <div className="text-white text-lg font-serif mb-6">Trống trơn. Bạn chưa có lịch hẹn nào.</div>
                                            <button
                                                onClick={() => navigate("/appointments")}
                                                className="px-8 py-3 bg-[#1754cf] hover:bg-[#1349b8] text-white text-sm tracking-wide font-bold rounded-lg transition-all border border-[#1754cf]/50 hover:shadow-[0_0_15px_rgba(23,84,207,0.4)]"
                                            >
                                                + Đặt lịch cắt tóc ngay
                                            </button>
                                        </div>
                                    ) : (
                                        filteredAppointments.map((appointment) => (
                                            <div
                                                key={appointment._id}
                                                className="bg-[#111621] border border-[#282a31] rounded-xl p-6 hover:border-[#1754cf]/50 transition-all duration-300 group shadow-md"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-[#1c2230] text-[#1754cf] flex items-center justify-center border border-[#282a31] group-hover:border-[#1754cf]/50 transition-colors">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-serif font-bold text-white mb-0.5">
                                                                        {appointment.serviceId?.name}
                                                                    </h3>
                                                                    <div className="text-[#a7b7ed] font-medium text-sm">{Number(appointment.totalPrice).toLocaleString('vi-VN')} VNĐ</div>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(appointment.status)}`}>
                                                                {appointment.status === 'confirmed' ? 'Đã duyệt' : appointment.status === 'completed' ? 'Thành công' : appointment.status === 'cancelled' ? 'Hủy bỏ' : appointment.status}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#1c2230] rounded-lg p-4 border border-[#282a31]">
                                                            <div className="flex items-center gap-3 text-[#c3c6d6]">
                                                                <svg className="w-4 h-4 text-[#1754cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                <span className="font-medium tracking-wide">{formatDate(appointment.appointmentDate)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[#c3c6d6]">
                                                                <svg className="w-4 h-4 text-[#1754cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                                <span className="font-medium tracking-wide">Craftsman: <span className="text-white">{appointment.barberId?.name}</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 min-w-[150px]">
                                                        {appointment.status === "confirmed" && appointment.paymentStatus !== "paid" && (
                                                            <button
                                                                onClick={() => navigate("/payment", { state: { appointment } })}
                                                                className="px-5 py-2.5 font-bold text-xs uppercase tracking-widest text-white rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-yellow-500/50"
                                                            >
                                                                Thanh toán VNPay
                                                            </button>
                                                        )}

                                                        {appointment.paymentStatus === "paid" && (
                                                            <div className="px-5 py-2.5 text-center text-xs uppercase tracking-widest font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                                                Đã Thanh Toán
                                                            </div>
                                                        )}

                                                        {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                                            <button
                                                                onClick={() => confirmCancelAppointment(appointment)}
                                                                className="px-5 py-2.5 border border-[#282a31] hover:border-rose-500/50 bg-[#1c2230] hover:bg-rose-500/10 text-[#c3c6d6] hover:text-rose-400 text-xs uppercase tracking-widest font-bold rounded-lg transition-all"
                                                            >
                                                                Hủy Lịch
                                                            </button>
                                                        )}

                                                        {appointment.qrCode && appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                                            <div className="mt-2 text-center bg-white p-2 rounded-xl inline-block mx-auto border border-[#282a31]">
                                                                <img src={appointment.qrCode} alt="QR Code" className="w-24 h-24" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: VOUCHERS */}
                        {activeTab === "voucher" && (
                            <div className="bg-[#1c2230] border border-[#282a31] rounded-3xl p-8  animate-fade-in relative overflow-hidden">
                                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1754cf]/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#282a31] relative z-10">
                                    <h2 className="text-[12px] sm:text-sm font-bold tracking-[0.2em] text-[#1754cf] uppercase flex items-center gap-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                                        Bộ sưu tập Voucher
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    {availableVouchers.length > 0 ? availableVouchers.map((voucher) => (
                                        <div key={voucher.id} className="relative group bg-[#111621] border border-[#282a31] rounded-2xl hover:border-[#1754cf]/50 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 hover:">
                                            {voucher.isNew && (
                                                <div className="absolute top-4 right-4 bg-amber-500 text-[#111621] text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full  z-10">Mới</div>
                                            )}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl border
                                                        ${voucher.type === 'DISCOUNT' ? 'bg-[#1754cf]/10 text-[#1754cf] border-[#1754cf]/30' :
                                                            voucher.type === 'GIFT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                                                'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}
                                                    >
                                                        {voucher.type === 'DISCOUNT' ? '%' : voucher.type === 'GIFT' ? '🎁' : '👑'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-serif font-bold text-white leading-tight">{voucher.title}</h3>
                                                        <p className="text-[#1754cf] font-medium text-xs mt-1 uppercase tracking-widest">{voucher.expiry}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[#c3c6d6] text-sm leading-relaxed mb-6 flex-1 font-light">
                                                    {voucher.desc}
                                                </p>
                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-0 border border-[#282a31] rounded-xl overflow-hidden bg-[#1c2230]">
                                                        <div className="flex-1 px-4 py-3 font-mono text-center text-white font-bold tracking-widest">
                                                            {voucher.code}
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(voucher.code)}
                                                            className="px-5 py-3.5 bg-[#282a31] hover:bg-[#1754cf] text-[#a7b7ed] hover:text-white text-xs uppercase tracking-widest font-bold border-l border-[#1c2230] transition-colors"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-full opacity-30" style={{
                                                backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, #1754cf 11px)',
                                                backgroundSize: '20px 20px',
                                                backgroundPosition: '-10px -10px',
                                                backgroundRepeat: 'repeat-x'
                                            }}></div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-16 text-center border border-[#282a31] border-dashed rounded-2xl bg-[#111621] mt-4">
                                            <div className="w-16 h-16 rounded-full bg-[#1c2230] text-[#c3c6d6] flex items-center justify-center mx-auto mb-4 border border-[#282a31]">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <p className="text-white font-serif text-lg">Bạn chưa có Voucher nào khả dụng.</p>
                                            <p className="text-[#a7b7ed] text-sm mt-2">Hãy sử dụng dịch vụ hoặc cập nhật lên VIP để mở khóa thêm các Ưu đãi độc quyền!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Cancel Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-[#0c0e15]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl p-8 max-w-md w-full  animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex flex-col items-center text-center relative z-10 pb-6">
                            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-full mb-6 border border-rose-500/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-serif">Xác nhận hủy lịch</h3>
                            <p className="text-[#c3c6d6] leading-relaxed text-sm font-light">
                                Bạn có chắn muốn hủy cuộc hẹn với <strong className="text-white font-medium">{appointmentToCancel?.barberId?.name}</strong> không?
                            </p>
                        </div>
                        <div className="flex gap-4 relative z-10 pt-2 border-t border-[#282a31]/50 mt-2">
                            <button
                                onClick={() => { setShowCancelDialog(false); setAppointmentToCancel(null); }}
                                disabled={cancelling}
                                className="flex-1 px-4 py-3 bg-[#111621] hover:bg-[#282a31] border border-[#282a31] text-[#c3c6d6] hover:text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-all"
                            >
                                Giữ Lại
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                disabled={cancelling}
                                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 border border-rose-500/50 text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                            >
                                {cancelling ? "Đang xử lý..." : "Hủy Bỏ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-12 text-center text-[#c3c6d6] text-sm border-t border-[#282a31] bg-[#0c0e15] mt-auto">
                <p className="tracking-wide">&copy; {new Date().getFullYear()} The Blue Blade. Premium Care.</p>
            </footer>
        </div>
    );
}

export default ProfilePage;

