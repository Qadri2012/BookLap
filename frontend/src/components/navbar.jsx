// navbar

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ NEW

const NAV_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/lapangan", label: "Lapangan" },
  { to: "/riwayat", label: "Riwayat" },
  { to: "/pesanan", label: "Pesanan" },
  { to: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ NEW
  const [dropOpen, setDropOpen] = useState(false); // ✅ NEW
  // const user = JSON.parse(localStorage.getItem("user") || "{}"); // ✅ NEW
  const navRef = useRef(null);

  const [activeStyle, setActiveStyle] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const isLoginPage = location.pathname.startsWith("/login");
  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const displayName = user?.nama || "Akun Saya";
  // ✅ NEW: sembunyikan navbar di halaman cash
const isCashPage = location.pathname.startsWith("/cash");

if (isCashPage) return null;

  // // const isLogin = location.pathname.startsWith("/login");
  // const isLoggedIn = !!localStorage.getItem("token");

  // ✅ DETEKSI HALAMAN DETAIL LAPANGAN
  const isDetailLapangan = location.pathname.startsWith("/lapangan/");

  const isActive = (to) => location.pathname === to;

  // SCROLL DETECTION
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // UNDERLINE
  useEffect(() => {
    if (isLoginPage ) return;

    requestAnimationFrame(() => {
      const activeEl = document.querySelector(".nav-active");
      if (activeEl && navRef.current) {
        const rect = activeEl.getBoundingClientRect();
        const parent = navRef.current.getBoundingClientRect();

        setActiveStyle({
          width: rect.width,
          left: rect.left - parent.left,
        });
      }
    });
  }, [location.pathname, isLoginPage ]);

  return (
    <nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}
  style={{
  background: isLoginPage
    ? "#fff"
    : isDetailLapangan
    ? "linear-gradient(135deg, #0a2e14 0%, #143d1e 50%, #0a2e14 100%)"
    : scrolled
    ? "linear-gradient(135deg, #0a2e14 0%, #143d1e 50%, #0a2e14 100%)"
    : "transparent",
  boxShadow: isLoginPage
    ? "0 2px 10px rgba(0,0,0,0.08)"
    : isDetailLapangan || scrolled
    ? "0 2px 20px rgba(0,0,0,0.3)"
    : "none",
  borderBottom: isDetailLapangan || scrolled
    ? "1px solid rgba(74,222,128,0.15)"
    : "none",
  overflow: "visible", // ✅ NEW
}}
>
  {/* GLOW KANAN */}
<div
  style={{
    position: "absolute",
    top: -80,
    right: -120,
    width: 260,
    height: 260,
    background:
      "radial-gradient(circle, rgba(24,109,34,0.22) 0%, rgba(22,163,74,0.10) 35%, rgba(10,46,20,0.02) 65%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(8px)", // ✅ NEW
  }}
/>

  {/* GLOW KIRI */}
<div
  style={{
    position: "absolute",
    top: -80,
    left: -120,
    width: 260,
    height: 260,
    background:
      "radial-gradient(circle, rgba(24,109,34,0.22) 0%, rgba(22,163,74,0.10) 35%, rgba(10,46,20,0.02) 65%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(8px)", // ✅ NEW
  }}
/>

  <div className="max-w-7xl mx-auto px-6 lg:px-10" style={{ position: "relative", zIndex: 1 }}>
    <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 -ml-3">
            <img src="/logo.png" alt="BookLap" className="w-[100px] h-[100px]" />
            
            <span
              className={`font-extrabold text-2xl ${
                isLoginPage ? "text-gray-900" : "text-white"
              }`}
            >
              Book<span className="text-green-500">Lap</span>
            </span>
          </Link>

          {/* MENU */}
          <div
            ref={navRef}
            className="hidden md:flex relative items-center gap-8 ml-10"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-2 py-2 text-[16px] font-semibold ${
                  isActive(to)
                    ? isLoginPage
                      ? "text-green-600"
                      : "text-white nav-active"
                    : isLoginPage
                    ? "text-gray-700 hover:text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            {isLoggedIn ? (
  <div style={{ position: "relative" }}>
    {/* Tombol avatar */}
    <button
      onClick={() => setDropOpen((p) => !p)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "99px",
        padding: "5px 12px 5px 5px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #16a34a, #4ade80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 800,
          color: "#fff",
        }}
      >
        {(user.nama || user.username || "U")[0].toUpperCase()}
      </div>

      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
        {user.nama || user.username || "Pengguna"}
      </span>

      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        style={{
          transform: dropOpen ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.2s",
        }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    {/* Dropdown menu */}
    {dropOpen && (
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,
          width: "220px",
          borderRadius: "16px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          overflow: "hidden",
          zIndex: 9999,
          animation: "dropDown 0.2s ease",
        }}
      >
        {/* Header user info */}
       

        {/* Menu items */}
        {[
          { icon: "👤", label: "Profil Saya", path: "/profil" },
        
          { icon: "🔔", label: "Notifikasi", path: "/notifikasi" },
         
          { icon: "⚙️", label: "Pengaturan", path: "/profil?tab=keamanan" },
        ].map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => {
              navigate(path);
              setDropOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "13px",
              color: "#374151",
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "15px" }}>{icon}</span>
            {label}
          </button>
        ))}

        <div style={{ height: "1px", background: "#f3f4f6" }} />

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
            setDropOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "11px 16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "13px",
            color: "#dc2626",
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span>🚪</span> Keluar
        </button>
      </div>
    )}
  </div>
              ) : (
  <div className="flex items-center gap-3">
    <Link
      to="/login"
      className={`rounded-full px-5 py-2 text-sm font-semibold transition backdrop-blur-md ${
        isLoginPage
          ? "border border-gray-200 bg-white/80 text-gray-900 shadow-sm hover:bg-white"
          : "border border-white/30 bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      Sign In
    </Link>

    <Link
      to="/login?mode=register"
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
        isLoginPage
          ? "bg-[#186d22] text-white hover:bg-[#145a1c]"
          : "bg-[#186d22] text-white hover:bg-[#145a1c]"
      }`}
    >
      Gabung Sekarang
    </Link>
  </div>
)}
            {/* UNDERLINE */}
            {!isLoginPage && (
              <span
                className="absolute bottom-0 h-[3px] bg-[#186d22] rounded-full transition-all duration-300"
                style={activeStyle}
              />
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}