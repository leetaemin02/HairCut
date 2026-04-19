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
        <header className="sticky top-0 z-50 bg-navy px-6 py-5 sm:px-10 lg:px-20 border-b border-white/5 shadow-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h2
                        onClick={() => navigate("/dashboard")}
                        className="text-3xl font-logo text-white tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        The Blue Blade
                    </h2>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className={`font-serif text-[18px] transition-colors ${location.pathname === "/dashboard" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            if (user?.role === "barber") navigate("/barber-dashboard");
                            else navigate("/services");
                        }}
                        className={`font-serif text-[18px] transition-colors ${(location.pathname === "/services" || location.pathname === "/barber-dashboard") ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                    >
                        {user?.role === "barber" ? "Barber Portal" : "Services"}
                    </button>
                    {user?.role !== "admin" && (
                        <button
                            onClick={() => navigate("/profile")}
                            className={`font-serif text-[18px] transition-colors ${location.pathname === "/profile" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                        >
                            Customer
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/about")}
                        className={`font-serif text-[18px] transition-colors ${location.pathname === "/about" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                    >
                        About
                    </button>
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className={`font-serif text-[18px] transition-colors ${location.pathname === "/admin" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                        >
                            Admin
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="font-serif text-white/90 hidden sm:inline text-lg">Hi, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-white/60 hover:text-white transition-colors text-sm font-serif ml-2"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2 border border-white/30 hover:bg-white/10 text-white font-serif rounded-full transition-all"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header >
    );
}

export default Header;
