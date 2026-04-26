import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceAPI } from "../services/api";
import Header from "../components/Header";
import { motion } from "framer-motion";

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServices();
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group services by category
  const categories = [...new Set(services.map((s) => s.category || "Khác"))];

  const groupedServices = categories.reduce((acc, category) => {
    acc[category] = services.filter((s) => (s.category || "Khác") === category);
    return acc;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white font-sans">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif mb-6 tracking-tight"
          >
            Các dịch vụ của chúng tôi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-serif italic"
          >
            Khám phá những dịch vụ làm tóc và chăm sóc dành cho phái mạnh.
          </motion.p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.replace(/\s+/g, '-').toLowerCase()}`}
              className="px-6 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-sm font-medium tracking-widest uppercase"
            >
              {category}
            </a>
          ))}
        </div>

        {/* Categorized Services */}
        <div className="space-y-24">
          {categories.map((category) => (
            <section
              key={category}
              id={category.replace(/\s+/g, '-').toLowerCase()}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-3xl font-serif font-bold tracking-widest uppercase whitespace-nowrap">
                  {category}
                </h2>
                <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent"></div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {groupedServices[category].map((service) => (
                  <motion.div
                    key={service._id}
                    variants={itemVariants}
                    className="group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full "
                  >
                    {/* Service Image */}
                    <div
                      className="relative h-64 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/services/${service._id}`)}
                    >
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">
                          ✂️
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-lg">View Details →</span>
                      </div>

                      {/* Popular Badge */}
                      {service.completedCount > 10 && (
                        <div className="absolute top-4 right-4 bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                          Most Popular
                        </div>
                      )}
                    </div>

                    {/* Service Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3
                          className="text-xl font-serif font-bold group-hover:text-blue-400 transition-colors cursor-pointer"
                          onClick={() => navigate(`/services/${service._id}`)}
                        >
                          {service.name}
                        </h3>
                        <div className="text-right">
                          <p className="text-blue-400 font-bold tracking-widest">{Number(service.price).toLocaleString('vi-VN')} VND</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{service.duration} mins</p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                        {service.description || "Indulge in a premium grooming experience tailored specifically for your unique style and rejuvenation."}
                      </p>

                      <button
                        onClick={() => navigate("/appointments", { state: { serviceId: service._id } })}
                        className="w-full py-4 bg-transparent border border-white/20 hover:bg-white hover:text-slate-950 transition-all duration-300 font-bold text-sm tracking-widest uppercase rounded-md group-hover:border-white group-hover:"
                      >
                        Đặt lịch ngay
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      </main>

      <footer className="py-20 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-serif text-white mb-6 tracking-widest">THE BLUE BLADE</h2>
          <p className="mb-8">Địa điểm làm đẹp của phái mạnh</p>
          <div className="flex justify-center gap-8 mb-12">
            <a href="#" className="hover:text-blue-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
          </div>
          <p>&copy; {new Date().getFullYear()} The Blue Blade Barber Shop.</p>
        </div>
      </footer>
    </div>
  );
}

export default ServicesPage;

