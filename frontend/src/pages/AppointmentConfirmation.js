import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { appointmentAPI, reviewAPI } from "../services/api";
import Header from "../components/Header";

function AppointmentConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const appointment = location.state?.appointment;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    if (!appointment) { navigate("/appointments"); return; }
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
      navigate("/appointments");
    } catch {
      alert("Không thể hủy lịch hẹn. Vui lòng thử lại.");
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await reviewAPI.createReview({
        appointmentId: appointment._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      alert("Cảm ơn bạn đã đánh giá!");
      setShowReview(false);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setReviewLoading(false);
    }
  };

  if (!appointment) return null;

  const canCancel = appointment.status !== "cancelled" && appointment.status !== "completed";
  const isCompleted = appointment.status === "completed";
  const dt = new Date(appointment.appointmentDate);

  const statusColors = {
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    confirmed: "text-green-400 bg-green-400/10 border-green-400/30",
    completed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
  };

  const paymentColors = {
    pending: "text-orange-400",
    paid: "text-green-400",
    cancelled: "text-red-400",
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white flex flex-col">
      <Header user={user} />

      <main className="flex flex-1 justify-center items-start p-4 pt-6">
        <div
          className={`w-full max-w-sm transition-all duration-500 ${showSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Success Badge */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500/30 mb-3">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Đặt lịch thành công!</h1>
            <p className="text-white/50 text-xs mt-1">ID: {appointment.appointmentId}</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">

            {/* QR + Info Row */}
            <div className="p-5 flex items-start gap-4">
              {/* QR Code */}
              {appointment.qrCode && (
                <div className="shrink-0" id="confirmation-qr">
                  <div className="bg-white p-2 rounded-xl">
                    <QRCodeCanvas
                      value={JSON.stringify({
                        appointmentId: appointment._id,
                        appointmentCode: appointment.appointmentId,
                      })}
                      size={90}
                    />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="w-full mt-1.5 text-[10px] font-bold text-white/40 hover:text-white transition-colors text-center"
                  >
                    Tải QR
                  </button>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 space-y-2.5 min-w-0">
                {/* Status row */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusColors[appointment.status] || statusColors.pending}`}>
                    {appointment.status}
                  </span>
                  <span className={`text-[10px] font-bold ${paymentColors[appointment.paymentStatus] || paymentColors.pending}`}>
                    💳 {appointment.paymentStatus === "paid" ? "Đã thanh toán" : appointment.paymentStatus === "cancelled" ? "Đã hủy" : "Chưa thanh toán"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400 text-base">📅</span>
                  <div>
                    <p className="font-bold text-white text-sm leading-tight">
                      {dt.toLocaleDateString("vi-VN", { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-white/50 text-xs">{dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>

                {/* Barber */}
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-base">✂️</span>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{appointment.barberId?.name || "Chuyên nghiệp"}</p>
                    <p className="text-white/50 text-xs truncate">{appointment.barberId?.email}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-white/50 text-xs">Tổng tiền</span>
                  <span className="text-white font-bold text-sm">{Number(appointment.totalPrice).toLocaleString("vi-VN")} VND</span>
                </div>
              </div>
            </div>

            {/* Notes (if any) */}
            {appointment.notes && (
              <div className="px-5 pb-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Ghi chú</p>
                  <p className="text-white/60 text-xs italic">"{appointment.notes}"</p>
                </div>
              </div>
            )}

            {/* Review banner (completed) */}
            {isCompleted && (
              <div className="px-5 pb-4">
                <button
                  onClick={() => setShowReview(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 hover:from-yellow-500/30 hover:to-amber-500/20 text-yellow-400 text-sm font-bold rounded-xl border border-yellow-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>★★★★★</span> Đánh giá dịch vụ
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => navigate("/appointments")}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
              >
                Xem lịch hẹn
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl border border-white/10 transition-all active:scale-95"
              >
                Trang chủ
              </button>
            </div>
          </div>

          {/* Cancel */}
          {canCancel && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full mt-3 py-2.5 text-red-400/70 hover:text-red-400 text-xs font-bold rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
            >
              Hủy lịch hẹn này
            </button>
          )}

          {/* Note */}
          <p className="text-center text-white/30 text-[10px] mt-4">
            💡 Vui lòng đến trước 5-10 phút. Hủy lịch trước 24 giờ.
          </p>
        </div>
      </main>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-xs w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-white">Hủy lịch hẹn?</h3>
              <p className="text-white/60 text-sm mt-2">Thao tác này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Giữ lại
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">Đánh giá Dịch Vụ</h3>
              <button onClick={() => setShowReview(false)} className="text-white/40 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">Mức độ hài lòng</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? "text-yellow-400" : "text-white/20"}`}
                    >★</button>
                  ))}
                </div>
              </div>
              <div>
                <textarea
                  rows="3"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Dịch vụ rất tốt, Barber tận tình..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 placeholder-white/30 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReview(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm">Hủy</button>
                <button type="submit" disabled={reviewLoading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-60">
                  {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentConfirmation;