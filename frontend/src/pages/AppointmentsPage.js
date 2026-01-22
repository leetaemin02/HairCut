import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { appointmentAPI, serviceAPI, authAPI } from "../services/api";
import Header from "../components/Header";

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
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateOnly, setSelectedDateOnly] = useState(null);
  const [barbers, setBarbers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchAppointments();
      fetchServices();
      if (JSON.parse(userData)?.role === "customer") {
        fetchBarbers();
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

  const getAvailableTimeSlots = () => {
    return [
      "09:00 AM",
      "09:45 AM",
      "10:30 AM",
      "11:15 AM",
      "01:30 PM",
      "02:15 PM",
      "03:00 PM",
      "03:45 PM",
      "04:30 PM",
    ];
  };

  const handleDateSelect = (date) => {
    setSelectedDateOnly(date);
    setStep(3.5);
  };

  const handleTimeSelect = (time) => {
    if (selectedDateOnly) {
      const [timePart, period] = time.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      const adjustedHours =
        period === "PM" && hours !== 12 ? hours + 12 : hours;

      const fullDate = new Date(selectedDateOnly);
      fullDate.setHours(adjustedHours, minutes, 0);
      setSelectedTime(time);
      setAppointmentDate(fullDate.toISOString().slice(0, 16));
      setStep(4);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingLoading(true);

    try {
      await appointmentAPI.createAppointment({
        barberId: selectedBarber,
        serviceId: selectedService,
        appointmentDate,
        notes,
      });

      // Reset form
      setStep(1);
      setSelectedService(null);
      setSelectedBarber(null);
      setAppointmentDate("");
      setSelectedTime("");
      setSelectedDateOnly(null);
      setNotes("");
      setCurrentMonth(new Date());
      fetchAppointments();
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setBookingLoading(false);
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

  const currentService = services.find((s) => s._id === selectedService);
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <div
                          key={service._id}
                          onClick={() => {
                            setSelectedService(service._id);
                            setStep(2);
                          }}
                          className={`flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedService === service._id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-transparent bg-white/5 hover:border-white/20"
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
                              {service.duration} min - ${service.price}
                            </p>
                            <p className="text-white/60 text-sm pt-1">
                              {service.description || "Professional service"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Step 2: Choose Barber */}
                  {step >= 2 && (
                    <section>
                      <h2 className="text-2xl font-bold font-heading pb-4">
                        Choose Your Barber
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {barbers.map((barber) => (
                          <div
                            key={barber._id}
                            onClick={() => {
                              setSelectedBarber(barber._id);
                              setStep(3);
                            }}
                            className={`flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedBarber === barber._id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-transparent bg-white/5 hover:border-white/20"
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
                          </div>
                        ))}
                        <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-white/20 bg-transparent cursor-pointer transition-all hover:border-white/40 hover:text-white/80 text-white/60">
                          <span className="text-4xl">👥</span>
                          <p className="text-base font-bold text-center">
                            Any Available
                          </p>
                        </div>
                      </div>
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
                                    handleDateSelect(dayObj.date);
                                  }
                                }}
                                disabled={!dayObj.isCurrentMonth}
                                className={`aspect-square flex items-center justify-center rounded-lg font-medium transition-all ${!dayObj.isCurrentMonth
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {getAvailableTimeSlots().map((time) => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${selectedTime === time
                                  ? "border-2 border-blue-600 bg-blue-600/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                  : "border border-white/10 bg-white/5 text-white hover:border-blue-600 hover:bg-blue-600/10"
                                  }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
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

                    {currentService && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded flex-shrink-0 flex items-center justify-center text-xl">
                          ✂️
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/50 uppercase font-bold tracking-wider">
                            Service
                          </p>
                          <p className="text-sm font-bold text-white">
                            {currentService.name}
                          </p>
                          <p className="text-xs text-white/60">
                            {currentService.duration} min • $
                            {currentService.price}
                          </p>
                        </div>
                      </div>
                    )}

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
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/60">Total Amount</span>
                        <span className="text-3xl font-bold text-white">
                          ${currentService?.price || "0.00"}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 text-center">
                        Tax included in total price
                      </p>
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      disabled={
                        !selectedService ||
                        !selectedBarber ||
                        !appointmentDate ||
                        bookingLoading
                      }
                      className={`w-full h-12 px-6 rounded-lg font-bold text-base transition-all ${selectedService &&
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

          {/* Barber View - Appointments Management */}
          {user?.role === "barber" && (
            <>
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold font-heading">
                  Manage Appointments
                </h1>
              </div>

              {/* Filter and Search Section */}
              <div className="space-y-4 rounded-lg bg-white/5 p-6 border border-white/10">
                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, service, or appointment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-white/30"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Filter by Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Filter by Service
                    </label>
                    <select
                      value={filterService}
                      onChange={(e) => setFilterService(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Services</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">
                    Showing {filteredAppointments.length} of{" "}
                    {appointments.length} appointments
                  </p>
                  <button
                    onClick={() => navigate("/scanner")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Scan QR Code
                  </button>
                </div>
              </div>

              {/* Appointments List */}
              {loading ? (
                <div className="text-center py-12 text-white/60">
                  Loading appointments...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="rounded-lg bg-white/5 border border-white/10 p-12 text-center">
                  <p className="text-white/60 text-lg">
                    {appointments.length === 0
                      ? "No appointments scheduled"
                      : "No appointments match your filters"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                    >
                      <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white">
                              {appointment.serviceId?.name}
                            </h3>
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-bold border ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          <div className="space-y-2 text-white/80 text-sm">
                            <p>
                              <strong>Customer:</strong>{" "}
                              {appointment.customerId?.name}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {appointment.customerId?.phone}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleString("default", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p>
                              <strong>Price:</strong> ${appointment.totalPrice}
                            </p>
                            {appointment.notes && (
                              <p>
                                <strong>Notes:</strong> {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* QR Code Section */}
                        {appointment.qrCode && (
                          <div className="flex flex-col items-center gap-3 sm:border-l sm:border-white/10 sm:pl-6">
                            <div
                              id={`qr-${appointment._id}`}
                              className="bg-white p-3 rounded-lg"
                            >
                              <QRCodeCanvas
                                value={JSON.stringify({
                                  appointmentId: appointment._id,
                                  appointmentCode: appointment.appointmentId,
                                })}
                                size={120}
                              />
                            </div>
                            <button
                              onClick={() => downloadQRCode(appointment._id)}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded transition-colors"
                            >
                              Download QR
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div >
  );
}

export default AppointmentsPage;
