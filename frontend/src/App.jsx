// App.jsx

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
      location.pathname === "/transfer";

  return (
    <div>
      {!hideNavbar && <Navbar />}

      <Routes>
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

        <Route path="/pemesanan" element={<Pemesanan />} />
        <Route path="/transfer" element={<Transfer />} />

        <Route path="/pesanan" element={<Pesanan />} />
      </Routes>
    </div>
  );
}

export default App;