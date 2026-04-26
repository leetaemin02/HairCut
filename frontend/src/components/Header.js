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
        <header className="sticky top-0 z-50 bg-navy px-6 py-5 sm:px-10 lg:px-20 border-b border-white/5 ">
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
                        Trang chủ
                    </button>
                    <button
                        onClick={() => {
                            if (user?.role === "barber") navigate("/barber-dashboard");
                            else navigate("/services");
                        }}
                        className={`font-serif text-[18px] transition-colors ${(location.pathname === "/services" || location.pathname === "/barber-dashboard") ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                    >
                        {user?.role === "barber" ? "Barber Portal" : "Dịch vụ"}
                    </button>

                    <button
                        onClick={() => navigate("/about")}
                        className={`font-serif text-[18px] transition-colors ${location.pathname === "/about" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                    >
                        Giới thiệu
                    </button>
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className={`font-serif text-[18px] transition-colors ${location.pathname === "/admin" ? "text-white font-semibold underline underline-offset-8" : "text-white/80 hover:text-white"}`}
                        >
                            Quản trị
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/appointments")}
                        className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-serif font-bold rounded-full  transition-all transform hover:scale-105 animate-pulse-soft"
                        style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    >
                        ✂ Đặt Lịch Ngay
                    </button>
                    {user ? (
                        <div className="relative group flex items-center gap-2 border-l border-white/20 pl-6 cursor-pointer py-2">
                            <span className="font-serif text-white/90 hidden sm:inline text-lg">Hi, {user.name}</span>
                            <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            
                            <div className="absolute right-0 top-[100%] w-60 bg-[#1c2230] rounded-xl  border border-[#282a31] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden translate-y-2 group-hover:translate-y-0">
                                <button onClick={() => navigate("/profile")} className="text-left px-5 py-3.5 text-[#c3c6d6] hover:text-white hover:bg-white/5 transition-colors font-serif border-b border-[#282a31] text-sm tracking-wide">
                                    Thông tin cá nhân
                                </button>
                                <button onClick={() => navigate("/profile?tab=history")} className="text-left px-5 py-3.5 text-[#c3c6d6] hover:text-white hover:bg-white/5 transition-colors font-serif border-b border-[#282a31] text-sm tracking-wide">
                                    Lịch sử đặt lịch hẹn
                                </button>
                                <button onClick={() => navigate("/profile?tab=voucher")} className="text-left px-5 py-3.5 text-[#c3c6d6] hover:text-white hover:bg-white/5 transition-colors font-serif border-b border-[#282a31] text-sm tracking-wide flex justify-between items-center">
                                    <span>Ví Voucher</span>
                                    <span className="bg-[#1754cf] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Mới</span>
                                </button>
                                <button onClick={handleLogout} className="text-left px-5 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-serif text-sm tracking-wide">
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-6 py-2 border border-white/30 hover:bg-white/10 text-white font-serif rounded-full transition-all"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}

export default Header;

