import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppointmentsPage from "./pages/AppointmentsPage";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import Dashboard from "./pages/Dashboard";
import QRScanner from "./pages/QRScanner";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import ServiceDetail from "./pages/ServiceDetail";
import BarberProfile from "./pages/BarberProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import BarberDashboard from "./pages/BarberDashboard";
import PaymentResult from "./pages/PaymentResult";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIChatbot from "./components/AIChatbot/AIChatbot";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment-confirmation"
          element={
            <ProtectedRoute>
              <AppointmentConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/barbers/:id" element={<BarberProfile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barber-dashboard"
          element={
            <ProtectedRoute>
              <BarberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-result"
          element={
            <ProtectedRoute>
              <PaymentResult />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <AIChatbot />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;