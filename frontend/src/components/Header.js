import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path ? "text-blue-400" : "text-white/60 hover:text-white";
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur-sm sm:px-6 md:px-10 lg:px-20">
            <div className="flex items-center justify-between md:grid md:grid-cols-3">
                <div className="flex items-center gap-4 md:justify-self-start">
                    <h2 className="text-2xl font-bold font-heading tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 text-transparent bg-clip-text drop-shadow-sm">
                        The Blue Blade
                    </h2>
                </div>

                <div className="hidden md:flex items-center gap-8 md:justify-self-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className={`${isActive("/dashboard")} transition-colors text-sm font-medium`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/appointments")}
                        className={`${isActive("/appointments")} transition-colors text-sm font-medium`}
                    >
                        Appointments
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className={`${isActive("/profile")} transition-colors text-sm font-medium`}
                    >
                        Profile
                    </button>
                    <a
                        href="#"
                        className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                    >
                        About
                    </a>
                </div>

                <div className="flex items-center gap-4 md:justify-self-end">
                    {user?.role === "barber" && (
                        <button
                            onClick={() => navigate("/scanner")}
                            className="hidden sm:flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Scan QR
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <span className="text-sm font-medium hidden sm:inline">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div >
            </div >
        </header >
    );
}

export default Header;
