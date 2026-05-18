// navbar

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/lapangan", label: "Lapangan" },
  { to: "/riwayat", label: "Riwayat" },
  { to: "/pesanan", label: "Pesanan" },
  { to: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef(null);

  const [activeStyle, setActiveStyle] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const isLoginPage = location.pathname.startsWith("/login");
  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const displayName = user?.nama || "Akun Saya";

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
      : (isDetailLapangan || scrolled)
      ? "0 2px 20px rgba(0,0,0,0.3)"
      : "none",
    borderBottom: (isDetailLapangan || scrolled)
      ? "1px solid rgba(74,222,128,0.15)"
      : "none",
    // ✅ overflow hidden supaya glow tidak keluar navbar
    overflow: "hidden",
  }}
>
  {/* GLOW KANAN — sama dengan footer */}
  {(isDetailLapangan || scrolled) && !isLoginPage && (
    <div style={{
      position: "absolute", top: -60, right: -60,
      width: 200, height: 200,
      background: "radial-gradient(circle, rgba(24,109,34,0.5) 0%, rgba(22,163,74,0.15) 40%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    }} />
  )}

  {/* GLOW KIRI — sama dengan footer */}
  {(isDetailLapangan || scrolled) && !isLoginPage && (
    <div style={{
      position: "absolute", top: -60, left: -60,
      width: 180, height: 180,
      background: "radial-gradient(circle, rgba(74,222,128,0.3) 0%, rgba(22,163,74,0.1) 40%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    }} />
  )}

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

            {/* SIGN IN */}
            {isLoggedIn ? (
  <Link
    to="/profil"
    className="px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-white/20 text-white border border-white/30 hover:bg-white/30 transition"
  >
    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
      👤
    </span>
    {displayName}
  </Link>
) : (
  <>
    <Link
      to="/login"
      className={`px-5 py-2 rounded-full text-sm font-medium transition backdrop-blur-md
      ${
        isLoginPage
          ? "bg-white/70 text-gray-900 border border-gray-200 shadow-sm"
          : "border border-white/60 text-white hover:bg-white/10"
      }`}
    >
      ↪ Sign In
    </Link>

    <Link
      to="/register"
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        isLoginPage
          ? "bg-[#186d22] text-white hover:bg-green-500"
          : "bg-[#186d22] text-white hover:bg-[#65c470]"
      }`}
    >
      Gabung Sekarang
    </Link>
  </>
)}

            {/* REGISTER */}
            {/* <Link
              to="/register"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                isLoginPage
                  ? "bg-[#186d22] text-white hover:bg-green-500"
                  : "bg-[#186d22] text-white hover:bg-[#65c470]"
              }`}
            >
              Gabung Sekarang
            </Link> */}

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