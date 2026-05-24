// ✅ NEW: App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";

import Home from "./pages/home";
import LoginSelect from "./pages/loginselect";
import Lapangan from "./pages/lapangan";
import DetailLapangan from "./pages/detaillapangan";
import Pesanan from "./pages/pesanan";
import Login from "./pages/login";
import TentangKami from "./pages/tentangKami";
import VerifyPhone from "./pages/VerifyPhone";
import VerifyOtp from "./pages/VerifyOtp";
import Pemesanan from "./pages/pemesanan";
import Transfer from "./pages/transfer";
import Cash from "./pages/cash";
import Riwayat from "./pages/Riwayat";
import Profile from "./pages/profile";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const location = useLocation();

  const hideNavbar =
  location.pathname === "/login/user" ||
  location.pathname === "/login/mitra" ||
  location.pathname === "/login/admin" ||
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

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/user" element={<Login />} />
          <Route path="/login/mitra" element={<Login />} />
          <Route path="/login/admin" element={<Login />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/tentangkami" element={<TentangKami />} />
          <Route path="/lapangan" element={<Lapangan />} />
          <Route path="/lapangan/:id" element={<DetailLapangan />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/profil" element={<Profile />} />

          {/* USER PROTECTED */}
          <Route
            path="/pemesanan"
            element={
              <ProtectedRoute roles={["user", "mitra", "admin"]}>
                <Pemesanan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute roles={["user", "mitra", "admin"]}>
                <Transfer />
              </ProtectedRoute>
            }
          />
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
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;