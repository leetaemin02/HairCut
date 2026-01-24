import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SuccessIcon from "../components/SuccessIcon";
import QRCodeSection from "../components/QRCodeSection";
import AppointmentDetailCard from "../components/AppointmentDetailCard";
import { icons } from "../utils/appointmentIcons";
import { appointmentAPI } from "../services/api";

function AppointmentConfirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const appointment = location.state?.appointment;

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        if (!appointment) {
            navigate("/appointments");
            return;
        }
        setTimeout(() => setShowSuccess(true), 100);
    }, [appointment, navigate]);

    const downloadQRCode = () => {
        const canvas = document.querySelector("#confirmation-qr canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `appointment-${appointment.appointmentId}.png`;
            link.click();
        }
    };

    const handleCancelAppointment = async () => {
        setCancelling(true);
        try {
            await appointmentAPI.cancelAppointment(appointment._id);
            // Navigate back to profile or appointments page
            navigate("/profile", {
                state: { message: "Appointment cancelled successfully" },
            });
        } catch (error) {
            alert("Failed to cancel appointment. Please try again.");
            setCancelling(false);
        }
    };

    // Check if appointment can be cancelled (not already cancelled or completed)
    const canCancel = appointment &&
        appointment.status !== "cancelled" &&
        appointment.status !== "completed";

    if (!appointment) return null;

    const appointmentDateTime = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDateTime.toLocaleDateString("en-US", {
        weekday: "short", // Viết tắt thứ để tiết kiệm không gian
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white flex flex-col">
            <Header user={user} />

            <main className="flex flex-1 justify-center p-4 sm:p-6">
                {/* Giảm max-w từ 4xl xuống 2xl để khung gọn hơn */}
                <div className="w-full max-w-2xl">
                    <div
                        className={`transition-all duration-700 ${showSuccess ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
                            }`}
                    >
                        {/* Giảm kích thước icon thành công nếu component này hỗ trợ prop size */}
                        <div className="scale-90 mb-2">
                            <SuccessIcon />
                        </div>

                        {/* Success Message - Nhỏ hơn */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                Booking Confirmed!
                            </h1>
                            <p className="text-white/60 text-sm">
                                Your appointment has been scheduled
                            </p>
                        </div>

                        {/* Appointment Details Card */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl mb-6">
                            {/* Header Banner - Thu gọn padding */}
                            <div className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 p-4 text-center">
                                <h2 className="text-lg font-bold">The Blue Blade</h2>
                                <p className="text-white/70 text-xs">
                                    ID: {appointment.appointmentId}
                                </p>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Giảm scale QR code nếu cần trong QRCodeSection */}
                                <div className="flex justify-center py-2">
                                    <QRCodeSection appointment={appointment} onDownload={downloadQRCode} />
                                </div>

                                {/* Details Grid - Chỉnh gap nhỏ lại */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AppointmentDetailCard
                                        icon={icons.calendar}
                                        iconBgColor="bg-blue-500/20"
                                        iconColor="text-blue-400"
                                        label="Date & Time"
                                        title={formattedDate}
                                        subtitle={<span className="text-blue-400 font-medium text-xs">{formattedTime}</span>}
                                    />

                                    <AppointmentDetailCard
                                        icon={icons.service}
                                        iconBgColor="bg-purple-500/20"
                                        iconColor="text-purple-400"
                                        label="Service"
                                        title={appointment.serviceId?.name || "Service"}
                                        subtitle={<span className="text-xs">{`${Number(appointment.totalPrice).toLocaleString('vi-VN')} VND`}</span>}
                                    />

                                    <AppointmentDetailCard
                                        icon={icons.user}
                                        iconBgColor="bg-cyan-500/20"
                                        iconColor="text-cyan-400"
                                        label="Your Barber"
                                        title={appointment.barberId?.name || "Professional"}
                                        subtitle={<span className="text-xs truncate block max-w-[150px]">{appointment.barberId?.email}</span>}
                                    />

                                    <AppointmentDetailCard
                                        icon={icons.status}
                                        iconBgColor="bg-yellow-500/20"
                                        iconColor="text-yellow-400"
                                        label="Status"
                                        title={<span className="capitalize text-sm">{appointment.status}</span>}
                                        subtitle={<span className="text-xs">Payment: {appointment.paymentStatus}</span>}
                                    />
                                </div>

                                {appointment.notes && (
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                        <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">
                                            Special Requests
                                        </p>
                                        <p className="text-white/70 text-sm italic">"{appointment.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons - Giảm padding nút */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate("/appointments")}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
                            >
                                View All
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
                            >
                                Dashboard
                            </button>
                        </div>

                        {/* Cancel Button - Only for upcoming appointments */}
                        {canCancel && (
                            <button
                                onClick={() => setShowCancelDialog(true)}
                                className="w-full mt-3 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 text-sm font-bold rounded-lg transition-all active:scale-95"
                            >
                                Cancel Appointment
                            </button>
                        )}

                        {/* Notice - Thu nhỏ font */}
                        <div className="mt-6 border-t border-white/10 pt-4 text-center">
                            <p className="text-amber-400/80 text-[11px] leading-relaxed">
                                Tip: Please arrive 5-10 mins early. <br />
                                Cancellations require 24h notice.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Cancel Appointment?</h3>
                        </div>
                        <p className="text-white/70 mb-6">
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelDialog(false)}
                                disabled={cancelling}
                                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                disabled={cancelling}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppointmentConfirmation;