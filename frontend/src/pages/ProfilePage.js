import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { appointmentAPI } from "../services/api";

function ProfilePage() {
    const navigate = useNavigate();
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

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        fetchUserProfile();
        fetchAppointments();
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
                setSuccessMessage("Profile updated successfully!");
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
            setSuccessMessage("Appointment cancelled successfully");
            setShowCancelDialog(false);
            setAppointmentToCancel(null);
            fetchAppointments(); // Refresh list
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
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "pending":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "completed":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "cancelled":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <Header user={user} />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-white text-xl">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header user={user} />

            <div className="container mx-auto px-4 py-8 sm:px-6 md:px-10 lg:px-20">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 animate-fade-in">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Information Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Profile</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {/* Profile Avatar */}
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-white/40 mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Name</p>
                                        <p className="text-white font-medium">{user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Email</p>
                                        <p className="text-white font-medium">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Phone</p>
                                        <p className="text-white font-medium">{user?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Address</p>
                                        <p className="text-white font-medium">
                                            {user?.address || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60 mb-1">Role</p>
                                        <p className="text-white font-medium capitalize">
                                            {user?.role}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appointment History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-white">
                                    Appointment History
                                </h2>

                                {/* Filter Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {["all", "upcoming", "confirmed", "completed", "cancelled"].map(
                                        (filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setStatusFilter(filter)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === filter
                                                    ? "bg-blue-600 text-white shadow-lg scale-105"
                                                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                                                    }`}
                                            >
                                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Appointments List */}
                            <div className="space-y-4">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-white/40 text-lg">
                                            No appointments found
                                        </div>
                                        <button
                                            onClick={() => navigate("/appointments")}
                                            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105"
                                        >
                                            Book an Appointment
                                        </button>
                                    </div>
                                ) : (
                                    filteredAppointments.map((appointment) => (
                                        <div
                                            key={appointment._id}
                                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-white">
                                                            {appointment.serviceId?.name}
                                                        </h3>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                                appointment.status
                                                            )}`}
                                                        >
                                                            {appointment.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                            <span>
                                                                {formatDate(appointment.appointmentDate)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                />
                                                            </svg>
                                                            <span>
                                                                Barber: {appointment.barberId?.name}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            <span className="font-semibold text-blue-300">
                                                                {Number(appointment.totalPrice).toLocaleString('vi-VN')} VND
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                                />
                                                            </svg>
                                                            <span className="text-xs">
                                                                ID: {appointment.appointmentId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-4 flex flex-col gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate("/appointment-confirmation", {
                                                                state: { appointment },
                                                            })
                                                        }
                                                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                                                    >
                                                        View Details
                                                    </button>

                                                    {/* Pay Now Button - Only for confirmed & unpaid appointments */}
                                                    {appointment.status === "confirmed" && appointment.paymentStatus !== "paid" && (
                                                        <button
                                                            onClick={() => navigate("/payment", { state: { appointment } })}
                                                            className="w-full px-4 py-2 font-bold text-sm text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                                        >
                                                            💳 Thanh toán VNPAY
                                                        </button>
                                                    )}

                                                    {/* Paid badge */}
                                                    {appointment.paymentStatus === "paid" && (
                                                        <div className="w-full px-4 py-2 text-center text-xs font-bold rounded-lg bg-green-500/20 border border-green-500/30 text-green-300">
                                                            ✓ Đã thanh toán
                                                        </div>
                                                    )}

                                                    {/* Cancel Button - Only for upcoming appointments */}
                                                    {appointment.status !== "cancelled" &&
                                                        appointment.status !== "completed" && (
                                                            <button
                                                                onClick={() => confirmCancelAppointment(appointment)}
                                                                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 text-sm font-bold rounded-lg transition-all active:scale-95"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                </div>
                                            </div>

                                            {/* QR Code for upcoming appointments */}
                                            {appointment.qrCode &&
                                                appointment.status !== "cancelled" &&
                                                appointment.status !== "completed" && (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <img
                                                            src={appointment.qrCode}
                                                            alt="QR Code"
                                                            className="w-24 h-24 bg-white p-2 rounded-lg"
                                                        />
                                                        <span className="text-xs text-white/60">
                                                            Scan at shop
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            {
                showCancelDialog && (
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
                                Are you sure you want to cancel your appointment with{" "}
                                <span className="text-white font-bold">
                                    {appointmentToCancel?.barberId?.name}
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelDialog(false);
                                        setAppointmentToCancel(null);
                                    }}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Keep It
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
                )
            }
        </div >
    );
}

export default ProfilePage;
