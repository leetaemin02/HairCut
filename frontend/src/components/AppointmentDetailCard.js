import React from "react";

function AppointmentDetailCard({ icon, iconBgColor, iconColor, label, title, subtitle }) {
    return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-4">
                <div className={`${iconBgColor} rounded-lg p-3`}>
                    <svg
                        className={`w-6 h-6 ${iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {icon}
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1">
                        {label}
                    </p>
                    <p className="text-white font-bold text-lg">{title}</p>
                    {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}

export default AppointmentDetailCard;
