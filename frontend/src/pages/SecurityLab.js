// frontend/src/pages/SecurityLab.js
import React, { useState, useEffect, useRef } from "react";
import { securityAPI, authAPI } from "../services/api";
import Header from "../components/Header";

function SecurityLab() {
  const [user, setUser] = useState(null);
  const [headers, setHeaders] = useState({});
  const [headersInfo, setHeadersInfo] = useState({});
  const [loadingHeaders, setLoadingHeaders] = useState(false);

  // Rate limiting simulation states
  const [simLimit, setSimLimit] = useState(210);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStats, setSimStats] = useState({ total: 0, ok: 0, blocked: 0, other: 0 });
  const [simLogs, setSimLogs] = useState([]);

  // NoSQL Injection states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [payloadType, setPayloadType] = useState("none"); // none, normal, attack

  // Console Morgan Logs
  const [consoleLogs, setConsoleLogs] = useState([
    `[Morgan System Log] Initializing Security Audit Lab Terminal...`,
    `[Morgan System Log] Local connection: OK`,
  ]);
  const consoleBottomRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHeaders();
  }, []);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  const addConsoleLog = (method, path, status, size, responseTime) => {
    const now = new Date();
    const timeStr = now.toLocaleDateString("vi-VN") + " " + now.toLocaleTimeString("vi-VN");
    const logLine = `::1 - - [${timeStr}] "${method} ${path} HTTP/1.1" ${status} ${size} - ${responseTime}ms`;
    setConsoleLogs((prev) => [...prev, logLine]);
  };

  const fetchHeaders = async () => {
    setLoadingHeaders(true);
    const start = Date.now();
    try {
      const res = await securityAPI.getHeaders();
      const time = Date.now() - start;
      setHeaders(res.data.headers || {});
      setHeadersInfo(res.data.info || {});
      addConsoleLog("GET", "/api/security/headers", 200, JSON.stringify(res.data).length, time);
    } catch (err) {
      const time = Date.now() - start;
      console.error(err);
      addConsoleLog("GET", "/api/security/headers", err.response?.status || 500, "Error", time);
    } finally {
      setLoadingHeaders(false);
    }
  };

  // Run global Rate Limiting simulation
  const runRateLimitSim = async () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimProgress(0);
    setSimStats({ total: 0, ok: 0, blocked: 0, other: 0 });
    setSimLogs([]);
    
    setConsoleLogs((prev) => [...prev, `[Simulation] Bắt đầu gửi liên tục ${simLimit} request để giả lập Spam DDoS/Brute-force...`]);

    let localOk = 0;
    let localBlocked = 0;
    let localOther = 0;
    const reqLogs = [];

    // Gửi song song theo từng batch để tối ưu tốc độ và không gây nghẽn trình duyệt
    const batchSize = 10;
    for (let i = 0; i < simLimit; i += batchSize) {
      const currentBatch = Math.min(batchSize, simLimit - i);
      const promises = [];

      for (let j = 0; j < currentBatch; j++) {
        const reqIndex = i + j + 1;
        const start = Date.now();
        
        const promise = securityAPI.getStatus()
          .then((res) => {
            const time = Date.now() - start;
            localOk++;
            const logItem = `Req #${reqIndex}: Status 200 OK ✅ (${time}ms)`;
            reqLogs.push(logItem);
            addConsoleLog("GET", "/api/security/status", 200, JSON.stringify(res.data).length, time);
          })
          .catch((err) => {
            const time = Date.now() - start;
            const status = err.response?.status;
            if (status === 429) {
              localBlocked++;
              const logItem = `Req #${reqIndex}: Status 429 Too Many Requests ❌ (Bị chặn bởi Rate Limiter - ${time}ms)`;
              reqLogs.push(logItem);
              addConsoleLog("GET", "/api/security/status", 429, 82, time);
            } else {
              localOther++;
              const logItem = `Req #${reqIndex}: Status ${status || "Network Error"} ⚠️ (${time}ms)`;
              reqLogs.push(logItem);
              addConsoleLog("GET", "/api/security/status", status || 500, "Error", time);
            }
          });
        
        promises.push(promise);
      }

      await Promise.all(promises);
      
      const totalSent = i + currentBatch;
      setSimProgress(Math.round((totalSent / simLimit) * 100));
      setSimStats({ total: totalSent, ok: localOk, blocked: localBlocked, other: localOther });
      setSimLogs([...reqLogs]);
      
      // Delay nhỏ giữa các batch để trình duyệt vẽ UI mượt mà
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setConsoleLogs((prev) => [...prev, `[Simulation] Hoàn thành giả lập. Kết quả: ${localOk} Thành công, ${localBlocked} Bị chặn đứng.`]);
    setSimRunning(false);
  };

  // Set payload mẫu cho NoSQL Injection
  const handleSelectPayload = (type) => {
    setPayloadType(type);
    if (type === "normal") {
      setEmail("admin@gmail.com");
      setPassword("password123");
    } else if (type === "attack") {
      // Vì là input text, ta sẽ mô phỏng việc hacker gửi JSON
      setEmail('{"$ne": null}');
      setPassword('{"$ne": null}');
    } else {
      setEmail("");
      setPassword("");
    }
  };

  // Send login request with potential NoSQL payload
  const handleNoSqlLogin = async (e) => {
    e.preventDefault();
    setSqlLoading(true);
    setSqlResult(null);
    const start = Date.now();

    // Chuẩn bị payload thực tế gửi lên
    let sendData = {};
    
    // Nếu chọn kiểu tấn công, ta cố tình parse chuỗi nhập vào thành Object thực tế để gửi lên (vì ta dùng axios post gửi JSON)
    if (payloadType === "attack" || email.startsWith("{") || password.startsWith("{")) {
      try {
        const parsedEmail = email.startsWith("{") ? JSON.parse(email) : email;
        const parsedPassword = password.startsWith("{") ? JSON.parse(password) : password;
        sendData = { email: parsedEmail, password: parsedPassword };
      } catch (err) {
        // Nếu gõ JSON sai cú pháp
        sendData = { email, password };
      }
    } else {
      sendData = { email, password };
    }

    setConsoleLogs((prev) => [...prev, `[NoSQL Play] Gửi yêu cầu Đăng nhập với payload: ${JSON.stringify(sendData)}`]);

    try {
      const res = await authAPI.login(sendData);
      const time = Date.now() - start;
      setSqlResult({
        status: 200,
        statusText: "OK",
        data: res.data,
        success: true,
        explanation: "Cảnh báo: Đăng nhập thành công! Tài khoản hợp lệ hoặc hệ thống không ngăn chặn được payload."
      });
      addConsoleLog("POST", "/api/auth/login", 200, JSON.stringify(res.data).length, time);
    } catch (err) {
      const time = Date.now() - start;
      const responseData = err.response?.data || { message: "Lỗi kết nối mạng" };
      const status = err.response?.status || 500;

      let explanation = "";
      if (status === 500 && responseData.message?.includes("Cast to string failed")) {
        explanation = "AN TOÀN CỰC CAO: Bộ lọc `mongoSanitize` ở Backend đã tự động xóa bỏ toán tử '$ne' thành đối tượng rỗng '{}'. Tiếp sau đó, Mongoose phát hiện kiểu dữ liệu truyền vào là Object rỗng thay vì String nên đã từ chối thực thi truy vấn (Cast to string failed). Kẻ tấn công bị đẩy ra ngoài!";
      } else if (status === 400 && responseData.message === "Thông tin đăng nhập không chính xác") {
        explanation = "AN TOÀN: Server nhận diện thông tin đăng nhập không chính xác (hoặc đã được lọc sạch thông tin rỗng và tìm kiếm không khớp). Đăng nhập thất bại.";
      } else {
        explanation = `Lỗi hệ thống: ${responseData.message}. Cuộc tấn công bị ngăn chặn.`;
      }

      setSqlResult({
        status: status,
        statusText: err.response?.statusText || "Internal Server Error",
        data: responseData,
        success: false,
        explanation: explanation
      });
      addConsoleLog("POST", "/api/auth/login", status, JSON.stringify(responseData).length, time);
    } finally {
      setSqlLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white font-sans">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase tracking-wider text-xs">
            🛡️ Security Audit & Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
            Phòng Thí Nghiệm Bảo Mật & Demo Lab
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Hệ thống bảng điều khiển tương tác trực tiếp giúp kiểm thử và trực quan hóa hoạt động của các cơ chế bảo mật nâng cao được áp dụng tại The Blue Blade.
          </p>
        </div>

        {/* Console Logs Section */}
        <section className="bg-black/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-2 font-mono text-xs text-slate-500">morgan_live_terminal.log</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-white/5 px-2 py-0.5 rounded">
              Localhost:5000 Log Stream
            </span>
          </div>
          <div className="p-5 font-mono text-sm h-64 overflow-y-auto space-y-2 text-green-400 bg-black">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className={log.includes("429") ? "text-red-400" : log.includes("500") ? "text-yellow-500" : log.includes("[Simulation]") ? "text-blue-400 font-semibold" : "text-green-400"}>
                {log}
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>
        </section>

        {/* 2-Column Lab Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Layer 1: Helmet HTTP Headers Check */}
          <div className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">Layer 1</span>
                  <h3 className="text-xl font-bold mt-2">Helmet HTTP Headers Auditor</h3>
                </div>
                <button
                  onClick={fetchHeaders}
                  disabled={loadingHeaders}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-all border border-white/10 flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingHeaders ? "Đang quét..." : "🔄 Quét lại Headers"}
                </button>
              </div>
              <p className="text-sm text-slate-400">
                Khi kích hoạt Helmet, các HTTP response headers sẽ được cập nhật để trình duyệt của khách hàng tự phòng thủ trước các mối nguy hại.
              </p>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto">
                {Object.keys(headers).length > 0 ? (
                  <>
                    {/* Check if X-Powered-By is hidden */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                      <div>
                        <span className="font-mono font-bold text-white">x-powered-by</span>
                        <p className="text-xs text-slate-400">Ẩn thông tin công nghệ Backend (Express/Node.js)</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${!headers["x-powered-by"] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {!headers["x-powered-by"] ? "🛡️ ẨN AN TOÀN" : "⚠️ CÓ RÒ RỈ"}
                      </span>
                    </div>

                    {/* Check other security headers */}
                    {Object.entries(headersInfo).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                        <div className="max-w-[70%]">
                          <span className="font-mono font-bold text-white">{key}</span>
                          <p className="text-xs text-slate-400 truncate">{headers[key] || "Không hiển thị"}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${val === "Không cấu hình" ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-slate-500 text-sm py-8">Chưa quét được Headers. Nhấn quét lại.</p>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500 italic border-t border-white/5 pt-4">
              * Helmet giúp doanh nghiệp đạt chứng chỉ bảo mật nhờ tuân thủ đầy đủ các khuyến nghị header an toàn của OWASP.
            </div>
          </div>

          {/* Layer 2: Rate Limiting Simulation */}
          <div className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">Layer 2</span>
                <h3 className="text-xl font-bold mt-2">Rate Limiting Simulator (Chống DDoS/Spam)</h3>
              </div>
              <p className="text-sm text-slate-400">
                Server đặt hạn mức 200 req/15 phút cho API chung và 10 req/15 phút cho API Đăng nhập. Chạy thử giả lập gửi đồng loạt nhiều request để kích hoạt khóa IP tạm thời.
              </p>

              {/* Slider & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Số lượng Request giả lập: <span className="text-blue-400 font-bold">{simLimit}</span></label>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="10"
                    value={simLimit}
                    onChange={(e) => setSimLimit(Number(e.target.value))}
                    disabled={simRunning}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={runRateLimitSim}
                  disabled={simRunning}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {simRunning ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Đang bắn API ({simProgress}%)
                    </>
                  ) : (
                    "🚀 Bắt đầu giả lập Spam API"
                  )}
                </button>
              </div>

              {/* Live Progress Bar and Statistics */}
              {simStats.total > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Tiến độ: {simStats.total} / {simLimit}</span>
                    <span className="font-bold text-red-400">Blocked (429): {simStats.blocked}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                    <div className="bg-green-500 h-full" style={{ width: `${(simStats.ok / simLimit) * 100}%` }}></div>
                    <div className="bg-red-500 h-full" style={{ width: `${(simStats.blocked / simLimit) * 100}%` }}></div>
                    <div className="bg-yellow-500 h-full" style={{ width: `${(simStats.other / simLimit) * 100}%` }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-500/10 text-green-400 p-2 rounded border border-green-500/10">
                      <p className="font-bold text-lg">{simStats.ok}</p>
                      <p className="text-[10px] text-slate-400">200 OK</p>
                    </div>
                    <div className="bg-red-500/10 text-red-400 p-2 rounded border border-red-500/10">
                      <p className="font-bold text-lg">{simStats.blocked}</p>
                      <p className="text-[10px] text-slate-400">429 Blocked</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-white/5">
                      <p className="font-bold text-lg">{simStats.other}</p>
                      <p className="text-[10px] text-slate-400">Khác</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 italic border-t border-white/5 pt-4">
              * Rate limiter giúp doanh nghiệp chống lại cuộc tấn công DoS, giúp ứng dụng không bị treo khi bị spam hàng loạt.
            </div>
          </div>

        </div>

        {/* Layer 3: NoSQL Injection Playground */}
        <section className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">Layer 3</span>
            <h3 className="text-2xl font-bold mt-2">NoSQL Injection Playground (Chống xâm nhập database)</h3>
            <p className="text-sm text-slate-400 mt-1">
              Hacker cố gắng chèn các ký tự điều khiển MongoDB (`$ne`, `$gt`) vào biểu mẫu Đăng nhập nhằm truy cập trái phép. Kiểm chứng cách bộ lọc triệt tiêu payload nguy hại này.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Form & Attack Presets */}
            <form onSubmit={handleNoSqlLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Chọn kịch bản Demo nhanh</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPayload("normal")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${payloadType === "normal" ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
                  >
                    🟢 Đăng nhập đúng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPayload("attack")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${payloadType === "attack" ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'}`}
                  >
                    🔴 Payload độc hại ($ne)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPayload("none")}
                    className="py-2 px-3 bg-slate-900 border border-white/5 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400"
                  >
                    🧹 Xóa sạch ô nhập
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-slate-400">Email input:</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="admin@gmail.com hoặc {'$ne': null}"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-slate-400">Password input:</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="Mật khẩu của bạn hoặc {'$ne': null}"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sqlLoading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sqlLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Đang gửi payload kiểm tra...
                  </>
                ) : (
                  "🔒 Thực hiện Đăng nhập (Send Request)"
                )}
              </button>
            </form>

            {/* Test Results & Visualization */}
            <div className="bg-slate-950 rounded-xl border border-white/5 p-5 flex flex-col justify-between min-h-[300px]">
              {sqlResult ? (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Response Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${sqlResult.status === 200 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {sqlResult.status} {sqlResult.statusText}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-400">Dữ liệu thô Server trả về:</span>
                      <pre className="p-3 bg-slate-900 rounded border border-white/5 text-xs text-slate-300 overflow-x-auto max-h-[100px] font-mono">
                        {JSON.stringify(sqlResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border text-sm mt-4 leading-relaxed ${sqlResult.success ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    <h4 className="font-bold flex items-center gap-1.5 mb-1.5">
                      {sqlResult.success ? "⚠️ HỆ THỐNG ĐÃ ĐĂNG NHẬP" : "✅ AN TOÀN CHỐNG INJECTION THÀNH CÔNG"}
                    </h4>
                    <p className="text-xs">{sqlResult.explanation}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm space-y-2 py-10">
                  <span>🛠️ Kết quả phân tích sẽ xuất hiện ở đây.</span>
                  <span>Hãy chọn kịch bản ở bên trái và bấm Đăng nhập.</span>
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-950 mt-20">
        <p>&copy; {new Date().getFullYear()} The Blue Blade Barber Shop. Developed for Security Presentation.</p>
      </footer>
    </div>
  );
}

export default SecurityLab;
