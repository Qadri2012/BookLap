// ✅ NEW: App.jsx
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import LoginSelect from "./pages/loginselect";
import Lapangan from "./pages/lapangan";
import DetailLapangan from "./pages/detaillapangan";
import Pesanan from "./pages/pesanan";
import Login from "./pages/login";
import LoginMitra from "./pages/loginMitra";
import LoginAdmin from "./pages/loginAdmin";
import TentangKami from "./pages/tentangKami";

import VerifyOtp from "./pages/VerifyOtp";
import Pemesanan from "./pages/pemesanan";
import Transfer from "./pages/transfer";
import Cash from "./pages/cash";
import Riwayat from "./pages/riwayat";
import Profile from "./pages/profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminLapangan from "./pages/admin/Lapangan";
import AdminLapanganForm from "./pages/admin/LapanganForm";
import AdminBooking from "./pages/admin/Booking";
import AdminJadwal from "./pages/admin/Jadwal";
import AdminUser from "./pages/admin/User";
import AdminLaporan from "./pages/admin/Laporan";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminApproval from "./pages/admin/AdminApproval";
import Pengaturan from "./pages/admin/Pengaturan";
import Kontak from "./pages/kontak";
import ScrollToTop from "./components/ScrollToTop";
import TestSupabase from "./pages/TestSupabase";
import AdminChat from "./pages/admin/AdminChat";
import ReviewFeedback from "./pages/admin/ReviewFeedback";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login/user" ||
    location.pathname === "/login-mitra" ||
    location.pathname === "/login-admin" ||
    location.pathname === "/tentangkami" ||
    location.pathname === "/verify-phone" ||
    location.pathname === "/verify-otp" ||
    location.pathname === "/pemesanan" ||
    location.pathname === "/transfer" ||
    location.pathname === "/cash" ||
    location.pathname === "/profil";

  return (
    <AuthProvider>
      <div>
        {!hideNavbar && <Navbar />}
        <ScrollToTop />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/user" element={<Login />} />
          {/* <Route path="/login" element={<LoginSelect />} /> */}
          <Route path="/login-mitra" element={<LoginMitra />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/tentangkami" element={<TentangKami />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/lapangan" element={<Lapangan />} />
          <Route path="/lapangan/:id" element={<DetailLapangan />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/admin/pengaturan" element={<Pengaturan />} />
          <Route path="/test-supabase" element={<TestSupabase />} />
          

          {/* USER PROTECTED */}
          <Route path="/pemesanan" element={ <ProtectedRoute roles={["user", "mitra", "admin"]}> <Pemesanan /> </ProtectedRoute>}/>
          <Route path="/transfer" element={ <ProtectedRoute roles={["user", "mitra", "admin"]}> <Transfer /> </ProtectedRoute> } />
          <Route
            path="/cash"
            element={
              <ProtectedRoute roles={["user", "mitra", "admin"]}>
                <Cash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesanan"
            element={
              <ProtectedRoute roles={["user", "mitra", "admin"]}>
                <Pesanan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approval-admin"
            element={
              <ProtectedAdminRoute>
                <AdminApproval />
              </ProtectedAdminRoute>
            }
          />

        

         {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="lapangan" element={<AdminLapangan />} />
          <Route path="lapangan/tambah" element={<AdminLapanganForm />} />
          <Route path="lapangan/edit/:id" element={<AdminLapanganForm />} />
          <Route path="booking" element={<AdminBooking />} />
          <Route path="jadwal" element={<AdminJadwal />} />
          <Route path="user" element={<AdminUser />} />
          <Route path="laporan" element={<AdminLaporan />} />
          <Route path="chat" element={<AdminChat />} />
          <Route
  path="review-feedback"
  element={<ReviewFeedback />}
/>
        </Route>
        
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;