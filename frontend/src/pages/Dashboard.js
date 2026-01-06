import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { appointmentAPI, serviceAPI } from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [barberId, setBarberId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments();
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
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

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await appointmentAPI.createAppointment({
        barberId,
        serviceId: selectedService,
        appointmentDate,
        notes,
      });
      setShowBookingForm(false);
      setAppointmentDate("");
      setBarberId("");
      setSelectedService(null);
      setNotes("");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Haircut Appointment System</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="appointments-section">
          <div className="section-header">
            <h2>My Appointments</h2>
            {user?.role === "customer" && (
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="btn-primary"
              >
                {showBookingForm ? "Cancel" : "Book Appointment"}
              </button>
            )}
          </div>

          {showBookingForm && user?.role === "customer" && (
            <div className="booking-form-container">
              <h3>Book New Appointment</h3>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleBookAppointment}>
                <div className="form-group">
                  <label>Select Service</label>
                  <select
                    value={selectedService || ""}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                  >
                    <option value="">Choose a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - ${service.price} ({service.duration}{" "}
                        min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Barber ID</label>
                  <input
                    type="text"
                    placeholder="Enter barber ID"
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Date & Time</label>
                  <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </button>
              </form>
            </div>
          )}

          <div className="appointments-list">
            {appointments.length === 0 ? (
              <p className="empty-message">No appointments yet</p>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-info">
                    <h4>{appointment.serviceId?.name}</h4>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(appointment.appointmentDate).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-${appointment.status}`}>
                        {appointment.status}
                      </span>
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
                  {appointment.qrCode && (
                    <div className="qr-code-container">
                      <div id={`qr-${appointment._id}`}>
                        <QRCodeCanvas
                          value={JSON.stringify({
                            appointmentId: appointment._id,
                            appointmentCode: appointment.appointmentId,
                          })}
                          size={150}
                        />
                      </div>
                      <button
                        onClick={() => downloadQRCode(appointment._id)}
                        className="btn-secondary"
                      >
                        Download QR
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
