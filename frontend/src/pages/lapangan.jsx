// lapangan

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getLapangan,
  searchLapanganTersedia,
} from "../services/api";
import Footer from "../components/Footer";



// ── TOAST SYSTEM ──────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, hiding: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
    }, 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, hiding: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  }, []);

  return { toasts, addToast, dismiss };
}

const ICONS = { success: "✓", info: "ℹ", warn: "⚠" };
const ICON_COLORS = {
  success: "bg-green-500",
  info: "bg-blue-500",
  warn: "bg-amber-500",
};

function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px] max-w-sm relative overflow-hidden"
          style={{
            animation: t.hiding
              ? "toastOut .3s ease forwards"
              : "toastIn .35s cubic-bezier(.34,1.56,.64,1) forwards",
          }}
        >
          <div
            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${ICON_COLORS[t.type]}`}
          >
            {ICONS[t.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{t.title}</p>
            <p className="text-xs text-white/60 mt-0.5">{t.msg}</p>
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-white/40 hover:text-white text-base leading-none transition-colors"
          >
            ✕
          </button>
          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-green-400 rounded-b-2xl"
            style={{ animation: "shrinkBar 3.5s linear forwards" }}
          />
        </div>
      ))}
    </div>
  );
}

// ── SKELETON CARD 

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="h-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      <div className="p-6 flex flex-col gap-3">
        <div className="h-3.5 w-4/5 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-3/5 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-10 w-36 bg-gray-100 rounded-lg animate-pulse mt-2" />
      </div>
    </div>
  );
}

// ── STAR RATING 

function Stars({ count }) {
  return (
    <span className="text-amber-400 tracking-wide">
      {"★".repeat(count)}
      {"☆".repeat(5 - count)}
    </span>
  );
}

// ── LAPANGAN CARD 

// ── LAPANGAN CARD 

function LapanganCard({ field, delay = 0, onBook }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer"
      style={{
        transition:
          "opacity .5s ease, transform .5s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
      }}

      // ✅ SEKARANG SELURUH CARD BISA DIKLIK
      onClick={() => onBook(field)}

      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={field.foto?.[0]}
          alt={field.nama}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white text-[11px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
          {field.tipe}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 pb-6">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5">
          {field.nama}
        </h3>

        <p className="text-sm text-gray-400 flex items-start gap-1.5 mb-4">
          <svg width="11" height="14" viewBox="0 0 12 14" fill="none">
            <path
              d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
              fill="#94a3b8"
            />
          </svg>
          {field.alamat}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Stars count={Math.round(field.rating)} />
          <span className="font-semibold text-gray-700">
            {field.rating}
          </span>
          <span className="text-gray-300">·</span>
          <span>{field.reviews} ulasan</span>
        </div>
        {field.tanggal_pencarian && field.jam_pencarian && (
  <div className="mb-4">
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
      <span className="text-green-600 font-bold">
        ✓
      </span>

      <span className="text-xs font-semibold text-green-700">
        Jadwal tersedia pada tanggal {field.tanggal_pencarian} pukul {field.jam_pencarian}
      </span>
    </div>
  </div>
)}

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ biar tidak double klik dari card
            onBook(field);
          }}
          className="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-br from-[#145c1b] via-[#186d22] to-[#239233] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          style={{ boxShadow: "0 4px 14px rgba(34,197,94,.3)" }}
        >
          Lihat Detail Lapangan
        </button>
      </div>
    </div>
  );
}

// ── SECTION HEADER 
function SectionHeader({ title, count }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex items-center gap-4 mb-10"
      style={{
        transition: "opacity .6s ease, transform .6s ease",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <h2
        className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {title}
      </h2>
      <span className="bg-green-100 text-green-700 text-xs font-bold tracking-widest px-3 py-1 rounded-full uppercase">
        {count} Tersedia
      </span>
      <div
        className="flex-1 h-0.5 rounded-full"
        style={{ background: "linear-gradient(to right, #bbf7d0, transparent)" }}
      />
    </div>
  );
}

// ── MAIN PAGE 
export default function Lapangan() {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tanggalQuery = queryParams.get("tanggal");
  const jamQuery = queryParams.get("jam");
  const lokasiQuery = (queryParams.get("lokasi") || "")
    .toLowerCase()
    .trim();
  const lapanganQuery = (queryParams.get("lapangan") || "")
    .toLowerCase()
    .trim();
  const normalize = (value = "") =>
    value.toString().toLowerCase().replace(/\s+/g, "").trim();
  const isSearchMode = Boolean(lokasiQuery || lapanganQuery);

  const [loaded, setLoaded] = useState(false);
  const [dataLapangan, setDataLapangan] = useState([]);
  const [futsalShowAll, setFutsalShowAll] = useState(false);
  const { toasts, addToast, dismiss } = useToast();
  const [authPopup, setAuthPopup] = useState(false);
  const [targetAfterAuth, setTargetAfterAuth] = useState("");


  // Simulate async data load (skeleton → cards)
useEffect(() => {
  const fetchData = async () => {
    try {
      let data = [];

      const sedangCari =
        tanggalQuery &&
        jamQuery &&
        lokasiQuery &&
        lapanganQuery;

      if (sedangCari) {
        console.log({
  tanggalQuery,
  jamQuery,
  lokasiQuery,
  lapanganQuery,
});
        
        data = await searchLapanganTersedia({
          
          tanggal: tanggalQuery,
          jam: jamQuery,
          lokasi: lokasiQuery,
          tipe: lapanganQuery,
        });
      } else {
        data = await getLapangan();
      }

      setDataLapangan(data);
    } catch (err) {
      console.error(err);
      setDataLapangan([]);
    } finally {
      setLoaded(true);
    }
  };

  fetchData();
}, [
  tanggalQuery,
  jamQuery,
  lokasiQuery,
  lapanganQuery,
]);

  // Welcome toast
  useEffect(() => {
    const t = setTimeout(
      () => addToast("info", "Selamat Datang!", "Temukan lapangan terbaik di Parepare 🏟️"),
      1900
    );
    return () => clearTimeout(t);
  }, [addToast]);

  function handleBook(field) {
  const targetPath = `/lapangan/${field.id}`;
  const token = localStorage.getItem("token");

  // ← Cek lebih ketat: null, undefined, string kosong, "null", "undefined"
  const isLoggedIn = token && token !== "null" && token !== "undefined" && token.trim() !== "";

  if (!isLoggedIn) {
    localStorage.setItem("redirectAfterAuth", targetPath);
    setTargetAfterAuth(targetPath);
    setAuthPopup(true);
    return;   // ← STOP di sini, tidak lanjut ke navigate
  }

  addToast("success", "Lapangan Dipilih", `Kamu memilih ${field.nama}`);
  setTimeout(() => navigate(targetPath), 300);
}
//  dari searc bar juga
  // ── FILTER DARI SEARCH BAR ─────────────────────────────
const filteredLapangan = dataLapangan;

const futsalData = filteredLapangan.filter((f) =>
  normalize(f.tipe || "").includes("futsal")
);
const miniData = filteredLapangan.filter((f) =>
  normalize(f.tipe || "").includes("minisoccer")
);
const futsalVisible = isSearchMode
  ? futsalData
  : futsalShowAll
    ? futsalData
    : futsalData.slice(0, 6);
    
const futsalCount = futsalData.length;

  return (
    <>

      <div className="w-full bg-gray-50 antialiased overflow-x-hidden min-h-screen">
        <Navbar />

        {/* ═══ HERO (DENGAN RADIUS BAWAH) ═══ */}
<section
  className="relative w-full h-[80vh] flex flex-col justify-center overflow-hidden rounded-b-[30px]"
>
  {/* Background Image */}
<img
  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2400&q=100"
  alt="Lapangan futsal"
  className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
/>

  {/* Overlay Gelap */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 pointer-events-none" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

  {/* Konten */}
  <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 pt-24 text-white">
    
    {/* JUDUL */}
    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight max-w-2xl">
      Jelajahi{" "}
      <span className="text-green-400">Lapangan</span>{" "}
      Terbaik
    </h1>

    {/* DESKRIPSI */}
    <p className="mt-5 text-base sm:text-lg text-white/65 max-w-md leading-relaxed font-light">
      Temukan berbagai pilihan lapangan futsal dan mini soccer terbaik di Parepare dengan fasilitas lengkap.
    </p>

  </div>
</section>
{isSearchMode &&
  loaded &&
  filteredLapangan.length === 0 && (
    <div className="px-5 sm:px-10 lg:px-16 xl:px-24 py-20 text-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Tidak ada lapangan tersedia
        </h3>

        <p className="text-gray-500">
          Tidak ditemukan lapangan yang tersedia pada
          tanggal, jam, lokasi, dan jenis olahraga yang
          dipilih.
        </p>
      </div>
    </div>
)}

       {/* FUTSAL SECTION */}
{(!isSearchMode || futsalData.length > 0) && (
  <section className="px-5 sm:px-10 lg:px-16 xl:px-24 py-16" id="futsal">
    <SectionHeader title="LAPANGAN FUTSAL" count={futsalCount} />

    {!loaded ? (
      /* Skeleton */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {futsalVisible.map((f, i) => (
            <LapanganCard
              key={f.id}
              field={f}
              delay={i * 80}
              onBook={handleBook}
            />
          ))}
        </div>

        {/* Lihat Semua Button */}
        {!isSearchMode && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setFutsalShowAll((v) => !v)}
              className="inline-flex items-center gap-3 border-2 border-gray-200 rounded-3xl px-8 py-3.5 font-bold text-gray-700 bg-white transition-all duration-200 hover:border-green-400 hover:text-green-700 hover:bg-green-50 hover:-translate-y-0.5"
            >
              {futsalShowAll ? "Tutup" : "Lihat Semua"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transition: "transform .3s",
                  transform: futsalShowAll ? "rotate(180deg)" : "rotate(0)",
                }}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </>
    )}
  </section>
)}

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-5 sm:mx-10 lg:mx-16 xl:mx-24" />

       {/* MINI SOCCER SECTION */}
{(!isSearchMode || miniData.length > 0) && (
  <section className="px-5 sm:px-10 lg:px-16 xl:px-24 py-16" id="minisoccer">
    <SectionHeader title="LAPANGAN MINISOCCER" count={miniData.length} />

    {!loaded ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {miniData.map((f, i) => (
          <LapanganCard
            key={f.id}
            field={f}
            delay={i * 80}
            onBook={handleBook}
          />
        ))}
      </div>
    )}
  </section>
)}

        <Footer />
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {authPopup && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
    onClick={() => setAuthPopup(false)}
  >
    <div
      className="bg-white rounded-2xl p-6 w-[320px] text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Anda harus melakukan register/login dulu
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Silakan login terlebih dahulu untuk melihat detail lapangan.
      </p>

      <button
        onClick={() => {
          setAuthPopup(false);
          navigate(`/login?next=${encodeURIComponent(targetAfterAuth)}`);
        }}
        className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
      >
        OK
      </button>
    </div>
  </div>
)}
    </>
  );
}
