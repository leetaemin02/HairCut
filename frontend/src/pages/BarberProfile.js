import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI, serviceAPI } from "../services/api";
import Header from "../components/Header";

function BarberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [services, setServices] = useState([]);
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
      const barberRes = await authAPI.getBarberById(id);
      setBarber(barberRes.data);

      // Fetch services that this barber specializes in
      const allServicesRes = await serviceAPI.getServices();
      const barberServices = allServicesRes.data.filter(service => 
        barberRes.data.specialty.includes(service.name)
      );
      setServices(barberServices);
    } catch (err) {
      console.error("Error fetching barber profile:", err);
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

  if (!barber) {
    return (
      <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Barber Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="text-blue-400 underline">Back to Dashboard</button>
      </div>
    );
  }

  const profileImage = barber.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}&backgroundColor=b6e3f4`;

  return (
    <div className="bg-navy min-h-screen text-white">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4] group">
              <img
                src={profileImage}
                alt={barber.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl font-bold text-white mb-2">{barber.name}</h1>
                <p className="text-blue-400 font-medium uppercase tracking-widest text-sm">Master Barber</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-xl">📧</span>
                    <span>{barber.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-xl">📞</span>
                    <span>{barber.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/appointments", { state: { barberId: barber._id } })}
                className="w-full py-4 bg-white text-navy font-serif font-bold text-lg rounded-full hover:bg-white/90 transition-all shadow-lg"
              >
                Book with {barber.name.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* Right Column: Specialties & Services */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-4xl font-serif mb-6 text-white tracking-wider">Professional Profile</h2>
              <p className="text-xl text-slate-300 leading-relaxed font-serif italic">
                Experience the pinnacle of grooming with {barber.name}. With years of experience and a passion for modern styles, {barber.name} specializes in delivering precision cuts and exceptional service.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <span>✂️</span> Expertise & Specialties
              </h3>
              <div className="flex flex-wrap gap-3">
                {barber.specialty && barber.specialty.length > 0 ? (
                  barber.specialty.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase tracking-widest text-xs"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">Professional Barbering</span>
                )}
              </div>
            </div>

            {services.length > 0 && (
              <div>
                <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                  <span>✨</span> Available Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div 
                      key={service._id}
                      onClick={() => navigate(`/services/${service._id}`)}
                      className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{service.name}</h4>
                        <span className="text-blue-400 font-bold">{Number(service.price).toLocaleString('vi-VN')} VND</span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{service.description}</p>
                      <div className="text-xs text-slate-500 font-medium">Duration: {service.duration} mins</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} The Blue Blade. Premium Grooming Excellence.</p>
      </footer>
    </div>
  );
}

export default BarberProfile;
