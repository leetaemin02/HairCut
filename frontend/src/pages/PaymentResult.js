import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

function PaymentResult() {
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const verifyPayment = async () => {
      try {
        // location.search contains the query params returned by VNPAY
        const response = await api.get(`/payment/vnpay-return${location.search}`);
        if (response.data.success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ.");
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Thanh toán thất bại hoặc có lỗi xảy ra.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("Lỗi xác minh thanh toán. Vui lòng liên hệ hỗ trợ.");
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setStatus("failed");
      setMessage("Không tìm thấy thông tin thanh toán.");
    }
  }, [location]);

  return (
    <div className="bg-[#111621] min-h-screen text-[#e2e2ec] flex flex-col">
      <Header user={user} />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#1c2230] border border-[#282a31] rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1754cf] mb-4"></div>
              <h2 className="text-xl font-bold text-white">Đang xử lý...</h2>
              <p className="text-[#c3c6d6] mt-2">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-green-500/30">
                ✔
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
              <p className="text-[#c3c6d6] mb-6">{message}</p>
              <button 
                onClick={() => navigate("/profile")}
                className="bg-gradient-to-r from-[#1754cf] to-[#003ea7] hover:from-[#1349b8] hover:to-[#003185] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#1754cf]/20"
              >
                Về trang cá nhân
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-red-500/30">
                ✘
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Giao dịch thất bại</h2>
              <p className="text-[#c3c6d6] mb-6">{message}</p>
              <button 
                onClick={() => navigate("/profile")}
                className="bg-transparent border border-[#282a31] hover:bg-[#282a31] text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                Quay lại
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaymentResult;
