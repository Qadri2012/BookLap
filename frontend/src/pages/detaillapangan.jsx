
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Footer from "../components/Footer";
import { api } from "../services/api";
import {
  FaCar,
  FaMotorcycle,
  FaToilet,
  FaLightbulb,
  FaCoffee,
  FaMosque,
  FaStore,
  FaChair,
  FaTshirt,
} from "react-icons/fa";

import { GiSoccerField } from "react-icons/gi";
const fasilitasIcons = {
  "Food Court": <FaStore size={26} color="#000" />,
  "Cafe R57": <FaCoffee size={26} color="#000" />,
  "Coffee Area": <FaCoffee size={26} color="#000" />,
  "Mushollah": <FaMosque size={26} color="#000" />,
  "Ruang Ganti": <FaTshirt size={26} color="#000" />,
  "Kamar Mandi": <FaToilet size={26} color="#000" />,
  "Toilet": <FaToilet size={26} color="#000" />,
  "Parkiran Motor": <FaMotorcycle size={26} color="#000" />,
  "Parkiran Mobil": <FaCar size={26} color="#000" />,
  "Tribun": <FaChair size={26} color="#000" />,
  "Tribun Penonton": <FaChair size={26} color="#000" />,
  "Tribun Lapangan": <FaChair size={26} color="#000" />,
  "Lampu LED": <FaLightbulb size={26} color="#000" />,
};

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
// ── HELPERS ──────────────────────────────────────────────────────────────
function getWeekDays() {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    return {
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      day: dayNames[d.getDay()],
      dayName: dayNames[d.getDay()],
      iso: toISODate(d),
    };
  });
}

function generateSlots(open, close) {
  if (!open || !close) return [];
  const slots = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch]     = close.split(":").map(Number);
  let cur        = oh * 60 + om;
  const endFinal = ch === 24 ? 1440 : ch * 60;
  while (cur + 90 <= endFinal) {
    const sH = String(Math.floor(cur / 60)).padStart(2,"0");
    const sM = String(cur % 60).padStart(2,"0");
    const eH = String(Math.floor((cur+90)/60)).padStart(2,"0");
    const eM = String((cur+90)%60).padStart(2,"0");
    slots.push(`${sH}:${sM} - ${eH}:${eM}`);
    cur += 90;
  }
  return slots;
}

function Stars({ count, size = 14 }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function Breadcrumb({ fieldName, onBack }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 0", fontSize:13, color:"#6b7280", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <span onClick={onBack} style={{ cursor:"pointer", color:"#374151", fontWeight:500 }}>Lapangan</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      <span style={{ color:"#15803d", fontWeight:600 }}>{fieldName}</span>
    </div>
  );
}

function PhotoGallery({ photos, name }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, height:380, borderRadius:16, overflow:"hidden", width:"100%" }}>
        <div style={{ overflow:"hidden" }}>
          <img src={photos[0]} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, height:"100%" }}>
          {photos.slice(1,3).map((src,i) => (
            <div key={i} style={{ position:"relative", overflow:"hidden", flex:"1 1 0", minHeight:0 }}>
              <img src={src} alt={`${name} ${i+2}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              {i === 1 && (
                <button onClick={() => setShowAll(true)} style={{ position:"absolute", bottom:12, right:12, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)", color:"#fff", border:"none", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  lihat semua foto
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {showAll && (
        <div onClick={() => setShowAll(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, overflowY:"auto" }}>
          <button onClick={() => setShowAll(false)} style={{ position:"fixed", top:20, right:24, background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:10, padding:"6px 14px", fontSize:22, cursor:"pointer" }}>×</button>
          {photos.map((src,i) => (
            <img key={i} src={src} alt={`Foto ${i+1}`} onClick={e => e.stopPropagation()} style={{ maxWidth:"90vw", maxHeight:"70vh", borderRadius:12, objectFit:"contain" }} />
          ))}
        </div>
      )}
    </>
  );
}

// ── CEK JADWAL ────────────────────────────────────────────────────────────
function CekJadwal({ field, slotGridRef, initialSelectedSlots = [], initialOpenBookingBox = false }) {
  const weekDays = getWeekDays();
  const navigate = useNavigate();
  const courts =
  Array.isArray(field.courts) && field.courts.length > 0
    ? field.courts
    : ["Lapangan 1"];
  const hasMultipleCourts = courts.length > 1;

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState(
    hasMultipleCourts ? "Semua Lapangan" : courts[0] || "Lapangan 1"
  );
  const [courtDropOpen, setCourtDropOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(
    initialSelectedSlots.map(
      (slot) => `${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${slot.court_no}`
    )
  );
  const [showSelectedPanel, setShowSelectedPanel] = useState(initialOpenBookingBox);
  const [timeFilter, setTimeFilter] = useState("Hari Ini");
  const [jadwalData, setJadwalData] = useState([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  const selectedCourtNo =
    selectedCourt === "Semua Lapangan"
      ? null
      : Number(String(selectedCourt).match(/\d+/)?.[0] || 1);

  const selectedDate = weekDays[selectedDayIdx]?.iso;

  const activeHours =
    field.hari_operasional?.[weekDays[selectedDayIdx]?.dayName] || {
      open: field.jam_buka,
      close: field.jam_tutup,
    };

   useEffect(() => {
  const fetchJadwal = async () => {
    try {
      setLoadingJadwal(true);

      const params = new URLSearchParams();
      params.append("lapangan_id", field.id);
      params.append("tanggal", selectedDate);

      if (selectedCourtNo) {
        params.append("court_no", selectedCourtNo);
      }

      const res = await api.get(`/jadwal?${params.toString()}`);
      const data = res.data;

      setJadwalData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil jadwal:", error);
      setJadwalData([]);
    } finally {
      setLoadingJadwal(false);
    }
  };

  if (field?.id && selectedDate) {
    fetchJadwal();
  }
}, [field?.id, selectedCourtNo, selectedDate]);

  function handleDayChange(idx) {
    setSelectedDayIdx(idx);
    setSelectedSlots([]);
  }

  function toggleSlot(slot) {
    if (slot.status !== "tersedia") return;

    const key = `${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${slot.court_no}`;
    setSelectedSlots((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  const selectedSlotData = jadwalData.filter((slot) => {
  const key = `${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${slot.court_no}`;
    return selectedSlots.includes(key);
  });

  useEffect(() => {
  if (initialOpenBookingBox && initialSelectedSlots.length > 0 && jadwalData.length > 0) {
    setShowSelectedPanel(true);
  }
}, [initialOpenBookingBox, initialSelectedSlots, jadwalData]);

  const totalSelectedPrice = selectedSlotData.reduce((sum, slot) => {
    return sum + Number(slot.harga || 0);
  }, 0);

  // const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  const isSelectedPanelOpen = selectedSlots.length > 0 && showSelectedPanel;
  useEffect(() => {
    if (selectedSlots.length === 0) {
      setShowSelectedPanel(false);
    }
  }, [selectedSlots.length]);

  function removeSelectedSlot(slot) {
    const key = `${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${slot.court_no}`;
    setSelectedSlots((prev) => prev.filter((k) => k !== key));
  }

  function formatTanggal(isoDate) {
    const d = new Date(`${isoDate}T00:00:00`);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDurasiMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h} Jam`;
    if (h === 0) return `${m} Menit`;
    return `${h} Jam ${m} Menit`;
  }

  const totalDurationMinutes = selectedSlotData.reduce((sum, slot) => {
    const [sh, sm] = slot.jam_mulai.slice(0, 5).split(":").map(Number);
    const [eh, em] = slot.jam_selesai.slice(0, 5).split(":").map(Number);

    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;

    return sum + diff;
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* BOX TANGGAL */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 13,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Tanggal Kalender
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            padding: 16,
          }}
        >
          {weekDays.map((d, i) => {
            const isActive = selectedDayIdx === i;

            return (
              <button
                key={i}
                onClick={() => handleDayChange(i)}
                style={{
                  padding: "10px 6px",
                  border: isActive ? "1.5px solid #186d22" : "1.5px solid #e5e7eb",
                  borderRadius: 12,
                  background: isActive ? "#186d22" : "#fff",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .18s",
                  boxShadow: isActive ? "0 2px 8px rgba(22,163,74,.25)" : "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? "#fff" : "#374151",
                  }}
                >
                  {d.date} {d.month}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: isActive ? "rgba(255,255,255,.85)" : "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  {d.day}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOX PILIH LAPANGAN */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "#fff",
          overflow: "visible",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 13,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Pilih Lapangan
        </div>

        <div
          style={{
            padding: 16,
            position: "relative",
            display: "flex",
            justifyContent: "flex-start",
            overflow: "visible",
            zIndex: 20,
          }}
        >
          {hasMultipleCourts ? (
            <div style={{ position: "relative", width: "100%", maxWidth: 240 }}>
              <button
                onClick={() => setCourtDropOpen((p) => !p)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "10px 14px",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>{selectedCourt}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{
                    transform: courtDropOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform .2s",
                    flexShrink: 0,
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {courtDropOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    zIndex: 9999,
                    overflow: "hidden",
                  }}
                >
                  <button
  onClick={() => {
    setSelectedCourt("Semua Lapangan");
    setCourtDropOpen(false);
    setSelectedSlots([]);
  }}
  style={{
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: selectedCourt === "Semua Lapangan" ? 700 : 500,
    background: selectedCourt === "Semua Lapangan" ? "#f0fdf4" : "#fff",
    color: selectedCourt === "Semua Lapangan" ? "#15803d" : "#374151",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }}
>
  {selectedCourt === "Semua Lapangan" && <span style={{ marginRight: 6 }}>✓</span>}
  Semua Lapangan
</button>

                  {courts.map((c, idx) => {
  const courtLabel =
    typeof c === "object"
      ? c.nama || c.label || `Lapangan ${c.court_no || idx + 1}`
      : c;

  const isActive = courtLabel === selectedCourt;

  return (
    <button
      key={courtLabel}
      onClick={() => {
        setSelectedCourt(courtLabel);
        setCourtDropOpen(false);
        setSelectedSlots([]);
      }}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "12px 16px",
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        background: isActive ? "#f0fdf4" : "#fff",
        color: isActive ? "#15803d" : "#374151",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {isActive && <span style={{ marginRight: 6 }}>✓</span>}
      {courtLabel}
    </button>
  );
})}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                padding: "10px 14px",
                background: "#fff",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                minWidth: 240,
              }}
            >
              {courts[0] || "Lapangan 1"}
            </div>
          )}
        </div>
      </div>

      {/* BOX JADWAL */}
<div
  style={{
    border: "1px solid rgba(255,255,255,0.45)",
    borderRadius: 20,
    overflow: "hidden",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
    position: "relative",
  }}
>
  <div style={{ display: "flex", alignItems: "flex-start" }}>
    {/* Sidebar filter waktu */}
    <div style={{ width: 120, borderRight: "1px solid #f3f4f6", flexShrink: 0 }}>
      <div
        style={{
          padding: "11px 14px",
          fontSize: 12,
          fontWeight: 700,
          color: "#374151",
          borderBottom: "1px solid #f3f4f6",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.4,
        }}
      >
        Pilih Waktu Tersedia
      </div>

      {["Hari Ini", "Besok", "Minggu Depan"].map((f) => (
        <button
          key={f}
          onClick={() => setTimeFilter(f)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "11px 14px",
            border: "none",
            background: timeFilter === f ? "#186d22" : "#fff",
            color: timeFilter === f ? "#fff" : "#374151",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderBottom: "1px solid #f3f4f6",
            transition: "all .15s",
          }}
        >
          {f}
        </button>
      ))}
    </div>


 {/* Grid slot */}
      <div
        ref={slotGridRef}
        style={{
          flex: 1,
          padding: 14,
          alignSelf: "flex-start",
          pointerEvents: isSelectedPanelOpen ? "none" : "auto",
          userSelect: isSelectedPanelOpen ? "none" : "auto",
        }}
      >
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "#374151",
            background: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {loadingJadwal
            ? "Memuat..."
            : `${jadwalData.filter((s) => s.status === "tersedia").length} Jadwal Tersedia`}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {loadingJadwal ? (
        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Memuat jadwal...
        </p>
      ) : jadwalData.length === 0 ? (
        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Tidak ada slot tersedia.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            maxHeight: 480,
            overflowY: "auto",
            paddingRight: 4,
            paddingTop: 0,
            alignContent: "start",
          }}
        >
          {jadwalData.map((slot, i) => {
            const isAvailable = slot.status === "tersedia";
            const isPending = slot.status === "pending";
            const isBooking = slot.status === "booking";
            const key = `${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${slot.court_no}`;
            const isSelected = selectedSlots.includes(key);

            const start = slot.jam_mulai ? slot.jam_mulai.slice(0, 5) : "--:--";
            const end = slot.jam_selesai ? slot.jam_selesai.slice(0, 5) : "--:--";

            const startParts = start.split(":").map(Number);
            const endParts = end.split(":").map(Number);

            let durationText = "1 Jam";
            if (startParts.length === 2 && endParts.length === 2) {
              let diffMinutes = endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
              if (diffMinutes < 0) diffMinutes += 24 * 60;

              if (diffMinutes >= 60) {
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                durationText = minutes === 0 ? `${hours} Jam` : `${hours} Jam ${minutes} Menit`;
              } else {
                durationText = `${diffMinutes} Menit`;
              }
            }

            const price = slot.harga
              ? `Rp. ${Number(slot.harga).toLocaleString("id-ID")}`
              : "Rp. 0";

            return (
              <button
                key={i}
                onClick={() => toggleSlot(slot)}
                disabled={!isAvailable}
                style={{
                  position: "relative",
                  border: isSelected ? "2px solid #186d22" : "1px solid rgba(148,163,184,0.28)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: isAvailable
                    ? isSelected
                      ? "#f0fdf4"
                      : "rgba(255,255,255,0.92)"
                    : isPending
                    ? "#fef3c7"
                    : isBooking
                    ? "#fee2e2"
                    : "#e5e7eb",
                  boxShadow: isSelected
                    ? "0 12px 28px rgba(22,163,74,0.18)"
                    : "0 10px 24px rgba(15,23,42,0.06)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  transition: "all .18s ease",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textAlign: "left",
                  minHeight: 104,
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>
                  {durationText}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6, lineHeight: 1.3 }}>
                  <span>🕒</span>
                  <span>{start}–{end}</span>
                </div>

                <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>
                  {price}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: isAvailable
                      ? "#186d22"
                      : isPending
                      ? "#d97706"
                      : isBooking
                      ? "#dc2626"
                      : "#374151",
                  }}
                >
                  {slot.status.toUpperCase()}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: isSelected ? "2px solid #186d22" : "2px solid #9ca3af",
                    background: isSelected ? "#186d22" : "#fff",
                  }}
                />

                {!isAvailable && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background: "rgba(255,255,255,.55)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
</div>



{/* KOTAK BESAR / EXPANDED */}
{selectedSlots.length > 0 && !showSelectedPanel && (
  <button
    onClick={() => setShowSelectedPanel(true)}
    style={{
      position: "fixed",
      left: "50%",
      bottom: 18,
      transform: "translateX(-50%)",
      zIndex: 9998,
      width: "min(420px, calc(100vw - 16px))",
      background: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: 16,
      boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
      padding: "10px 16px 12px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      cursor: "pointer",
    }}
  >
    <div
      style={{
        textAlign: "center",
        color: "#186d22",
        fontSize: 16,
        fontWeight: 800,
        marginBottom: 6,
      }}
    >
      Click Here
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", textAlign: "left" }}>
        {selectedSlots.length} Slot dipilih
      </div>

      <div
        style={{
          color: "#186d22",
          fontSize: 22,
          fontWeight: 700,
          transform: "translateY(-2px)",
        }}
      >
        ^
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", textAlign: "right" }}>
        Rp {totalSelectedPrice.toLocaleString("id-ID")}
      </div>
    </div>
  </button>
)}

{selectedSlots.length > 0 && showSelectedPanel && (
  <div
    style={{
      position: "fixed",
      left: "50%",
      bottom: 18,
      transform: "translateX(-50%)",
      zIndex: 9998,
      width: "min(620px, calc(100vw - 16px))",
      height: "min(80vh, 720px)",
      background: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: 18,
      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}
  >
    <button
      onClick={() => setShowSelectedPanel(false)}
      style={{
        width: "100%",
        background: "#fff",
        border: "none",
        borderBottom: "1px solid #e5e7eb",
        padding: "8px 16px 10px",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#186d22",
          fontSize: 18,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        Tambah Jadwal
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", textAlign: "left" }}>
          {selectedSlots.length} Slot dipilih
        </div>

        <div
          style={{
            color: "#186d22",
            fontSize: 22,
            fontWeight: 700,
            transform: "translateY(-2px)",
          }}
        >
          ˅
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", textAlign: "right" }}>
          Rp {totalSelectedPrice.toLocaleString("id-ID")}
        </div>
      </div>
    </button>

    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 18px 0", flexShrink: 0 }}>
        <h3
          style={{
            textAlign: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Lapangan yang Dipilih
        </h3>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 18px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {selectedSlotData.map((slot, idx) => {
            const start = slot.jam_mulai.slice(0, 5);
            const end = slot.jam_selesai.slice(0, 5);
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);
            let diff = eh * 60 + em - (sh * 60 + sm);
            if (diff < 0) diff += 24 * 60;

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  padding: "10px 12px",
                  background: "#fff",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>
                    {formatTanggal(slot.tanggal)}
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
                    {formatDurasiMinutes(diff)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {start} - {end}
                  </div>
                  <div style={{ fontSize: 12, color: "#186d22", fontWeight: 700, marginTop: 4 }}>
                    Rp {Number(slot.harga || 0).toLocaleString("id-ID")}
                  </div>
                </div>

                <button
                  onClick={() => removeSelectedSlot(slot)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 4,
                    color: "#111827",
                  }}
                  aria-label="hapus slot"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid #e5e7eb",
          padding: "14px 18px 16px",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>Total Durasi:</span>
          <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 700 }}>
            {formatDurasiMinutes(totalDurationMinutes)}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ color: "#111827", fontSize: 14, fontWeight: 800 }}>Total Harga:</span>
          <span style={{ color: "#111827", fontSize: 18, fontWeight: 900 }}>
            Rp. {totalSelectedPrice.toLocaleString("id-ID")}
          </span>
        </div>

        <button
        onClick={() =>
          navigate("/pemesanan", {
            state: {
              field,
              selectedSlots: selectedSlotData,
              totalPrice: totalSelectedPrice,
              totalDurationMinutes,
            },
          })
        }
        style={{
          width: "100%",
          background: "#186d22",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "14px 18px",
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Lanjutkan Pemesanan
      </button>
      </div>
    </div>
  </div>
)}
</div>
        
      
  
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function DetailLapangan() {
const { id } = useParams();
const navigate = useNavigate();
const routerLocation = useLocation();
const location = window.location;

const [field, setField] = useState(null);
const [reviews, setReviews] = useState([]);

const slotGridRef = useRef(null);
const [selectedDayName, setSelectedDayName] = useState("Senin");
const [descExpanded, setDescExpanded] = useState(false);
const jadwalSectionRef = useRef(null);

useEffect(() => {
  if (routerLocation.state?.scrollToSlotGrid) {
    setTimeout(() => {
      slotGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }
}, [routerLocation.state]);

const handleScrollToJadwal = () => {
  jadwalSectionRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
  }
}, []);
useEffect(() => {
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/lapangan/${id}`);
      const data = res.data;

const jumlahLapangan = Number(
  data.jumlah_lapangan ||
    data.total_lapangan ||
    data.court_count ||
    0
);

let courts = [];

// kalau API memang sudah mengirim daftar lapangan
if (Array.isArray(data.courts) && data.courts.length > 0) {
  courts = data.courts.map((c, index) =>
    typeof c === "string"
      ? c
      : c?.nama || c?.label || c?.name || `Lapangan ${c?.court_no || index + 1}`
  );
} else if (Array.isArray(data.lapangan) && data.lapangan.length > 0) {
  courts = data.lapangan.map((c, index) =>
    typeof c === "string"
      ? c
      : c?.nama || c?.label || c?.name || `Lapangan ${c?.court_no || index + 1}`
  );
} else if (jumlahLapangan > 0) {
  // fallback kalau hanya ada angka jumlah lapangan
  courts = Array.from({ length: jumlahLapangan }, (_, i) => `Lapangan ${i + 1}`);
} else {
  courts = ["Lapangan 1"];
}

const parsed = {
  ...data,
  foto: data.foto || [],
  fasilitas: data.fasilitas || [],
  hari_operasional: data.hari_operasional || null,
  courts,
};

      setField(parsed);
    } catch (error) {
      console.error("Gagal ambil detail lapangan:", error);
    }
  };

  const fetchReview = async () => {
    try {
      const res = await api.get(`/review/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Gagal ambil review:", error);
    }
  };

  fetchDetail();
  fetchReview();
}, [id]);

  if (!field) {
  return <p>Loading...</p>;
}
  

  const desc = field.deskripsi || "Tidak ada deskripsi";
  const shortDesc = desc.slice(0,160) + "...";
  const activeHours =
  field.hari_operasional?.[selectedDayName] || {
    open: field.jam_buka,
    close: field.jam_tutup,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f9fafb; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"'Plus Jakarta Sans',sans-serif", paddingTop:"80px" }}>

        {/* Breadcrumb */}
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px" }}>
          <Breadcrumb fieldName={field.nama} onBack={() => navigate(-1)} />
        </div>

        {/* Gallery full width */}
        <div style={{ width:"100%", padding:"0 24px" }}>
          <div style={{ maxWidth:1400, margin:"0 auto" }}>
            <PhotoGallery photos={field.foto || []} />
          </div>
        </div>

        {/* Konten utama */}
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 24px 80px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:32, alignItems:"start" }}>

            {/* ═══ KOLOM KIRI ═══ */}
            <div style={{ animation:"fadeUp .45s ease both" }}>

              {/* Nama + Alamat + Badge */}
              <div style={{ marginTop:20, marginBottom:20 }}>
                <h1 style={{ fontFamily:"'Poppins',sans-serif", fontSize:26, fontWeight:800, color:"#111827", lineHeight:1.2, marginBottom:8 }}>
                  {field.nama}
                </h1>
                <div style={{ display:"flex", alignItems:"flex-start", gap:6, color:"#6b7280", fontSize:13, marginBottom:12 }}>
                  <svg width="13" height="16" viewBox="0 0 12 16" fill="none" style={{ marginTop:1, flexShrink:0 }}>
                    <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#9ca3af"/>
                  </svg>
                  {field.alamat}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[
                    { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>, label:field.tipe },
                    { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>, label:field.permukaan },
                    { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="1"/></svg>, label:field.ukuran },
                    { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:`Kapasitas ${field.kapasitas}` },
                  ].map(({ icon, label }) => (
                    <span key={label} style={{ display:"flex", alignItems:"center", gap:5, border:"1px solid #e5e7eb", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:600, color:"#374151", background:"#fff" }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:10, fontFamily:"'Poppins',sans-serif" }}>Deskripsi</h2>
                <p style={{ fontSize:13.5, color:"#4b5563", lineHeight:1.75 }}>
                  {descExpanded ? field.deskripsi : shortDesc}
                </p>
                <button onClick={() => setDescExpanded(p => !p)} style={{ background:"none", border:"none", cursor:"pointer", color:"#186d22", fontWeight:700, fontSize:13, marginTop:6, display:"flex", alignItems:"center", gap:4, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:0 }}>
                  {descExpanded ? "Sembunyikan" : "Selengkapnya"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: descExpanded ? "rotate(180deg)" : "rotate(0)", transition:"transform .2s" }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </div>

              {/* MAP + LABEL */}
<div style={{ marginBottom:24 }}>
  <h2 style={{ 
  fontSize:16,
  fontWeight:800,
  marginBottom:12,
  color:"#111827",
  fontFamily:"'Poppins', sans-serif",
  letterSpacing:"0.2px"
}}>
  Lihat Lokasi
</h2>

  <div style={{ 
    position:"relative",
    borderRadius:14, 
    overflow:"hidden", 
    border:"1px solid #e5e7eb", 
    height:180 
  }}>

    {/* MAP */}
    <iframe
      src={`https://www.google.com/maps?q=${field.latitude},${field.longitude}&output=embed`}
      width="100%"
      height="180"
      style={{ border:"none" }}
      loading="lazy"
    />

    {/* 🔥 LABEL NAMA LAPANGAN */}
    <div style={{
      position:"absolute",
      top:10,
      left:10,
      background:"#ffffff",
      padding:"6px 12px",
      borderRadius:8,
      fontWeight:700,
      fontSize:12,
      color:"#111827",
      boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
      display:"flex",
      alignItems:"center",
      gap:6
    }}>
      📍 {field.nama}
    </div>

  </div>

  {/* 🔥 BUTTON GOOGLE MAPS */}
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${field.latitude},${field.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display:"inline-block",
      marginTop:10,
      background: "#186d22",
      color:"#fff",
      padding:"10px 16px",
      borderRadius:10,
      fontSize:13,
      fontWeight:700,
      textDecoration:"none"
    }}
  >
    Navigasi ke Lokasi
  </a>
</div>

              {/* Fasilitas */}
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#111827",
                    marginBottom: 14,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  Fasilitas
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {(field.fasilitas || []).map((f, i) => {
                    const label = typeof f === "string" ? f : f.label;

                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          padding: "16px 18px",
                          border: "1px solid rgba(145, 195, 145, 0.6)",
                          borderRadius: 14,
                          background: "rgba(145, 195, 145, 0.3)",
                          minWidth: 95,
                        }}
                      >
                        <span>
                          {fasilitasIcons[label]}
                        </span>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#111827",
                            textAlign: "center",
                            lineHeight: 1.4,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jam Operasional */}
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:14, fontFamily:"'Poppins',sans-serif" }}>Jam Operasional</h2>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                  {Object.keys(field.hari_operasional || {}).map((d) => (
                    <button key={d} onClick={() => setSelectedDayName(d)}
                      style={{ border: selectedDayName === d ? "1px solid #186d22" : "1px solid #186d22", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color: selectedDayName === d ? "#16a34a" : "#374151", background: selectedDayName === d ? "#f0fdf4" : "#fff", cursor:"pointer", transition:"all .2s" }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#186d22" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span style={{ fontSize:14, fontWeight:700, color:"#186d22" }}>{activeHours.open} - {activeHours.close}</span>
                </div>
              </div>
            </div>

            {/* ═══ KOLOM KANAN — Sticky Card ═══ */}
            <div style={{ position:"sticky", top:100, marginTop:20, animation:"fadeUp .45s .1s ease both" }}>
              <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
                <div style={{ padding:"18px 20px", borderBottom:"1px solid #f3f4f6" }}>
                  <p style={{ fontSize:12, color:"#6b7280", fontWeight:600, marginBottom:4 }}>Harga Mulai</p>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:24, fontWeight:800, color:"#dc2626", fontFamily:"'Poppins',sans-serif" }}>
                      Rp {field.harga.toLocaleString("id-ID")}
                    </span>
                    <span style={{ fontSize:13, color:"#9ca3af", fontWeight:500 }}>/sesi</span>
                  </div>
                </div>
                <div style={{ padding:"12px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:8 }}>
                  {field.reviews > 0 ? (
                    <>
                      <Stars count={Math.round(field.rating)} />
                      <span style={{ fontWeight:700, fontSize:13, color:"#374151" }}>{field.rating}</span>
                      <span style={{ color:"#9ca3af", fontSize:12 }}>· {field.reviews} ulasan</span>
                    </>
                  ) : (
                    <span style={{ fontSize:12, color:"#9ca3af" }}>Belum ada ulasan</span>
                  )}
                </div>
                <div style={{ padding:"16px 20px" }}>
                <button
                  onClick={handleScrollToJadwal}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#186d22",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    boxShadow: "0 4px 16px rgba(22,163,74,.3)",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,163,74,.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(22,163,74,.3)";
                  }}
                >
                  Cek Jadwal dan Pesan Sekarang!
                </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── CEK JADWAL FULL WIDTH ── */}
          <div ref={jadwalSectionRef} style={{ marginTop: 32, paddingBottom: 0, scrollMarginTop: "100px" }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:14, fontFamily:"'Poppins',sans-serif" }}>
              Cek Jadwal Lapangan
            </h2>
            <CekJadwal
              field={field}
              selectedDayName={selectedDayName}
              slotGridRef={slotGridRef}
              initialSelectedSlots={routerLocation.state?.selectedSlots || []}
              initialOpenBookingBox={routerLocation.state?.openBookingBox || false}
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
