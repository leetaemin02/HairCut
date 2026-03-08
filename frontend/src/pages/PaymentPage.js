import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { paymentAPI } from "../services/api";

function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const appointment = location.state?.appointment;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        // Guard: only confirmed appointments can reach this page
        if (!appointment || appointment.status !== "confirmed") {
            navigate("/profile");
        }
    }, [appointment, navigate]);

    if (!appointment) return null;

    const appointmentDateTime = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDateTime.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const handlePayWithVNPAY = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await paymentAPI.createPayment({ appointmentId: appointment._id });
            if (res.data?.payUrl) {
                // Redirect to VNPAY Sandbox payment page
                window.location.href = res.data.payUrl;
            } else {
                setError("Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Đã xảy ra lỗi khi kết nối với VNPAY.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
            <Header user={user} />

            <main className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-lg space-y-6">

                    {/* Title */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                            <svg className="w-9 h-9 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Thanh Toán VNPAY
                        </h1>
                        <p className="text-white/50 text-sm mt-2">
                            Thanh toán an toàn qua cổng VNPAY Sandbox
                        </p>
                    </div>

                    {/* Appointment Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        {/* Header gradient */}
                        <div className="bg-gradient-to-r from-blue-700/70 to-cyan-700/70 px-6 py-4">
                            <p className="text-xs text-white/60 uppercase font-semibold tracking-wider">Chi tiết lịch hẹn</p>
                            <p className="text-white font-bold text-sm mt-1">#{appointment.appointmentId}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Service */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-white/50">Dịch vụ</p>
                                    <p className="font-semibold text-white">{appointment.serviceId?.name || "Dịch vụ cắt tóc"}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* Barber */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-white/50">Thợ cắt tóc</p>
                                    <p className="font-semibold text-white">{appointment.barberId?.name || "Barber"}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* Date & Time */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-white/50">Ngày & Giờ</p>
                                    <p className="font-semibold text-white">{formattedDate}</p>
                                    <p className="text-sm text-blue-400">{formattedTime}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/5" />

                            {/* Status badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-white/50 text-sm">Trạng thái</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 uppercase tracking-wide">
                                    ✓ Đã xác nhận
                                </span>
                            </div>

                            {/* Total Price */}
                            <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                                <span className="text-white/70 font-medium">Tổng thanh toán</span>
                                <span className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                                    {Number(appointment.totalPrice).toLocaleString("vi-VN")} VND
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* VNPAY Pay Button */}
                    <button
                        id="btn-pay-vnpay"
                        onClick={handlePayWithVNPAY}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Đang kết nối VNPAY...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                                Thanh toán qua VNPAY
                            </span>
                        )}
                    </button>

                    {/* Back button */}
                    <button
                        onClick={() => navigate("/profile")}
                        className="w-full py-3 rounded-2xl font-bold text-white/60 border border-white/10 hover:bg-white/5 transition-all text-sm"
                    >
                        ← Quay lại Profile
                    </button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                        <svg className="w-4 h-4 text-green-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Thanh toán bảo mật qua VNPAY Sandbox (môi trường thử nghiệm)</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PaymentPage;
