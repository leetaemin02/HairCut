import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { appointmentAPI } from "../services/api";

function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        if (scanning) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(e => console.error("Play error:", e));
              scanQRCode();
            };
          }
        }
      } catch (err) {
        setError("Không thể truy cập camera: " + err.message);
        setScanning(false);
      }
    };

    if (scanning) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanning]);

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRScanned(code.data);
          return;
        }
      }

      if (scanning) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const handleQRScanned = async (qrData) => {
    try {
      const parsedData = JSON.parse(qrData);
      const response = await appointmentAPI.scanQRCode({
        appointmentCode: parsedData.appointmentCode,
      });

      setResult(response.data.appointment);
      setScanning(false);
    } catch (err) {
      console.error("Scan Error", err);
      setError("Mã QR không hợp lệ hoặc đã quét. Vui lòng thử lại!");
      setScanning(false);
    }
  };

  return (
    <div className="bg-[#111621] min-h-screen text-[#e2e2ec] font-sans flex flex-col">
      <header className="px-6 py-5 bg-[#111621] border-b border-[#282a31] sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2
            onClick={() => navigate("/dashboard")}
            className="text-3xl font-logo text-white tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
          >
            The Blue Blade
          </h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-[#c3c6d6] text-sm font-bold bg-[#1c2230] px-4 py-2 rounded-lg hover:bg-[#282a31] transition-colors border border-[#282a31]"
        >
          Go Back
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#1754cf]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-xl z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              QR Check-in
            </h1>
            <p className="text-[#c3c6d6]">Scan client's QR code to confirm appointment</p>
          </div>

          <div className="bg-[#1c2230] border border-[#282a31] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {error && (
              <div className="bg-[#ffb4ab]/10 text-[#ffb4ab] p-4 rounded-xl mb-6 border border-[#ffb4ab]/20 text-sm flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </div>
            )}

            {!scanning && !result ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-32 h-32 bg-[#1754cf]/10 rounded-full flex items-center justify-center mb-8 border border-[#1754cf]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1754cf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    setScanning(true);
                  }}
                  className="w-full sm:w-auto px-10 py-4 bg-[#1754cf] hover:bg-[#1754cf]/80 text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(23,84,207,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  Scan Code Now
                </button>
              </div>
            ) : scanning ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden border-2 border-[#282a31] group">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 border-2 border-[#1754cf]/50 rounded-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1754cf]"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1754cf]"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1754cf]"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1754cf]"></div>

                    <div className="absolute left-0 right-0 h-1 bg-[#1754cf]/80 shadow-[0_0_15px_rgba(23,84,207,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <p className="mt-6 text-[#c3c6d6] text-sm animate-pulse">Position QR code inside the frame...</p>

                <button
                  onClick={() => setScanning(false)}
                  className="mt-8 px-6 py-2 bg-[#282a31] hover:bg-[#33343c] text-white font-bold rounded-xl border border-[#434654] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            {result && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Check-in Success!</h2>
                    <p className="text-green-400 font-medium">Appointment confirmed</p>
                  </div>
                </div>

                <div className="space-y-4 bg-[#111621] p-6 rounded-2xl border border-[#282a31] mb-8">
                  <div className="flex justify-between items-center pb-3 border-b border-[#282a31]">
                    <span className="text-[#c3c6d6] text-sm font-bold">Client</span>
                    <span className="text-white font-bold">{result.customerId?.name}</span>
                  </div>
                  <div className="flex justify-between items-start pb-3 border-b border-[#282a31]">
                    <span className="text-[#c3c6d6] text-sm font-bold mt-0.5">Services</span>
                    <div className="text-right">
                      {result.serviceIds?.map((service, idx) => (
                        <div key={idx} className="text-[#1754cf] font-bold">{service.name}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#282a31]">
                    <span className="text-[#c3c6d6] text-sm font-bold">Time</span>
                    <span className="text-white font-bold">
                      {new Date(result.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(result.appointmentDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#c3c6d6] text-sm font-bold">Status</span>
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/20">
                      {result.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 py-4 bg-[#111621] hover:bg-[#282a31] text-white font-bold rounded-2xl border border-[#282a31] transition-all active:scale-95"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => navigate("/barber-dashboard")}
                    className="flex-1 py-4 bg-[#1754cf] hover:bg-[#1754cf]/80 text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(23,84,207,0.3)] transition-all active:scale-95"
                  >
                    To Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[#c3c6d6]/60 text-sm border-t border-[#282a31] bg-[#111621]">
        <p>&copy; {new Date().getFullYear()} The Blue Blade Barber Shop. All rights reserved.</p>
      </footer>

      {/* Global Style for Scanning Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

export default QRScanner;