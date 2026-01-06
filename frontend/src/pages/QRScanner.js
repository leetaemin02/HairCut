import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { appointmentAPI } from "../services/api";
import "../styles/qr-scanner.css";

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

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;
      setScanning(true);
      scanQRCode();
    } catch (err) {
      setError("Unable to access camera: " + err.message);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current) return;

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

      requestAnimationFrame(scan);
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

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      setError("Invalid QR code or appointment not found");
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="qr-scanner-container">
      <h1>QR Code Scanner</h1>
      {error && <div className="error-message">{error}</div>}

      {!scanning ? (
        <button onClick={startScanning} className="btn-primary">
          Start Scanning
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            style={{ width: "100%", maxWidth: "500px" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button onClick={stopScanning} className="btn-secondary">
            Stop Scanning
          </button>
        </>
      )}

      {result && (
        <div className="scan-result">
          <h2>Appointment Confirmed!</h2>
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
            <strong>Status:</strong> {result.status}
          </p>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
