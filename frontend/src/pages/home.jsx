
// home

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import { useNavigate, useLocation } from "react-router-dom";

import Footer from "../components/Footer";
import gambar4 from "../assets/gambar4.png"; // ✅ NEW
// ✅ NEW: icon untuk kartu fitur Home
import { FaSearch, FaCalendarAlt, FaMoneyBillWave, FaClipboardList } from "react-icons/fa";
// ✅ NEW: ikon statistik bawah map
import { FaBuilding, FaMapMarkerAlt, FaBolt } from "react-icons/fa";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLapangan, searchLapanganTersedia,} from "../services/api";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ── DATA ────────────────────────────────────────────────────────────────────
// ✅ NEW: icon fitur Home memakai react-icons
const FEATURES = [
  { icon: <FaSearch size={40} color="#000000" />, title: "Temukan Lapangan", desc: "Dari mana saja" },
  { icon: <FaCalendarAlt size={40} color="#000000" />, title: "Reservasi Praktis", desc: "Beberapa langkah" },
  { icon: <FaMoneyBillWave size={40} color="#000000"/>, title: "Harga Jelas", desc: "Transparan & akurat" },
  { icon: <FaClipboardList size={40} color="#000000" />, title: "Atur Jadwal", desc: "Mudah & fleksibel" },
];



const FAQS = [
  { q: "Apa itu BookLap?", a: "BookLap adalah platform digital untuk menemukan dan memesan lapangan futsal & mini soccer secara online — mudah, cepat, dan terpercaya." },
  { q: "Bagaimana cara membooking lapangan lewat BookLap?", a: "Daftar akun, pilih lapangan, tentukan jadwal, lalu lakukan pembayaran. Konfirmasi booking langsung kamu terima." },
  { q: "Apakah saya harus membayar di awal?", a: "Ya, pembayaran di muka untuk memastikan slot kamu terjamin dan tidak diambil pengguna lain." },
  { q: "Metode pembayaran apa saja yang tersedia?", a: "Transfer bank, dompet digital (GoPay, OVO, Dana), serta QRIS." },
  { q: "Apakah saya bisa membatalkan booking?", a: "Pembatalan maksimal 24 jam sebelum jadwal bermain. Refund diproses sesuai kebijakan lapangan." },
  { q: "Saya mengalami kendala saat booking, apa yang harus saya lakukan?", a: "Hubungi support kami via email atau WhatsApp di halaman Kontak." },
];

const SLIDES = [
  {
    headline: "Harga Transparan",
    sub: "Bandingkan harga sebelum booking",
    img: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1600&q=85",
  },
  {
    headline: "Booking Mudah & Cepat",
    sub: "Pesan lapangan hanya dalam hitungan detik",
    img: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1600&q=85",
  },
  {
    headline: "Lapangan Terbaik",
    sub: "Pilih dari berbagai lapangan berkualitas",
    img: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1600&q=85",
  },
];

const SPORT_DETAIL = {
  futsal: {
    title: "Futsal",
    desc: "Futsal adalah olahraga sepak bola yang dimainkan di lapangan berukuran lebih kecil dengan jumlah pemain yang lebih sedikit sehingga permainan berlangsung lebih cepat, intens, dan dinamis. Olahraga ini menuntut kerja sama tim, kecepatan berpikir, kontrol bola yang baik, serta strategi permainan yang efektif untuk menciptakan pengalaman bermain yang seru dan kompetitif.",
    
  },
  minisoccer: {
    title: "Mini Soccer",
    desc: "Mini soccer merupakan variasi sepak bola modern yang dimainkan di lapangan yang lebih luas dibanding futsal sehingga memberikan ruang gerak yang lebih bebas bagi pemain. Permainan ini cocok untuk pertandingan tim dengan intensitas tinggi karena menggabungkan kecepatan, teknik, strategi, dan kerja sama antar pemain sehingga menghadirkan pengalaman bermain yang lebih mendekati sepak bola profesional.",
  },
};

const LOKASI_OPTIONS = [
  "Jl. Pelita No.Utara, Lakessi, Kec. Soreang, Parepare",
  "Jl. Moh. Yusuf, Bacukiki, Parepare",
  "Tiro Sompe, Bacukiki Barat, Parepare",
  "Jl. Petta Unga, Watang Soreang, Parepare",
  "Watang Soreang, Parepare",
];
const OLAHRAGA_OPTIONS = [
  "Futsal",
  "Mini Soccer",
];
const JAM_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
// const MAP_IFRAME_SRC = (lat, lng) =>
//   `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
// ✅ Helper format tanggal lokal
const formatTanggalLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ── DROPDOWN ─────────────────────────────────────────────────────────────────
function Dropdown({ label, options, value, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors"
      >
        {icon && <span className="text-white/50 flex-shrink-0">{icon}</span>}
        <span className={`flex-1 text-left truncate ${value ? "text-white" : "text-white/60"}`}>
          {value || label}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden"
          style={{ zIndex: 9999, background: "rgba(10,14,12,0.97)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                value === opt ? "text-green-400 bg-green-500/10" : "text-white/65 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CUSTOM CALENDAR PICKER ────────────────────────────────────────────────────
function CalendarPicker({ value, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(value?.date || null);
  const [selectedJam, setSelectedJam] = useState(value?.jam || "");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];

  // Previous month filler
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false, date: null });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push({ day: d, currentMonth: true, date, isPast: date < today, isToday: date.getTime() === today.getTime() });
  }
  // Next month filler
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: null });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDate(cell) {
    if (!cell.currentMonth || cell.isPast) return;
    setSelectedDate(cell.date);
    if (selectedJam) {
      onChange({ date: cell.date, jam: selectedJam });
    }
  }

  function selectJam(jam) {
    setSelectedJam(jam);
    if (selectedDate) {
      onChange({ date: selectedDate, jam });
      setOpen(false);
    }
  }

  function formatDisplay() {
    if (!value?.date) return null;
    const d = value.date;
    const tgl = `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return value.jam ? `${tgl}, ${value.jam}` : tgl;
  }

  const isSelected = (cell) =>
    cell.currentMonth && selectedDate &&
    cell.date?.getTime() === selectedDate.getTime();

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors"
      >
        <span className="text-white/50 flex-shrink-0">
          {/* Calendar icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </span>
        <span className={`flex-1 text-left truncate ${formatDisplay() ? "text-white" : "text-white/60"}`}>
          {formatDisplay() || "Tanggal dan Jam"}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            zIndex: 9999,
            width: "320px",
            right: 0,
            background: "rgba(10,14,12,0.97)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* ─ Calendar header ─ */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              ‹
            </button>
            <span className="text-white font-semibold text-sm tracking-wide">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              ›
            </button>
          </div>

          {/* ─ Day headers ─ */}
          <div className="grid grid-cols-7 px-4 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-white/30 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* ─ Calendar cells ─ */}
          <div className="grid grid-cols-7 px-4 pb-3 gap-y-0.5">
            {cells.map((cell, idx) => {
              const sel = isSelected(cell);
              const isT = cell.isToday;
              const past = !cell.currentMonth || cell.isPast;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={past}
                  onClick={() => selectDate(cell)}
                  className={`
                    h-9 w-full rounded-full text-[13px] font-medium transition-all duration-150
                    ${!cell.currentMonth ? "text-white/15 cursor-default" : ""}
                    ${cell.currentMonth && cell.isPast ? "text-white/20 cursor-not-allowed" : ""}
                    ${cell.currentMonth && !cell.isPast && !sel && !isT ? "text-white/70 hover:bg-white/10 hover:text-white cursor-pointer" : ""}
                    ${isT && !sel ? "text-green-400 font-bold ring-1 ring-green-500/50" : ""}
                    ${sel ? "bg-green-500 text-black font-bold shadow-lg shadow-green-500/30" : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* ─ Jam divider ─ */}
          <div className="border-t border-white/8 mx-4" />

          {/* ─ Jam section ─ */}
          <div className="px-5 py-4">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Jam
            </p>
            <div className="relative">
              <select
                value={selectedJam}
                onChange={(e) => selectJam(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 cursor-pointer transition-all"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled style={{ background: "#0a0e0c" }}>Pilih jam</option>
                {JAM_OPTIONS.map((j) => (
                  <option key={j} value={j} style={{ background: "#0a0e0c" }}>{j}</option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FAQ ITEM ─────────────────────────────────────────────────────────────────
// ── FAQ ITEM — ganti seluruh fungsi FaqItem yang lama ─────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => setOpen(!open)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "14px",
        marginBottom: "10px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hovered && !open ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered || open
          ? "0 8px 24px rgba(22,97,34,0.18)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Header tombol ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          background: open
            ? "#1a5c25"
            : hovered
              ? "#1f6e2c"
              : "#236129",
          transition: "background 0.25s ease",
        }}
      >
        <span style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#fff",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.4,
          flex: 1,
          paddingRight: "16px",
        }}>
          {q}
        </span>

        {/* Ikon chevron */}
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 0.3s ease, border-color 0.2s ease",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* ── Isi jawaban ── */}
      <div style={{
        maxHeight: open ? "400px" : "0px",
        overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#fff",
      }}>
        <p style={{
          padding: "18px 22px",
          fontSize: "14px",
          color: "#374151",
          lineHeight: 1.75,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          margin: 0,
        }}>
          {a}
        </p>
      </div>
    </div>
  );
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }

    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    // kasih waktu sebentar supaya layout selesai dulu
    const t = setTimeout(() => {
      map.invalidateSize(true);
    }, 0);

    const handleResize = () => {
      map.invalidateSize(true);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// ✅ NEW: map dibuat full mengikuti container
function LapanganMap({ points, userCoords }) {
  const validPoints = points
    .map((f) => ({
      ...f,
      latitude: Number(f.latitude),
      longitude: Number(f.longitude),
    }))
    .filter((f) => Number.isFinite(f.latitude) && Number.isFinite(f.longitude));

  const center =
    validPoints.length > 0
      ? [validPoints[0].latitude, validPoints[0].longitude]
      : [-4.005, 119.63];

  return (
    <div
      className="w-full h-full overflow-hidden bg-white"
      style={{
        borderRadius: "24px",
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds points={validPoints} />

        {validPoints.map((f) => (
          <Marker key={f.id} position={[f.latitude, f.longitude]}>
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                  {f.nama}
                </div>
                <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                  {f.alamat}
                </div>
                {userCoords && (
                  <div
                    style={{
                      fontSize: "12px",
                      marginBottom: "4px",
                      color: "#166534",
                      fontWeight: 600,
                    }}
                  >
                    Jarak dari lokasi anda:{" "}
                    {calculateDistance(
                      userCoords.lat,
                      userCoords.lng,
                      f.latitude,
                      f.longitude
                    )} km
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#166534" }}>
                  Rp {Number(f.harga || 0).toLocaleString("id-ID")}/jam
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function ScrollableCards({ data, navigate }) {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  useEffect(() => {
    handleScroll();

    const el = scrollRef.current;
    if (!el) return;

    const onResize = () => handleScroll();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [data]);

  return (
    <div className="w-full">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Kartu */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
      >
        {data.slice(0, 6).map((f, i) => (
          <div
            key={f.id || i}
            className="group flex-shrink-0 w-72 sm:w-80 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
          >
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                src={
                  Array.isArray(f.foto)
                    ? f.foto[0]
                    : typeof f.foto === "string"
                    ? f.foto
                    : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=75"
                }
                alt={f.nama || f.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=75";
                }}
              />
              <span className="absolute top-3 left-3 bg-green-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {f.tipe || "Lapangan"}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                {f.nama || f.name}
              </h3>
              <p className="text-xs text-gray-400 flex gap-1 mb-4 line-clamp-2">
                📍 {f.alamat || f.address}
              </p>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-black font-medium leading-none mb-[2px]">
                    Harga mulai
                  </p>
                  <div className="flex items-end gap-[2px]">
                    <span className="text-lg font-bold text-green-600 leading-none">
                      Rp {Number(f.harga || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-gray-400 mb-[1px]">/jam</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/lapangan/${f.id}`)}
                  className="bg-[#186d22] hover:bg-green-500 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                >
                  Lihat Lapangan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Garis tipis scroll */}
      <div className="mt-3 flex justify-center">
        <div className="relative w-[180px] h-[3px] rounded-full bg-black/10 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-[#186d22] transition-all duration-150"
            style={{
              width: "38%",
              left: `${progress * 62}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}


function EscalatorGallery({ futsalPhotos = [], miniPhotos = [] }) {
  const leftPhotos = futsalPhotos.length > 0 ? futsalPhotos : [];
  const rightPhotos = miniPhotos.length > 0 ? miniPhotos : [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        width: "130%",
        marginLeft: "-20%",
        marginTop: "-80px",
        height: 560,
      }}
    >
      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up {
          animation: scrollUp 70s linear infinite;
          will-change: transform;
        }
        .scroll-down {
          animation: scrollDown 70s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* KIRI — FUTSAL */}
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          borderRadius: 10,
          background: "#186d22",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 64,
            zIndex: 20,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, #186d22 0%, rgba(24,109,34,0.85) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            height: 64,
            zIndex: 20,
            pointerEvents: "none",
            background:
              "linear-gradient(to top, #186d22 0%, rgba(24,109,34,0.85) 60%, transparent 100%)",
          }}
        />

        <div
          className="scroll-up"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "8px 8px",
            width: "100%",
          }}
        >
          {[...leftPhotos, ...leftPhotos].map((src, idx) => (
            <div
              key={`f-${idx}`}
              style={{
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Futsal ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* KANAN — MINI SOCCER */}
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          borderRadius: 10,
          background: "#186d22",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 64,
            zIndex: 20,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, #186d22 0%, rgba(24,109,34,0.85) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            height: 64,
            zIndex: 20,
            pointerEvents: "none",
            background:
              "linear-gradient(to top, #186d22 0%, rgba(24,109,34,0.85) 60%, transparent 100%)",
          }}
        />

        <div
          className="scroll-down"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "8px 8px",
            width: "100%",
          }}
        >
          {[...rightPhotos, ...rightPhotos].map((src, idx) => (
            <div
              key={`m-${idx}`}
              style={{
                width: "100%",
                aspectRatio: "17/13",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Mini Soccer ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  // ── GANTI useEffect fetch data ────────────────────────────────────────
const [dataLapangan, setDataLapangan] = useState([]);
const [loadingLapangan, setLoadingLapangan] = useState(true);
// Tambah di dalam Home() setelah state lainnya
const [mounted, setMounted] = useState(false);
const location = useLocation();
const heroRef = useRef(null);

useEffect(() => {
  if (location.hash === "#hero") {
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}, [location.hash]);
useEffect(() => {
  // Delay singkat supaya hero sudah render duluan
  const t = setTimeout(() => setMounted(true), 100);
  return () => clearTimeout(t);
}, []);
const [errorLapangan, setErrorLapangan]     = useState(null);
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingLapangan(true);
      const data = await getLapangan();

      // Pastikan data adalah array
      if (Array.isArray(data)) {
        setDataLapangan(data);
      } else {
        setDataLapangan([]);
        setErrorLapangan("Format data tidak valid");
      }
    } catch (err) {
      console.error("Gagal fetch lapangan:", err);
      setErrorLapangan("Gagal memuat data lapangan");
      setDataLapangan([]);
    } finally {
      setLoadingLapangan(false);
    }
  };

  fetchData();
}, []);
  const mapPoints = dataLapangan.filter(
  (f) =>
    Number.isFinite(Number(f.latitude)) &&
    Number.isFinite(Number(f.longitude))
);
const futsalPhotos = [...new Set(
  dataLapangan
    .filter((lap) => String(lap.tipe || "").toLowerCase() === "futsal")
    .flatMap((lap) =>
      Array.isArray(lap.foto)
        ? lap.foto
        : lap.foto
          ? [lap.foto]
          : []
    )
    .filter(Boolean)
)];

const miniPhotos = [...new Set(
  dataLapangan
    .filter((lap) => String(lap.tipe || "").toLowerCase() === "minisoccer")
    .flatMap((lap) =>
      Array.isArray(lap.foto)
        ? lap.foto
        : lap.foto
          ? [lap.foto]
          : []
    )
    .filter(Boolean)
)];

  const [slide, setSlide] = useState(0);
  const [activeSport, setActiveSport] = useState("futsal");
  const [activeFeature, setActiveFeature] = useState(null);
  const [lokasi, setLokasi] = useState("");
  const [olahraga, setOlahraga] = useState("");
  const [waktu, setWaktu] = useState(null); // { date: Date, jam: "08:00" }
  const [userLocation, setUserLocation] = useState("");
  const [distanceText, setDistanceText] = useState("");
  const [userCoords, setUserCoords] = useState(null);
const handleCariLapangan = async () => {
  try {
    if (!waktu?.date || !waktu?.jam) {
      alert("Silakan pilih tanggal dan jam");
      return;
    }

    if (!lokasi) {
      alert("Silakan pilih lokasi");
      return;
    }

    if (!olahraga) {
      alert("Silakan pilih olahraga");
      return;
    }

    navigate(
      `/lapangan` +
        `?tanggal=${encodeURIComponent(
          formatTanggalLocal(waktu.date)
        )}` +
        `&jam=${encodeURIComponent(waktu.jam)}` +
        `&lokasi=${encodeURIComponent(lokasi)}` +
        `&lapangan=${encodeURIComponent(olahraga)}`
    );

  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);
  const px = "px-4 sm:px-8 lg:px-16 xl:px-24";

 async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "BookLap-App/1.0 (timnyawituxth@gmail.com)",
    },
  });

  if (!res.ok) throw new Error("Reverse geocoding gagal");

  const data = await res.json();
  const a = data.address || {};

  const jalan     = a.road || a.pedestrian || a.footway || a.path || "";
  const nomor     = a.house_number ? ` No.${a.house_number}` : "";
  const kelurahan = a.quarter || a.neighbourhood || a.suburb || "";
  const kecamatan = a.city_district || a.district || "";
  const kota      = a.city || a.town || a.village || a.county || "";
  const provinsi  = a.state || "";

  const parts = [
    jalan ? `${jalan}${nomor}` : "",
    kelurahan,
    kecamatan,
    kota,
    provinsi,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : data.display_name || "";
}

async function searchManualLocation() {
  if (!userLocation.trim()) return;

  try {
    setDistanceText("Mencari lokasi...");

    // ✅ Tambah "Parepare" sebagai konteks jika tidak disebut
    const query = userLocation.trim();

    // ✅ Coba dengan countrycodes=id supaya fokus ke Indonesia
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1&accept-language=id`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "BookLap-App/1.0 (timnyawituxth@gmail.com)",
      },
    });

    const data = await res.json();

    if (!data || data.length === 0) {
      // ✅ Coba pencarian lebih longgar — tambah "Parepare Sulawesi"
      const url2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Parepare Sulawesi Selatan")}&countrycodes=id&limit=5&accept-language=id`;

      const res2 = await fetch(url2, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "BookLap-App/1.0 (timnyawituxth@gmail.com)",
        },
      });

      const data2 = await res2.json();

      if (!data2 || data2.length === 0) {
        setDistanceText("❌ Lokasi tidak ditemukan. Coba tulis lebih lengkap, contoh: 'Lapadde, Parepare'");
        return;
      }

      const place2 = data2[0];
      setUserCoords({ lat: Number(place2.lat), lng: Number(place2.lon) });
      setUserLocation(place2.display_name);
      setDistanceText("✅ Lokasi ditemukan. Klik marker untuk melihat jarak ke lapangan.");
      return;
    }

    const place = data[0];
    setUserCoords({ lat: Number(place.lat), lng: Number(place.lon) });
    setUserLocation(place.display_name);
    setDistanceText("✅ Lokasi ditemukan. Klik marker untuk melihat jarak ke lapangan.");

  } catch (err) {
    setDistanceText("❌ Gagal mencari lokasi. Periksa koneksi internet.");
  }
}

function detectLocation() {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung lokasi");
    return;
  }

  setDistanceText("Mendeteksi lokasi saat ini...");
  setUserLocation("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userLat  = position.coords.latitude;
      const userLng  = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      setUserCoords({ lat: userLat, lng: userLng });
      setDistanceText(`Menerjemahkan koordinat... (akurasi ±${Math.round(accuracy)}m)`);

      try {
        const locationName = await reverseGeocode(userLat, userLng);
        setUserLocation(locationName || `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
        setDistanceText(
          `✅ Lokasi aktif (±${Math.round(accuracy)}m). Klik marker untuk melihat jarak ke lapangan.`
        );
      } catch {
        setUserLocation(`${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
        setDistanceText("Lokasi aktif. Klik marker untuk melihat jarak ke lapangan.");
      }
    },
    (error) => {
      const errorMsg = {
        1: "Izin lokasi ditolak. Aktifkan izin lokasi di browser.",
        2: "Posisi tidak tersedia. Coba di luar ruangan.",
        3: "Timeout. Coba lagi.",
      };
      setDistanceText(errorMsg[error.code] || "Gagal mengambil lokasi.");
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );
}
  return (
    <div className="w-full bg-gray-50 antialiased">

{/* ═══ HERO ═══ */}
<section
  ref={heroRef}
  id="hero"
  className="relative w-full flex items-center overflow-hidden"
  style={{
    minHeight: "130vh",
    backgroundColor: "#000",
    isolation: "isolate",
    willChange: "transform",
    zIndex: 40,
    position: "relative",
    // borderBottomLeftRadius: "50px",   // ✅ sudut bawah kiri
    // borderBottomRightRadius: "50px", 
  }}
>
  <video
  autoPlay
  muted
  loop
  playsInline
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
>
  <source
    src="https://res.cloudinary.com/drdaiwuae/video/upload/q_auto/f_auto/v1781900074/video1_k4b52b.mp4"
    type="video/mp4"
  />
</video>

  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent pointer-events-none" />

  <div
  className={`relative z-10 w-full ${px} flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 py-24 -mt-40`}
>
    <div className="w-full lg:w-[520px] flex-shrink-0 -mt-32">
      <h1
        className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-[1.1]"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
      >
        Selamat Datang di Website{" "}
       
                <span>Book</span>
                <span className="text-[#186d22]">Lap</span>
             
      </h1>
      <p
        className="mt-5 max-w-md leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.9)",
          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
        }}
      >
        Temukan dan pesan lapangan futsal & mini soccer favoritmu dengan cepat,
        mudah, dan terpercaya.
      </p>
    </div>

    <div className="relative z-[999] w-full lg:w-[420px] flex-shrink-0">
      <div
        className="rounded-3xl p-6 shadow-2xl overflow-visible"
        style={{
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <h3 className="text-white text-lg font-semibold mb-4">
          Cari dan Pesan lapangan terbaik langsung dengan{" "}
          <span className="text-green-400">BookLap</span>
        </h3>
        <div className="flex flex-col gap-3">
          <CalendarPicker value={waktu} onChange={setWaktu} />
          <div className="h-px bg-white/10" />
          <Dropdown
            label="Pilih Lokasi"
            options={LOKASI_OPTIONS}
            value={lokasi}
            onChange={setLokasi}
          />
          <div className="h-px bg-white/10" />
          <Dropdown
            label="Jenis Olahraga"
            options={OLAHRAGA_OPTIONS}
            value={olahraga}
            onChange={setOlahraga}
          />
          <button
            onClick={handleCariLapangan}
            className="mt-3 w-full bg-[#186d22] hover:bg-[#16601f] text-white font-bold py-3 rounded-xl transition-all"
          >
            Cari Lapangan Sekarang!
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ═══ BUTTON BAR BAWAH HERO ═══ */}
<div
  style={{
    position: "relative",
    zIndex: 45,

    /* ✅ naik tepat di bawah hero */
    marginTop: "-18px",

    display: "flex",
    justifyContent: "center",

    marginBottom: "50px",
  }}
>
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "90px",
    }}
  >
    {/* ✅ blur glow bawah */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-22px",
        transform: "translateX(80%)",

        width: "92%",
        height: "55px",

        background: "rgba(255,255,255,0.35)",
        filter: "blur(22px)",

        borderTopLeftRadius: "0px",
        borderTopRightRadius: "0px",
        borderBottomLeftRadius: "70px",
        borderBottomRightRadius: "70px",

        zIndex: 1,
      }}
    />

    {/* ✅ button utama */}
    <button
      style={{
        position: "relative",
        zIndex: 2,

        width: "100%",
        height: "90px",

        background: "#e5e5e5",

        border: "1px solid rgba(255,255,255,0.55)",

        /* ✅ atas rata */
        borderTopLeftRadius: "0px",
        borderTopRightRadius: "0px",

        /* ✅ bawah melengkung */
        borderBottomLeftRadius: "70px",
        borderBottomRightRadius: "70px",

        boxShadow:
          "0 10px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",

        backdropFilter: "blur(10px)",

        cursor: "pointer",

        transition: "all 0.25s ease",

        /* ✅ posisi text */
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        /* ✅ style text */
        fontSize: "30px",
        fontWeight: "800",
        color: "#186d22",

        letterSpacing: "-0.5px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = "#efefef";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "#e5e5e5";
      }}
    >
      Mulai pertandinganmu bersama BookLap
    </button>
  </div>
</div>


{/* BACKGROUND + KARTU — FIXED */}
<div
  style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 5,
    pointerEvents: "none",
    opacity: mounted ? 1 : 0,
    transition: "opacity 0.4s ease",
  }}
>
   
  {/* GAMBAR LAPANGAN */}
<img
  src={gambar4}
  alt="gambar4"
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  }}
/>
  {/* ── OVERLAY LEBIH GELAP agar kartu dan teks lebih menonjol ── */}
  <div style={{
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.60) 100%)",
  }} />

  {/* WRAPPER UTAMA */}
  <div
    style={{
      position: "absolute",
      top: "55%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      maxWidth: "1200px",
      padding: "0 32px",
      pointerEvents: "auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    }}
  >
  
    {/* ── BARIS ATAS: tombol teks ── */}
     {/* ── JUDUL — lebih kecil, elegan ── */}
    <div style={{ textAlign: "center", marginBottom: "4px" }}>
      <p style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#4ade80",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: "8px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        Platform Booking Lapangan
      </p>
      <h2 style={{
        fontSize: "28px",
        fontWeight: 800,
        color: "#ffffff",
        letterSpacing: "-0.02em",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textShadow: "0 2px 16px rgba(0,0,0,0.4)",
        lineHeight: 1.2,
      }}>
        Mulai Pertandinganmu Bersama{" "}
        <span style={{ color: "#4ade80" }}>BookLap</span>
      </h2>
    </div>

     {/* ── 4 KARTU — glassmorphism ── */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        width: "100%",
      }}
    >
      {FEATURES.map(({ icon, title, desc }, i) => {
        const isActive = activeFeature === i;
        return (
          <div
            key={i}
            onClick={() => setActiveFeature(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: "20px",
              padding: "24px 18px",
              cursor: "pointer",
              // ── Glassmorphism saat tidak aktif ──
              background: isActive
                ? "rgba(22,163,74,0.85)"
                : "rgba(255,255,255,0.13)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: isActive
                ? "1.5px solid rgba(74,222,128,0.5)"
                : "1px solid rgba(255,255,255,0.22)",
              boxShadow: isActive
                ? "0 12px 40px rgba(22,163,74,0.35)"
                : "0 8px 32px rgba(0,0,0,0.18)",
              transform: isActive
                ? "translateY(-6px) scale(1.03)"
                : "translateY(0) scale(1)",
              transition: "all 0.35s cubic-bezier(.34,1.56,.64,1)",
            }}
            onMouseEnter={e => {
              if (activeFeature !== i) {
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }
            }}
            onMouseLeave={e => {
              if (activeFeature !== i) {
                e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <div style={{ marginBottom: "10px" }}>{icon}</div>
            <h3 style={{
              fontWeight: 700,
              fontSize: "13.5px",
              marginBottom: "5px",
              color: "#ffffff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: "12px",
              lineHeight: 1.55,
              color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)",
            }}>
              {desc}
            </p>
          </div>
        );
      })}
    </div>

    {/* ── TOMBOL CTA — lebih proporsional ── */}
    <button
      onClick={() => navigate("/tentangkami")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,255,255,0.10)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.28)",
        borderRadius: "99px",
        padding: "10px 22px",
        fontSize: "13.5px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "all 0.2s ease",
        marginTop: "4px",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.20)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.10)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      Cari tahu lebih lanjut tentang kami
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>

  </div>
</div>



{/* JENIS OLAHRAGA */}
<section
  className="relative w-full"
  style={{
    zIndex: 5,
    overflow: "hidden",
    background: "#186d22",
    marginTop: "-180px",
    paddingTop: "280px",
    paddingBottom: "180px",
  }}
>
  <div className={`${px} px-6`} style={{ marginTop: "-110px" }}>
    <div className="mb-12">
      <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
    Kategori
  </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Pilih Jenis Olahraga
      </h2>
    </div>

    {(() => {
      const sport = SPORT_DETAIL[activeSport] || SPORT_DETAIL.futsal;

      return (
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* TEKS KIRI */}
          <div className="pt-2">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveSport("futsal")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeSport === "futsal"
                    ? "bg-white text-[#186d22]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Futsal
              </button>

              <button
                onClick={() => setActiveSport("minisoccer")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeSport === "minisoccer"
                    ? "bg-white text-[#186d22]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Mini Soccer
              </button>
            </div>

            

            <p className="text-gray-300 max-w-md leading-relaxed">
              {sport.desc}
            </p>
          </div>

          {/* GALLERY KANAN */}
          <div className="self-start -mt-8 md:-mt-12">
            <EscalatorGallery
              futsalPhotos={futsalPhotos}
              miniPhotos={miniPhotos}
            />
          </div>
        </div>
      );
    })()}
  </div>
</section>

{/* REKOMENDASI LAPANGAN */}
<section
  className="w-full pb-16"
  style={{
    position: "relative",
    zIndex: 20,
    backgroundColor: "#f9fafb",

    /* ✅ tarik putih naik */
    marginTop: "-150px",

    paddingTop: "70px",

    borderTopLeftRadius: "50px",
    borderTopRightRadius: "50px",

    overflow: "hidden",

    marginBottom: "40px",
  }}
>
    <div className={`flex items-end justify-between mb-8 ${px}`}>
    <div>
      <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
        Pilihan Terbaik
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
        Rekomendasi Lapangan Populer
      </h2>
    </div>
    <button
      onClick={() => navigate("/lapangan")}
      className="text-sm text-green-600 font-medium hover:text-green-700 transition-colors whitespace-nowrap"
    >
      Lihat Semua →
    </button>
  </div>

  <div className={`${px}`}>

    {/* Loading state */}
    {loadingLapangan && (
      <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 sm:w-80 h-64 bg-gray-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    )}

    {/* Error state */}
    {!loadingLapangan && errorLapangan && (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-semibold text-gray-600">{errorLapangan}</p>
        <p className="text-sm mt-1">Pastikan server backend sudah berjalan di port 5000</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full text-sm font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    )}

    {/* Empty state */}
    {!loadingLapangan && !errorLapangan && dataLapangan.length === 0 && (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🏟️</p>
        <p className="font-semibold text-gray-600">Belum ada lapangan tersedia</p>
      </div>
    )}

    {/* Data lapangan */}
{!loadingLapangan && !errorLapangan && dataLapangan.length > 0 && (
  <ScrollableCards data={dataLapangan} navigate={navigate} />
)}
</div>
</section>

      {/* ═══ BANNER SLIDER ═══ */}
{/* ═══ BANNER SLIDER ═══ */}
<section
  className="w-full px-6 lg:px-12 xl:px-20 pb-16"
  style={{
    position: "relative",
    zIndex: 20,
    backgroundColor: "#f9fafb",

    // ↑ NAIKKAN BANNER AGAR RAPAT
    marginTop: "-40px",

    borderBottomLeftRadius: "50px",
    borderBottomRightRadius: "50px",
  }}
>
  <div
    className="relative w-full max-w-[1400px] mx-auto rounded-3xl overflow-hidden shadow-xl"
    style={{ aspectRatio: "18/7" }}
  >
    <img
      src={SLIDES[slide].img}
      alt="Banner"
      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
    <div className="absolute inset-0 flex items-center px-8 sm:px-16">
      <div>
        <h3 className="text-white text-2xl sm:text-4xl font-extrabold leading-tight">
          {SLIDES[slide].headline}
        </h3>
        <p className="text-white/70 text-sm sm:text-base mt-2">
          {SLIDES[slide].sub}
        </p>
      </div>
    </div>
    <button
      onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}
      className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-green-600 text-white text-xl font-bold flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200"
    >‹</button>
    <button
      onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
      className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-green-600 text-white text-xl font-bold flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200"
    >›</button>
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
      {SLIDES.map((_, i) => (
        <button
          key={i}
          onClick={() => setSlide(i)}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === slide ? "w-8 bg-green-400" : "w-2 bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  </div>
</section>

{/* WHY BOOKLAP — PETA */}
<section
  className="relative w-full overflow-hidden"
  style={{
    position: "relative",
    zIndex: 5,
    backgroundColor: "#186d22",
    marginTop: "-120px",
    paddingBottom: "80px",
  }}
>
  {/* SVG concave kiri atas */}
  <svg viewBox="0 0 220 120" preserveAspectRatio="none"
    style={{ position:"absolute", top:"-120px", left:0, width:"220px", height:"121px", zIndex:21, pointerEvents:"none", display:"block" }}>
    <path d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z" fill="#0d3d1a" />
  </svg>
  {/* SVG concave kanan atas */}
  <svg viewBox="0 0 220 120" preserveAspectRatio="none"
    style={{ position:"absolute", top:"-120px", right:0, width:"220px", height:"121px", zIndex:21, pointerEvents:"none", display:"block", transform:"scaleX(-1)" }}>
    <path d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z" fill="#0d3d1a" />
  </svg>

  {/* Dekorasi lingkaran blur background */}
  <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"400px", height:"400px", borderRadius:"50%", background:"rgba(74,222,128,0.04)", pointerEvents:"none" }} />
  <div style={{ position:"absolute", bottom:"-80px", left:"-80px", width:"500px", height:"500px", borderRadius:"50%", background:"rgba(22,163,74,0.06)", pointerEvents:"none" }} />

  <div className={`relative z-10 ${px} pt-24`}>

    {/* ── HEADER ── */}
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:"32px", gap:"8px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"32px", height:"3px", borderRadius:"99px", background:"linear-gradient(to right, #4ade80, #22c55e)" }} />
        <p style={{ fontSize:"11px", fontWeight:700, color:"#4ade80", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          Lokasi BookLap
        </p>
      </div>

      <h2 style={{
        fontSize:"clamp(24px, 3vw, 38px)",
        fontWeight:800,
        color:"#ffffff",
        letterSpacing:"-0.02em",
        lineHeight:1.15,
        fontFamily:"'Plus Jakarta Sans', sans-serif",
      }}>
        Temukan Lapangan{" "}
        <span style={{
          background:"linear-gradient(135deg, #4ade80, #22c55e)",
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
        }}>Terdekat</span>{" "}
        dari Lokasimu
      </h2>

      <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.5)", maxWidth:"480px", lineHeight:1.7, marginTop:"4px" }}>
        Masukkan alamatmu atau aktifkan GPS untuk mengetahui lapangan BookLap yang paling dekat dengan lokasimu saat ini.
      </p>
    </div>

    {/* ── SEARCH BAR ── */}
    <div style={{
      display:"flex",
      gap:"10px",
      alignItems:"center",
      marginBottom:"20px",
      flexWrap:"wrap",
    }}>
      {/* Input */}
      <div style={{
        flex:1,
        minWidth:"260px",
        position:"relative",
        display:"flex",
        alignItems:"center",
      }}>
        {/* Ikon search di dalam input */}
        <svg
          style={{ position:"absolute", left:"16px", color:"rgba(255,255,255,0.4)", pointerEvents:"none" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") searchManualLocation(); }}
          placeholder="Cari alamat, kelurahan, atau nama tempat..."
          style={{
            width:"100%",
            height:"52px",
            paddingLeft:"44px",
            paddingRight:"18px",
            borderRadius:"14px",
            border:"1.5px solid rgba(255,255,255,0.12)",
            background:"rgba(255,255,255,0.08)",
            color:"#fff",
            fontSize:"13.5px",
            outline:"none",
            backdropFilter:"blur(12px)",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            transition:"border-color 0.2s, background 0.2s",
          }}
          onFocus={e => {
            e.target.style.borderColor = "rgba(74,222,128,0.5)";
            e.target.style.background  = "rgba(255,255,255,0.12)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(255,255,255,0.12)";
            e.target.style.background  = "rgba(255,255,255,0.08)";
          }}
        />
      </div>

      {/* Tombol GPS */}
      <button
        onClick={detectLocation}
        title="Gunakan lokasi saat ini"
        style={{
          width:"52px", height:"52px",
          borderRadius:"14px",
          border:"1.5px solid rgba(74,222,128,0.35)",
          background:"rgba(34,197,94,0.15)",
          color:"#4ade80",
          cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          backdropFilter:"blur(12px)",
          transition:"all 0.2s",
          flexShrink:0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(34,197,94,0.28)";
          e.currentTarget.style.borderColor = "rgba(74,222,128,0.6)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(34,197,94,0.15)";
          e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
        </svg>
      </button>

      {/* Tombol Cari */}
      <button
        onClick={searchManualLocation}
        style={{
          height:"52px",
          padding:"0 24px",
          borderRadius:"14px",
          border:"none",
          background:"linear-gradient(135deg, #22c55e, #16a34a)",
          color:"#fff",
          fontWeight:700,
          fontSize:"13.5px",
          cursor:"pointer",
          fontFamily:"'Plus Jakarta Sans', sans-serif",
          boxShadow:"0 6px 20px rgba(34,197,94,0.35)",
          transition:"all 0.2s",
          flexShrink:0,
          letterSpacing:"0.01em",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 10px 28px rgba(34,197,94,0.45)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.35)";
        }}
      >
        Cari Lokasi
      </button>
    </div>

    {/* Status text */}
    {distanceText && (
      <div style={{
        display:"inline-flex", alignItems:"center", gap:"8px",
        marginBottom:"16px",
        padding:"8px 14px",
        borderRadius:"10px",
        background:"rgba(74,222,128,0.12)",
        border:"1px solid rgba(74,222,128,0.25)",
        color:"#86efac",
        fontSize:"13px",
        fontWeight:600,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        {distanceText}
      </div>
    )}

    {/* ── PETA ── */}
      <div
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          height: "440px",
          position: "relative",
          background: "#fff",
        }}
      >
      {/* Label overlay kiri atas */}
      <div style={{
        position:"absolute", top:"14px", left:"14px",
        zIndex:999, pointerEvents:"none",
        background:"rgba(13,61,26,0.85)",
        backdropFilter:"blur(10px)",
        border:"1px solid rgba(74,222,128,0.25)",
        borderRadius:"10px",
        padding:"8px 14px",
        display:"flex", alignItems:"center", gap:"7px",
      }}>
        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 0 3px rgba(34,197,94,0.3)" }} />
        <span style={{ fontSize:"12px", fontWeight:700, color:"#fff" }}>
          {mapPoints.length} Lapangan Tersedia
        </span>
      </div>

      <LapanganMap points={mapPoints} userCoords={userCoords} />
    </div>

    {/* ── STATS BAWAH PETA ── */}
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(3, 1fr)",
      gap:"12px",
      marginTop:"16px",
    }}>
        {[
          { icon: <FaBuilding size={22} color="#000000" />, value: mapPoints.length + "+", label: "Lapangan Terdaftar" },
          { icon: <FaMapMarkerAlt size={22} color="#000000" />, value: "Parepare", label: "Kota Tersedia" },
          { icon: <FaBolt size={22} color="#000000" />, value: "Real-time", label: "Update Jadwal" },
        ].map(({ icon, value, label }) => (
        <div key={label} style={{
          display:"flex", alignItems:"center", gap:"12px",
          padding:"14px 18px",
          borderRadius:"14px",
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.09)",
          backdropFilter:"blur(10px)",
        }}>
          <span style={{ fontSize:"22px", flexShrink:0 }}>{icon}</span>
          <div>
            <p style={{ fontSize:"16px", fontWeight:800, color:"#fff", lineHeight:1, marginBottom:"2px" }}>{value}</p>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", fontWeight:500 }}>{label}</p>
          </div>
        </div>
      ))}
    </div>

  </div>
</section>

{/* ✅ SVG CONCAVE BAWAH WHY */}
<div
  style={{
    position: "relative",
    zIndex: 21,
    marginTop: "-1px",
    pointerEvents: "none",
    height: "120px",
    backgroundColor: "transparent",
  }}
>
  {/* SVG kiri */}
  <svg
    viewBox="0 0 220 120"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      top: 0, left: 0,
      width: "220px", height: "120px",
      display: "block",
      // ✅ HAPUS opacity — pakai solid penuh
    }}
  >
    <path
      d="M0,0 L0,120 C0,40 60,0 140,0 L220,0 Z"
      fill="#186d22"  // ✅ sama persis dengan backgroundColor section
    />
  </svg>

  {/* SVG kanan */}
  <svg
    viewBox="0 0 220 120"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      top: 0, right: 0,
      width: "220px", height: "120px",
      display: "block",
      transform: "scaleX(-1)",
      // ✅ HAPUS opacity
    }}
  >
    <path
      d="M0,0 L0,120 C0,40 60,0 140,0 L220,0 Z"
      fill="#186d22"  // ✅ sama
    />
  </svg>
</div>

{/* ═══ GAP — celah tembus ke background fixed ═══ */}
{/* ✅ Ini ruang kosong di antara WHY dan FAQ — background fixed terlihat di sini */}
<div style={{ height: "120px", position: "relative", zIndex: 15 }} />

{/* ═══ FAQ ═══ */}
<section
  className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-20"
  style={{
    position: "relative",
    zIndex: 20,
    backgroundColor: "#f9fafb",

    /* ✅ turunkan FAQ */
    marginTop: "40px",
  }}
>
  {/* ✅ SVG concave sudut kiri atas */}
  <svg
    viewBox="0 0 220 120"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      top: "-120px",
      left: 0,
      width: "220px",
      height: "121px",
      zIndex: 21,
      pointerEvents: "none",
      display: "block",
    }}
  >
    <path
      d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z"
      fill="#f9fafb"
    />
  </svg>

  {/* ✅ SVG concave sudut kanan atas — mirror */}
  <svg
    viewBox="0 0 220 120"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      top: "-120px",
      right: 0,
      width: "220px",
      height: "121px",
      zIndex: 21,
      pointerEvents: "none",
      display: "block",
      transform: "scaleX(-1)",
    }}
  >
    <path
      d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z"
      fill="#f9fafb"
    />
  </svg>

  {/* HEADER */}
  <div className="text-center mb-14">
    <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3">FAQ</p>
    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
      Bingung? Mulai dari Sini
    </h2>
  </div>

  {/* LIST FAQ — ganti bagian ini */}
<div className="w-full" style={{ display: "flex", flexDirection: "column" }}>
  {FAQS.map((f, i) => (
    <FaqItem key={i} {...f} />
  ))}
</div>
</section>

{/* ═══ TESTIMONI ═══ */}
<section
  className="w-full py-20"
  style={{
    position: "relative",
    zIndex: 20,
    backgroundColor: "#186d22",
    overflow: "hidden",
  }}
>
  {/* SVG lengkung kiri atas */}
  <svg viewBox="0 0 220 120" preserveAspectRatio="none"
    style={{ position:"absolute", top:"-120px", left:0, width:"220px", height:"121px", zIndex:21, pointerEvents:"none", display:"block" }}>
    <path d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z" fill="#186d22" />
  </svg>

  {/* SVG lengkung kanan atas */}
  <svg viewBox="0 0 220 120" preserveAspectRatio="none"
    style={{ position:"absolute", top:"-120px", right:0, width:"220px", height:"121px", zIndex:21, pointerEvents:"none", display:"block", transform:"scaleX(-1)" }}>
    <path d="M0,120 L0,0 C0,70 60,120 140,120 L220,120 Z" fill="#186d22" />
  </svg>

  <style>{`
    .testimoni-track {
      display: flex;
      gap: 24px;
      animation: scrollLeft 30s linear infinite;
      width: max-content;
    }
    .testimoni-track:hover {
      animation-play-state: paused;
    }
    @keyframes scrollLeft {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .testi-card {
      transition: transform 0.35s cubic-bezier(.34,1.56,.64,1),
                  box-shadow 0.35s ease,
                  background 0.3s ease;
    }
    .testi-card:hover {
      transform: translateY(-10px) scale(1.03) !important;
      box-shadow: 0 24px 48px rgba(0,0,0,0.14) !important;
      background: #ffffff !important;
    }
  `}</style>

  <div className="relative z-10">
    {/* HEADER */}
    <div className={`${px} text-center mb-16`}>
      <p className="text-sm font-semibold text-white uppercase tracking-widest mb-3">
        Testimoni Pengguna
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
        Pengalaman Mereka Bersama BookLap
      </h2>
      {/* <p className="text-white mt-4 max-w-2xl mx-auto leading-relaxed">
        Ribuan pemain futsal dan mini soccer telah menggunakan BookLap
        untuk booking lapangan lebih cepat, praktis, dan terpercaya.
      </p> */}
    </div>

    {/* AUTO-SCROLL TRACK — overflow hidden di wrapper */}
    <div style={{ overflow: "hidden", paddingBottom: "16px", marginTop: "-40px" }}>
      <div className="testimoni-track">
        {/* Render 2x untuk efek loop tanpa putus */}
        {[...Array(2)].map((_, dupIdx) =>
          [
            {
              nama: "Rizky Pratama",
              role: "Pemain Futsal",
              rating: 5,
              komen: "Booking lapangan sekarang jauh lebih cepat. Tinggal pilih jadwal lalu langsung pesan tanpa ribet chat manual.",
            },
            {
              nama: "Fahri Ramadhan",
              role: "Kapten Tim Mini Soccer",
              rating: 5,
              komen: "Pilihan lapangannya lengkap dan tampilannya nyaman dipakai. Sangat membantu saat mencari jadwal kosong.",
            },
            {
              nama: "Dimas Saputra",
              role: "Pengguna BookLap",
              rating: 5,
              komen: "Saya suka karena harga lapangan transparan dan lokasi lapangan langsung terlihat di maps.",
            },
            {
              nama: "Andi Wijaya",
              role: "Pemain Futsal",
              rating: 5,
              komen: "Aplikasinya simpel dan tidak ribet. Bisa booking dalam 2 menit dari mana saja — benar-benar praktis!",
            },
            {
              nama: "Budi Santoso",
              role: "Pengelola Tim",
              rating: 4,
              komen: "Fitur cek jadwal langsung dari web sangat membantu tim kami mengatur latihan rutin setiap minggu.",
            },
            {
              nama: "Siti Rahma",
              role: "Pengguna BookLap",
              rating: 5,
              komen: "Tidak perlu lagi telepon lapangan untuk cek ketersediaan. Semua info ada di satu tempat, keren banget!",
            },
          ].map((item, i) => (
            <div
              key={`${dupIdx}-${i}`}
              className="testi-card"
              style={{
                flexShrink: 0,
                width: "320px",
                borderRadius: "10px",
                padding: "28px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                cursor: "default",
              }}
            >
              {/* Rating bintang */}
              <div style={{ display:"flex", gap:"3px", marginBottom:"16px" }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "16px",
                      color: s < item.rating ? "#facc15" : "rgba(255,255,255,0.2)",
                    }}
                  >★</span>
                ))}
              </div>

              {/* Komentar */}
              <p style={{
                color: "#374151",
                fontSize: "14px",
                lineHeight: 1.75,
                marginBottom: "24px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {item.komen}
              </p>

              {/* Divider */}
              <div style={{ height:"1px", background: "#000000", marginBottom:"20px" }} />

              {/* User info */}
              <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{
                  width: "46px", height: "46px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #16a34a, #4ade80)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: "18px",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(22,163,74,0.4)",
                }}>
                  {item.nama.charAt(0)}
                </div>
                <div>
                  <h4 style={{ color:"#111827", fontWeight:700, fontSize:"14px", marginBottom:"3px" }}>
                    {item.nama}
                  </h4>
                  <p style={{ color:"#6b7280", fontSize:"12px" }}>
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    
  </div>
</section>
<Footer />
    </div>
  );
}

