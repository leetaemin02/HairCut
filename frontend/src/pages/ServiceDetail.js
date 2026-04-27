import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serviceAPI, authAPI } from "../services/api";
import Header from "../components/Header";

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const serviceRes = await serviceAPI.getServiceById(id);
      setService(serviceRes.data);

      const barbersRes = await authAPI.getBarbersByService(serviceRes.data.name);
      setBarbers(barbersRes.data);
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Service Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="text-blue-400 underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Image, Description, Process */}
          <div className="lg:col-span-2 space-y-12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9]">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent"></div>
            </div>

            <div>
              <h1 className="text-5xl font-serif mb-6 text-white tracking-wider">{service.name}</h1>
              <p className="text-xl text-slate-300 leading-relaxed font-serif italic">
                {service.description || "Trải nghiệm dịch vụ đẳng cấp 5 sao"}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing & Barbers */}
          <div className="space-y-8">
            {/* Booking Card */}
            <div className="top-28 bg-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md">
              <div className="mb-6">
                <span className="text-slate-400 text-sm uppercase tracking-widest font-bold">Dịch vụ chăm sóc</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold text-white tracking-widest">{Number(service.price).toLocaleString('vi-VN')}</span>
                  <span className="text-blue-400 font-bold">VND</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-400">
                  <span>Thời gian dự kiến:</span>
                  <span className="text-white font-medium">{Number(service.duration)} phút</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/appointments", { state: { serviceId: service._id } })}
                className="w-full py-4 bg-white text-navy font-serif font-bold text-xl rounded-md hover:bg-white/90 transition-all shadow-lg"
              >
                Đặt lịch ngay
              </button>

              <p className="text-xs text-center text-slate-500 mt-4 italic">
                * Giá có thể thay đổi tùy theo yêu cầu cụ thể
              </p>
            </div>

            {/* Specialist Barbers */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-red-400">
                Thợ chuyên nghiệp
              </h3>
              <div className="space-y-6">
                {barbers.length > 0 ? (
                  barbers.map((barber) => (
                    <div key={barber._id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/barbers/${barber._id}`)}>
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                        <img
                          src={barber.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}&backgroundColor=b6e3f4`}
                          alt={barber.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{barber.name}</h4>
                        <p className="text-sm text-slate-500 italic">Chuyên gia trong lĩnh vực {service.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Thợ của chúng tôi đều được đào tạo cho dịch vụ này.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} The Blue Blade. Premium Grooming Excellence.</p>
      </footer>
    </div>
  );
}

export default ServiceDetail;