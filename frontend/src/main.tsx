import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Booking } from "@/pages/Booking";
import { ParkingSession } from "@/pages/ParkingSession";
import { Payments } from "@/pages/Payments";
import { History } from "@/pages/History";
import { Vehicles } from "@/pages/Vehicles";
import { Profile } from "@/pages/Profile";
import { Admin } from "@/pages/Admin";
import { LiveMonitoring } from "@/pages/LiveMonitoring";
import { SlotManagement } from "@/pages/SlotManagement";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/book" element={<Booking />} />
                  <Route path="/session" element={<ParkingSession />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/settings" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/monitor" element={<LiveMonitoring />} />
                  <Route path="/slots" element={<SlotManagement />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);