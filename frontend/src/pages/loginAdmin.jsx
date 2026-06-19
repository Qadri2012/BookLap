// NEW: LoginAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import img1 from "../assets/gambar1.png";
import img2 from "../assets/gambar2.png";
import img3 from "../assets/gambar3.png";
import img4 from "../assets/gambar4.png";
import { useAuth } from "../context/AuthContext";

const SLIDE_IMGS = [img1, img2, img3, img4];

// NEW: API base
const API_BASE = import.meta.env.VITE_API_URL;

const REGISTER_ADMIN_ENDPOINT = "/auth/register-admin";
const REQUEST_ADMIN_LOGIN_OTP_ENDPOINT = "/auth/request-admin-login-otp";
const VERIFY_ADMIN_LOGIN_OTP_ENDPOINT = "/auth/verify-admin-login-otp";
const VERIFY_ADMIN_OTP_ENDPOINT = "/auth/verify-admin-otp"; // sesuaikan kalau route kamu berbeda
// NEW
const CHECK_ADMIN_IDENTITY_ENDPOINT = "/auth/check-admin-identity";

const authApi = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
});

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

function Field({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  error,
  right,
  autoComplete,
  inputMode,
  readOnly = false,
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
          background: "#fff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
          transition: "border 0.2s",
          overflow: "hidden",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          readOnly={readOnly}
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

// NEW: select reusable
function SelectField({ label, value, onChange, error, children }) {
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
          background: "#fff",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "12px",
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

// NEW: checkbox reusable
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

// NEW: popup modal umum
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

        <p style={{ fontSize: "13.5px", color: "#555", lineHeight: 1.6 }}>
          {popup.msg}
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: "22px",
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
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}



// NEW: helper validasi
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };

  const checks = [
    pw.length >= 12,
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

function validatePassword(password = "", compareTo = "") {
  const errors = [];
  if (password.length < 12) errors.push("Minimal 12 karakter");
  if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf besar");
  if (!/[0-9]/.test(password)) errors.push("Minimal 1 angka");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Minimal 1 simbol (!@#$...)");
  if (password.length > 128) errors.push("Maksimal 128 karakter");

  const compare = String(compareTo || "").trim().toLowerCase();
  if (compare && password.toLowerCase().includes(compare)) {
    errors.push("Password tidak boleh mengandung nama/email");
  }

  return errors;
}

function getEmailError(value = "") {
  const v = String(value).trim().toLowerCase();
  if (!v) return "Email wajib diisi";
  if (!/\S+@\S+\.\S+/.test(v)) return "Format email tidak valid";
  if (v.length > 254) return "Email terlalu panjang";
  return "";
}

function getInviteCodeError(value = "") {
  const v = String(value).trim().toUpperCase();
  if (!v) return "Kode undangan wajib diisi";
  if (!/^[A-Z0-9-]{8,32}$/.test(v)) return "Format kode undangan tidak valid";
  return "";
}

function getPhoneError(value = "") {
  const v = String(value).trim();
  if (!v) return "Nomor HP wajib diisi";
  if (!/^[0-9+\-\s]{8,20}$/.test(v)) return "Format nomor tidak valid";
  return "";
}

function getIdentityError(value = "") {
  const v = String(value).trim();
  if (!v) return "Nomor identitas wajib diisi";
  if (!/^[A-Za-z0-9\-\/]{4,30}$/.test(v)) {
    return "Format nomor identitas tidak valid";
  }
  return "";
}

function getOtpError(value = "") {
  const v = String(value).trim();
  if (!v) return "OTP wajib diisi";
  if (!/^\d{6}$/.test(v)) return "OTP harus 6 digit";
  return "";
}

// NEW: popup OTP email untuk registrasi admin
function OtpPopup({
  open,
  email,
  otpValue,
  setOtpValue,
  onClose,
  onVerify,
  loading,
  message,
}) {
  if (!open) return null;

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
        zIndex: 10000,
        animation: "fadeIn 0.2s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: 800,
            color: "#111",
            marginBottom: "8px",
          }}
        >
          Verifikasi OTP Email
        </h3>

        <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
          Silakan masukkan 6 digit OTP yang telah dikirim ke email{" "}
          <strong>{email}</strong>.
        </p>

        <div style={{ marginTop: "16px" }}>
          <Field
            label="Kode OTP"
            type="text"
            placeholder="6 digit OTP"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/[^\d]/g, ""))}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            error={message}
          />
        </div>

        <button
          onClick={onVerify}
          disabled={loading}
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
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: loading ? 0.75 : 1,
            marginTop: "8px",
          }}
        >
          {loading ? "Verifikasi..." : "Verifikasi OTP"}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            borderRadius: "12px",
            background: "#f3f4f6",
            color: "#111",
            fontWeight: 700,
            fontSize: "14px",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function LoginOtpPopup({
  open,
  email,
  otpValue,
  setOtpValue,
  onClose,
  onVerify,
  loading,
  message,
}) {
  if (!open) return null;

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
        zIndex: 10000,
        animation: "fadeIn 0.2s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: 800,
            color: "#111",
            marginBottom: "8px",
          }}
        >
          Verifikasi OTP Login
        </h3>

        <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
          Silakan masukkan 6 digit OTP yang telah dikirim ke email{" "}
          <strong>{email}</strong>.
        </p>

        <div style={{ marginTop: "16px" }}>
          <Field
            label="Kode OTP"
            type="text"
            placeholder="6 digit OTP"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/[^\d]/g, ""))}
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            error={message}
          />
        </div>

        <button
          onClick={onVerify}
          disabled={loading}
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
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: loading ? 0.75 : 1,
            marginTop: "8px",
          }}
        >
          {loading ? "Verifikasi..." : "Verifikasi OTP"}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            borderRadius: "12px",
            background: "#f3f4f6",
            color: "#111",
            fontWeight: 700,
            fontSize: "14px",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const role = "admin";

  const [popup, setPopup] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  // NEW: login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  const [showLoginOtpPopup, setShowLoginOtpPopup] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpMessage, setLoginOtpMessage] = useState("");
  const [loginOtpLoading, setLoginOtpLoading] = useState(false);
  const [loginPendingEmail, setLoginPendingEmail] = useState("");

  // NEW: register states
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rPassword2, setRPassword2] = useState("");
  const [rInviteCode, setRInviteCode] = useState("");
  // const [rJabatanDivisi, setRJabatanDivisi] = useState("");
  const [rLevelAkses, setRLevelAkses] = useState("");
  const [rNomorIdentitas, setRNomorIdentitas] = useState("");
  const [rShowPassword, setRShowPassword] = useState(false);
  const [rShowPassword2, setRShowPassword2] = useState(false);
  const [rErrors, setRErrors] = useState({});
  const [rLoading, setRLoading] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);

  // NEW: persetujuan & captcha
  const [agreeData, setAgreeData] = useState(false);
  const [agreeAccess, setAgreeAccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  // NEW: OTP popup
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // NEW: lockout login
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const strength = useMemo(() => getPasswordStrength(rPassword), [rPassword]);

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

  function switchMode(signup) {
    setIsSignUp(signup);
    setPopup(null);
    setLoginErrors({});
    setRErrors({});
    setShowOtpPopup(false);
    setOtpValue("");
    setOtpMessage("");

    setLoginEmail("");
    setLoginPassword("");
    setLoginOtp("");
    setLoginShowPassword(false);

    setRName("");
    setRPhone("");
    setREmail("");
    setRPassword("");
    setRPassword2("");
    setRInviteCode("");
    setRLevelAkses("");
    setRNomorIdentitas("");
    setRShowPassword(false);
    setRShowPassword2(false);

    setAgreeData(false);
    setAgreeAccess(false);
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setCaptchaToken("");

    setShowLoginOtpPopup(false);
    setLoginOtpCode("");
    setLoginOtpMessage("");
    setLoginPendingEmail("");
    setLoginOtpLoading(false);
  }

  function validateLogin() {
    const e = {};
    const emailErr = getEmailError(loginEmail);
    if (emailErr) e.email = emailErr;

    if (!loginPassword) e.password = "Password wajib diisi";

    return e;
  }

 function validateRegister() {
  const e = {};

  const name = String(rName).trim();
  if (!name) e.name = "Nama admin wajib diisi";
  else if (name.length < 3) e.name = "Nama minimal 3 karakter";
  else if (name.length > 60) e.name = "Nama maksimal 60 karakter";

  const phoneErr = getPhoneError(rPhone);
  if (phoneErr) e.phone = phoneErr;

  const emailErr = getEmailError(rEmail);
  if (emailErr) e.email = emailErr;

  const pwErrs = validatePassword(rPassword, `${rName} ${rEmail}`);
  if (pwErrs.length) e.password = pwErrs[0];

  if (!rPassword2) e.password2 = "Konfirmasi password wajib diisi";
  else if (rPassword !== rPassword2) e.password2 = "Password tidak cocok";

  if (!rInviteCode) {
    e.inviteCode = "Kode undangan belum terisi. Cek NIP dulu.";
  }

  const idErr = getIdentityError(rNomorIdentitas);
  if (idErr) e.nomorIdentitas = idErr;

  if (!captchaToken) e.captcha = "Silakan selesaikan CAPTCHA";

  if (!agreeData) e.agreeData = "Harap menyatakan data yang diberikan benar";
  if (!agreeAccess) e.agreeAccess = "Harap menyetujui kebijakan akses admin";
  if (!agreeTerms) e.agreeTerms = "Harap menyetujui Syarat & Ketentuan";
  if (!agreePrivacy) e.agreePrivacy = "Harap menyetujui Kebijakan Privasi";

  return e;
}

  async function handleLogin(ev) {
    ev.preventDefault();

    const errs = validateLogin();
    if (Object.keys(errs).length) {
      setLoginErrors(errs);
      return;
    }

    setLoginErrors({});
    setLoginLoading(true);

    try {
      const { data } = await authApi.post(
        REQUEST_ADMIN_LOGIN_OTP_ENDPOINT,
        {
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }
      );

      setLoginPendingEmail(loginEmail.trim().toLowerCase());
      setShowLoginOtpPopup(true);
      setLoginOtpCode("");
      setLoginOtpMessage("");

      setPopup({
        type: "success",
        msg: data?.message || "OTP login telah dikirim ke email admin.",
      });
    } catch (err) {
      setPopup({
        type: "error",
        msg:
          err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "Gagal meminta OTP login.",
      });
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(ev) {
    ev.preventDefault();

    const errs = validateRegister();
    if (Object.keys(errs).length) {
      setRErrors(errs);
      return;
    }

    setRErrors({});
    setRLoading(true);

    // NEW: LoginAdmin.jsx -> handleRegister()
// REPLACE seluruh isi try { ... } lama dengan blok ini
try {
  const cleanPhone = rPhone.replace(/\D/g, "").replace(/^0+/, "");
  const fullPhone = `62${cleanPhone}`;

  const { data } = await authApi.post(REGISTER_ADMIN_ENDPOINT, {
    role,
    nama: rName.trim(),
    no_hp: fullPhone,
    email: rEmail.trim().toLowerCase(),
    password: rPassword,
    inviteCode: rInviteCode.trim().toUpperCase(),
    nomor_identitas: rNomorIdentitas.trim(),
    captchaToken,
    agreeData,
    agreeAccess,
    agreeTerms,
    agreePrivacy,
  });

  const emailClean = rEmail.trim().toLowerCase();

  // Tampilkan popup sukses dulu
  setPopup({
    type: "success",
    msg: data?.message || "Registrasi berhasil. OTP telah dikirim ke email Anda.",
  });

  // Baru buka OTP popup setelah sedikit jeda
  setTimeout(() => {
    setRegisteredEmail(emailClean);
    setShowOtpPopup(true);
    setOtpValue("");
    setOtpMessage("");
  }, 500);
} catch (err) {
  setPopup({
    type: "error",
    msg:
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Registrasi admin gagal. Terjadi kesalahan pada server.",
  });
} finally {
  setRLoading(false);
}
  }

  async function handleVerifyOtp() {
    if (!otpValue || !/^\d{6}$/.test(otpValue)) {
      setOtpMessage("OTP harus 6 digit");
      return;
    }

    setOtpLoading(true);
    setOtpMessage("");

    try {
      const { data } = await authApi.post(VERIFY_ADMIN_OTP_ENDPOINT, {
        email: registeredEmail,
        otpCode: otpValue,
      });

      setShowOtpPopup(false);
      setOtpValue("");
      setRegisteredEmail("");

      setPopup({
        type: "success",
        msg:
          data?.message ||
          "OTP berhasil diverifikasi. Silakan login dengan akun admin Anda.",
      });

      setIsSignUp(false);
      setLoginEmail(rEmail.trim().toLowerCase());
      setLoginPassword("");
      setLoginOtp("");
    } catch (err) {
      setOtpMessage(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "OTP tidak valid"
      );
    } finally {
      setOtpLoading(false);
    }
  }
  async function handleVerifyLoginOtp() {
    if (!loginOtpCode || !/^\d{6}$/.test(loginOtpCode)) {
      setLoginOtpMessage("OTP harus 6 digit");
      return;
    }

    setLoginOtpLoading(true);
    setLoginOtpMessage("");

    try {
      const { data } = await authApi.post(
        VERIFY_ADMIN_LOGIN_OTP_ENDPOINT,
        {
          email: loginPendingEmail,
          otpCode: loginOtpCode,
        }
      );

      setShowLoginOtpPopup(false);
      setLoginOtpCode("");
      setLoginPendingEmail("");

      authLogin(data.user, data.token);

      setPopup({
        type: "success",
        msg: data?.message || "Login admin berhasil.",
      });

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 900);
    } catch (err) {
      setLoginOtpMessage(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "OTP login tidak valid"
      );
    } finally {
      setLoginOtpLoading(false);
    }
  }

    // NEW: cek NIP lalu auto-fill kode undangan
  async function handleCheckAdminIdentity() {
    const nip = rNomorIdentitas.trim();

    if (!nip) {
      setRErrors((prev) => ({
        ...prev,
        nomorIdentitas: "Nomor identitas wajib diisi",
      }));
      return;
    }

    setIdentityLoading(true);

    try {
      const { data } = await authApi.post(CHECK_ADMIN_IDENTITY_ENDPOINT, {
        nomor_identitas: nip,
      });

      setRInviteCode(data?.inviteCode || "");
      setRLevelAkses(data?.level_akses || "");
      setREmail(data?.adminMaster?.email || "");

      setRErrors((prev) => ({
        ...prev,
        inviteCode: "",
        nomorIdentitas: "",
      }));
    } catch (err) {
      setRInviteCode("");
      setRErrors((prev) => ({
        ...prev,
        inviteCode:
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Kode undangan tidak ditemukan untuk NIP ini",
      }));
    } finally {
      setIdentityLoading(false);
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

      <OtpPopup
        open={showOtpPopup}
        email={registeredEmail}
        otpValue={otpValue}
        setOtpValue={setOtpValue}
        onClose={() => {
          setShowOtpPopup(false);
          setOtpValue("");
          setOtpMessage("");
        }}
        onVerify={handleVerifyOtp}
        loading={otpLoading}
        message={otpMessage}
      />

      <LoginOtpPopup
        open={showLoginOtpPopup}
        email={loginPendingEmail}
        otpValue={loginOtpCode}
        setOtpValue={setLoginOtpCode}
        onClose={() => {
          setShowLoginOtpPopup(false);
          setLoginOtpCode("");
          setLoginOtpMessage("");
        }}
        onVerify={handleVerifyLoginOtp}
        loading={loginOtpLoading}
        message={loginOtpMessage}
      />

      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "#fff",
        }}
      >
        {/* NEW: panel kiri */}
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
              {isSignUp ? "Buat Akun\nAdmin" : "Selamat\nDatang Admin"}
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
                ? "Registrasi admin memakai invite code, OTP email, dan status pending."
                : "Masuk ke dashboard admin dengan aman."}
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
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            padding: "32px 36px",
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
        >
          <div style={{ animation: "fadeSlideUp 0.4s both" }}>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                color: "#111",
                marginBottom: "4px",
              }}
            >
              {isSignUp ? "Buat Akun Admin" : "Masuk Admin"}
            </h2>

            <p style={{ fontSize: "12.5px", color: "#555", marginBottom: "18px" }}>
              {isSignUp
                ? "Isi data admin dengan benar, NIP akan dicek terlebih dahulu lalu kode undangan terisi otomatis dan dilanjutkan verifikasi OTP email."
                : "Masukkan email admin, password, dan OTP 2FA."}
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

            {isSignUp ? (
              <>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111",
                    marginBottom: "10px",
                  }}
                >
                  Identitas Dasar
                </h3>

                <div className="field-anim" style={{ animationDelay: "0ms" }}>
                  <Field
                    label="Nama Lengkap"
                    placeholder="Nama lengkap admin"
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                    maxLength={60}
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
                        background: "#fff",
                        border: rErrors.phone
                          ? "1px solid #ef4444"
                          : "1px solid #d1d5db",
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
                        onChange={(e) =>
                          setRPhone(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        maxLength={13}
                        autoComplete="tel"
                        placeholder="Nomor HP"
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
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: "11.5px",
                          marginTop: "4px",
                          marginBottom: "10px",
                          paddingLeft: "4px",
                        }}
                      >
                        {rErrors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="field-anim" style={{ animationDelay: "80ms" }}>
                  <Field
                    label="Email Admin"
                    type="email"
                    placeholder="booklapadmin@gmail.com"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    maxLength={254}
                    error={rErrors.email}
                    autoComplete="email"
                  />
                </div>

                <div className="field-anim" style={{ animationDelay: "120ms" }}>
                  <Field
                    label="Nomor Identitas"
                    placeholder="NIP / ID Karyawan"
                    value={rNomorIdentitas}
                    onChange={(e) => {
                      setRNomorIdentitas(e.target.value.replace(/\s/g, ""));
                      setRInviteCode("");
                    }}
                    onBlur={handleCheckAdminIdentity}
                    maxLength={30}
                    error={rErrors.nomorIdentitas}
                    autoComplete="off"
                  />
                </div>

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  Keamanan Akun
                </h3>

                <div className="field-anim" style={{ animationDelay: "160ms" }}>
                  <Field
                    label="Password"
                    type={rShowPassword ? "text" : "password"}
                    placeholder="Password (min. 12 karakter)"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                    maxLength={128}
                    error={rErrors.password}
                    autoComplete="new-password"
                    right={
                      <span onClick={() => setRShowPassword(!rShowPassword)}>
                        <EyeIcon open={rShowPassword} />
                      </span>
                    }
                  />

                  {rPassword ? (
                    <div style={{ marginBottom: "10px", marginTop: "-6px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: "3px",
                              borderRadius: "99px",
                              background:
                                i < strength.score ? strength.color : "rgba(0,0,0,0.12)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>

                      <p style={{ fontSize: "11px", color: "#555" }}>
                        Kekuatan:{" "}
                        <strong style={{ color: strength.color }}>{strength.label}</strong>
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          marginTop: "6px",
                        }}
                      >
                        {[
                          { ok: rPassword.length >= 12, label: "12+ karakter" },
                          { ok: /[A-Z]/.test(rPassword), label: "Huruf besar" },
                          { ok: /[0-9]/.test(rPassword), label: "Angka" },
                          { ok: /[^A-Za-z0-9]/.test(rPassword), label: "Simbol" },
                        ].map(({ ok, label }) => (
                          <span
                            key={label}
                            style={{
                              fontSize: "10.5px",
                              padding: "2px 8px",
                              borderRadius: "99px",
                              background: ok
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(0,0,0,0.07)",
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

                <div className="field-anim" style={{ animationDelay: "200ms" }}>
                  <Field
                    label="Konfirmasi Password"
                    type={rShowPassword2 ? "text" : "password"}
                    placeholder="Konfirmasi password"
                    value={rPassword2}
                    onChange={(e) => setRPassword2(e.target.value)}
                    maxLength={128}
                    error={rErrors.password2}
                    autoComplete="new-password"
                    right={
                      <span onClick={() => setRShowPassword2(!rShowPassword2)}>
                        <EyeIcon open={rShowPassword2} />
                      </span>
                    }
                  />
                </div>

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  Verifikasi Khusus Admin
                </h3>

                <div className="field-anim" style={{ animationDelay: "240ms" }}>
                  <Field
                    label="Kode Undangan"
                    placeholder={identityLoading ? "Mencari kode..." : "Kode akan terisi otomatis"}
                    value={rInviteCode}
                    onChange={() => {}}
                    maxLength={32}
                    error={rErrors.inviteCode}
                    autoComplete="off"
                    readOnly
                  />
                </div>

                <div className="field-anim" style={{ animationDelay: "320ms" }}>
                </div>

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  Persetujuan
                </h3>

                <div className="field-anim" style={{ animationDelay: "360ms" }}>
                  <CheckField
                    checked={agreeData}
                    onChange={(e) => setAgreeData(e.target.checked)}
                    label="Saya menyatakan data yang diberikan benar"
                    error={rErrors.agreeData}
                  />
                  <CheckField
                    checked={agreeAccess}
                    onChange={(e) => setAgreeAccess(e.target.checked)}
                    label="Saya menyetujui kebijakan akses admin"
                    error={rErrors.agreeAccess}
                  />
                  <CheckField
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    label="Saya menyetujui Syarat & Ketentuan"
                    error={rErrors.agreeTerms}
                  />
                  <CheckField
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    label="Saya menyetujui Kebijakan Privasi"
                    error={rErrors.agreePrivacy}
                  />
                </div>

                <div className="field-anim" style={{ animationDelay: "400ms" }}>
                  <div style={{ marginBottom: "14px" }}>
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={(token) => setCaptchaToken(token || "")}
                      onExpired={() => setCaptchaToken("")}
                      onErrored={() => setCaptchaToken("")}
                    />
                    {rErrors.captcha ? (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: "11.5px",
                          marginTop: "8px",
                        }}
                      >
                        {rErrors.captcha}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={rLoading}
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
                    cursor: rLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: rLoading ? 0.75 : 1,
                    marginBottom: "14px",
                    marginTop: "10px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {rLoading ? (
                    <>
                      <Spin /> Mendaftarkan...
                    </>
                  ) : (
                    "Daftar Admin"
                  )}
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "16px",
                    fontSize: "13px",
                    color: "#444",
                  }}
                >
                  Sudah punya akun admin?{" "}
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
                </div>
              </>
            ) : (
              <>
                <div className="field-anim" style={{ animationDelay: "0ms" }}>
                  <Field
                    label="Email Admin"
                    type="email"
                    placeholder="booklapadmin@gmail.com"
                    value={loginEmail}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLoginEmail(v);
                      setLoginErrors((prev) => ({
                        ...prev,
                        email: v ? getEmailError(v) : "",
                      }));
                    }}
                    maxLength={254}
                    error={loginErrors.email}
                    autoComplete="email"
                  />
                </div>

                <div className="field-anim" style={{ animationDelay: "40ms" }}>
                  <Field
                    label="Password"
                    type={loginShowPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    maxLength={128}
                    error={loginErrors.password}
                    autoComplete="current-password"
                    right={
                      <span onClick={() => setLoginShowPassword(!loginShowPassword)}>
                        <EyeIcon open={loginShowPassword} />
                      </span>
                    }
                  />
                </div>

                <div className="field-anim" style={{ animationDelay: "80ms" }}>

                </div>

                <button
                  onClick={handleLogin}
                  disabled={loginLoading || isLocked}
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
                    cursor: loginLoading || isLocked ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: loginLoading ? 0.75 : 1,
                    transition: "all 0.2s",
                    marginBottom: "14px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {loginLoading ? (
                    <>
                      <Spin /> Memproses...
                    </>
                  ) : isLocked ? (
                    `🔒 Terkunci (${Math.floor(countdown / 60)}:${String(
                      countdown % 60
                    ).padStart(2, "0")})`
                  ) : (
                    "Masuk Admin"
                  )}
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "16px",
                    fontSize: "13px",
                    color: "#444",
                  }}
                >
                  Belum punya akun admin?{" "}
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
                </div>
              </>
            )}

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
              Data admin tersimpan aman
            </p>
          </div>
        </div>
      </div>
    </>
  );
}