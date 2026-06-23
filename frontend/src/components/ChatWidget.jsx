import axios from "axios";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  FaWhatsapp, FaTimes, FaInstagram,
  FaComments, FaHeadset, FaClipboardList, FaPlus,
  FaBullhorn, FaGift, FaBolt, FaCheckSquare,
  FaInfoCircle, FaClock, FaCalendarCheck,
  FaMoneyCheckAlt, FaBan, FaPhoneAlt, FaStar,
  FaExclamationTriangle, FaThumbsUp, FaHistory,
  FaFileAlt, FaChevronRight, FaPaperPlane,
  FaCheck,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const CONTACTS = [
  {
    id: 1,
    initials: "AD",
    name: "Admin Support",
    preview: "Layanan bantuan pelanggan",
    unread: 0,
    online: true,
    color: "#4a7c59",
  },
];

const THEMES = {
  dark: {
    bg: "#181c22",
    sidebar: "#1e2228",
    header: "#1e2228",
    input: "#252b34",
    text: "#f1f5f9",
    secondary: "#cbd5e1",
    border: "#2a2f38",
  },
  light: {
    bg: "#ffffff",
    sidebar: "#f8fafc",
    header: "#ffffff",
    input: "#f1f5f9",
    text: "#111827",
    secondary: "#374151",
    border: "#d1d5db",
  },
};

const LAPORAN_TABS = [
  {
    id: "masalah",
    label: "Laporan Masalah",
    icon: <FaExclamationTriangle />,
  },
  {
    id: "keluhan",
    label: "Keluhan & Pengaduan",
    icon: <FaThumbsUp />,
  },
  {
    id: "rating",
    label: "Rating & Ulasan",
    icon: <FaStar />,
  },
];


// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────
function Avatar({ initials, color, size = 40, online = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 0.5,
          userSelect: "none",
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid #1e2228",
          }}
        />
      )}
    </div>
  );
}

function AnnouncementCard({ icon, title, body, date, badge, bgColor, borderColor, iconColor, badgeColor }) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 24,
        padding: 24,
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,.08)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, color: iconColor, fontSize: 22, fontWeight: 800 }}>{title}</h3>
        <p style={{ marginTop: 10, color: "#374151", fontSize: 18, lineHeight: 1.7 }}>{body}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b" }}>{date}</div>
      </div>
      <span
        style={{
          background: badgeColor,
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        {badge}
      </span>
    </div>
  );
}

function HelpCard({ icon, title, body, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 20, padding: 24 }}>
      {icon}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

// ── Laporan Modal ──
function LaporanModal({ onClose, user }) {
  const [activeTab, setActiveTab] = useState("masalah");

  // Form states
  const [masalahForm, setMasalahForm] = useState({ judul: "", kategori: "", deskripsi: "" });
  const [keluhanForm, setKeluhanForm] = useState({
  nama: "",
  email: "",
  nohp: "",
  pesan: "",
  harapan: "",
});

  const [ratingForm, setRatingForm] = useState({ rating: 0, nama: "", ulasan: "" });

  const [submitted, setSubmitted] = useState(null); // which tab was submitted
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
  if (user?.id) {
    checkReviewStatus();
  }
}, [user]);

const handleSubmit = async (tab) => {
  try {
    setLoading(true);

    // ===================================
    // WEBSITE REVIEW
    // ===================================
    if (tab === "rating") {

      if (hasReviewed) {
        alert(
          "Anda sudah pernah memberikan ulasan untuk BookLap."
        );
        return;
      }

      await axios.post(
        "http://localhost:5000/api/v1/website-review",
        {
          user_id: user.id,
          nama:
            ratingForm.nama ||
            user?.nama ||
            "Pengguna BookLap",

          rating: ratingForm.rating,
          ulasan: ratingForm.ulasan,
        }
      );

      setHasReviewed(true);

      setSuccessMessage(
        "✅ Ulasan Anda berhasil dikirim. Terima kasih atas masukan Anda."
      );
    }

    setSubmitted(tab);

    setTimeout(() => {
      setSubmitted(null);
    }, 3000);

    // reset form
    if (tab === "rating") {
      setRatingForm({
        rating: 0,
        nama: "",
        ulasan: "",
      });
    }

  } catch (error) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Gagal mengirim ulasan"
    );
  } finally {
    setLoading(false);
  }
};

const checkReviewStatus = async () => {
  if (!user?.id) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/v1/website-review/check/${user.id}`
    );

    setHasReviewed(res.data.hasReview);
  } catch (error) {
    console.error(error);
  }
};

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    background: "#f8fafc", color: "#111827", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };

  const SuccessBanner = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <FaCheck color="#fff" size={16} />
      </div>
      <div>
        <div style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>Berhasil dikirim!</div>
        <div style={{ fontSize: 13, color: "#166534" }}>Kami akan segera merespons dalam 1×24 jam.</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {

      // ── Tab 1: Laporan Masalah ──
      case "masalah":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {submitted === "masalah" && <SuccessBanner />}
            <div>
              <label style={labelStyle}>Judul Masalah</label>
              <input style={inputStyle} placeholder="Contoh: Tombol pembayaran tidak muncul" value={masalahForm.judul} onChange={(e) => setMasalahForm({ ...masalahForm, judul: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={masalahForm.kategori} onChange={(e) => setMasalahForm({ ...masalahForm, kategori: e.target.value })}>
                <option value="">-- Pilih kategori --</option>
                <option>Bug / Error</option>
                <option>Performa Lambat</option>
                <option>Tampilan Rusak</option>
                <option>Fitur Tidak Berfungsi</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Deskripsi Masalah</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Jelaskan masalah yang kamu temukan secara detail..." value={masalahForm.deskripsi} onChange={(e) => setMasalahForm({ ...masalahForm, deskripsi: e.target.value })} />
            </div>
            <button onClick={() => handleSubmit("masalah")} disabled={loading || !masalahForm.judul || !masalahForm.deskripsi} style={submitBtn(loading || !masalahForm.judul || !masalahForm.deskripsi)}>
              {loading ? "Mengirim..." : <><FaPaperPlane /> Kirim Laporan</>}
            </button>
          </div>
        );

      // ── Tab 2: Keluhan ──
case "keluhan":
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {submitted === "keluhan" && <SuccessBanner />}

      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 13,
          color: "#92400e",
        }}
      >
        Gunakan form ini untuk menyampaikan keluhan layanan,
        kritik, saran, maupun pengaduan resmi kepada BookLap.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Nama Lengkap</label>
          <input
            style={inputStyle}
            placeholder="Nama lengkap"
            value={keluhanForm.nama}
            onChange={(e) =>
              setKeluhanForm({
                ...keluhanForm,
                nama: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="email@kamu.com"
            value={keluhanForm.email}
            onChange={(e) =>
              setKeluhanForm({
                ...keluhanForm,
                email: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Nomor HP</label>
        <input
          style={inputStyle}
          placeholder="08xx-xxxx-xxxx"
          value={keluhanForm.nohp}
          onChange={(e) =>
            setKeluhanForm({
              ...keluhanForm,
              nohp: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label style={labelStyle}>
          Keluhan / Pengaduan
        </label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: 140,
            resize: "vertical",
          }}
          placeholder="Jelaskan keluhan, kritik, saran, atau pengaduan secara detail..."
          value={keluhanForm.pesan}
          onChange={(e) =>
            setKeluhanForm({
              ...keluhanForm,
              pesan: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label style={labelStyle}>
          Harapan Penyelesaian (Opsional)
        </label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: 100,
            resize: "vertical",
          }}
          placeholder="Apa yang Anda harapkan dari BookLap?"
          value={keluhanForm.harapan}
          onChange={(e) =>
            setKeluhanForm({
              ...keluhanForm,
              harapan: e.target.value,
            })
          }
        />
      </div>

      <button
        onClick={() => handleSubmit("keluhan")}
        disabled={
          loading ||
          !keluhanForm.nama ||
          !keluhanForm.pesan
        }
        style={submitBtn(
          loading ||
          !keluhanForm.nama ||
          !keluhanForm.pesan
        )}
      >
        {loading ? (
          "Mengirim..."
        ) : (
          <>
            <FaPaperPlane />
            Kirim Keluhan & Pengaduan
          </>
        )}
      </button>
    </div>
  );



        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {submitted === "pengaduan" && <SuccessBanner />}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
              ⚠️ Form pengaduan resmi. Pengaduan palsu dapat dikenakan sanksi sesuai ketentuan BookLap.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <input style={inputStyle} placeholder="Nama lengkap sesuai KTP" value={pengaduanForm.nama} onChange={(e) => setPengaduanForm({ ...pengaduanForm, nama: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>No. HP</label>
                <input style={inputStyle} placeholder="08xx-xxxx-xxxx" value={pengaduanForm.nohp} onChange={(e) => setPengaduanForm({ ...pengaduanForm, nohp: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Kronologi Kejadian</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Jelaskan kronologi kejadian secara runtut dan detail..." value={pengaduanForm.kronologi} onChange={(e) => setPengaduanForm({ ...pengaduanForm, kronologi: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Harapan Penyelesaian</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Apa yang kamu harapkan dari pengaduan ini?" value={pengaduanForm.harapan} onChange={(e) => setPengaduanForm({ ...pengaduanForm, harapan: e.target.value })} />
            </div>
            <button onClick={() => handleSubmit("pengaduan")} disabled={loading || !pengaduanForm.nama || !pengaduanForm.kronologi} style={submitBtn(loading || !pengaduanForm.nama || !pengaduanForm.kronologi)}>
              {loading ? "Mengirim..." : <><FaPaperPlane /> Ajukan Pengaduan</>}
            </button>
          </div>
        );

      // ── Tab 5: Rating & Ulasan ──
      case "rating":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {successMessage && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #22c55e",
                  color: "#166534",
                  padding: "14px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                {successMessage}
              </div>
            )}

            {/* Rating input */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Bagaimana pengalaman kamu menggunakan BookLap?</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Penilaian ini untuk website BookLap, bukan lapangan.</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <StarRating value={ratingForm.rating} onChange={(v) => setRatingForm({ ...ratingForm, rating: v })} size={40} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: ["", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"][ratingForm.rating] || "#94a3b8" }}>
                {["Pilih bintang di atas", "Sangat Buruk", "Kurang Baik", "Cukup", "Baik", "Sangat Baik"][ratingForm.rating]}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nama (opsional)</label>
              <input style={inputStyle} placeholder="Nama kamu" value={ratingForm.nama} onChange={(e) => setRatingForm({ ...ratingForm, nama: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Ulasan</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Ceritakan pengalaman kamu menggunakan website BookLap — apa yang kamu suka atau ingin diperbaiki?" value={ratingForm.ulasan} onChange={(e) => setRatingForm({ ...ratingForm, ulasan: e.target.value })} />
            </div>
            {hasReviewed && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  color: "#92400e",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Anda sudah pernah memberikan ulasan untuk BookLap.
                Setiap akun hanya diperbolehkan memberikan 1 ulasan.
              </div>
            )}
            <button onClick={() => handleSubmit("rating")} disabled={
            loading ||
            hasReviewed ||
            !ratingForm.rating ||
            !ratingForm.ulasan
            }style={submitBtn(
            loading ||
            hasReviewed ||
            !ratingForm.rating ||
            !ratingForm.ulasan
            )}>
              {loading ? "Mengirim..." : <><FaStar /> Kirim Ulasan</>}
            </button>

            {/* Recent reviews */}

          </div>
        );

      default: return null;
    }
  };

  return (
    <>
      <div onClick={onClose} style={overlayStyle} />
      <div style={{ ...modalStyle, maxWidth: 1100, height: "85vh" }}>

        {/* Header */}
        <div style={{ padding: "24px 30px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaClipboardList size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Pusat Laporan & Ulasan</h2>
              <div style={{ fontSize: 14, opacity: 0.85 }}>Sampaikan masalah, keluhan, atau penilaian kamu</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTimes />
          </button>
        </div>

        {/* Body: sidebar tabs + content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar tabs */}
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#f8fafc", padding: "16px 0", display: "flex", flexDirection: "column", gap: 4 }}>
            {LAPORAN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 20px",
                  background: activeTab === tab.id ? "#fff" : "transparent",
                  border: "none",
                  borderLeft: activeTab === tab.id ? "3px solid #ef4444" : "3px solid transparent",
                  borderRight: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#ef4444" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 15 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 20 }}>
              {LAPORAN_TABS.find((t) => t.id === activeTab)?.label}
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Star Rating ──
function StarRating({ value, onChange, size = 32 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={size}
          style={{ cursor: "pointer", transition: "color 0.15s" }}
          color={(hovered || value) >= s ? "#f59e0b" : "#d1d5db"}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  );
}
const submitBtn = (disabled) => ({
  height: 52,
  border: "none",
  borderRadius: 14,
  background: disabled
    ? "#cbd5e1"
    : "linear-gradient(135deg,#ef4444,#dc2626)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  opacity: disabled ? 0.7 : 1,
});

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function ChatWidget() {
  const { user } = useAuth();

  // UI state
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modal state
  const [showPengumuman, setShowPengumuman] = useState(false);
  const [showBantuan, setShowBantuan] = useState(false);
  const [showLaporan, setShowLaporan] = useState(false);

  // Chat state
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [adminOnline, setAdminOnline] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const theme = THEMES[darkMode ? "dark" : "light"];

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Radial menu items ──
  const menuItems = [
    { bg: "#ef4444", icon: <FaClipboardList />, action: () => setShowLaporan(true) },
    { bg: "#10b981", icon: <FaComments />,      action: () => setOpen(true) },
    { bg: "#f59e0b", icon: <FaHeadset />,        action: () => setShowBantuan(true) },
    { bg: "#2563eb", icon: <FaBullhorn />,       action: () => setShowPengumuman(true) },
    { bg: "#E1306C", icon: <FaInstagram />,      action: () => window.open("https://instagram.com/booklap", "_blank") },
    { bg: "#25D366", icon: <FaWhatsapp />,       action: () => window.open("https://wa.me/6281234567890", "_blank") },
  ];

  const STEP = 360 / menuItems.length;

  // ─────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadAdminStatus();
  }, []);

  useEffect(() => {
    if (user?.id) loadMessages();
  }, [user]);

  // Realtime: new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`widget-chat-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chats" }, (payload) => {
        if (String(payload.new.chat_room) === String(user.id)) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id);
            return exists ? prev : [...prev, payload.new];
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Realtime: admin status
  useEffect(() => {
    const channel = supabase
      .channel("admin-status")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "admin_status" }, (payload) => {
        setAdminOnline(payload.new.is_online);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ─────────────────────────────────────────
  // Data fetchers
  // ─────────────────────────────────────────
  const loadAdminStatus = async () => {
    const { data } = await supabase.from("admin_status").select("*").eq("id", 1).single();
    if (data) setAdminOnline(data.is_online);
  };

  const loadMessages = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("chat_room", String(user.id))
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
  };

  // ─────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRotation((prev) => prev - STEP);
    setTimeout(() => setIsSpinning(false), 400);
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const { error } = await supabase.from("chats").insert([{
      user_id: user?.id,
      user_name: user?.nama,
      chat_room: user?.id,
      sender: "user",
      message: trimmed,
      message_type: "text",
    }]);

    if (!error) {
      setInput("");
      setShowEmojiPicker(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file || !user?.id) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("chat-images").upload(filePath, file);
      if (uploadError) { console.error("Upload error:", uploadError); return; }

      const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);

      await supabase.from("chats").insert([{
        user_id: user.id,
        user_name: user.nama,
        chat_room: user.id,
        sender: "user",
        message: data.publicUrl,
        message_type: "image",
      }]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ─────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────
  const renderRadialMenu = () => {
    const radius = 160;
    const centerX = 62.5;
    const centerY = 62.5;
    const iconSize = 80;

    return menuItems.map((item, i) => {
      const angle = (360 / menuItems.length) * i + rotation;
      const rad = (angle * Math.PI) / 180;
      const rightPos = centerX - iconSize / 2 - radius * Math.cos(rad);
      const bottomPos = centerY - iconSize / 2 - radius * Math.sin(rad);
      const normalized = ((angle % 360) + 360) % 360;
      const visible = normalized > 30 && normalized < 330;

      return (
        <button
          key={i}
          onClick={visible ? item.action : undefined}
          style={{
            position: "fixed",
            right: `${rightPos}px`,
            bottom: `${bottomPos}px`,
            width: iconSize,
            height: iconSize,
            borderRadius: "50%",
            border: "none",
            background: item.bg,
            color: "#fff",
            zIndex: 9998,
            fontSize: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.7)",
            transition: "all .4s cubic-bezier(0.34,1.56,0.64,1)",
            cursor: visible ? "pointer" : "default",
            pointerEvents: visible ? "auto" : "none",
            boxShadow: visible ? "0 4px 15px rgba(0,0,0,.35)" : "none",
          }}
        >
          {item.icon}
        </button>
      );
    });
  };

  const renderMessage = (msg) => {
    const isUser = msg.sender === "user";
    return (
      <div
        key={msg.id}
        style={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 10,
          marginBottom: 6,
        }}
      >
        {!isUser && (
          <Avatar
            initials={selectedContact.initials}
            color={selectedContact.color}
            size={42}
            online={adminOnline}
          />
        )}
        <div
          style={{
            maxWidth: "58%",
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 4,
          }}
        >
          <div
            style={{
              padding: "11px 16px",
              borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: isUser ? "#2e6b3e" : darkMode ? "#252b34" : "#f3f4f6",
              color: isUser ? "#e8f5e9" : theme.text,
              fontSize: 14,
              lineHeight: 1.55,
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            {msg.message_type === "image" ? (
              <img
                src={msg.message}
                alt="chat"
                style={{ maxWidth: 280, borderRadius: 12, display: "block" }}
              />
            ) : (
              msg.message
            )}
          </div>
          <span style={{ fontSize: 11, color: "#4b5563" }}>
            {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────
  // Modals
  // ─────────────────────────────────────────
  const renderPengumuman = () => (
    <>
      <div onClick={() => setShowPengumuman(false)} style={overlayStyle} />
      <div style={{ ...modalStyle, maxWidth: 1250, height: "80vh" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8,#1e40af)", padding: "24px 30px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={circleIconStyle("#fff3")}>
                <FaBullhorn size={48} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: "#fff", margin: 0, fontSize: 30, fontWeight: 800 }}>Pengumuman BookLap</h2>
                <div style={{ color: "#dbeafe", marginTop: 6, fontSize: 15 }}>Informasi terbaru & penting dari BookLap</div>
              </div>
            </div>
            <button onClick={() => setShowPengumuman(false)} style={closeButtonStyle}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28, flex: 1, overflowY: "auto", background: "#f8fafc" }}>
          <AnnouncementCard
            icon={<FaGift size={55} color="#2563eb" />}
            title="Promo Akhir Pekan"
            body="Diskon 20% untuk semua pemesanan lapangan futsal setiap Sabtu dan Minggu."
            date={<><FaClock /> Berlaku sampai 30 Juni 2026</>}
            badge="PROMO"
            bgColor="#eff6ff"
            borderColor="#bfdbfe"
            iconColor="#1d4ed8"
            badgeColor="#2563eb"
          />
          <AnnouncementCard
            icon={<FaBolt size={55} color="#f97316" />}
            title="Maintenance Sistem"
            body="Sistem pembayaran akan maintenance pada pukul 02.00 - 04.00 WITA."
            date="19 Juni 2026 • 01:00"
            badge="PENTING"
            bgColor="#fff7ed"
            borderColor="#fed7aa"
            iconColor="#ea580c"
            badgeColor="#f59e0b"
          />
          <AnnouncementCard
            icon={<FaCheckSquare size={55} color="#16a34a" />}
            title="Lapangan Baru"
            body="Kini tersedia lapangan Mini Soccer terbaru yang dapat langsung dipesan melalui aplikasi BookLap."
            date="18 Juni 2026 • 16:30"
            badge="INFO"
            bgColor="#f0fdf4"
            borderColor="#bbf7d0"
            iconColor="#15803d"
            badgeColor="#22c55e"
          />
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 28px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569", fontSize: 16 }}>
            <FaInfoCircle color="#2563eb" />
            Terima kasih telah menjadi bagian dari keluarga BookLap
          </div>
          <button style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
            📢 Lihat Semua Pengumuman
          </button>
        </div>
      </div>
    </>
  );

  const renderBantuan = () => (
    <>
      <div onClick={() => setShowBantuan(false)} style={overlayStyle} />
      <div style={{ ...modalStyle, maxWidth: 1100, height: "75vh" }}>
        {/* Header */}
        <div style={{ padding: "24px 30px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <FaHeadset size={48} />
            <div>
              <h2 style={{ margin: 0, fontSize: 28 }}>Pusat Bantuan BookLap</h2>
              <div>Bantuan cepat untuk pengguna</div>
            </div>
          </div>
          <button onClick={() => setShowBantuan(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 30, cursor: "pointer" }}>
            <FaTimes />
          </button>
        </div>

        {/* Grid */}
        <div style={{ padding: 30, flex: 1, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          <HelpCard icon={<FaCalendarCheck size={40} color="#2563eb" />} title="Cara Booking Lapangan" body="Pilih lapangan, pilih jadwal, lakukan pembayaran lalu booking berhasil." bg="#eff6ff" />
          <HelpCard icon={<FaMoneyCheckAlt size={40} color="#d97706" />} title="Masalah Pembayaran" body="Transfer berhasil tetapi status belum berubah?" bg="#fef3c7" />
          <HelpCard icon={<FaBan size={40} color="#dc2626" />} title="Pembatalan Booking" body="Ingin membatalkan pesanan yang sudah dibuat?" bg="#fee2e2" />
          <HelpCard icon={<FaPhoneAlt size={40} color="#16a34a" />} title="Hubungi Admin" body="Admin aktif setiap hari 08.00 - 22.00 WITA" bg="#dcfce7" />
        </div>
      </div>
    </>
  );

  const renderChat = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 99990, display: "flex", justifyContent: "center", alignItems: "center", padding: 30 }}>
      <div style={{ width: "90%", maxWidth: 1400, height: "85vh", background: theme.bg, borderRadius: 24, overflow: "hidden", display: "flex", boxShadow: "0 30px 80px rgba(0,0,0,.45)", border: "1px solid #2a2f38" }}>
        
        {/* Sidebar */}
        <aside style={{ width: 320, minWidth: 260, maxWidth: 340, background: theme.sidebar, borderRight: "1px solid #2a2f38", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px 20px 12px" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.text }}>Pesan</h2>
          </div>

          {/* Admin number info */}
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: theme.secondary, marginBottom: 8 }}>Chat nomor admin di bawah ini</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e" }}>+62 812-3456-7890</div>
            </div>
          </div>

          {/* Contact list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {CONTACTS.map((c) => {
              const active = selectedContact.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    width: "100%",
                    padding: "13px 18px",
                    background: active ? "#1a3a26" : "transparent",
                    border: "none",
                    borderLeft: active ? "3px solid #4ade80" : "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#232930"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <Avatar initials={c.initials} color={c.color} online={adminOnline} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{c.name}</span>
                      {c.unread > 0 && (
                        <span style={{ background: "#4ade80", color: "#0f1a14", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: theme.secondary, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginTop: 2 }}>
                      {c.preview}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", background: theme.bg, minWidth: 0 }}>
          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #2a2f38", background: theme.header, gap: 14 }}>
            <Avatar initials={selectedContact.initials} color={selectedContact.color} size={42} online={selectedContact.online} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{selectedContact.name}</div>
              <div style={{ fontSize: 12, color: adminOnline ? "#4ade80" : "#94a3b8", marginTop: 1 }}>
                {adminOnline ? "Online sekarang" : "Sedang offline"}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setDarkMode(!darkMode)} title="Ubah Tema" style={topBarButtonStyle(theme)}>
                {darkMode ? "🌙" : "☀️"}
              </button>
              <button onClick={() => setOpen(false)} style={{ ...topBarButtonStyle(theme), color: "#fff" }}>
                <FaTimes />
              </button>
              <button
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                style={{ height: 58, padding: "0 28px", borderRadius: 14, border: "1px solid #2d5c38", background: "linear-gradient(135deg,#14532d,#166534)", color: "#4ade80", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
              >
                <FaWhatsapp size={18} /> Telepon via WA
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ textAlign: "center", margin: "8px 0 18px", position: "relative" }}>
              <span style={{ fontSize: 12, color: "#4b5563", background: theme.bg, padding: "0 12px", position: "relative", zIndex: 1 }}>{today}</span>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: theme.border, zIndex: 0 }} />
            </div>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); }}
          />

          {/* Input bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px 18px" }}>
            {/* Emoji */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={inputIconButton(theme)}>😊</button>
              {showEmojiPicker && (
                <div style={{ position: "absolute", bottom: 50, left: 0, zIndex: 999999 }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
              )}
            </div>

            {/* Attachment */}
            <button onClick={() => fileInputRef.current?.click()} style={inputIconButton(theme)}>📎</button>

            {/* Text input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: theme.input, border: "1.5px solid #2e343d", color: theme.text, fontSize: 14, outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "#4a7c59")}
              onBlur={(e) => (e.target.style.borderColor = "#2e343d")}
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                ...inputIconButton(theme),
                background: input.trim() ? "#2e6b3e" : theme.input,
                borderColor: input.trim() ? "#3d8a52" : "#2e343d",
                color: input.trim() ? "#4ade80" : "#6b7280",
                cursor: input.trim() ? "pointer" : "default",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              ➤
            </button>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:.5} 50%{transform:translateY(-4px);opacity:1} }

      `}</style>
    </div>
  );

  // ─────────────────────────────────────────
  // Root render
  // ─────────────────────────────────────────
  return (
    <>
    <style>{`
.arrows {
  display:flex;
  align-items:center;
  animation:moveRight .8s linear infinite;
}

.chevron {
  width:22px;
  height:22px;
  border-right:4px solid #fff;
  border-top:4px solid #fff;
  transform:rotate(45deg);
  margin-left:-6px;
}

@keyframes moveRight {
  0% { transform: translateX(-28px); }
  100% { transform: translateX(0px); }
}
`}</style>
      {/* Radial menu items */}
      {renderRadialMenu()}

      {/* Arrow hint */}
<div style={{ position: "fixed", right: 280, bottom: 42, zIndex: 9997, display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
  <div style={{ background: "#fff", color: "#111827", padding: "8px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>
    Klik Disini
  </div>
  <div style={{ display: "flex", alignItems: "center", overflow: "hidden", width: 90 }}>
    <div className="arrows">
      <div className="chevron" />
      <div className="chevron" />
      <div className="chevron" />
      <div className="chevron" />
    </div>
  </div>
</div>

      {/* Main FAB */}
      <button
        onClick={handleSpin}
        style={{ position: "fixed", right: 25, bottom: 25, width: 75, height: 75, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", cursor: "pointer", zIndex: 9999, fontSize: 28, boxShadow: "0 15px 35px rgba(220,38,38,.35)" }}
      >
        <div style={{ transform: isSpinning ? "rotate(90deg)" : "rotate(0deg)", transition: "all .4s ease" }}>
          <FaPlus />
        </div>
      </button>

      {/* Modals */}
      {showPengumuman && renderPengumuman()}
      {showBantuan && renderBantuan()}
      {showLaporan && (
        <LaporanModal
          onClose={() => setShowLaporan(false)}
          user={user}
        />
      )}
      {open && renderChat()}
    </>
  );
}

// ─────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  zIndex: 99990,
};

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  background: "#fff",
  borderRadius: 28,
  overflow: "hidden",
  zIndex: 99991,
  boxShadow: "0 35px 100px rgba(0,0,0,.45)",
  display: "flex",
  flexDirection: "column",
};

const closeButtonStyle = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,.25)",
  background: "rgba(255,255,255,.08)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const circleIconStyle = (bg) => ({
  width: 92,
  height: 92,
  borderRadius: "50%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
});

const topBarButtonStyle = (theme) => ({
  width: 58,
  height: 58,
  borderRadius: 14,
  border: "1px solid #3a3f47",
  background: theme.input,
  color: theme.text,
  fontSize: 24,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const inputIconButton = (theme) => ({
  width: 38,
  height: 38,
  borderRadius: 9,
  background: theme.input,
  border: "1.5px solid #2e343d",
  color: "#6b7280",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});
