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
  getBarbersByService: (specialty) => api.get(`/auth/barbers?specialty=${specialty}`),
  getBarberById: (id) => api.get(`/auth/barbers/${id}`),
  
  // Admin User controls
  getAllUsers: () => api.get("/auth/admin/users"),
  updateUserRole: (id, roleData) => api.put(`/auth/admin/users/${id}/role`, roleData),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}`),
  getStats: () => api.get("/auth/admin/stats"),
  getBarberStats: () => api.get("/auth/admin/barber-stats"),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (data) => api.post("/appointments", data),
  getAppointments: () => api.get("/appointments"),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
  scanQRCode: (data) => api.post("/appointments/scan-qr", data),
  getAvailableSlots: (params) => api.get("/appointments/available-slots", { params }),
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
  updateLookbook: (id, data) => api.put(`/lookbook/${id}`, data),
  deleteLookbook: (id) => api.delete(`/lookbook/${id}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) => api.post("/payment/create", data),
};

// Voucher API
export const voucherAPI = {
  getVouchers: () => api.get("/vouchers"),
  createVoucher: (data) => api.post("/vouchers", data),
  updateVoucher: (id, data) => api.put(`/vouchers/${id}`, data),
  deleteVoucher: (id) => api.delete(`/vouchers/${id}`),
  validateVoucher: (data) => api.post("/vouchers/validate", data),
};

// Review API
export const reviewAPI = {
  getReviews: (params) => api.get("/reviews", { params }),
  createReview: (data) => api.post("/reviews", data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getBarberRatingStats: () => api.get("/reviews/barber-stats"),
};

export default api;
