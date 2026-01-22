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
            video: { facingMode: "environment" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for video to be ready before starting scan
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(e => console.error("Play error:", e));
              scanQRCode();
            };
          }
        }
      } catch (err) {
        setError("Unable to access camera: " + err.message);
        setScanning(false);
      }
    };

    if (scanning) {
      startCamera();
    } else {
      // Stop camera if not scanning
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
      // Don't stop scanning on error, just log it or maybe show temporary toast
      // For now, let's stop to prevent flood
      setError("Invalid QR code or appointment not found");
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">QR Code Scanner</h1>
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 border border-red-300 max-w-md w-full">
          {error}
        </div>
      )}

      {!scanning ? (
        <button
          onClick={() => {
            setError(""); // Clear previous errors
            setScanning(true);
          }}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition"
        >
          Start Scanning
        </button>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full border-4 border-purple-600 rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={() => setScanning(false)}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
          >
            Stop Scanning
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-600 mb-6">
            Appointment Confirmed!
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Customer:</strong> {result.customerId?.name}
            </p>
            <p>
              <strong>Service:</strong> {result.serviceId?.name}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(result.appointmentDate).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                {result.status}
              </span>
            </p>
          </div>

          <button
            onClick={() => setResult(null)}
            className="mt-6 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
