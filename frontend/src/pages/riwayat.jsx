import { useEffect, useState } from "react";
import { getRiwayatByUser } from "../services/api";
import { createReview, } from "../services/api";

/* ─── CONFIG ─────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  Selesai: {
    bg: "rgba(20,150,80,0.10)",
    color: "#14a852",
    border: "rgba(20,150,80,0.25)",
    dot: "#14a852",
    label: "Selesai",
    glyph: "✓",
  },
  Dibatalkan: {
    bg: "rgba(220,38,38,0.09)",
    color: "#dc2626",
    border: "rgba(220,38,38,0.22)",
    dot: "#dc2626",
    label: "Dibatalkan",
    glyph: "✕",
  },
  Expired: {
    bg: "rgba(234,88,12,0.09)",
    color: "#ea580c",
    border: "rgba(234,88,12,0.22)",
    dot: "#ea580c",
    label: "Expired",
    glyph: "⊘",
  },
};

const FILTERS = ["Semua", "Selesai", "Dibatalkan", "Expired"];

const getStatusLabel = (s) => {
  if (s === "selesai") return "Selesai";
  if (s === "dibatalkan") return "Dibatalkan";
  return "Expired";
};

const rupiah = (v) =>
  `Rp ${Number(v || 0).toLocaleString("id-ID")}`;

const formatDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
};

/* ─── DETAIL MODAL ────────────────────────────────────────────────────── */
function DetailPanel({
  item,
  onClose,

  rating,
  setRating,

  komentar,
  setKomentar,

  sendingReview,
  setSendingReview,
}) {
  if (!item) return null;



  const status = getStatusLabel(item.status_pemesanan);
  const st = STATUS_CFG[status];
  const detailList = item.detail_pemesanan || [];
  const layananList = item.detail_layanan || [];

  const getBankName = () => {
    const va = item.va_number || "";
    if (va.startsWith("009")) return "BNI";
    if (va.startsWith("002")) return "BRI";
    if (va.startsWith("008")) return "Mandiri";
    if (va.startsWith("451")) return "BSI";
    return "-";
  };



  return (
      <div
        style={{
          position: "sticky",
          top: "90px",
          background: "#fff",
          borderRadius: "24px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
      <div style={{
        width: "100%", maxHeight: "92vh",
        background: "#fff", borderRadius: "28px 28px 0 0",
        overflowY: "auto",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
      }}>
        {/* Hero */}
        <div style={{ position: "relative", height: "200px", borderRadius: "28px 28px 0 0", overflow: "hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80"
            alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)",
          }} />
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✕
            </button>

          {/* Drag handle */}
          <div style={{
            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
            width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.4)",
          }} />
          <div style={{ position: "absolute", bottom: 20, left: 24 }}>
            <h2 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: 800, fontFamily: "'Instrument Serif', serif" }}>
              {item.lapangan?.nama}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: "12px", display: "flex", gap: 4, alignItems: "center" }}>
              <span>📍</span>{item.lapangan?.alamat}
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 24px 40px" }}>
          {/* Status pill */}
          <div style={{ marginBottom: 24 }}>
            <span style={{
              background: st.bg, color: st.color,
              border: `1.5px solid ${st.border}`,
              padding: "6px 16px", borderRadius: "99px",
              fontWeight: 700, fontSize: "13px",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
              {st.label}
            </span>
          </div>

          {/* Info sections */}
          {[
            {
              title: "Informasi Pemesan",
              rows: [
                { label: "Nama", value: item.nama_pemesan },
                { label: "Email", value: item.email },
                { label: "WhatsApp", value: item.no_whatsapp },
              ],
            },
          ].map((section) => (
            <InfoSection key={section.title} title={section.title} rows={section.rows} />
          ))}

          <InfoSection title="Informasi Pembayaran" rows={
            item.payment_channel === "cash"
              ? [{ label: "Kode Pemesanan", value: item.kode_pemesanan }]
              : [
                  { label: "Bank", value: getBankName() },
                  { label: "Virtual Account", value: item.va_number },
                ]
          } />

          <InfoSection title="Informasi Booking" rows={[
            { label: "Lapangan", value: item.lapangan?.nama },
            { label: "Durasi", value: `${Math.floor(Number(item.total_durasi_menit) / 60)} Jam` },
          ]} />

          {/* Slot detail */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Detail Pemesanan</SectionLabel>
            {detailList.map((slot, i) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: "14px",
                background: "#f8faf8", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "1px solid #e8eee9",
              }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: "#111", marginBottom: 2 }}>{formatDate(slot.tanggal)}</p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>{slot.jam_mulai} – {slot.jam_selesai}</p>
                </div>
                <span style={{
                  background: "#0d3d1f", color: "#fff",
                  borderRadius: "10px", padding: "4px 12px", fontSize: "12px", fontWeight: 700,
                }}>Court {slot.nomor_lapangan}</span>
              </div>
            ))}
          </div>

          {/* Layanan tambahan */}
          {layananList.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Layanan Tambahan</SectionLabel>
              {layananList.map((lay, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px dashed #e5e7eb",
                }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {lay.layanan?.nama_layanan} <span style={{ color: "#9ca3af" }}>×{lay.qty}</span>
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>{rupiah(lay.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rincian pembayaran */}
          <div style={{
            background: "#f8faf8", borderRadius: "18px", padding: "18px 20px",
            border: "1px solid #e8eee9",
          }}>
            <SectionLabel style={{ marginBottom: 14 }}>Rincian Pembayaran</SectionLabel>
            {[
              { label: "Subtotal Sewa", value: item.subtotal_sewa },
              { label: "Subtotal Layanan", value: item.subtotal_layanan },
              { label: "Biaya Admin", value: item.biaya_admin },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "6px 0", fontSize: "13px", color: "#6b7280",
              }}>
                <span>{label}</span>
                <span style={{ color: "#374151", fontWeight: 600 }}>{rupiah(value)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "#e5e7eb", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: "15px", color: "#111" }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "20px", color: "#0d3d1f" }}>{rupiah(item.total_bayar)}</span>
            </div>
          </div>

          {item.review && (
            <div
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 16,
                background: "#f8faf8",
                border:
                  "1px solid #e5e7eb",
              }}
            >
              <h3>
                Ulasan Anda
              </h3>

              <p
                style={{
                  marginTop: 10,
                }}
              >
                {"⭐".repeat(
                  item.review.rating
                )}
              </p>

              <p
                style={{
                  marginTop: 10,
                }}
              >
                {item.review.komentar}
              </p>
            </div>
          )}

          {item.status_pemesanan === "selesai" &&
          !item.review && (
            <div
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 16,
                border:
                  "1px solid #e5e7eb",
                background: "#f8faf8",
              }}
            >

              <h3
                style={{
                  marginBottom: 12,
                }}
              >
                Berikan Ulasan
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {[1,2,3,4,5].map(
                  (star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setRating(star)
                      }
                      style={{
                        fontSize: 24,
                        border: "none",
                        background:
                          "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {star <= rating
                        ? "⭐"
                        : "☆"}
                    </button>
                  )
                )}
              </div>

              <textarea
                value={komentar}
                onChange={(e)=>
                  setKomentar(
                    e.target.value
                  )
                }
                placeholder="Bagikan pengalaman bermain..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 12,
                  border:
                    "1px solid #d1d5db",
                }}
              />

              <button
                disabled={sendingReview}
                onClick={async () => {
                  try {

                    setSendingReview(true);

                    await createReview({
                      lapanganId:
                        item.lapangan.id,

                      pemesananId:
                        item.id,

                      rating,

                      komentar,
                    });

                    alert(
                      "Review berhasil dikirim"
                    );

                    window.location.reload();

                  } catch (err) {

                    alert(
                      err.response?.data?.msg ||
                      "Gagal mengirim review"
                    );

                  } finally {

                    setSendingReview(false);

                  }
                }}
                style={{
                  marginTop: 12,
                  background:
                    "#0d3d1f",
                  color: "#fff",
                  border: "none",
                  padding:
                    "10px 20px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Kirim Review
              </button>

            </div>
          )}

          {/* Alasan batal */}
          {item.alasan_batal && (
            <div style={{
              marginTop: 20, padding: "14px 16px",
              borderRadius: "14px", background: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.18)",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Alasan Pembatalan
              </p>
              <p style={{ fontSize: "13px", color: "#991b1b", lineHeight: 1.6 }}>{item.alasan_batal}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, rows }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>{title}</SectionLabel>
      <div style={{ background: "#f8faf8", borderRadius: "14px", border: "1px solid #e8eee9", overflow: "hidden" }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "11px 16px",
            borderBottom: i < rows.length - 1 ? "1px solid #eef0ee" : "none",
          }}>
            <span style={{ fontSize: "12.5px", color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#111", textAlign: "right", maxWidth: "55%" }}>{value || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <p style={{
      fontSize: "11px", fontWeight: 800, color: "#9ca3af",
      textTransform: "uppercase", letterSpacing: "0.09em",
      marginBottom: 10, ...style,
    }}>{children}</p>
  );
}

/* ─── BOOKING CARD ────────────────────────────────────────────────────── */
function BookingCard({ r, idx, onClick }) {
  const status = getStatusLabel(r.status_pemesanan);
  const st = STATUS_CFG[status];
  const slot = r.detail_pemesanan?.[0];

  return (
    <div
      onClick={() => onClick(r)}
      style={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #e8eee9",
        boxShadow: "0 2px 16px rgba(0,20,10,0.05)",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        animation: `fadeRow .4s ${idx * 0.07}s ease both`,
        transition: "transform .22s ease, box-shadow .22s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,40,20,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,20,10,0.05)";
      }}
    >
      {/* Status accent bar */}
      <div style={{ width: "4px", flexShrink: 0, background: st.dot }} />

      {/* Thumbnail */}
      <div style={{ width: "108px", flexShrink: 0, overflow: "hidden", position: "relative" }}>
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80"
          alt={r.lapangan?.nama}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.08))",
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: "14px", fontWeight: 800, color: "#0d1a10",
            margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontFamily: "'Instrument Serif', serif",
          }}>
            {r.lapangan?.nama || "-"}
          </h3>
          <p style={{
            fontSize: "11.5px", color: "#9ca3af", margin: "0 0 10px",
            display: "flex", alignItems: "center", gap: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            📍 {r.lapangan?.alamat || "-"}
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { icon: "📅", text: formatDate(slot?.tanggal) },
              {
                icon: "🕐",
                text: slot?.jam_mulai && slot?.jam_selesai
                  ? `${slot.jam_mulai} – ${slot.jam_selesai}`
                  : "-",
              },
            ].map(({ icon, text }) => (
              <span key={icon} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "#f3f7f4", border: "1px solid #e2ebe4",
                borderRadius: "8px", padding: "3px 8px",
                fontSize: "11px", color: "#374151", fontWeight: 500,
              }}>
                {icon} {text}
              </span>
            ))}
          </div>
        </div>

        {/* Right: price + status */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <p style={{ fontSize: "17px", fontWeight: 800, color: "#0d3d1f", marginBottom: 6, whiteSpace: "nowrap" }}>
            {rupiah(r.total_bayar)}
          </p>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#0d3d1f",
                  marginBottom: 6,
                  whiteSpace: "nowrap",
                }}
              >

              </p>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: st.bg,
                  color: st.color,
                  border: `1px solid ${st.border}`,
                  borderRadius: "99px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: st.dot,
                  }}
                />
                {st.label}
              </span>

              {r.status_pemesanan === "selesai" && (
                <p
                  style={{
                    marginTop: 6,
                    maxWidth: 170,
                    fontSize: "10px",
                    color: "#14a852",
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  ⭐ Klik untuk memberikan rating dan ulasan
                </p>
              )}

              <div style={{ marginTop: 10 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c5d2c8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}



/* ─── MAIN ────────────────────────────────────────────────────────────── */
export default function Riwayat() {
  const [filter, setFilter] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = await getRiwayatByUser(user.id);
        const history = (data || []).filter((item) =>
          ["selesai", "dibatalkan", "expired"].includes(item.status_pemesanan)
        );
        setRiwayat(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = riwayat.filter((r) => {
    const mf = filter === "Semua" || getStatusLabel(r.status_pemesanan) === filter;
    const ms = (r.lapangan?.nama || "").toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const totalSelesai = riwayat.filter((r) => r.status_pemesanan === "selesai").length;
  const totalSpend = riwayat
    .filter((r) => r.status_pemesanan === "selesai")
    .reduce((acc, r) => acc + Number(r.total_bayar || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #f4f6f3;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c8d5ca; border-radius: 99px; }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeRow { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .search-input:focus { outline: none; border-color: #0d3d1f !important; box-shadow: 0 0 0 3px rgba(13,61,31,0.1); }
        .filter-btn:focus-visible { outline: 2px solid #0d3d1f; outline-offset: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f2f5f2" }}>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section style={{ position: "relative", height: "52vh", minHeight: "280px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2400&q=100"
            alt="Lapangan"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          />
          {/* dark overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(5,20,10,0.88) 0%, rgba(5,20,10,0.55) 55%, rgba(5,20,10,0.25) 100%)",
          }} />
          {/* green tint bottom */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(13,61,31,0.6) 0%, transparent 50%)",
          }} />

          {/* HEADLINE */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 44,
            padding: "0 28px",
            animation: "slideUp .5s ease both",
          }}>
            <p style={{
              fontSize: "11px", fontWeight: 700, color: "#6ee78f",
              textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 10,
            }}>
              Akun Saya
            </p>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 6vw, 44px)",
              fontWeight: 400, fontStyle: "italic",
              color: "#fff", lineHeight: 1.15, marginBottom: 8,
            }}>
              Riwayat <span style={{ color: "#6ee78f" }}>Booking</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", maxWidth: "380px" }}>
              Semua catatan pemesanan lapangan Anda tersimpan di sini.
            </p>
          </div>
        </section>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px 20px 80px" }}>



          {/* FILTER + SEARCH */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap", gap: "10px",
            marginBottom: "18px",
            animation: "slideUp .45s .1s ease both",
          }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                const count = f !== "Semua"
                  ? riwayat.filter((r) => getStatusLabel(r.status_pemesanan) === f).length
                  : null;

                return (
                  <button
                    key={f}
                    className="filter-btn"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "7px 15px",
                      borderRadius: "99px",
                      border: active ? "1.5px solid #0d3d1f" : "1.5px solid #dde8de",
                      background: active ? "#0d3d1f" : "#fff",
                      color: active ? "#fff" : "#4b5563",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all .18s",
                    }}
                  >
                    {f}
                    {count !== null && (
                      <span style={{
                        marginLeft: 6,
                        background: active ? "rgba(255,255,255,0.2)" : "#f3f7f4",
                        color: active ? "#fff" : "#6b7280",
                        borderRadius: "99px", padding: "1px 7px",
                        fontSize: "10.5px", fontWeight: 700,
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Cari lapangan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: 34, paddingRight: 14, height: 36,
                  borderRadius: "99px", border: "1.5px solid #dde8de",
                  fontSize: "12px", color: "#374151", background: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  transition: "border .2s, box-shadow .2s", width: "190px",
                }}
              />
            </div>
          </div>
          {riwayat.some(
  (r) => r.status_pemesanan === "selesai"
) && (
  <div
    style={{
      marginBottom: 18,
      padding: "14px 18px",
      borderRadius: 14,
      background:
        "rgba(20,150,80,0.08)",
      border:
        "1px solid rgba(20,150,80,0.18)",
      color: "#0d3d1f",
      fontSize: "13px",
      fontWeight: 500,
    }}
  >
    ⭐ Anda memiliki pemesanan yang telah selesai.
    Klik kartu dengan status <b>Selesai</b> untuk
    memberikan rating dan ulasan terhadap lapangan.
  </div>
)}

          {/* DIVIDER label */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
              animation: "fadeIn .4s .15s ease both",
            }}>
              <div style={{ flex: 1, height: 1, background: "#dde8de" }} />
              <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" }}>
                {filtered.length} booking
              </span>
              <div style={{ flex: 1, height: 1, background: "#dde8de" }} />
            </div>
          )}

          {/* LIST */}
            <div
              style={{
                display: detail ? "grid" : "block",
                gridTemplateColumns: detail
                  ? "minmax(0,1fr) 500px"
                  : "1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              {/* KIRI */}
              <div>
                {loading ? (
                  <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {filtered.map((r, i) => (
                      <BookingCard
                        key={r.id}
                        r={r}
                        idx={i}
                        onClick={setDetail}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* KANAN */}
              {detail && (
                <div>
                  <DetailPanel
                    item={detail}
                    onClose={() => setDetail(null)}

                    rating={rating}
                    setRating={setRating}

                    komentar={komentar}
                    setKomentar={setKomentar}

                    sendingReview={sendingReview}
                    setSendingReview={setSendingReview}
                  />
                </div>
              )}
            </div>

          {/* FOOTER SUMMARY */}
          {filtered.length > 0 && !loading && (
            <div style={{
              marginTop: 20, padding: "12px 18px",
              background: "#fff", borderRadius: "14px",
              border: "1px solid #e8eee9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: "12.5px", color: "#9ca3af",
            }}>
              <span>
                Menampilkan <strong style={{ color: "#111" }}>{filtered.length}</strong> dari{" "}
                <strong style={{ color: "#111" }}>{riwayat.length}</strong> booking
              </span>
              <span style={{ color: "#0d3d1f", fontWeight: 700 }}>
                {filter !== "Semua" ? `Filter: ${filter}` : "Semua booking"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── SKELETON ────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  const shimmerStyle = {
    backgroundImage: "linear-gradient(90deg, #f0f4f1 25%, #e4ece5 50%, #f0f4f1 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: "10px",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 20, border: "1px solid #e8eee9",
          overflow: "hidden", display: "flex", height: 100,
        }}>
          <div style={{ width: 4, background: "#e5e7eb" }} />
          <div style={{ width: 108, height: "100%", ...shimmerStyle, borderRadius: 0 }} />
          <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ height: 14, width: "45%", ...shimmerStyle }} />
            <div style={{ height: 10, width: "65%", ...shimmerStyle }} />
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ height: 24, width: 110, ...shimmerStyle }} />
              <div style={{ height: 24, width: 90, ...shimmerStyle }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── EMPTY STATE ─────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "60px 24px",
      textAlign: "center", border: "1px solid #e8eee9",
      animation: "fadeIn .35s ease",
    }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🏟️</div>
      <p style={{ fontSize: "15px", fontWeight: 800, color: "#1a2e1d", marginBottom: 6, fontFamily: "'Instrument Serif', serif" }}>
        Tidak ada riwayat ditemukan
      </p>
      <p style={{ fontSize: "13px", color: "#9ca3af" }}>
        Coba ubah filter atau kata kunci pencarian
      </p>
    </div>
  );
}
