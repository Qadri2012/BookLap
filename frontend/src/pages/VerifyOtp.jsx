import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email ||
    "email terdaftar";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { data } =
        await api.post(
          "/auth/verify-email-otp",
          {
            otp,
          }
        );

      setSuccess(
        data?.message ||
          "Verifikasi berhasil"
      );

      setTimeout(() => {
        navigate("/login/user", {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "OTP salah atau sudah kedaluwarsa"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily:
          "'Plus Jakarta Sans', sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 20,
          padding: 28,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Verifikasi Email
        </h2>

        <p
          style={{
            fontSize: 13.5,
            color: "#6b7280",
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          Kode OTP telah dikirim ke:
          <br />
          <strong>{email}</strong>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          placeholder="Masukkan 6 digit OTP"
          maxLength={6}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 14,
            outline: "none",
            marginBottom: 14,
            textAlign: "center",
            letterSpacing: "4px",
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: "100%",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 700,
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading
            ? "Memverifikasi..."
            : "Verifikasi OTP"}
        </button>

        {success && (
          <p
            style={{
              marginTop: 12,
              color: "#16a34a",
              fontSize: 12.5,
            }}
          >
            {success}
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: 12,
              color: "#dc2626",
              fontSize: 12.5,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}