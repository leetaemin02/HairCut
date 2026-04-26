import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceAPI, authAPI, lookbookAPI, reviewAPI } from "../services/api";
import Header from "../components/Header";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [lookbookItems, setLookbookItems] = useState([]);
  const [barberRatingStats, setBarberRatingStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchServices();
    fetchBarbers();
    fetchLookbook();
    fetchBarberRatings();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getServices();
      setServices(response.data.slice(0, 3)); // Show top 3 services
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await authAPI.getBarbers();
      const mappedBarbers = response.data.map((barber) => ({
        id: barber._id,
        name: barber.name,
        role: Array.isArray(barber.specialty) ? (barber.specialty.length > 0 ? barber.specialty : ["Professional Barber"]) : [barber.specialty || "Professional Barber"],
        image: barber.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}&backgroundColor=b6e3f4`,
        bio: "Experienced professional dedicated to your perfect look.",
      }));
      setBarbers(mappedBarbers.slice(0, 3)); // Show top 3 barbers
    } catch (err) {
      console.error("Error fetching barbers:", err);
    }
  };

  const fetchLookbook = async () => {
    try {
      const response = await lookbookAPI.getLookbook();
      setLookbookItems(response.data);
    } catch (err) {
      console.error("Error fetching lookbook:", err);
    }
  };

  const fetchBarberRatings = async () => {
    try {
      const res = await reviewAPI.getBarberRatingStats();
      setBarberRatingStats(res.data);
    } catch (err) {
      console.error("Error fetching barber ratings:", err);
    }
  };



  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      {/* Header - Consistent with AppointmentsPage */}
      <Header user={user} />

      <main className="flex flex-col">
        {/* Hero Section */}
        <section
          className="relative px-6 py-24 md:py-48 flex flex-col items-center text-center overflow-hidden bg-cover bg-center bg-no-repeat min-h-[85vh] justify-center"
          style={{ backgroundImage: "url('/assets/banner.jpg')" }}
        >
          <div className="absolute inset-0 bg-[#0D1B2A]/70 pointer-events-none"></div>
          <div className="z-10 max-w-5xl space-y-8">
            <h1
              className="text-6xl md:text-6xl font-serif text-white tracking-tight leading-tight"
            >
              Elevate Your Style
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-serif italic">
              Experience premium haircutting services tailored to the modern gentleman.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <button
                onClick={() => navigate("/appointments")}
                className="px-10 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-navy transition-all text-white font-serif font-bold text-lg rounded-full"
              >
                Book Here
              </button>
            </div>
          </div>
        </section>

        {/* Features / Services Preview */}
        <section className="px-4 py-16 sm:px-6 md:px-10 lg:px-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading mb-4">Dịch vụ được ưa chuộng nhất</h2>
              <p className="text-slate-400">Khách hàng khác đã thử, còn bạn thì sao ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => navigate(`/services/${service._id}`)}
                    className="group p-6 rounded-2xl bg-white/5 border border-white/5 transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="w-full h-64 mb-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-4xl transition-transform overflow-hidden  border border-white/5 relative">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {service.completedCount || 0} lần được khách hàng tin dùng
                    </div>
                    <h3 className="text-1xl font-serif font-bold mb-2 transition-colors uppercase tracking-widest">{service.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-blue-400 font-bold tracking-widest">{Number(service.price).toLocaleString('vi-VN')} VND</span>
                      <span className="text-sm text-slate-500 underline underline-offset-4 group-hover:text-white transition-colors">Chi tiết →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-slate-500">Đang tải dịch vụ ....</div>
              )}
            </div>
          </div>
        </section>

        {/* Barbers Team */}
        <section id="about" className="px-4 py-20 sm:px-6 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold font-heading mb-4">Các thợ chính của chúng tôi</h2>
                <p className="text-slate-400 max-w-md">Đội ngũ thợ chính của chúng tôi với nhiều năm kinh nghiệm trong nghề, cam kết mang đến cho bạn những kiểu tóc ưng ý nhất.</p>
              </div>
              <button
                onClick={() => navigate("/appointments")}
                className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                Liên hệ ngay <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  onClick={() => navigate(`/barbers/${barber.id}`)}
                  className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 aspect-[3/4] group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 opacity-90"></div>
                  <img
                    src={barber.image}
                    alt={barber.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {barber.role.map((r, idx) => (
                        <span key={idx} className="text-blue-400 text-[10px] font-bold uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">{r}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{barber.name}</h3>

                    {/* Star Rating */}
                    {(() => {
                      const stats = barberRatingStats[barber.id];
                      if (!stats) return <p className="text-slate-400 text-xs mb-1">Chưa có đánh giá</p>;
                      const fullStars = Math.floor(stats.avgRating);
                      const halfStar = stats.avgRating - fullStars >= 0.5;
                      return (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                              <span key={i} className={`text-sm ${i <= fullStars ? 'text-yellow-400'
                                : i === fullStars + 1 && halfStar ? 'text-yellow-400/60'
                                  : 'text-white/20'
                                }`}>★</span>
                            ))}
                          </div>
                          <span className="text-yellow-400 text-xs font-bold">{stats.avgRating}</span>
                          <span className="text-white/40 text-xs">({stats.reviewCount})</span>
                        </div>
                      );
                    })()}

                    <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">{barber.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lookbook Section */}
        <section className="px-4 py-20 bg-slate-900/30 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading mb-4">Các mẫu tóc được ưa chuộng</h2>
              <p className="text-slate-400">Tham khảo các mẫu tóc được ưa chuộng nhất hiện nay.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lookbookItems.length > 0 ? (
                lookbookItems.map((item) => (
                  <div key={item._id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      {item.category && <p className="text-xs text-blue-400">{item.category}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-white/10 rounded-xl">
                  <p>Check back soon for our latest styles!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="px-4 py-20 bg-slate-950 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold font-heading mb-6">Ghé thăm tiệm của chúng tôi</h2>
                <p className="text-slate-400 mb-8">
                  Tọa lạc tại trung tâm thành phố, studio hiện đại của chúng tôi mang đến một không gian thư giãn, nơi bạn có thể thư giãn trong khi chúng tôi chăm sóc phong cách của bạn.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📍</div>
                    <div>
                      <h4 className="font-bold text-white">Địa chỉ</h4>
                      <p className="text-slate-400">71/41, Đường Nguyễn Công Hoan, P7<br />Quận Phú Nhuận, TP.HCM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">🕒</div>
                    <div>
                      <h4 className="font-bold text-white">Giờ mở cửa</h4>
                      <p className="text-slate-400">Thứ 2 - Thứ 7: 9:00 AM - 5:00 PM<br />Chủ Nhật: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📞</div>
                    <div>
                      <h4 className="font-bold text-white">Liên hệ</h4>
                      <p className="text-slate-400">0383018738<br />theminh30205@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Map / Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border block border-white/10 ">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <span className="text-slate-600 font-bold">Map Visualization Placeholder</span>
              </div>
              {/* In a real app, embed Google Maps iframe here */}
              <iframe
                title="Map"
                width="100%"
                height="100%"
                style={{ border: 0, opacity: 0.6 }}
                loading="lazy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564756836!5m2!1sen!2s"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} The Blue Blade Barber Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Dashboard;

