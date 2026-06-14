// NEW: src/pages/loginMitra.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import img1 from "../assets/gambar1.png";
import img2 from "../assets/gambar2.png";
import img3 from "../assets/gambar3.png";
import img4 from "../assets/gambar4.png";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../context/AuthContext";

const SLIDE_IMGS = [img1, img2, img3, img4];

// NEW: base API dari env
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authApi = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
});

// NEW: limit keamanan
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000;

// NEW: sanitasi sederhana
function sanitize(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// NEW: strength password
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };

  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ];

  const score = checks.filter(Boolean).length;

  const map = [
    { label: "Sangat lemah", color: "#ef4444" },
    { label: "Lemah", color: "#f97316" },
    { label: "Cukup", color: "#eab308" },
    { label: "Kuat", color: "#22c55e" },
    { label: "Sangat kuat", color: "#16a34a" },
  ];

  return { score, ...map[score] };
}

// NEW: validasi password
function validatePassword(pw, compareTo = "") {
  const errors = [];
  if (pw.length < 8) errors.push("Minimal 8 karakter");
  if (!/[A-Z]/.test(pw)) errors.push("Minimal 1 huruf besar");
  if (!/[0-9]/.test(pw)) errors.push("Minimal 1 angka");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("Minimal 1 simbol (!@#$...)");
  if (pw.length > 128) errors.push("Maksimal 128 karakter");

  if (
    compareTo &&
    pw.toLowerCase().includes(compareTo.toLowerCase()) &&
    compareTo.length >= 3
  ) {
    errors.push("Password tidak boleh mengandung nama/email");
  }

  return errors;
}

// NEW: icon mata
const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// NEW: input umum
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  right,
  autoComplete,
}) {
  return (
    <div style={{ marginBottom: error ? "4px" : "14px" }}>
      {label ? (
        <div
          style={{
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#111",
          }}
        >
          {label}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
          transition: "border 0.2s",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "11px 14px",
            fontSize: "13.5px",
            color: "#1a1a1a",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
        {right ? (
          <span
            style={{
              paddingRight: "12px",
              color: "#555",
              cursor: "pointer",
              display: "flex",
            }}
          >
            {right}
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          style={{
            color: "#dc2626",
            fontSize: "11.5px",
            marginTop: "4px",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// NEW: textarea
function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
}) {
  return (
    <div style={{ marginBottom: error ? "4px" : "14px" }}>
      <div
        style={{
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#111",
        }}
      >
        {label}
      </div>

      <div
        style={{
          background: "#ffffff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
          transition: "border 0.2s",
          overflow: "hidden",
        }}
      >
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: "100%",
            resize: "vertical",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "11px 14px",
            fontSize: "13.5px",
            color: "#1a1a1a",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
      </div>

      {error ? (
        <p
          style={{
            color: "#dc2626",
            fontSize: "11.5px",
            marginTop: "4px",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// NEW: select
function SelectField({ label, value, onChange, error, children }) {
  return (
    <div style={{ marginBottom: error ? "4px" : "14px" }}>
      <div
        style={{
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#111",
        }}
      >
        {label}
      </div>

      <div
        style={{
          background: "#ffffff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
          transition: "border 0.2s",
          overflow: "hidden",
        }}
      >
        <select
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "11px 14px",
            fontSize: "13.5px",
            color: "#1a1a1a",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {children}
        </select>
      </div>

      {error ? (
        <p
          style={{
            color: "#dc2626",
            fontSize: "11.5px",
            marginTop: "4px",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// NEW: input file
function FileField({ label, accept, onChange, error, fileName }) {
  return (
    <div style={{ marginBottom: error ? "4px" : "14px" }}>
      <div
        style={{
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#111",
        }}
      >
        {label}
      </div>

      <div
        style={{
          background: "#ffffff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "10px 14px",
        }}
      >
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          style={{
            width: "100%",
            fontSize: "13.5px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
      </div>

      {fileName ? (
        <p style={{ fontSize: "11.5px", color: "#555", marginTop: "4px" }}>
          File terpilih: {fileName}
        </p>
      ) : null}

      {error ? (
        <p
          style={{
            color: "#dc2626",
            fontSize: "11.5px",
            marginTop: "4px",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// NEW: checkbox
function CheckField({ checked, onChange, label, error }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          fontSize: "13px",
          color: "#222",
          cursor: "pointer",
          lineHeight: 1.45,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ marginTop: "3px", width: "16px", height: "16px" }}
        />
        <span>{label}</span>
      </label>

      {error ? (
        <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

// NEW: spinner
const Spin = () => (
  <svg
    style={{ animation: "spin 0.8s linear infinite", width: 16, height: 16 }}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="4"
    />
    <path
      d="M4 12a8 8 0 018-8V0"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

// NEW: modal popup
function PopupModal({ popup, onClose }) {
  if (!popup) return null;

  const isSuccess = popup.type === "success";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "320px",
          background: "#fff",
          borderRadius: "20px",
          padding: "32px 28px 24px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            color: "#999",
            lineHeight: 1,
            padding: "2px 6px",
            borderRadius: "6px",
            transition: "color 0.15s",
          }}
        >
          ×
        </button>

        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: isSuccess
              ? "rgba(34,197,94,0.12)"
              : "rgba(239,68,68,0.1)",
            border: `2px solid ${
              isSuccess ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          {isSuccess ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "16px",
            fontWeight: 800,
            color: "#111",
            marginBottom: "8px",
          }}
        >
          {isSuccess ? "Berhasil!" : "Terjadi Kesalahan"}
        </h3>

        <p
          style={{
            fontSize: "13.5px",
            color: "#555",
            lineHeight: 1.6,
            marginBottom: "22px",
          }}
        >
          {popup.msg}
        </p>

        <button
          onClick={onClose}
          style={{
            padding: "10px 36px",
            borderRadius: "10px",
            border: "none",
            background: isSuccess
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: isSuccess
              ? "0 4px 14px rgba(22,163,74,0.3)"
              : "0 4px 14px rgba(239,68,68,0.3)",
            transition: "all 0.2s",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function LoginMitra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // NEW: role khusus mitra
  const role = "mitra";

  const query = new URLSearchParams(location.search);
  const nextPath =
    query.get("next") || localStorage.getItem("redirectAfterAuth") || "/";

  const [popup, setPopup] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  // NEW: state login
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");
  const [lShowP, setLShowP] = useState(false);
  const [lErrors, setLErrors] = useState({});
  const [lLoading, setLLoading] = useState(false);

  // NEW: lockout
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // NEW: state register mitra
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rShowP, setRShowP] = useState(false);
  const [rShow2, setRShow2] = useState(false);
  const [rErrors, setRErrors] = useState({});
  const [rLoading, setRLoading] = useState(false);

  // NEW: data mitra
  const [rBusinessName, setRBusinessName] = useState("");
  const [rFieldType, setRFieldType] = useState("");
  const [rAddress, setRAddress] = useState("");
  const [rCity, setRCity] = useState("");
  const [rOpenTime, setROpenTime] = useState("");
  const [rCloseTime, setRCloseTime] = useState("");
  const [rFieldCount, setRFieldCount] = useState("");

  // NEW: dokumen
  const [rPhotoLapangan, setRPhotoLapangan] = useState(null);
  const [rKtpPemilik, setRKtpPemilik] = useState(null);

  // NEW: captcha + persetujuan
  const [captchaToken, setCaptchaToken] = useState("");
  const [rAgreeData, setRAgreeData] = useState(false);
  const [rAgreeTerms, setRAgreeTerms] = useState(false);
  const [rAgreePrivacy, setRAgreePrivacy] = useState(false);

  // NEW: reset password
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const strength = getStrength(isSignUp ? rPass : "");

  useEffect(() => {
    const t = setInterval(
      () => setSlideIdx((p) => (p + 1) % SLIDE_IMGS.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;

    const t = setInterval(() => {
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);

      if (rem <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        clearInterval(t);
      } else {
        setCountdown(rem);
      }
    }, 1000);

    return () => clearInterval(t);
  }, [lockedUntil]);

  // NEW: reset semua state saat pindah mode
  function switchMode(signup) {
    setIsSignUp(signup);
    setLErrors({});
    setRErrors({});
    setPopup(null);
    setShowForgot(false);

    setLEmail("");
    setLPass("");
    setLShowP(false);

    setRName("");
    setRPhone("");
    setREmail("");
    setRPass("");
    setRPass2("");
    setRShowP(false);
    setRShow2(false);
    setRBusinessName("");
    setRFieldType("");
    setRAddress("");
    setRCity("");
    setROpenTime("");
    setRCloseTime("");
    setRFieldCount("");
    setRPhotoLapangan(null);
    setRKtpPemilik(null);
    setCaptchaToken("");
    setRAgreeData(false);
    setRAgreeTerms(false);
    setRAgreePrivacy(false);
  }

  function validateLogin() {
    const e = {};
    if (!lEmail.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(lEmail)) e.email = "Format email tidak valid";
    else if (lEmail.length > 254) e.email = "Email terlalu panjang";
    if (!lPass) e.pass = "Password wajib diisi";
    return e;
  }

  // NEW: validasi register mitra
  function validateRegister() {
    const e = {};

    const cleanName = rName.trim();
    if (!cleanName) e.name = "Nama wajib diisi";
    else if (cleanName.length < 3) e.name = "Nama minimal 3 karakter";
    else if (cleanName.length > 50) e.name = "Nama maksimal 50 karakter";

    if (!rPhone.trim()) e.phone = "Nomor HP wajib diisi";
    else if (!/^[0-9+\-\s]{8,20}$/.test(rPhone))
      e.phone = "Format nomor tidak valid";

    if (!rEmail.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(rEmail)) e.email = "Format email tidak valid";
    else if (rEmail.length > 254) e.email = "Email terlalu panjang";

    const pwErrs = validatePassword(rPass, rName + " " + rEmail);
    if (pwErrs.length) e.pass = pwErrs[0];

    if (!rPass2) e.pass2 = "Konfirmasi password wajib diisi";
    else if (rPass !== rPass2) e.pass2 = "Password tidak cocok";

    if (!rBusinessName.trim()) e.businessName = "Nama usaha/lapangan wajib diisi";
    if (!rFieldType.trim()) e.fieldType = "Jenis lapangan wajib dipilih";
    if (!rAddress.trim()) e.address = "Alamat lengkap wajib diisi";
    if (!rCity.trim()) e.city = "Kota/Kabupaten wajib diisi";
    if (!rOpenTime) e.openTime = "Jam operasional buka wajib diisi";
    if (!rCloseTime) e.closeTime = "Jam operasional tutup wajib diisi";

    if (!rFieldCount || Number(rFieldCount) < 1)
      e.fieldCount = "Jumlah lapangan minimal 1";

    if (rOpenTime && rCloseTime && rOpenTime >= rCloseTime) {
      e.closeTime = "Jam tutup harus lebih besar dari jam buka";
    }

    if (!rPhotoLapangan) e.photo = "Foto lapangan wajib diunggah";
    if (!rKtpPemilik) e.ktp = "KTP pemilik wajib diunggah";

    if (!captchaToken) e.captcha = "Silakan selesaikan CAPTCHA";

    if (!rAgreeData) e.agreeData = "Harap menyatakan data yang diberikan benar";
    if (!rAgreeTerms) e.agreeTerms = "Harap menyetujui Syarat & Ketentuan";
    if (!rAgreePrivacy) e.agreePrivacy = "Harap menyetujui Kebijakan Privasi";

    return e;
  }

  async function handleLogin(ev) {
    ev.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) return;

    const errs = validateLogin();
    if (Object.keys(errs).length) {
      setLErrors(errs);
      return;
    }

    setLErrors({});
    setLLoading(true);

    try {
      const { data } = await authApi.post("/auth/login", {
        email: sanitize(lEmail).trim().toLowerCase(),
        password: lPass,
        role, // NEW: fixed mitra
      });

      if (!data?.token || !data?.user) {
        throw new Error("Respons login tidak lengkap dari server.");
      }

      setAttempts(0);
      authLogin(data.user, data.token);

      localStorage.removeItem("redirectAfterAuth");
      setPopup({
        type: "success",
        msg: "Login mitra berhasil! Selamat datang kembali.",
      });

      setTimeout(() => {
        navigate(nextPath, { replace: true });
      }, 900);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setPopup({
          type: "error",
          msg: "Terlalu banyak percobaan gagal. Akun terkunci selama 15 menit.",
        });
      } else {
        setPopup({
          type: "error",
          msg:
            err.response?.data?.message ||
            err.response?.data?.msg ||
            err.message ||
            `Email atau password tidak valid. Sisa percobaan: ${
              MAX_LOGIN_ATTEMPTS - newAttempts
            }`,
        });
      }
    } finally {
      setLLoading(false);
    }
  }

  // NEW: register mitra
  async function handleRegister(ev) {
    ev.preventDefault();

    const errs = validateRegister();
    if (Object.keys(errs).length) {
      setRErrors(errs);
      return;
    }

    setRErrors({});
    setRLoading(true);

    try {
      const cleanPhone = rPhone.replace(/\D/g, "").replace(/^0+/, "");
      const fullPhone = `62${cleanPhone}`;

      const formData = new FormData();
      formData.append("role", "mitra");
      formData.append("nama", sanitize(rName).trim());
      formData.append("no_hp", fullPhone);
      formData.append("email", sanitize(rEmail).trim().toLowerCase());
      formData.append("password", rPass);

      formData.append("nama_usaha", sanitize(rBusinessName).trim());
      formData.append("jenis_lapangan", rFieldType);
      formData.append("alamat_lengkap", sanitize(rAddress).trim());
      formData.append("kota_kabupaten", sanitize(rCity).trim());
      formData.append("jam_buka", rOpenTime);
      formData.append("jam_tutup", rCloseTime);
      formData.append("jumlah_lapangan", String(rFieldCount));

      formData.append("captchaToken", captchaToken);

      formData.append("setuju_data_benar", rAgreeData ? "1" : "0");
      formData.append("setuju_terms", rAgreeTerms ? "1" : "0");
      formData.append("setuju_privacy", rAgreePrivacy ? "1" : "0");

      if (rPhotoLapangan) formData.append("foto_lapangan", rPhotoLapangan);
      if (rKtpPemilik) formData.append("ktp_pemilik", rKtpPemilik);

      // NEW: endpoint khusus mitra
      const { data } = await authApi.post("/auth/register-mitra", formData);

      setRName("");
      setRPhone("");
      setREmail("");
      setRPass("");
      setRPass2("");
      setRBusinessName("");
      setRFieldType("");
      setRAddress("");
      setRCity("");
      setROpenTime("");
      setRCloseTime("");
      setRFieldCount("");
      setRPhotoLapangan(null);
      setRKtpPemilik(null);
      setCaptchaToken("");
      setRAgreeData(false);
      setRAgreeTerms(false);
      setRAgreePrivacy(false);

      setPopup({
        type: "success",
        msg:
          data?.message ||
          "Data mitra tersimpan. Silakan verifikasi lewat WhatsApp.",
      });

      setTimeout(() => {
        navigate("/verify-phone", {
          state: { phone: `+${fullPhone}` },
          replace: true,
        });
      }, 900);
    } catch (err) {
      setPopup({
        type: "error",
        msg:
          err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "Registrasi mitra gagal. Terjadi kesalahan pada server.",
      });
    } finally {
      setRLoading(false);
    }
  }

  async function handleForgotPassword(ev) {
    ev.preventDefault();

    if (!fpEmail.trim() || !/\S+@\S+\.\S+/.test(fpEmail)) {
      setPopup({ type: "error", msg: "Masukkan email yang valid." });
      return;
    }

    setFpLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1100));
      setFpEmail("");
      setPopup({
        type: "success",
        msg: "Link reset password telah dikirim ke email kamu. Link berlaku 15 menit.",
      });
    } catch {
      setPopup({
        type: "error",
        msg: "Gagal mengirim email reset password. Silakan coba lagi.",
      });
    } finally {
      setFpLoading(false);
    }
  }

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Syne:wght@700;800&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(10px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to { opacity:1; }
        }
        .field-anim { animation: fadeSlideUp 0.35s ease both; }
        .btn-glow:hover { box-shadow: 0 6px 24px rgba(22,163,74,0.35); }
        .btn-glow:active { transform: scale(0.97); }
        .slide-dot { transition: all 0.3s; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
      `}</style>

      <PopupModal popup={popup} onClose={() => setPopup(null)} />

      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* NEW: panel kiri sama seperti login lain */}
        <div
          style={{
            width: "58%",
            position: "relative",
            flexShrink: 0,
            borderTopRightRadius: "50px",
            borderBottomRightRadius: "50px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "100%",
              width: `${SLIDE_IMGS.length * 100}%`,
              transform: `translateX(-${slideIdx * 100}%)`,
              transition: "transform 1.2s ease-in-out",
            }}
          >
            {SLIDE_IMGS.map((img, i) => (
              <div
                key={i}
                style={{
                  width: `${100 / SLIDE_IMGS.length}%`,
                  height: "100%",
                  flexShrink: 0,
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,30,10,0.75) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
              padding: "32px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(28px,4vw,40px)",
                fontWeight: 800,
                marginBottom: "10px",
                lineHeight: 1.1,
                whiteSpace: "pre-line",
              }}
            >
              {isSignUp ? "Bergabung\nSekarang!" : "Selamat\nDatang Kembali!"}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                maxWidth: "260px",
                lineHeight: 1.6,
              }}
            >
              {isSignUp
                ? "Daftarkan akun mitra dan kelola lapanganmu"
                : "Masuk dan kelola booking lapanganmu"}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {SLIDE_IMGS.map((_, i) => (
              <div
                key={i}
                className="slide-dot"
                style={{
                  width: i === slideIdx ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "99px",
                  background: i === slideIdx ? "#22c55e" : "rgba(255,255,255,0.4)",
                }}
                onClick={() => setSlideIdx(i)}
              />
            ))}
          </div>
        </div>

        {/* NEW: panel kanan */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            padding: "32px 36px",
            overflowY: isSignUp ? "auto" : "hidden",
            scrollBehavior: "smooth",
          }}
        >
          {showForgot ? (
            <div style={{ animation: "fadeSlideUp 0.4s both" }}>
              <button
                onClick={() => setShowForgot(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Kembali ke Login
              </button>

              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: "6px",
                }}
              >
                Reset Password
              </h2>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>
                Masukkan email akunmu. Kami kirim link reset yang berlaku 15 menit.
              </p>

              <Field
                label="Email"
                type="email"
                placeholder="Masukkan email kamu"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                maxLength={254}
                autoComplete="email"
              />

              <button
                onClick={handleForgotPassword}
                disabled={fpLoading}
                className="btn-glow"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: fpLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: fpLoading ? 0.7 : 1,
                  transition: "all 0.2s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {fpLoading ? (
                  <>
                    <Spin /> Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </div>
          ) : (
            <div style={{ animation: "fadeSlideUp 0.4s both" }} key={isSignUp ? "reg" : "log"}>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: "4px",
                }}
              >
                {isSignUp ? "Buat Akun Mitra" : "Masuk ke Akun Mitra"}
              </h2>
              <p style={{ fontSize: "12.5px", color: "#555", marginBottom: "18px" }}>
                {isSignUp ? "Isi data mitra dengan benar" : "Masukkan email dan password kamu"}
              </p>

              {isLocked ? (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#dc2626",
                    marginBottom: "14px",
                  }}
                >
                  🔒 Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam{" "}
                  <strong>
                    {Math.floor(countdown / 60)}:
                    {String(countdown % 60).padStart(2, "0")}
                  </strong>
                </div>
              ) : null}

              {/* NEW: form register mitra */}
              {isSignUp ? (
                <>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#111", marginBottom: "10px" }}>
                    Informasi Akun
                  </h3>

                  <div className="field-anim" style={{ animationDelay: "0ms" }}>
                    <Field
                      label="Nama Lengkap"
                      placeholder="Nama lengkap"
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      maxLength={50}
                      error={rErrors.name}
                      autoComplete="name"
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "40ms" }}>
                    <div style={{ marginBottom: rErrors.phone ? "4px" : "14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#ffffff",
                          border: rErrors.phone ? "1px solid #ef4444" : "1px solid #d1d5db",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 14px",
                            background: "#f9fafb",
                            borderRight: "1px solid #e5e7eb",
                            fontSize: "13.5px",
                            fontWeight: 600,
                            color: "#374151",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          +62
                        </div>

                        <input
                          type="tel"
                          value={rPhone}
                          onChange={(e) => setRPhone(e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={13}
                          autoComplete="tel"
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            padding: "11px 14px",
                            fontSize: "13.5px",
                            color: "#1a1a1a",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>

                      {rErrors.phone ? (
                        <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px", marginBottom: "10px", paddingLeft: "4px" }}>
                          {rErrors.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="field-anim" style={{ animationDelay: "80ms" }}>
                    <Field
                      label="Email"
                      type="email"
                      placeholder="Email"
                      value={rEmail}
                      onChange={(e) => setREmail(e.target.value)}
                      maxLength={254}
                      error={rErrors.email}
                      autoComplete="email"
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "120ms" }}>
                    <Field
                      label="Password"
                      type={rShowP ? "text" : "password"}
                      placeholder="Password (min. 8 karakter)"
                      value={rPass}
                      onChange={(e) => setRPass(e.target.value)}
                      maxLength={128}
                      error={rErrors.pass}
                      autoComplete="new-password"
                      right={
                        <span onClick={() => setRShowP(!rShowP)}>
                          <EyeIcon open={rShowP} />
                        </span>
                      }
                    />

                    {rPass ? (
                      <div style={{ marginBottom: "10px", marginTop: "-6px" }}>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: "3px",
                                borderRadius: "99px",
                                background: i < strength.score ? strength.color : "rgba(0,0,0,0.12)",
                                transition: "background 0.3s",
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: "11px", color: "#555" }}>
                          Kekuatan:{" "}
                          <strong style={{ color: strength.color }}>{strength.label}</strong>
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                          {[
                            { ok: rPass.length >= 8, label: "8+ karakter" },
                            { ok: /[A-Z]/.test(rPass), label: "Huruf besar" },
                            { ok: /[0-9]/.test(rPass), label: "Angka" },
                            { ok: /[^A-Za-z0-9]/.test(rPass), label: "Simbol" },
                          ].map(({ ok, label }) => (
                            <span
                              key={label}
                              style={{
                                fontSize: "10.5px",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                background: ok ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.07)",
                                color: ok ? "#15803d" : "#777",
                                border: `1px solid ${
                                  ok ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.1)"
                                }`,
                                transition: "all 0.2s",
                              }}
                            >
                              {ok ? "✓" : "○"} {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="field-anim" style={{ animationDelay: "160ms" }}>
                    <Field
                      label="Konfirmasi Password"
                      type={rShow2 ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      value={rPass2}
                      onChange={(e) => setRPass2(e.target.value)}
                      maxLength={128}
                      error={rErrors.pass2}
                      autoComplete="new-password"
                      right={
                        <span onClick={() => setRShow2(!rShow2)}>
                          <EyeIcon open={rShow2} />
                        </span>
                      }
                    />
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#111", marginTop: "10px", marginBottom: "10px" }}>
                    Informasi Usaha
                  </h3>

                  <div className="field-anim" style={{ animationDelay: "200ms" }}>
                    <Field
                      label="Nama Usaha/Lapangan"
                      placeholder="Nama usaha/lapangan"
                      value={rBusinessName}
                      onChange={(e) => setRBusinessName(e.target.value)}
                      maxLength={80}
                      error={rErrors.businessName}
                      autoComplete="organization"
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "240ms" }}>
                    <SelectField
                      label="Jenis Lapangan"
                      value={rFieldType}
                      onChange={(e) => setRFieldType(e.target.value)}
                      error={rErrors.fieldType}
                    >
                      <option value="">Pilih jenis lapangan</option>
                      <option value="futsal">Futsal</option>
                      <option value="minisoccer">Mini Soccer</option>
                      <option value="badminton">Badminton</option>
                      <option value="basket">Basket</option>
                      <option value="voli">Voli</option>
                      <option value="tenis">Tenis</option>
                      <option value="lainnya">Lainnya</option>
                    </SelectField>
                  </div>

                  <div className="field-anim" style={{ animationDelay: "280ms" }}>
                    <TextareaField
                      label="Alamat Lengkap"
                      placeholder="Alamat lengkap lapangan"
                      value={rAddress}
                      onChange={(e) => setRAddress(e.target.value)}
                      error={rErrors.address}
                      rows={3}
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "320ms" }}>
                    <Field
                      label="Kota/Kabupaten"
                      placeholder="Kota/Kabupaten"
                      value={rCity}
                      onChange={(e) => setRCity(e.target.value)}
                      maxLength={60}
                      error={rErrors.city}
                      autoComplete="address-level2"
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "360ms" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <Field
                          label="Jam Buka"
                          type="time"
                          value={rOpenTime}
                          onChange={(e) => setROpenTime(e.target.value)}
                          error={rErrors.openTime}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Field
                          label="Jam Tutup"
                          type="time"
                          value={rCloseTime}
                          onChange={(e) => setRCloseTime(e.target.value)}
                          error={rErrors.closeTime}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="field-anim" style={{ animationDelay: "400ms" }}>
                    <Field
                      label="Jumlah Lapangan"
                      type="number"
                      placeholder="Contoh: 3"
                      value={rFieldCount}
                      onChange={(e) => setRFieldCount(e.target.value)}
                      maxLength={3}
                      error={rErrors.fieldCount}
                      autoComplete="off"
                    />
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#111", marginTop: "10px", marginBottom: "10px" }}>
                    Dokumen
                  </h3>

                  <div className="field-anim" style={{ animationDelay: "440ms" }}>
                    <FileField
                      label="Upload Foto Lapangan"
                      accept="image/*"
                      onChange={(e) => setRPhotoLapangan(e.target.files?.[0] || null)}
                      error={rErrors.photo}
                      fileName={rPhotoLapangan?.name}
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "480ms" }}>
                    <FileField
                      label="Upload KTP Pemilik"
                      accept="image/*,.pdf"
                      onChange={(e) => setRKtpPemilik(e.target.files?.[0] || null)}
                      error={rErrors.ktp}
                      fileName={rKtpPemilik?.name}
                    />
                  </div>

                  <div className="field-anim" style={{ animationDelay: "520ms" }}>
                    <div style={{ marginBottom: "14px" }}>
                      <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token || "")}
                        onExpired={() => setCaptchaToken("")}
                        onErrored={() => setCaptchaToken("")}
                      />
                      {rErrors.captcha ? (
                        <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "8px" }}>
                          {rErrors.captcha}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="field-anim" style={{ animationDelay: "560ms" }}>
                    <CheckField
                      checked={rAgreeData}
                      onChange={(e) => setRAgreeData(e.target.checked)}
                      label="Saya menyatakan data yang diberikan benar"
                      error={rErrors.agreeData}
                    />
                    <CheckField
                      checked={rAgreeTerms}
                      onChange={(e) => setRAgreeTerms(e.target.checked)}
                      label="Saya menyetujui Syarat & Ketentuan"
                      error={rErrors.agreeTerms}
                    />
                    <CheckField
                      checked={rAgreePrivacy}
                      onChange={(e) => setRAgreePrivacy(e.target.checked)}
                      label="Saya menyetujui Kebijakan Privasi"
                      error={rErrors.agreePrivacy}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="field-anim"
                    style={{ animationDelay: "0ms" }}
                  >
                    <Field
                      label="Email"
                      type="email"
                      placeholder="Email"
                      value={lEmail}
                      onChange={(e) => setLEmail(e.target.value)}
                      maxLength={254}
                      error={lErrors.email}
                      autoComplete="email"
                    />
                  </div>

                  <div
                    className="field-anim"
                    style={{ animationDelay: "40ms" }}
                  >
                    <Field
                      label="Password"
                      type={lShowP ? "text" : "password"}
                      placeholder="Password"
                      value={lPass}
                      onChange={(e) => setLPass(e.target.value)}
                      maxLength={128}
                      error={lErrors.pass}
                      autoComplete="current-password"
                      right={
                        <span onClick={() => setLShowP(!lShowP)}>
                          <EyeIcon open={lShowP} />
                        </span>
                      }
                    />
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      marginBottom: "14px",
                      marginTop: "-6px",
                    }}
                  >
                    <button
                      onClick={() => setShowForgot(true)}
                      style={{
                        fontSize: "12px",
                        color: "#15803d",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Lupa password?
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={isSignUp ? handleRegister : handleLogin}
                disabled={(isSignUp ? rLoading : lLoading) || isLocked}
                className="btn-glow"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: isLocked
                    ? "rgba(100,100,100,0.5)"
                    : "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor:
                    (isSignUp ? rLoading : lLoading) || isLocked
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: (isSignUp ? rLoading : lLoading) ? 0.75 : 1,
                  transition: "all 0.2s",
                  marginBottom: "14px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {(isSignUp ? rLoading : lLoading) ? (
                  <>
                    <Spin /> {isSignUp ? "Mendaftarkan..." : "Memproses..."}
                  </>
                ) : isLocked ? (
                  `🔒 Terkunci (${Math.floor(countdown / 60)}:${String(
                    countdown % 60
                  ).padStart(2, "0")})`
                ) : isSignUp ? (
                  "Daftar Sebagai Mitra"
                ) : (
                  "Masuk Sebagai Mitra"
                )}
              </button>

              {!isSignUp ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.15)" }} />
                    <span style={{ fontSize: "12px", color: "#666" }}>atau</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.15)" }} />
                  </div>

                  <button
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      padding: "10px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.75)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#333",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "all 0.2s",
                    }}
                    onClick={() => {
                      window.location.href = `${API_BASE}/api/v1/auth/google`;
                    }}
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      style={{ width: "18px" }}
                      alt="Google"
                    />
                    Masuk dengan Google
                  </button>
                </>
              ) : null}

              <div
                style={{
                  textAlign: "center",
                  marginTop: "16px",
                  fontSize: "13px",
                  color: "#444",
                }}
              >
                {isSignUp ? (
                  <>
                    Sudah punya akun mitra?{" "}
                    <span
                      onClick={() => switchMode(false)}
                      style={{
                        color: "#16a34a",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Login sekarang
                    </span>
                  </>
                ) : (
                  <>
                    Belum punya akun mitra?{" "}
                    <span
                      onClick={() => switchMode(true)}
                      style={{
                        color: "#16a34a",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Daftar sekarang
                    </span>
                  </>
                )}
              </div>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.4)",
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2L3 7v5c0 5 4 9.3 9 10.3C17 21.3 21 17 21 12V7L12 2z" />
                </svg>
                Data terenkripsi & tersimpan aman
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}