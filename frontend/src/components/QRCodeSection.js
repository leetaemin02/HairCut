import React from "react";
import { QRCodeCanvas } from "qrcode.react";

function QRCodeSection({ appointment, onDownload }) {
    return (
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/10">
            <div id="confirmation-qr" className="bg-white p-6 rounded-xl shadow-lg">
                <QRCodeCanvas
                    value={JSON.stringify({
                        appointmentId: appointment._id,
                        appointmentCode: appointment.appointmentId,
                        timestamp: new Date().getTime(),
                    })}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </div>
            <button
                onClick={onDownload}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all hover:scale-105"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                Download QR Code
            </button>
            <p className="text-xs text-white/40 text-center max-w-md">
                Show this QR code to your barber when you arrive for your appointment
            </p>
        </div>
    );
}

export default QRCodeSection;
