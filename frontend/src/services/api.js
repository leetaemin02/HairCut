import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  getBarbers: () => api.get("/auth/barbers"),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (data) => api.post("/appointments", data),
  getAppointments: () => api.get("/appointments"),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
  scanQRCode: (data) => api.post("/appointments/scan-qr", data),
};

// Service API
export const serviceAPI = {
  getServices: () => api.get("/services"),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (data) => api.post("/services", data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// Lookbook API
export const lookbookAPI = {
  getLookbook: () => api.get("/lookbook"),
  createLookbook: (data) => api.post("/lookbook", data),
};

export default api;
