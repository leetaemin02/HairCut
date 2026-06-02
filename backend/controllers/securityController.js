// backend/controllers/securityController.js

exports.getSecurityStatus = (req, res) => {
  res.status(200).json({
    success: true,
    status: {
      helmet: {
        active: true,
        description: "Bảo vệ các tiêu đề phản hồi HTTP (HTTP Response Headers), ngăn chặn rò rỉ công nghệ và tấn công clickjacking.",
        headers: [
          { name: "Content-Security-Policy", description: "Ngăn chặn tấn công XSS bằng cách chỉ định các nguồn tài nguyên hợp lệ." },
          { name: "X-Frame-Options", value: "SAMEORIGIN", description: "Chống Clickjacking (không cho phép nhúng web vào iframe bên ngoài)." },
          { name: "X-Content-Type-Options", value: "nosniff", description: "Ngăn chặn trình duyệt tự ý đoán định kiểu file (MIME sniffing)." },
          { name: "Strict-Transport-Security", description: "Bắt buộc mọi kết nối truyền nhận phải dùng HTTPS mã hóa SSL." },
          { name: "X-XSS-Protection", value: "0", description: "Vô hiệu hóa trình duyệt tự lọc XSS cũ và sử dụng CSP hiện đại." }
        ]
      },
      rateLimit: {
        active: true,
        description: "Giới hạn số lượng Request từ một IP nhằm chống tấn công Bruteforce mật khẩu và Spam DDoS.",
        config: {
          globalMax: 200,
          globalWindowMs: "15 phút",
          authMax: 10,
          authWindowMs: "15 phút"
        }
      },
      mongoSanitize: {
        active: true,
        description: "Tự động loại bỏ các toán tử chứa kí tự đặc biệt ($ và .) trong req.body, req.query để chống NoSQL Injection.",
        testCase: "Truyền đối tượng { $ne: null } để kiểm thử."
      },
      morgan: {
        active: true,
        description: "Lớp ghi nhật ký hệ thống (Audit Logs), lưu trữ toàn bộ các request truy cập phục vụ phân tích bảo mật sau này."
      }
    }
  });
};

exports.checkHeaders = (req, res) => {
  // Trả về toàn bộ tiêu đề (headers) mà server đang trả về thực tế trong response này
  // Nhưng vì Express cho phép xem headers đã được set thông qua res.getHeaders()
  const headers = res.getHeaders();
  
  res.status(200).json({
    success: true,
    headers: headers,
    info: {
      "x-powered-by": headers["x-powered-by"] ? "LỘ THÔNG TIN (Nguy hiểm)" : "ẨN THÀNH CÔNG (An toàn)",
      "x-frame-options": headers["x-frame-options"] || "Không cấu hình",
      "x-content-type-options": headers["x-content-type-options"] || "Không cấu hình",
      "content-security-policy": headers["content-security-policy"] ? "Đang kích hoạt" : "Không cấu hình"
    }
  });
};
