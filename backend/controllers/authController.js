// controllers/authController.js
const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();



function waitSessionSave(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function normalizeE164(phone = "") {
  const raw = String(phone).trim().replace(/[^\d+]/g, "");

  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("62")) return `+${raw}`;
  if (raw.startsWith("0")) return `+62${raw.slice(1)}`;

  return `+${raw}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeWhatsAppNumber(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  return digits.startsWith("62") ? digits : `62${digits.replace(/^0+/, "")}`;
}

exports.sendOtp = async (req, res) => {
  try {
    const pending = req.session.pendingRegister;

    if (!pending) {
      return res.status(400).json({
        message: "Data registrasi belum ada. Silakan daftar ulang.",
        msg: "Data registrasi belum ada. Silakan daftar ulang.",
      });
    }

    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(500).json({
        message: "WHATSAPP_TOKEN atau WHATSAPP_PHONE_NUMBER_ID belum diisi",
        msg: "WHATSAPP_TOKEN atau WHATSAPP_PHONE_NUMBER_ID belum diisi",
      });
    }

    const otp = generateOtp();
    const to = normalizeWhatsAppNumber(pending.no_hp);

    req.session.pendingRegister.otp = otp;
    req.session.pendingRegister.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    req.session.pendingRegister.otpAttempts = 0;

    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    req.session.otpPhone = to;
    req.session.otpVerified = false;
    console.log("OTP:", otp);
    await waitSessionSave(req);

    return res.json({
      message: "Kode OTP telah dikirim ke WhatsApp",
      msg: "Kode OTP telah dikirim ke WhatsApp",
      phone: maskPhone(pending.no_hp),
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err.response?.data || err);
    return res.status(500).json({
      message: "Gagal mengirim OTP",
      msg: "Gagal mengirim OTP",
      error: err.response?.data?.error?.message || err.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const code = String(req.body.otp || "").trim();
    const pending = req.session.pendingRegister;

    if (!pending) {
      return res.status(400).json({
        message: "Sesi verifikasi tidak ditemukan",
        msg: "Sesi verifikasi tidak ditemukan",
      });
    }

    if (!pending.otp || !pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP belum dibuat. Silakan kirim ulang.",
        msg: "OTP belum dibuat. Silakan kirim ulang.",
      });
    }

    if (Date.now() > pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP sudah kedaluwarsa",
        msg: "OTP sudah kedaluwarsa",
      });
    }

    if (code !== pending.otp) {
      req.session.pendingRegister.otpAttempts =
        (req.session.pendingRegister.otpAttempts || 0) + 1;

      if (req.session.pendingRegister.otpAttempts >= 5) {
        req.session.pendingRegister = null;
      }

      await waitSessionSave(req);

      return res.status(400).json({
        message: "OTP salah",
        msg: "OTP salah",
      });
    }

    const existing = await User.findOne({ where: { email: pending.email } });
    if (existing) {
      req.session.pendingRegister = null;
      req.session.otpPhone = null;
      await waitSessionSave(req);

      return res.status(400).json({
        message: "Email sudah terdaftar",
        msg: "Email sudah terdaftar",
      });
    }

    const hashed = await bcrypt.hash(pending.password, 12);

    const user = await User.create({
      nama: pending.nama,
      no_hp: pending.no_hp,
      email: pending.email,
      password: hashed,
      role: "user",
    });

    req.session.pendingRegister = null;
    req.session.otpPhone = null;
    req.session.otpVerified = true;
    await waitSessionSave(req);

    return res.json({
      message: "Verifikasi berhasil. Silakan login.",
      msg: "Verifikasi berhasil. Silakan login.",
      user: {
        id: user.id,
        nama: user.nama,
        no_hp: user.no_hp,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      message: "Gagal verifikasi OTP",
      msg: "Gagal verifikasi OTP",
      error: err.message,
    });
  }
};

const VALID_ROLES = ["user", "mitra", "admin"];

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "15m" }
  );
}

function validatePasswordStrength(password, nama, email) {
  const pw = password || "";
  const name = (nama || "").trim().toLowerCase();
  const mail = (email || "").trim().toLowerCase();
  const emailPrefix = mail.includes("@") ? mail.split("@")[0] : "";

  if (pw.length < 8) {
    return "Password minimal 8 karakter";
  }

  if (!/[A-Z]/.test(pw)) {
    return "Password harus memiliki minimal 1 huruf besar";
  }

  if (!/[0-9]/.test(pw)) {
    return "Password harus memiliki minimal 1 angka";
  }

  if (!/[^A-Za-z0-9]/.test(pw)) {
    return "Password harus memiliki minimal 1 simbol";
  }

  if (name && pw.toLowerCase().includes(name)) {
    return "Password tidak boleh mengandung nama";
  }

  if (emailPrefix && pw.toLowerCase().includes(emailPrefix)) {
    return "Password tidak boleh mengandung email";
  }

  return null;
}


function validateRegisterFields({ nama, no_hp, email, password }) {
  const name = (nama || "").trim();
  const phone = (no_hp || "").trim();
  const mail = (email || "").trim().toLowerCase();
  const pw = password || "";

  if (!name) return "Nama wajib diisi";
  if (name.length < 3) return "Nama minimal 3 karakter";
  if (name.length > 50) return "Nama maksimal 50 karakter";
  // if (!/^[A-Za-z0-9_-]+$/.test(name)) {
  //   return "Nama hanya boleh huruf, angka, underscore, dan strip";
  // }

  if (!phone) return "Nomor HP wajib diisi";
  if (!/^[0-9+\-\s]{8,20}$/.test(phone)) {
    return "Format nomor tidak valid";
  }

  if (!mail) return "Email wajib diisi";
  if (!/\S+@\S+\.\S+/.test(mail)) {
    return "Format email tidak valid";
  }
  if (mail.length > 254) return "Email terlalu panjang";

  if (!pw) return "Password wajib diisi";
  if (pw.length < 8) return "Password minimal 8 karakter";
  if (pw.length > 128) return "Password maksimal 128 karakter";
  if (!/[A-Z]/.test(pw)) return "Password harus memiliki minimal 1 huruf besar";
  if (!/[0-9]/.test(pw)) return "Password harus memiliki minimal 1 angka";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password harus memiliki minimal 1 simbol";

  const emailPrefix = mail.split("@")[0] || "";
  if (name && pw.toLowerCase().includes(name.toLowerCase())) {
    return "Password tidak boleh mengandung nama";
  }
  if (emailPrefix && pw.toLowerCase().includes(emailPrefix)) {
    return "Password tidak boleh mengandung email";
  }

  return null;
}

exports.getCaptcha = (req, res) => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;

  req.session.captchaAnswer = String(a + b);

  return res.json({
    question: `Berapa hasil ${a} + ${b} ?`,
  });
};

function maskPhone(phone = "") {
  const s = String(phone);
  if (s.length <= 6) return s;
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { nama, no_hp, email, password } = req.body;

    const namaClean = (nama || "").trim();
    const noHpClean = normalizeE164(no_hp || "");
    const emailClean = (email || "").trim().toLowerCase();
    const passwordClean = password || "";
    const captchaAnswer = String(req.body.captchaAnswer || "").trim();

    if (!namaClean || !noHpClean || !emailClean || !passwordClean) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
        msg: "Semua field wajib diisi",
      });
    }

    const validationError = validateRegisterFields({
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
        msg: validationError,
      });
    }

    const passwordError = validatePasswordStrength(
      passwordClean,
      namaClean,
      emailClean
    );

    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
        msg: passwordError,
      });
    }

    if (!req.session?.captchaAnswer || captchaAnswer !== req.session.captchaAnswer) {
      return res.status(400).json({
        message: "Jawaban CAPTCHA salah",
        msg: "Jawaban CAPTCHA salah",
      });
    }

    req.session.captchaAnswer = null;

    const existing = await User.findOne({ where: { email: emailClean } });
    if (existing) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
        msg: "Email sudah terdaftar",
      });
    }

    req.session.pendingRegister = {
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,
      otp: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal menyimpan data registrasi sementara",
          msg: "Gagal menyimpan data registrasi sementara",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Data registrasi tersimpan. Lanjutkan verifikasi WhatsApp.",
        msg: "Data registrasi tersimpan. Lanjutkan verifikasi WhatsApp.",
        otpRequired: true,
        phone: maskPhone(noHpClean),
      });
    });
  } catch (err) {
  console.error("REGISTER ERROR:", err);
  return res.status(500).json({
    message: "Server error",
    msg: "Server error",
    error: err.message,
  });
}
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const loginRole = VALID_ROLES.includes(role) ? role : "user";

    const emailClean = (email || "").trim().toLowerCase();

    if (!emailClean || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
        msg: "Email dan password wajib diisi",
      });
    }

    if (!/\S+@\S+\.\S+/.test(emailClean)) {
      return res.status(400).json({
        message: "Format email tidak valid",
        msg: "Format email tidak valid",
      });
    }

    const user = await User.findOne({ where: { email: emailClean } });

    if (!user) {
      return res.status(401).json({
        message: "Email atau password salah",
        msg: "Email atau password salah",
      });
    }

    if (user.role !== loginRole) {
      return res.status(403).json({
        message: "Akun tidak sesuai dengan jenis login yang dipilih",
        msg: "Akun tidak sesuai dengan jenis login yang dipilih",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        message: "Email atau password salah",
        msg: "Email atau password salah",
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Login berhasil",
      msg: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        no_hp: user.no_hp,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      msg: "Server error",
      error: err.message,
    });
  }
};