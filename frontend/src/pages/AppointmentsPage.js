import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { appointmentAPI, serviceAPI, authAPI, voucherAPI, reviewAPI } from "../services/api";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";

function AppointmentsPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Booking flow state (for customers)
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateOnly, setSelectedDateOnly] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Voucher & Review states
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState({ text: "", ok: false });
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // { appointmentId, barberId }
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAppointments();
      fetchServices();
      if (parsedUser?.role === "customer") {
        fetchBarbers();

        // Handle pre-selected service from navigation state
        if (location.state && location.state.serviceId) {
          setSelectedServices([location.state.serviceId]);
          setStep(2); // Jump to barber selection
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, searchTerm, filterStatus, filterService, sortBy]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getAppointments();
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getServices();
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await authAPI.getBarbers();
      // Add default specialty if missing
      const barbersWithSpecialty = response.data.map(barber => ({
        ...barber,
        specialty: barber.specialty || "Professional Barber"
      }));
      setBarbers(barbersWithSpecialty);
    } catch (err) {
      console.error("Error fetching barbers:", err);
    }
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.serviceId?.name?.toLowerCase().includes(term) ||
          apt.customerId?.name?.toLowerCase().includes(term) ||
          apt.customerId?.phone?.includes(term) ||
          apt.appointmentId?.includes(term)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    // Service filter
    if (filterService !== "all") {
      filtered = filtered.filter((apt) => apt.serviceId?._id === filterService);
    }

    // Sort
    filtered.sort((a, b) => {
      const aDate = new Date(a.appointmentDate);
      const bDate = new Date(b.appointmentDate);

      switch (sortBy) {
        case "date-asc":
          return aDate - bDate;
        case "date-desc":
          return bDate - aDate;
        case "price-high":
          return b.totalPrice - a.totalPrice;
        case "price-low":
          return a.totalPrice - b.totalPrice;
        default:
          return bDate - aDate;
      }
    });

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    if (selectedDateOnly && selectedBarber && selectedServices.length > 0) {
      fetchAvailableSlots();
    }
  }, [selectedDateOnly, selectedBarber, selectedServices]);

  const fetchAvailableSlots = async () => {
    setSlotsLoading(true);
    try {
      // Send date as YYYY-MM-DD to avoid UTC conversion issues
      const y = selectedDateOnly.getFullYear();
      const m = String(selectedDateOnly.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDateOnly.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const response = await appointmentAPI.getAvailableSlots({
        barberId: selectedBarber,
        date: dateStr,
        serviceIds: selectedServices
      });

      const slots = response.data.availableSlots || [];
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Error fetching available slots:", err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    );
    const prevDaysInMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevDaysInMonth - i,
        isCurrentMonth: false,
        date: null,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: null,
      });
    }

    return days;
  };



  const handleDateSelect = (date) => {
    setSelectedDateOnly(date);
    setStep(3.5);
    setAvailableSlots([]);
    setSelectedTime("");
  };

  const handleTimeSelect = (time) => {
    if (selectedDateOnly) {
      const [timePart, period] = time.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      let adjustedHours = hours;

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) {
        adjustedHours = hours + 12;
      } else if (period === "AM" && hours === 12) {
        adjustedHours = 0;
      }

      // Extract date components to avoid timezone issues
      const year = selectedDateOnly.getFullYear();
      const month = selectedDateOnly.getMonth();
      const day = selectedDateOnly.getDate();

      // Create a fresh date object with the selected date and time in local timezone
      const fullDate = new Date(year, month, day, adjustedHours, minutes, 0, 0);

      // Convert to ISO string (UTC) for storage in MongoDB
      const utcDateString = fullDate.toISOString();

      setSelectedTime(time);
      // Send UTC string - will be stored as UTC in MongoDB
      setAppointmentDate(utcDateString);
      setStep(4);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingLoading(true);

    try {
      const response = await appointmentAPI.createAppointment({
        barberId: selectedBarber,
        serviceIds: selectedServices,
        appointmentDate,
        notes,
        voucherCode: voucherCode || undefined,
      });

      // Navigate to confirmation page with appointment data
      navigate("/appointment-confirmation", {
        state: { appointment: response.data.appointment },
      });
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    setVoucherMsg({ text: "", ok: false });
    try {
      const res = await voucherAPI.validateVoucher({ code: voucherInput.trim() });
      setVoucherCode(voucherInput.trim().toUpperCase());
      setVoucherDiscount(res.data.discountPercent);
      setVoucherMsg({ text: `✓ Áp dụng thành công! Giảm ${res.data.discountPercent}%`, ok: true });
    } catch (err) {
      setVoucherCode("");
      setVoucherDiscount(0);
      setVoucherMsg({ text: err.response?.data?.message || "Mã không hợp lệ", ok: false });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleOpenReview = (appointment) => {
    setReviewTarget({ appointmentId: appointment._id, barberId: appointment.barberId?._id });
    setReviewForm({ rating: 5, comment: "" });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await reviewAPI.createReview({
        appointmentId: reviewTarget.appointmentId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      alert("Cảm ơn bạn đã đánh giá dịch vụ!");
      setShowReviewModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    const isSpecial = service.category === "Gói đặt biệt" || service.category === "Gói đặc biệt";

    if (isSpecial) {
      // If choosing special package, it's exclusive
      setSelectedServices([service._id]);
    } else {
      // If choosing normal service, remove any special package first
      setSelectedServices((prev) => {
        const filtered = prev.filter((id) => {
          const s = services.find((srv) => srv._id === id);
          return s && s.category !== "Gói đặt biệt" && s.category !== "Gói đặc biệt";
        });

        if (filtered.includes(service._id)) {
          return filtered.filter((id) => id !== service._id);
        } else {
          return [...filtered, service._id];
        }
      });
    }
  };

  const downloadQRCode = (appointmentId) => {
    const element = document.getElementById(`qr-${appointmentId}`);
    const canvas = element.querySelector("canvas");
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointment-${appointmentId}.png`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/30";
      case "confirmed":
        return "bg-green-500/20 text-green-200 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-200 border-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-200 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/30";
    }
  };

  const selectedServicesData = services.filter(s => selectedServices.includes(s._id));
  const totalSummaryPrice = selectedServicesData.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const progressWidth = (step / 4) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <Header user={user} />

      {/* Main Content */}
      <main className="flex flex-1 justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-7xl space-y-8">
          {/* Customer Booking Section */}
          {user?.role === "customer" && (
            <>
              {/* Booking Header */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold font-heading">
                    Book Your Appointment
                  </h1>
                  <div className="flex items-center gap-6 mt-4">
                    <p className="text-sm font-medium text-white/60">
                      <span className="text-blue-400 font-bold">
                        1. Service
                      </span>{" "}
                      &gt; 2. Barber &gt; 3. Time &gt; 4. Details
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="rounded-full bg-white/10 h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${progressWidth}%` }}
                  ></div>
                </div>
              </div>

              {bookingError && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                {/* Booking Form */}
                <div className="flex flex-col gap-8 lg:col-span-2">
                  {/* Step 1: Select Service */}
                  <section>
                    <h2 className="text-2xl font-bold font-heading pb-4">
                      Select a Service
                    </h2>

                    {/* Render by categories */}
                    {[...new Set(services.map(s => s.category || "Khác"))].map((category) => (
                      <div key={category} className="mb-10">
                        <div className="flex items-center gap-4 mb-6">
                          <h3 className="text-lg font-bold text-blue-400 uppercase tracking-widest">
                            {category}
                          </h3>
                          <div className="h-px flex-1 bg-white/10"></div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {services
                            .filter(s => (s.category || "Khác") === category)
                            .map((service, index) => (
                              <motion.div
                                key={service._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleServiceSelect(service)}
                                className={`flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 shadow-lg ${selectedServices.includes(service._id)
                                  ? "border-blue-500 bg-blue-500/20 shadow-blue-500/20"
                                  : "border-transparent bg-white/5 hover:border-white/20 hover:bg-white/10"
                                  }`}
                              >
                                <div className="w-full aspect-square bg-gradient-to-br from-blue-600 to-cyan-600 rounded-md flex items-center justify-center overflow-hidden">
                                  {service.image ? (
                                    <img
                                      src={service.image}
                                      alt={service.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-4xl">✂️</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-bold">
                                    {service.name}
                                  </p>
                                  <p className="text-white/60 text-sm">
                                    {Number(service.price).toLocaleString('vi-VN')} VND
                                  </p>
                                  <p className="text-white/60 text-sm pt-1">
                                    {service.description || "Professional service"}
                                  </p>
                                </div>
                                {selectedServices.includes(service._id) && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white fill-current">
                                    ✓
                                  </div>
                                )}
                              </motion.div>
                            ))}
                        </motion.div>
                      </div>
                    ))}

                    {/* Next step button for multi-selection */}
                    {selectedServices.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end mt-8"
                      >
                        <button
                          onClick={() => setStep(2)}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                          Next Step: Choose Barber
                        </button>
                      </motion.div>
                    )}
                  </section>

                  {/* Step 2: Choose Barber */}
                  {step >= 2 && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading pb-4">
                        Choose Your Barber
                      </h2>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {barbers.map((barber, index) => (
                          <motion.div
                            key={barber._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, rotate: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedBarber(barber._id);
                              setStep(3);
                            }}
                            className={`flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 shadow-lg ${selectedBarber === barber._id
                              ? "border-blue-500 bg-blue-500/20 shadow-blue-500/20"
                              : "border-transparent bg-white/5 hover:border-white/20 hover:bg-white/10"
                              }`}
                          >
                            <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-md flex items-center justify-center overflow-hidden">
                              <img
                                src={
                                  barber.profileImage ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}&backgroundColor=b6e3f4`
                                }
                                alt={barber.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-white font-bold">
                                {barber.name}
                              </p>
                              <p className="text-white/60 text-sm">
                                {barber.specialty}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-white/20 bg-transparent cursor-pointer transition-all hover:border-white/40 hover:text-white/80 text-white/60"
                        >
                          <span className="text-4xl">👥</span>
                          <p className="text-base font-bold text-center">
                            Any Available
                          </p>
                        </motion.div>
                      </motion.div>
                    </section>
                  )}

                  {/* Step 3: Date & Time */}
                  {step >= 3 && (
                    <>
                      <section className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-xl font-bold font-heading text-white">
                            {currentMonth.toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })}
                          </h2>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() - 1
                                  )
                                )
                              }
                              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                              ◀
                            </button>
                            <button
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth() + 1
                                  )
                                )
                              }
                              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold text-white/40 mb-2">
                            <div>MON</div>
                            <div>TUE</div>
                            <div>WED</div>
                            <div>THU</div>
                            <div>FRI</div>
                            <div>SAT</div>
                            <div>SUN</div>
                          </div>

                          <div className="grid grid-cols-7 gap-2">
                            {generateCalendarDays().map((dayObj, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (dayObj.isCurrentMonth && dayObj.date) {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    if (dayObj.date >= today) {
                                      handleDateSelect(dayObj.date);
                                    }
                                  }
                                }}
                                disabled={!dayObj.isCurrentMonth || (dayObj.date && dayObj.date < new Date().setHours(0, 0, 0, 0))}
                                className={`aspect-square flex items-center justify-center rounded-lg font-medium transition-all ${!dayObj.isCurrentMonth || (dayObj.date && dayObj.date < new Date().setHours(0, 0, 0, 0))
                                  ? "text-white/20 cursor-default"
                                  : selectedDateOnly &&
                                    selectedDateOnly.toDateString() ===
                                    dayObj.date.toDateString()
                                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                    : "text-white cursor-pointer hover:bg-blue-600/20"
                                  }`}
                              >
                                {dayObj.day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Time Slots */}
                      {selectedDateOnly && (
                        <section>
                          <h3 className="text-white text-lg font-bold font-heading mb-4">
                            Available Times (
                            {selectedDateOnly.toLocaleDateString("default", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                            )
                          </h3>
                          {slotsLoading ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                              <p className="text-white/60">No available slots for this date. Please try another day.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {availableSlots.map((slot) => {
                                const isBooked = !slot.isAvailable;

                                return (
                                  <button
                                    key={slot.formattedTime}
                                    onClick={() => !isBooked && handleTimeSelect(slot.formattedTime)}
                                    disabled={isBooked}
                                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${selectedTime === slot.formattedTime
                                      ? "border-2 border-blue-600 bg-blue-600/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                      : isBooked
                                        ? "border border-white/5 bg-white/5 text-white/20 cursor-not-allowed line-through"
                                        : "border border-white/10 bg-white/5 text-white hover:border-blue-600 hover:bg-blue-600/10"
                                      }`}
                                  >
                                    {slot.formattedTime}
                                    {isBooked && <span className="block text-[8px] mt-1 opacity-60">BOOKED</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </section>
                      )}
                    </>
                  )}

                  {/* Step 4: Additional Details */}
                  {step >= 4 && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading pb-4">
                        Additional Details
                      </h2>
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
                        <div>
                          <label className="block text-white/60 text-sm mb-2">
                            Special Requests
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special requests or preferences?"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-white/30"
                            rows="4"
                          />
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Booking Summary Sidebar */}
                <aside className="lg:col-span-1">
                  <div className="sticky top-28 flex flex-col gap-6 rounded-xl bg-white/5 p-6 border border-white/10">
                    <h3 className="text-xl font-bold font-heading text-white">
                      Appointment Summary
                    </h3>

                    {selectedServicesData.length > 0 && selectedServicesData.map((service) => (
                      <div key={service._id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded flex-shrink-0 flex items-center justify-center text-xl">
                          ✂️
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/50 uppercase font-bold tracking-wider">
                            Service
                          </p>
                          <p className="text-sm font-bold text-white">
                            {service.name}
                          </p>
                          <p className="text-xs text-white/60">
                            {Number(service.price).toLocaleString('vi-VN')} VND
                          </p>
                        </div>
                      </div>
                    ))}

                    {selectedBarber && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              barbers.find((b) => b._id === selectedBarber)?.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${barbers.find((b) => b._id === selectedBarber)?.name || 'User'
                              }&backgroundColor=b6e3f4`
                            }
                            alt="Barber"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/50 uppercase font-bold tracking-wider">
                            Barber
                          </p>
                          <p className="text-sm font-bold text-white">
                            {
                              barbers.find((b) => b._id === selectedBarber)
                                ?.name
                            }
                          </p>
                          <p className="text-xs text-white/60">
                            {
                              barbers.find((b) => b._id === selectedBarber)
                                ?.specialty
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {appointmentDate && (
                      <div className="p-3 rounded-lg border-2 border-blue-600/40 bg-blue-600/5">
                        <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">
                          Appointment Time
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span>📅</span>
                          <p className="text-sm font-bold text-white">
                            {new Date(appointmentDate).toLocaleDateString(
                              "default",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕒</span>
                          <p className="text-sm font-bold text-white">
                            {selectedTime}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                      {/* Voucher Code */}
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Mã Khuyến Mãi</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                          placeholder="Nhập mã giảm giá..."
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-white/30 font-bold tracking-widest"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={voucherLoading}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                        >
                          {voucherLoading ? "..." : "Áp dụng"}
                        </button>
                      </div>
                      {voucherMsg.text && (
                        <p className={`text-xs font-bold ${voucherMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{voucherMsg.text}</p>
                      )}

                      {/* Price display */}
                      <div className="flex justify-between items-baseline mt-2">
                        <span className="text-white/60">Tạm tính</span>
                        <span className={`text-lg font-bold ${voucherDiscount > 0 ? 'text-white/40 line-through' : 'text-white'}`}>
                          {Number(totalSummaryPrice).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      {voucherDiscount > 0 && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-green-400 font-bold text-sm">Sau giảm giá -{voucherDiscount}%</span>
                          <span className="text-2xl font-bold text-green-400">
                            {Number(totalSummaryPrice * (1 - voucherDiscount / 100)).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      )}
                      <p className="text-[10px] text-white/40 text-center">
                        Tax included in total price
                      </p>
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      disabled={
                        selectedServices.length === 0 ||
                        !selectedBarber ||
                        !appointmentDate ||
                        bookingLoading
                      }
                      className={`w-full h-12 px-6 rounded-lg font-bold text-base transition-all ${selectedServices.length > 0 &&
                        selectedBarber &&
                        appointmentDate &&
                        !bookingLoading
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                        : "bg-white/10 text-white/50 cursor-not-allowed"
                        }`}
                    >
                      {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>

                    {step >= 2 && (
                      <button
                        onClick={() => setStep(2)}
                        className="text-center text-white/40 hover:text-white transition-colors text-sm font-medium"
                      >
                        ← Back to Barbers
                      </button>
                    )}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Đánh giá Dịch Vụ</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div>
                <p className="text-white/60 text-sm mb-3">Mức độ hài lòng</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl transition-transform hover:scale-125 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-white/20'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Nhận xét (tùy chọn)</label>
                <textarea
                  rows="4"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Dịch vụ rất tốt, Barber tận tình..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-white/30"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl">
                  Hủy
                </button>
                <button type="submit" disabled={reviewLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  {reviewLoading ? "Đang gửi..." : "Đầy đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
