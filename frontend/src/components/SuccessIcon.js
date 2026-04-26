import React from "react";

function SuccessIcon() {
    return (
        <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-6 shadow-2xl shadow-green-500/50">
                    <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default SuccessIcon;
