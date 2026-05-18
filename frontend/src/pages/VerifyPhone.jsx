// VerifyPhone.jsx

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "nomor WhatsApp terdaftar";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        {},
        { withCredentials: true }
      );

      navigate("/verify-otp", {
        state: { phone },
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          Verifikasi Nomor WhatsApp
        </h2>
        <p style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 18, lineHeight: 1.6 }}>
          Klik tombol di bawah untuk mengirim kode OTP ke {phone}.
        </p>

        <button
          onClick={handleSendOtp}
          disabled={loading}
          style={{
            width: "100%",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Mengirim..." : "Kirim lewat WhatsApp"}
        </button>

        {error && (
          <p style={{ marginTop: 12, color: "#dc2626", fontSize: 12.5 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}