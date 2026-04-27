import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import Header from "../components/Header";
import { motion } from "framer-motion";

function AboutPage() {
  const [user, setUser] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await authAPI.getBarbers();
      const mappedBarbers = response.data.map((barber) => ({
        id: barber._id,
        name: barber.name,
        role: Array.isArray(barber.specialty)
          ? barber.specialty.length > 0
            ? barber.specialty
            : ["Professional Barber"]
          : [barber.specialty || "Professional Barber"],
        image:
          barber.profileImage ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}&backgroundColor=b6e3f4`,
        bio: "Experienced professional dedicated to your perfect look.",
      }));
      setBarbers(mappedBarbers);
    } catch (err) {
      console.error("Error fetching barbers:", err);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="bg-[#111621] min-h-screen text-[#e2e2ec] font-sans selection:bg-[#1754cf]/30 selection:text-white">
      <Header user={user} />

      <main className="flex flex-col">
        {/* Cinematic Hero Image */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative px-6 py-24 md:py-48 flex flex-col items-center text-center overflow-hidden bg-cover bg-center bg-no-repeat min-h-[65vh] justify-center"
          style={{ backgroundImage: "url('/assets/hair_salon_about.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#111621]/80 via-[#111621]/40 to-[#111621] pointer-events-none"></div>
          <div className="z-10 max-w-4xl space-y-6 mt-16">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight"
            >
              The Blue Blade
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-lg md:text-2xl text-[#c3c6d6] max-w-2xl mx-auto font-light"
            >
              Nơi mà bạn nên ghé tới sau chuỗi ngày dài mệt mỏi. Chúng tôi định nghĩa lại việc chăm sóc sắc đẹp nam giới bằng cách kết hợp sự tinh tế của nghề cắt tóc với một bầu không khí thư giãn.
            </motion.p>
          </div>
        </motion.section>

        {/* Introduction Section */}
        <section className="px-4 py-24 sm:px-6 md:px-10 lg:px-20 bg-[#111621]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-[12px] md:text-sm font-bold tracking-[0.2em] text-[#1754cf] uppercase mb-4">Nguồn gốc của The Blue Blade</h2>
            <h3 className="text-3xl md:text-5xl font-bold mb-8 text-white tracking-tight">Xây dựng niềm tin từ những điều nhỏ nhất</h3>
            <p className="text-lg text-[#c3c6d6] leading-relaxed mb-6 font-light">
              Được thành lập dựa trên niềm khát khao làm đẹp cho các cánh đàn ông các bạn trẻ, nơi mà bạn có thể tin tưởng. Tôi mong muốn tạo ra một không gian không bị ảnh hưởng bởi những yếu tố bên ngoài và sự hỗn loạn ồn ào của nhịp sống nhộn nhịp nơi thành thị. The Blue Blade được thành lập để cung cấp một bầu không khí sang trọng, chuyên nghiệp và thư giãn.
            </p>
            <p className="text-lg text-[#c3c6d6] leading-relaxed font-light">
              Mỗi chi tiết, từ chiếc ghế bọc da đến lưỡi dao sắc bén, đều được tuyển chọn tỉ mỉ và cẩn thận. Sự phát triển của chúng tôi trong những năm qua không nằm ở việc mở thêm cửa hàng, mà là hoàn thiện trải nghiệm độc đáo mà chúng tôi mang lại. Chúng tôi không chỉ cắt tóc; chúng tôi tạo nên phong cách cho bạn.
            </p>
          </motion.div>
        </section>

        {/* Contact Info Section */}
        <section className="px-4 py-20 bg-[#151926] border-y border-[#282a31]/50">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left"
          >
            <motion.div variants={fadeIn} className="flex flex-col items-center md:items-start p-8 rounded-2xl bg-[#1c2230] border border-[#282a31] hover:border-[#1754cf]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#1754cf]/10 flex items-center justify-center text-2xl mb-6 text-[#b4c5ff]">
                📍
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Địa chỉ</h4>
              <p className="text-[#c3c6d6] text-lg leading-relaxed">
                71/41, Phú Nhuận,<br />
                TP.HCM, Vietnam
              </p>
              <a href="https://maps.app.goo.gl/5JDDp2rfh4fWGg8p6" target="_blank" rel="noreferrer" className="mt-8 text-[#1754cf] font-medium text-sm tracking-widest uppercase hover:text-white transition-colors">
                Xem vị trí tại đây →
              </a>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col items-center md:items-start p-8 rounded-2xl bg-[#1c2230] border border-[#282a31] hover:border-[#1754cf]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#1754cf]/10 flex items-center justify-center text-2xl mb-6 text-[#b4c5ff]">
                📞
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Đặt lịch hẹn</h4>
              <p className="text-[#c3c6d6] text-lg leading-relaxed">
                Gọi cho chúng tôi để đặt lịch hẹn.<br />
                Việc đặt lịch hẹn có thể thay đổi tùy thuộc múi giờ.
              </p>
              <a href="tel:0383018738" className="mt-8 text-3xl font-bold text-white hover:text-[#1754cf] transition-colors">
                0383018738
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Barbers Team */}
        <section className="px-4 py-32 sm:px-6 md:px-10 lg:px-20 bg-[#111621]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-20"
            >
              <h2 className="text-[12px] md:text-sm font-bold tracking-[0.2em] text-[#1754cf] uppercase mb-4">Thành viên The Blue Blade</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white">Các thợ cắt tóc của chúng tôi</h3>
            </motion.div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {barbers.length > 0 ? (
                barbers.map((barber, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    key={barber.id}
                    onClick={() => navigate(`/barbers/${barber.id}`)}
                    className="group relative overflow-hidden rounded-xl bg-[#1c2230] border border-[#282a31] aspect-[3/4] cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-[#111621]/40 to-transparent z-10"></div>
                    <img
                      src={barber.image}
                      alt={barber.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {barber.role.map((r, idx) => (
                          <span key={idx} className="text-[#b4c5ff] text-[10px] font-bold uppercase tracking-widest bg-[#1754cf]/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            {r}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-1 group-hover:text-[#1754cf] transition-colors">{barber.name}</h4>
                      <p className="text-[#a7b7ed] text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-300 font-medium">
                        View Profile →
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-[#c3c6d6] py-12">
                  Loading our master barbers...
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-[#c3c6d6] text-sm border-t border-[#282a31] bg-[#0c0e15]">
        <p className="tracking-wide">&copy; {new Date().getFullYear()} Obsidian Groom / The Blue Blade. Premium Care.</p>
      </footer>
    </div>
  );
}

export default AboutPage;
