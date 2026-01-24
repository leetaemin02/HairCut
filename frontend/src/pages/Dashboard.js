import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceAPI, authAPI, lookbookAPI } from "../services/api";
import Header from "../components/Header";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [lookbookItems, setLookbookItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchServices();
    fetchBarbers();
    fetchLookbook();
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
        role: barber.specialty || "Professional Barber",
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



  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      {/* Header - Consistent with AppointmentsPage */}
      <Header user={user} />

      <main className="flex flex-col">
        {/* Hero Section */}
        <section
          className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/banner.jpg')" }}
        >
          <div className="absolute inset-0 bg-slate-900/80 pointer-events-none"></div>
          <div className="z-10 max-w-4xl space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              ✨ Welcome to the best grooming experience
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight bg-gradient-to-r from-white via-white to-slate-400 text-transparent bg-clip-text">
              Elevate Your Style
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Experience premium haircutting services tailored to the modern gentleman.
              From classic cuts to hot towel shaves, we define excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button
                onClick={() => navigate("/appointments")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 transition-transform text-white font-bold rounded-xl shadow-lg shadow-blue-500/25"
              >
                Book Appointment
              </button>
              <button
                onClick={() => document.getElementById('location').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-bold rounded-xl"
              >
                Find Location
              </button>
            </div>
          </div>
        </section>

        {/* Features / Services Preview */}
        <section className="px-4 py-16 sm:px-6 md:px-10 lg:px-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading mb-4">Our Premium Services</h2>
              <p className="text-slate-400">Top-tier grooming packages selected for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.length > 0 ? (
                services.map((service) => (
                  <div key={service._id} className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
                    <div className="w-full h-64 mb-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden shadow-lg border border-white/5 relative">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "✂️"
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description || "Experience the best quality service with our experts."}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 font-bold">{Number(service.price).toLocaleString('vi-VN')} VND</span>

                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-slate-500">Loading services...</div>
              )}
            </div>
          </div>
        </section>

        {/* Barbers Team */}
        <section id="about" className="px-4 py-20 sm:px-6 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold font-heading mb-4">Master Barbers</h2>
                <p className="text-slate-400 max-w-md">Our team of experienced professionals dedicated to your perfect look.</p>
              </div>
              <button
                onClick={() => navigate("/appointments")}
                className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                Book with them <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 aspect-[3/4] group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 opacity-90"></div>
                  <img
                    src={barber.image}
                    alt={barber.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">{barber.role}</p>
                    <h3 className="text-xl font-bold text-white mb-2">{barber.name}</h3>
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
              <h2 className="text-3xl font-bold font-heading mb-4">Style Lookbook</h2>
              <p className="text-slate-400">Inspiration from our latest cuts and styles.</p>
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
                <h2 className="text-3xl font-bold font-heading mb-6">Visit Our Studio</h2>
                <p className="text-slate-400 mb-8">
                  Located in the heart of the city, our modern studio provides a relaxing
                  atmosphere where you can unwind while we take care of your style.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📍</div>
                    <div>
                      <h4 className="font-bold text-white">Address</h4>
                      <p className="text-slate-400">123 Grooming Blvd, Downtown District<br />Metropolis, NY 10012</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">🕒</div>
                    <div>
                      <h4 className="font-bold text-white">Opening Hours</h4>
                      <p className="text-slate-400">Mon - Sat: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">📞</div>
                    <div>
                      <h4 className="font-bold text-white">Contact</h4>
                      <p className="text-slate-400">(555) 123-4567<br />hello@theblueblade.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Map / Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border block border-white/10 shadow-2xl">
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
