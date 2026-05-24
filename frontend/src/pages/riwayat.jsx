import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── DUMMY DATA ────────────────────────────────────────────────────────────────
const RIWAYAT = [
  {
    id: "BL-250520-001",
    lapangan: "Galaxy Futsal Centre",
    alamat: "Jl. Pelita No. Utara, Lakessi, Parepare",
    tipe: "Futsal",
    court: "Lapangan 1",
    tanggal: "2026-05-20",
    jam: "19:00 – 20:30",
    durasi: "1.5 Jam",
    harga: 120000,
    status: "Selesai",
    foto: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
  },
  {
    id: "BL-250518-002",
    lapangan: "Titik Kumpul Minisoccer",
    alamat: "Watang Soreang, Parepare",
    tipe: "Mini Soccer",
    court: "Lapangan 2",
    tanggal: "2026-05-18",
    jam: "08:00 – 10:00",
    durasi: "2 Jam",
    harga: 200000,
    status: "Selesai",
    foto: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80",
  },
  {
    id: "BL-250525-003",
    lapangan: "Sansiro Futsal",
    alamat: "Tiro Sompe, Bacukiki Barat, Parepare",
    tipe: "Futsal",
    court: "Lapangan 1",
    tanggal: "2026-05-25",
    jam: "15:00 – 16:30",
    durasi: "1.5 Jam",
    harga: 90000,
    status: "Mendatang",
    foto: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=400&q=80",
  },
  {
    id: "BL-250510-004",
    lapangan: "R57 Mini Soccer",
    alamat: "Jl. Petta Unga, Watang Soreang, Parepare",
    tipe: "Mini Soccer",
    court: "Lapangan 1",
    tanggal: "2026-05-10",
    jam: "20:00 – 21:30",
    durasi: "1.5 Jam",
    harga: 150000,
    status: "Dibatalkan",
    foto: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=400&q=80",
  },
  {
    id: "BL-250505-005",
    lapangan: "Grand Sulawesi Futsal",
    alamat: "Jl. Moh. Yusuf, Bacukiki, Parepare",
    tipe: "Futsal",
    court: "Lapangan 3",
    tanggal: "2026-05-05",
    jam: "10:00 – 12:00",
    durasi: "2 Jam",
    harga: 160000,
    status: "Selesai",
    foto: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80",
  },
  {
    id: "BL-250430-006",
    lapangan: "Galaxy Futsal Centre",
    alamat: "Jl. Pelita No. Utara, Lakessi, Parepare",
    tipe: "Futsal",
    court: "Lapangan 2",
    tanggal: "2026-04-30",
    jam: "18:00 – 19:30",
    durasi: "1.5 Jam",
    harga: 120000,
    status: "Selesai",
    foto: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
  },
];

const STATUS_CFG = {
  Selesai:    { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", dot: "#22c55e",  label: "Selesai"    },
  Mendatang:  { bg: "#eff6ff", color: "#2563eb", border: "#93c5fd", dot: "#3b82f6",  label: "Mendatang"  },
  Dibatalkan: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444",  label: "Dibatalkan" },
};

const FILTERS = ["Semua", "Mendatang", "Selesai", "Dibatalkan"];

const rupiah = (v) => `Rp ${Number(v).toLocaleString("id-ID")}`;

const formatDate = (s) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${s}T00:00:00`));

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  if (!item) return null;
  const st = STATUS_CFG[item.status];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "480px",
          background: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          animation: "slideUp .3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Foto */}
        <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
          <img
            src={item.foto}
            alt={item.lapangan}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(0,0,0,0.45)", border: "none",
              color: "#fff", fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >×</button>
          <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
            <h3 style={{ color: "#fff", fontSize: "17px", fontWeight: 800, margin: 0, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              {item.lapangan}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", margin: "3px 0 0" }}>{item.alamat}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px 24px" }}>
          {/* Status + ID */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: st.bg, color: st.color,
              border: `1px solid ${st.border}`,
              borderRadius: "99px", padding: "4px 12px",
              fontSize: "12px", fontWeight: 700,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.dot }} />
              {st.label}
            </span>
            <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>
              #{item.id}
            </span>
          </div>

          {/* Detail rows */}
          {[
            { label: "Tipe Lapangan", value: item.tipe },
            { label: "Court",         value: item.court },
            { label: "Tanggal",       value: formatDate(item.tanggal) },
            { label: "Jam",           value: item.jam },
            { label: "Durasi",        value: item.durasi },
            { label: "Total Bayar",   value: rupiah(item.harga), highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0",
              borderBottom: "1px solid #f3f4f6",
            }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
              <span style={{
                fontSize: "13px",
                fontWeight: highlight ? 800 : 600,
                color: highlight ? "#16a34a" : "#111827",
              }}>{value}</span>
            </div>
          ))}

          {/* Aksi */}
          <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
            {item.status === "Mendatang" && (
              <button style={{
                flex: 1, padding: "11px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                color: "#dc2626", fontWeight: 700, fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Batalkan
              </button>
            )}
            <button style={{
              flex: 1, padding: "11px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              border: "none",
              color: "#fff", fontWeight: 700, fontSize: "13px",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
            }}>
              {item.status === "Selesai" ? "Pesan Lagi" : "Lihat Detail"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Riwayat() {
  const navigate  = useNavigate();
  const [filter,  setFilter]  = useState("Semua");
  const [detail,  setDetail]  = useState(null);
  const [search,  setSearch]  = useState("");

  const filtered = RIWAYAT.filter((r) => {
    const matchFilter = filter === "Semua" || r.status === filter;
    const matchSearch = r.lapangan.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSelesai    = RIWAYAT.filter(r => r.status === "Selesai").length;
  const totalMendatang  = RIWAYAT.filter(r => r.status === "Mendatang").length;
  const totalSpend      = RIWAYAT.filter(r => r.status === "Selesai").reduce((a, r) => a + r.harga, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f6f3; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        @keyframes fadeIn  { from { opacity: 0; }                       to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeRow { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.11) !important; }
        .filter-btn { transition: all .18s; }
        .search-input:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f4f6f3" }}>

  {/* HERO FULL WIDTH */}
  <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center overflow-hidden rounded-b-[50px]">

    {/* Background */}
    <img
      src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2400&q=100"
      alt="Lapangan futsal"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    {/* Content */}
    <div className="relative z-10 px-6 sm:px-10 lg:px-16 text-white mt-10">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
        Pesanan <span className="text-green-400">Anda</span>
      </h1>

      <p className="mt-4 text-white/70 max-w-md">
        Kelola dan lihat riwayat pemesanan lapangan Anda dengan mudah dan cepat.
      </p>
    </div>
  </section>

  {/* CONTENT */}
  <div
    style={{
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "28px 24px 80px",
    }}
  >

    {/* STATS CARDS */}
    
          {/* ── STATS CARDS ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px",
            marginBottom: "28px",
            animation: "slideUp .4s .05s ease both",
          }}>
            {[
              { label: "Total Booking",    value: RIWAYAT.length,    icon: "🏟️", color: "#186d22", bg: "#f0fdf4" },
              { label: "Jadwal Mendatang", value: totalMendatang,    icon: "📅", color: "#2563eb", bg: "#eff6ff" },
              { label: "Total Pengeluaran",value: rupiah(totalSpend), icon: "💰", color: "#d97706", bg: "#fffbeb", wide: true },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "18px 20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "14px",
                  background: bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "3px" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: color, lineHeight: 1 }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTER + SEARCH ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px",
            marginBottom: "20px",
            animation: "slideUp .4s .1s ease both",
          }}>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    className="filter-btn"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "99px",
                      border: active ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                      background: active ? "#16a34a" : "#fff",
                      color: active ? "#fff" : "#374151",
                      fontSize: "12.5px", fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {f}
                    {f !== "Semua" && (
                      <span style={{
                        marginLeft: "6px",
                        background: active ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                        color: active ? "#fff" : "#6b7280",
                        borderRadius: "99px", padding: "1px 7px",
                        fontSize: "11px", fontWeight: 700,
                      }}>
                        {RIWAYAT.filter(r => r.status === f).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Cari lapangan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  paddingLeft: "34px", paddingRight: "14px",
                  height: "36px", borderRadius: "99px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "12.5px", color: "#374151",
                  background: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "border .2s, box-shadow .2s",
                  width: "200px",
                }}
              />
            </div>
          </div>

          {/* ── LIST ── */}
          {filtered.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: "20px",
              padding: "60px 24px", textAlign: "center",
              border: "1px solid #e5e7eb",
              animation: "fadeIn .3s ease",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏟️</div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                Tidak ada riwayat ditemukan
              </p>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((r, idx) => {
                const st = STATUS_CFG[r.status];
                return (
                  <div
                    key={r.id}
                    className="card-hover"
                    onClick={() => setDetail(r)}
                    style={{
                      background: "#fff",
                      borderRadius: "18px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      animation: `fadeRow .35s ${idx * 0.06}s ease both`,
                    }}
                  >
                    {/* Foto */}
                    <div style={{
                      width: "120px", flexShrink: 0,
                      position: "relative", overflow: "hidden",
                      background: "#f3f4f6",
                    }}>
                      <img
                        src={r.foto}
                        alt={r.lapangan}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {/* Tipe badge */}
                      <span style={{
                        position: "absolute", top: "8px", left: "8px",
                        background: r.tipe === "Futsal" ? "#16a34a" : "#2563eb",
                        color: "#fff", fontSize: "9px", fontWeight: 800,
                        padding: "3px 8px", borderRadius: "99px",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        {r.tipe}
                      </span>
                    </div>

                    {/* Konten */}
                    <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>

                      {/* Info utama */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.lapangan}
                          </h3>
                        </div>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {r.alamat}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {[
                            { icon: "📅", text: formatDate(r.tanggal) },
                            { icon: "🕐", text: r.jam },
                            { icon: "⏱️", text: r.durasi },
                            { icon: "🏟️", text: r.court },
                          ].map(({ icon, text }) => (
                            <span key={text} style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              background: "#f9fafb", border: "1px solid #f3f4f6",
                              borderRadius: "8px", padding: "3px 9px",
                              fontSize: "11.5px", color: "#4b5563", fontWeight: 500,
                            }}>
                              {icon} {text}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Kanan: harga + status */}
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#186d22", marginBottom: "6px", whiteSpace: "nowrap" }}>
                          {rupiah(r.harga)}
                        </p>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          background: st.bg, color: st.color,
                          border: `1px solid ${st.border}`,
                          borderRadius: "99px", padding: "4px 11px",
                          fontSize: "11.5px", fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: st.dot }} />
                          {st.label}
                        </span>

                        {/* Chevron */}
                        <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SUMMARY FOOTER ── */}
          {filtered.length > 0 && (
            <div style={{
              marginTop: "24px", padding: "14px 20px",
              background: "#fff", borderRadius: "14px",
              border: "1px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: "13px", color: "#6b7280",
            }}>
              <span>Menampilkan <strong style={{ color: "#111827" }}>{filtered.length}</strong> dari <strong style={{ color: "#111827" }}>{RIWAYAT.length}</strong> booking</span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>
                {filter !== "Semua" ? `Filter: ${filter}` : "Semua booking"}
              </span>
            </div>
          )}
        </div>
      </div>


      {/* ── DETAIL MODAL ── */}
      <DetailModal item={detail} onClose={() => setDetail(null)} />
    </>
  );
}
