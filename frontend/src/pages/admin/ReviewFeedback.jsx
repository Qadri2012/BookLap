import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/v1/website-review";

const TABS = [
  { key: "pending",  label: "Review Baru",     color: "#16a34a", light: "#dcfce7", dot: "#22c55e" },
  { key: "approved", label: "Diterima",         color: "#2563eb", light: "#dbeafe", dot: "#3b82f6" },
  { key: "rejected", label: "Ditolak",          color: "#dc2626", light: "#fee2e2", dot: "#ef4444" },
];

const STATUS_CONFIG = {
  approved: { label: "Diterima", bg: "#dcfce7", color: "#166534" },
  rejected: { label: "Ditolak",  bg: "#fee2e2", color: "#991b1b" },
  pending:  { label: "Pending",  bg: "#fef9c3", color: "#854d0e" },
};

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i < rating ? "#facc15" : "none"}
          stroke={i < rating ? "#facc15" : "#d1d5db"}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "4px", lineHeight: "14px" }}>
        {rating}/5
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      background: cfg.bg, color: cfg.color,
      padding: "4px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em",
    }}>
      <span style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

function ActionButtons({ review, onApprove, onReject, onDelete }) {
  if (review.status === "pending") {
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <ActionBtn onClick={() => onApprove(review.id)} color="#16a34a" hoverColor="#15803d" label="Terima"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />}
        />
        <ActionBtn onClick={() => onReject(review.id)} color="#d97706" hoverColor="#b45309" label="Tolak"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
        />
        <ActionBtn onClick={() => onDelete(review.id)} color="#dc2626" hoverColor="#b91c1c" label="Hapus"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />}
        />
      </div>
    );
  }
  return (
    <ActionBtn onClick={() => onDelete(review.id)} color="#dc2626" hoverColor="#b91c1c" label="Hapus"
      icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />}
    />
  );
}

function ActionBtn({ onClick, color, hoverColor, label, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        background: hovered ? hoverColor : color,
        color: "#fff", border: "none",
        padding: "6px 12px", borderRadius: "8px",
        fontSize: "12px", fontWeight: 600,
        cursor: "pointer", transition: "all 0.15s ease",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered ? `0 4px 12px ${color}55` : "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2">
        {icon}
      </svg>
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div style={{
            height: "14px", borderRadius: "6px",
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
            width: i === 3 ? "90%" : "60%",
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function ReviewFeedback() {
  const [activeTab, setActiveTab] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const adminToken = localStorage.getItem("adminToken");

  const activeTabConfig = TABS.find((t) => t.key === activeTab);

  useEffect(() => { fetchReviews(); }, [activeTab]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${activeTab}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await axios.put(`${API}/${id}/approve`);
      fetchReviews();
      showToast("Review berhasil diterima");
    } catch {
      showToast("Gagal menyetujui review", "error");
    }
  }

  async function handleReject(id) {
    try {
      await axios.put(`${API}/${id}/reject`);
      fetchReviews();
      showToast("Review berhasil ditolak", "warning");
    } catch {
      showToast("Gagal menolak review", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus review ini?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchReviews();
      showToast("Review berhasil dihapus", "error");
    } catch {
      showToast("Gagal menghapus review", "error");
    }
  }

  return (
    <div style={{
      padding: "32px",
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      minHeight: "100vh",
      background: "#f8fafc",
    }}>

      {/* ── Toast ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeRow {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .review-row { animation: fadeRow 0.25s ease forwards; }
        .review-row:hover td { background: #f8fafc !important; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: toast.type === "error" ? "#dc2626"
            : toast.type === "warning" ? "#d97706" : "#16a34a",
          color: "#fff",
          padding: "12px 20px", borderRadius: "12px",
          fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          animation: "slideIn 0.25s ease",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {toast.type === "success"
              ? <path d="M4.5 12.75l6 6 9-13.5" />
              : <path d="M6 18L18 6M6 6l12 12" />}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, color: "#16a34a",
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px",
        }}>
          Manajemen
        </p>
        <h1 style={{
          fontSize: "26px", fontWeight: 800, color: "#0f172a",
          letterSpacing: "-0.02em", margin: 0,
        }}>
          Review & Feedback
        </h1>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "24px",
        background: "#fff", padding: "6px",
        borderRadius: "14px", width: "fit-content",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 18px",
                borderRadius: "10px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.2s ease",
                background: active ? tab.color : "transparent",
                color: active ? "#fff" : "#6b7280",
                boxShadow: active ? `0 4px 14px ${tab.color}44` : "none",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: active ? "rgba(255,255,255,0.7)" : tab.dot,
                flexShrink: 0,
              }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Card Tabel ── */}
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
      }}>

        {/* Card header strip */}
        <div style={{
          height: "4px",
          background: `linear-gradient(to right, ${activeTabConfig.color}, ${activeTabConfig.dot})`,
        }} />

        <div style={{ padding: "20px 24px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, margin: 0 }}>
            {loading ? "Memuat data..." : `${reviews.length} review ditemukan`}
          </p>
          <button
            onClick={fetchReviews}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "none", border: "1px solid #e2e8f0",
              padding: "6px 12px", borderRadius: "8px",
              fontSize: "12px", fontWeight: 600, color: "#475569",
              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Refresh
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["No", "Nama", "Rating", "Ulasan", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                        stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, margin: 0 }}>
                        Belum ada review di sini
                      </p>
                      <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>
                        Review baru akan muncul di tab "Review Baru"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review, index) => (
                  <tr
                    key={review.id}
                    className="review-row"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    {/* No */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                      fontSize: "13px", color: "#94a3b8", fontWeight: 600,
                    }}>
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    {/* Nama */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "34px", height: "34px", borderRadius: "50%",
                          background: `linear-gradient(135deg, ${activeTabConfig.color}, ${activeTabConfig.dot})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 800, fontSize: "13px", flexShrink: 0,
                        }}>
                          {(review.nama || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                          {review.nama}
                        </span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                    }}>
                      <StarRating rating={review.rating} />
                    </td>

                    {/* Ulasan */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                      maxWidth: "300px",
                    }}>
                      <p style={{
                        fontSize: "13px", color: "#475569", lineHeight: 1.6,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {review.ulasan}
                      </p>
                    </td>

                    {/* Status */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                    }}>
                      <StatusBadge status={review.status} />
                    </td>

                    {/* Aksi */}
                    <td style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f8fafc",
                    }}>
                      <ActionButtons
                        review={review}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {!loading && reviews.length > 0 && (
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "flex-end",
          }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Total <strong style={{ color: "#475569" }}>{reviews.length}</strong> review
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
