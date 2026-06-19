const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const AdminInvite = require("../models/adminInvite");
const AdminMaster = require("../models/adminMaster");
require("dotenv").config();

//blacklist refresh token sementara (untuk development / single instance)
const blacklistedRefreshTokens = new Set();

// ✅ NEW: secure cookie config untuk refresh token
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  path: "/",
};

// NEW: transporter email untuk OTP admin
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
console.log("SMTP USER:", process.env.SMTP_USER);
console.log(
  "SMTP PASS ADA:",
  !!process.env.SMTP_PASS
);

mailTransporter.verify(
  (error, success) => {
    if (error) {
      console.log(
        "SMTP ERROR:",
        error
      );
    } else {
      console.log(
        "SMTP READY"
      );
    }
  }
);
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

function maskPhone(phone = "") {
  const s = String(phone);
  if (s.length <= 6) return s;
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
}

// ACCSES TOKEN
const VALID_ROLES = ["user", "mitra", "admin"];
function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1h" }
  );
}



// REFRESH TOKEN
function createRefreshToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}

function toUserPayload(user) {
  return {
    id: user.id,
    nama: user.nama,
    no_hp: user.no_hp,
    email: user.email,
    role: user.role,

    status: user.status || "active",

    level_akses: user.level_akses || null,
    jabatan_divisi: user.jabatan_divisi || null,
    nomor_identitas: user.nomor_identitas || null,

    // FLOW CASH
    jumlah_no_show:
      user.jumlah_no_show || 0,

    akun_diblokir:
      user.akun_diblokir || false,

    blocked_until:
      user.blocked_until || null,

    peringatan_no_show:
      user.peringatan_no_show || null,
  };
}

function getAccountStatusError(user) {
  const status = String(user?.status || "active").toLowerCase();

  if (status === "pending") {
    return "Akun masih pending dan belum disetujui super admin";
  }

  if (status === "rejected" || status === "blocked") {
    return "Akun tidak aktif";
  }

  return "";
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

// NEW: validasi email admin domain kantor
// function getAdminEmailError(value = "") {
//   const v = String(value).trim().toLowerCase();
//   if (!v) return "Email kantor wajib diisi";
//   if (!/\S+@\S+\.\S+/.test(v)) return "Format email tidak valid";
//   if (v.length > 254) return "Email terlalu panjang";
//   if (!v.endsWith(ADMIN_EMAIL_SUFFIX)) {
//     return `Email harus menggunakan domain ${ADMIN_EMAIL_SUFFIX}`;
//   }
//   return "";
// }

function getAdminEmailError(value = "") {
  const v = String(value).trim().toLowerCase();

  if (!v) return "Email wajib diisi";
  if (!/\S+@\S+\.\S+/.test(v)) return "Format email tidak valid";
  if (v.length > 254) return "Email terlalu panjang";

  return "";
}

// NEW: validasi invite code admin
function getInviteCodeError(value = "") {
  const v = String(value).trim().toUpperCase();
  if (!v) return "Kode undangan wajib diisi";
  if (!/^[A-Z0-9-]{8,32}$/.test(v)) return "Format kode undangan tidak valid";
  return "";
}

// NEW: validasi nomor identitas admin
function getIdentityError(value = "") {
  const v = String(value).trim();
  if (!v) return "Nomor identitas wajib diisi";
  if (!/^[A-Za-z0-9\-\/]{4,30}$/.test(v)) {
    return "Format nomor identitas tidak valid";
  }
  return "";
}

// NEW: validasi OTP admin
function getOtpError(value = "") {
  const v = String(value).trim();
  if (!v) return "OTP wajib diisi";
  if (!/^\d{6}$/.test(v)) return "OTP harus 6 digit";
  return "";
}

// NEW: kirim OTP ke email admin
async function sendAdminOtpEmail(toEmail, otpCode) {
  await mailTransporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: "OTP Verifikasi Admin BookLap",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>OTP Verifikasi Admin BookLap</h2>
        <p>Kode OTP Anda adalah:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
          ${otpCode}
        </div>
        <p>Kode ini berlaku 10 menit.</p>
      </div>
    `,
  });
}

async function sendUserOtpEmail(toEmail, otpCode) {
  try {
    // await mailTransporter.sendMail({
    //   from:
    //     process.env.EMAIL_FROM ||
    //     process.env.SMTP_USER,

    //   to: toEmail,

    //   subject: "Verifikasi Akun BookLap",

    //   html: `
    //     <div style="font-family:Arial">
    //       <h2>Verifikasi Akun BookLap</h2>
    //       <p>Kode OTP Anda:</p>
    //       <h1>${otpCode}</h1>
    //       <p>Berlaku 10 menit.</p>
    //     </div>
    //   `,
    // });

    console.log("EMAIL BERHASIL TERKIRIM");
  } catch (err) {
    console.error("EMAIL ERROR:", err);

    throw err;
  }
}

// NEW: cek kode undangan admin dari database
async function findActiveAdminInvite(inviteCode) {
  const code = String(inviteCode || "").trim().toUpperCase();

  if (!code) {
    return {
      ok: false,
      message: "Kode undangan wajib diisi",
    };
  }

  const invite = await AdminInvite.findOne({
    where: {
      code,
      role_target: "admin",
      status: "active",
    },
  });

  if (!invite) {
    return {
      ok: false,
      message: "Kode undangan tidak valid",
    };
  }

  if (invite.used_at) {
    return {
      ok: false,
      message: "Kode undangan sudah dipakai",
    };
  }

  if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
    await invite.update({ status: "expired" });

    return {
      ok: false,
      message: "Kode undangan sudah kedaluwarsa",
    };
  }

  return {
    ok: true,
    invite,
  };
}

// NEW: validasi tambahan admin
function validateAdminRegistrationFields({
  nama,
  no_hp,
  email,
  password,
  inviteCode,
  nomor_identitas,
  agreeData,
  agreeAccess,
  agreeTerms,
  agreePrivacy,
}) {
  const name = (nama || "").trim();
  const phone = (no_hp || "").trim();
  const mail = (email || "").trim().toLowerCase();
  const pw = password || "";

  if (!name) return "Nama admin wajib diisi";
  if (name.length < 3) return "Nama minimal 3 karakter";
  if (name.length > 60) return "Nama maksimal 60 karakter";

  if (!phone) return "Nomor HP wajib diisi";
  if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return "Format nomor tidak valid";

  const emailErr = getAdminEmailError(mail);
  if (emailErr) return emailErr;

  if (!pw) return "Password wajib diisi";
  if (pw.length < 12) return "Password minimal 12 karakter";
  if (pw.length > 128) return "Password maksimal 128 karakter";
  if (!/[A-Z]/.test(pw)) return "Password harus memiliki minimal 1 huruf besar";
  if (!/[0-9]/.test(pw)) return "Password harus memiliki minimal 1 angka";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password harus memiliki minimal 1 simbol";

  const inviteErr = getInviteCodeError(inviteCode);
  if (inviteErr) return inviteErr;

  const idErr = getIdentityError(nomor_identitas);
  if (idErr) return idErr;

  if (!isTruthyFlag(agreeData)) return "Harap menyatakan data yang diberikan benar";
  if (!isTruthyFlag(agreeAccess)) return "Harap menyetujui kebijakan akses admin";
  if (!isTruthyFlag(agreeTerms)) return "Harap menyetujui Syarat & Ketentuan";
  if (!isTruthyFlag(agreePrivacy)) return "Harap menyetujui Kebijakan Privasi";

  return null;
}

// NEW: cek format jam HH:MM
function isValidTimeHHMM(value = "") {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value).trim());
}

// NEW: cek flag checkbox lebih aman
function isTruthyFlag(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

// NEW: validasi data usaha mitra
function validateMitraBusinessFields({
  nama_usaha,
  jenis_lapangan,
  alamat_lengkap,
  kota_kabupaten,
  jam_buka,
  jam_tutup,
  jumlah_lapangan,
}) {
  const businessName = (nama_usaha || "").trim();
  const fieldType = (jenis_lapangan || "").trim();
  const address = (alamat_lengkap || "").trim();
  const city = (kota_kabupaten || "").trim();
  const openTime = (jam_buka || "").trim();
  const closeTime = (jam_tutup || "").trim();
  const fieldCount = Number(jumlah_lapangan);

  if (!businessName) return "Nama usaha/lapangan wajib diisi";
  if (businessName.length < 3) return "Nama usaha/lapangan minimal 3 karakter";
  if (businessName.length > 100) return "Nama usaha/lapangan maksimal 100 karakter";

  if (!fieldType) return "Jenis lapangan wajib dipilih";
  if (!address) return "Alamat lengkap wajib diisi";
  if (!city) return "Kota/Kabupaten wajib diisi";

  if (!isValidTimeHHMM(openTime)) return "Jam buka tidak valid";
  if (!isValidTimeHHMM(closeTime)) return "Jam tutup tidak valid";
  if (openTime >= closeTime) return "Jam tutup harus lebih besar dari jam buka";

  if (!Number.isInteger(fieldCount) || fieldCount < 1) {
    return "Jumlah lapangan minimal 1";
  }

  return null;
}



// NEW: helper register role khusus (mitra / admin)
async function handleRoleRegister(req, res, role) {
  try {
    const {
      nama,
      no_hp,
      email,
      password,
      captchaToken,

      // mitra
      nama_usaha,
      jenis_lapangan,
      alamat_lengkap,
      kota_kabupaten,
      jam_buka,
      jam_tutup,
      jumlah_lapangan,

      // admin
      adminCode,
      level_akses,
      agreeData,
      agreeAccess,
      agreeTerms,
      agreePrivacy,
    } = req.body;

    const namaClean = (nama || "").trim();
    const noHpClean = normalizeE164(no_hp || "");
    const emailClean = (email || "").trim().toLowerCase();
    const passwordClean = password || "";

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

    // ✅ reCAPTCHA tetap dipakai
    const captchaCheck = await verifyRecaptcha(captchaToken);
    if (!captchaCheck.ok) {
      return res.status(400).json({
        message: captchaCheck.message,
        msg: captchaCheck.message,
      });
    }

    const existing = await User.findOne({
      where: { email: emailClean },
    });

  if (existing && String(existing.status).toLowerCase() !== "pending") {
    return res.status(400).json({
      message: "Email sudah terdaftar",
      msg: "Email sudah terdaftar",
    });
  }

    let extraData = {};
    let finalLevelAkses = null;

    if (role === "mitra") {
      const mitraError = validateMitraBusinessFields({
        nama_usaha,
        jenis_lapangan,
        alamat_lengkap,
        kota_kabupaten,
        jam_buka,
        jam_tutup,
        jumlah_lapangan,
      });

      if (mitraError) {
        return res.status(400).json({
          message: mitraError,
          msg: mitraError,
        });
      }

      extraData = {
        nama_usaha: (nama_usaha || "").trim(),
        jenis_lapangan: (jenis_lapangan || "").trim(),
        alamat_lengkap: (alamat_lengkap || "").trim(),
        kota_kabupaten: (kota_kabupaten || "").trim(),
        jam_buka: (jam_buka || "").trim(),
        jam_tutup: (jam_tutup || "").trim(),
        jumlah_lapangan: Number(jumlah_lapangan) || 1,
      };
    }

    if (role === "admin") {
      const adminError = validateAdminRegistrationExtras({
        adminCode,
        level_akses,
        agreeData,
        agreeAccess,
        agreeTerms,
        agreePrivacy,
      });

      if (adminError) {
        return res.status(400).json({
          message: adminError,
          msg: adminError,
        });
      }

      finalLevelAkses = String(level_akses || "admin").trim();
    }

    // NOTE:
    // Kalau nanti upload file mitra sudah memakai multer,
    // kamu bisa ambil req.files di sini dan simpan path/file name-nya.
    const fotoLapangan =
      req.files?.foto_lapangan?.[0]?.filename ||
      req.files?.foto_lapangan?.[0]?.path ||
      null;

    const ktpPemilik =
      req.files?.ktp_pemilik?.[0]?.filename ||
      req.files?.ktp_pemilik?.[0]?.path ||
      null;

    req.session.pendingRegister = {
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,
      role,
      level_akses: finalLevelAkses,
      meta: {
        ...extraData,
        foto_lapangan: fotoLapangan,
        ktp_pemilik: ktpPemilik,
      },
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
    console.error("REGISTER ROLE ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      msg: "Server error",
      error: err.message,
    });
  }
}

//verify Google reCAPTCHA di backend
async function verifyRecaptcha(captchaToken) {
  if (!captchaToken) {
    return {
      ok: false,
      message: "Captcha wajib diselesaikan",
    };
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return {
      ok: false,
      message: "RECAPTCHA_SECRET_KEY belum diisi",
    };
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    params.append("response", captchaToken);

    const recaptchaRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!recaptchaRes.data?.success) {
      return {
        ok: false,
        message: "Verifikasi captcha gagal",
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message:
        err.response?.data?.["error-codes"]?.join(", ") ||
        "Verifikasi captcha gagal",
    };
  }
}

async function generateUniqueAdminInviteCode() {
  let code = "";
  let exists = true;

  while (exists) {
    code = `BL-ADM-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .toUpperCase()
      .slice(2, 6)}`;

    exists = await AdminInvite.findOne({ where: { code } });
  }

  return code;
}

async function getOrCreateActiveAdminInvite(adminMasterId) {
  const activeInvite = await AdminInvite.findOne({
    where: {
      admin_master_id: adminMasterId,
      role_target: "admin",
      status: "active",
    },
    order: [["created_at", "DESC"]],
  });

  if (activeInvite && !activeInvite.used_at) {
    if (!activeInvite.expires_at || new Date(activeInvite.expires_at) > new Date()) {
      return activeInvite;
    }
  }

  const newCode = await generateUniqueAdminInviteCode();

  const newInvite = await AdminInvite.create({
    code: newCode,
    role_target: "admin",
    admin_master_id: adminMasterId,
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
  });

  return newInvite;
}
//endpoint lama tetap ada, tapi sekarang hanya legacy
exports.getCaptcha = (req, res) => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;

  req.session.captchaAnswer = String(a + b);

  return res.json({
    question: `Berapa hasil ${a} + ${b} ?`,
  });
};

exports.verifyEmailOtp =
  async (req, res) => {
    try {
      const otp =
        String(
          req.body.otp || ""
        ).trim();

      const pending =
        req.session.pendingRegister;

      if (!pending) {
        return res
          .status(400)
          .json({
            message:
              "Sesi registrasi tidak ditemukan",
          });
      }

      if (
        Date.now() >
        pending.otpExpiresAt
      ) {
        return res
          .status(400)
          .json({
            message:
              "OTP sudah kedaluwarsa",
          });
      }

      if (otp !== pending.otp) {
        req.session.pendingRegister.otpAttempts =
          (
            req.session
              .pendingRegister
              .otpAttempts || 0
          ) + 1;

        await waitSessionSave(
          req
        );

        return res
          .status(400)
          .json({
            message:
              "OTP salah",
          });
      }

      const existing =
        await User.findOne({
          where: {
            email:
              pending.email,
          },
        });

      if (existing) {
        return res
          .status(400)
          .json({
            message:
              "Email sudah terdaftar",
          });
      }

      const hashed =
        await bcrypt.hash(
          pending.password,
          12
        );

      const user =
        await User.create({
          nama:
            pending.nama,

          no_hp:
            pending.no_hp,

          email:
            pending.email,

          password:
            hashed,

          role: "user",

          status:
            "active",
        });

      req.session.pendingRegister =
        null;

      await waitSessionSave(
        req
      );

      return res.json({
        message:
          "Verifikasi berhasil. Akun berhasil dibuat.",

        user:
          toUserPayload(
            user
          ),
      });
    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .json({
          message:
            "Gagal verifikasi OTP",
          error:
            err.message,
        });
    }
  };
// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      nama,
      no_hp,
      email,
      password,
      captchaToken,
    } = req.body;

    const namaClean = (nama || "").trim();
    const noHpClean = normalizeE164(no_hp || "");
    const emailClean = (email || "")
      .trim()
      .toLowerCase();

    const passwordClean = password || "";

    const validationError =
      validateRegisterFields({
        nama: namaClean,
        no_hp: noHpClean,
        email: emailClean,
        password: passwordClean,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // const captchaCheck =
    //   await verifyRecaptcha(
    //     captchaToken
    //   );

    // if (!captchaCheck.ok) {
    //   return res.status(400).json({
    //     message: captchaCheck.message,
    //   });
    // }

    const existing =
      await User.findOne({
        where: {
          email: emailClean,
        },
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Email sudah terdaftar",
      });
    }

    const otp = generateOtp();

    req.session.pendingRegister = {
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,

      otp,

      otpExpiresAt:
        Date.now() +
        10 * 60 * 1000,

      otpAttempts: 0,
    };

    await waitSessionSave(req);

    // await sendUserOtpEmail(
    //   emailClean,
    //   otp
    // );

    return res.status(201).json({
      message:
        "Kode verifikasi telah dikirim ke email Anda.",

      otpRequired: true,
      email: emailClean,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

//Controller memproses data dan validasi
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
    const user = await User.findOne({
      where: { email: emailClean },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email atau password salah",
        msg: "Email atau password salah",
      });
    }

    const accountStatus = String(
      user.status || "active"
    ).toLowerCase();

    const isSuperAdmin =
      user.email === "adminbooklap@gmail.com" ||
      user.level_akses === "superadmin";

    if (accountStatus === "pending" && !isSuperAdmin) {
      return res.status(403).json({
        message: "Akun masih pending dan belum disetujui super admin",
        msg: "Akun masih pending dan belum disetujui super admin",
      });
    }

    if (accountStatus === "rejected" || accountStatus === "blocked") {
      return res.status(403).json({
        message: "Akun tidak aktif",
        msg: "Akun tidak aktif",
      });
    }

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
    if (user.role === "user") {

      console.log("========== LOGIN TIME SERVER ==========");
      console.log(new Date());
      console.log(new Date().toISOString());

      user.last_login = new Date();

      await user.save();

      console.log("LAST LOGIN SAVED:");
      console.log(user.last_login);
    }

    // JWT DIKIRM SAAT LOGIN

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    // set refresh token ke HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    // kirim access token saja ke frontend
    return res.json({
      message: "Login berhasil",
      msg: "Login berhasil",
      token: accessToken,
      accessToken,
      user: toUserPayload(user),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      msg: "Server error",
      error: err.message,
    });
  }
};

// AUTH VERIFY
exports.verifyAuth = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
        msg: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        msg: "User tidak ditemukan",
      });
    }

    const statusError = getAccountStatusError(user);
    if (statusError) {
      return res.status(403).json({
        message: statusError,
        msg: statusError,
      });
    }

    return res.json({
      message: "Token valid",
      msg: "Token valid",
      user: toUserPayload(user),
    });
  } catch (err) {
    return res.status(401).json({
      message: "Token expired atau tidak valid",
      msg: "Token expired atau tidak valid",
      error: err.message,
    });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token tidak ditemukan",
        msg: "Refresh token tidak ditemukan",
      });
    }

    if (blacklistedRefreshTokens.has(refreshToken)) {
      return res.status(401).json({
        message: "Refresh token sudah tidak valid",
        msg: "Refresh token sudah tidak valid",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        msg: "User tidak ditemukan",
      });
    }

    const statusError = getAccountStatusError(user);
    if (statusError) {
      return res.status(403).json({
        message: statusError,
        msg: statusError,
      });
    }

    blacklistedRefreshTokens.add(refreshToken);

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    return res.json({
      message: "Token berhasil diperbarui",
      msg: "Token berhasil diperbarui",
      token: newAccessToken,
      accessToken: newAccessToken,
      user: toUserPayload(user),
    });
  } catch (err) {
    return res.status(401).json({
      message: "Refresh token tidak valid",
      msg: "Refresh token tidak valid",
      error: err.message,
    });
  }
};

// NEW: cek NIP admin lalu ambil invite code yang terhubung dari admin_master
exports.checkAdminIdentity = async (req, res) => {
  try {
    const nomorIdentitas = String(
      req.body.nomor_identitas || req.body.nomorIdentitas || ""
    ).trim();

    if (!nomorIdentitas) {
      return res.status(400).json({
        message: "Nomor identitas wajib diisi",
        msg: "Nomor identitas wajib diisi",
      });
    }

    const adminMaster = await AdminMaster.findOne({
      where: { nomor_identitas: nomorIdentitas },
    });

    if (!adminMaster) {
      return res.status(404).json({
        message: "Nomor identitas tidak terdaftar",
        msg: "Nomor identitas tidak terdaftar",
      });
    }

    const invite = await getOrCreateActiveAdminInvite(adminMaster.id);

    return res.json({
      message: "NIP valid",
      msg: "NIP valid",
      valid: true,
      adminMaster: {
        id: adminMaster.id,
        nama: adminMaster.nama,
        nomor_identitas: adminMaster.nomor_identitas,
        email: adminMaster.email,
        no_hp: adminMaster.no_hp,
        level_akses: adminMaster.level_akses,
        status: adminMaster.status,
      },
      inviteCode: invite.code,
      inviteId: invite.id,
      adminMasterId: adminMaster.id,
      level_akses: adminMaster.level_akses,
    });
  } catch (err) {
    console.error("CHECK ADMIN IDENTITY ERROR:", err);
    return res.status(500).json({
      message: "Gagal memeriksa identitas admin",
      msg: "Gagal memeriksa identitas admin",
      error: err.message,
    });
  }
};

// NEW: REGISTER MITRA
exports.registerMitra = async (req, res) => {
  return handleRoleRegister(req, res, "mitra");
};


// NEW: LOGIN MITRA
exports.loginMitra = async (req, res) => {
  req.body.role = "mitra";
  return exports.login(req, res);
};

// NEW: REGISTER ADMIN -> kirim OTP ke email dulu, akun dibuat setelah verifikasi OTP
exports.registerAdmin = async (req, res) => {
  try {
    const {
      nama,
      no_hp,
      email,
      password,
      inviteCode,
      nomor_identitas,
      captchaToken,
      agreeData,
      agreeAccess,
      agreeTerms,
      agreePrivacy,
    } = req.body;

    const namaClean = (nama || "").trim();
    const noHpClean = normalizeE164(no_hp || "");
    const emailClean = (email || "").trim().toLowerCase();
    const passwordClean = password || "";
    const inviteCodeClean = String(inviteCode || "").trim().toUpperCase();
    const nomorIdentitasClean = String(nomor_identitas || "").trim();

    const adminMaster = await AdminMaster.findOne({
      where: { nomor_identitas: nomorIdentitasClean },
    });

    if (!adminMaster) {
      return res.status(400).json({
        message: "Nomor identitas tidak terdaftar",
        msg: "Nomor identitas tidak terdaftar",
      });
    }

    // NEW: email harus sama dengan data master
    if (String(adminMaster.email || "").trim().toLowerCase() !== emailClean) {
      return res.status(400).json({
        message: "Email tidak sesuai dengan data admin master",
        msg: "Email tidak sesuai dengan data admin master",
      });
    }

    const inviteCheck = await AdminInvite.findOne({
      where: {
        code: inviteCodeClean,
        admin_master_id: adminMaster.id,
        role_target: "admin",
        status: "active",
      },
    });

    if (!inviteCheck) {
      return res.status(400).json({
        message: "Kode undangan tidak cocok dengan NIP",
        msg: "Kode undangan tidak cocok dengan NIP",
      });
    }

    if (
      inviteCheck.expires_at &&
      new Date(inviteCheck.expires_at).getTime() < Date.now()
    ) {
      await inviteCheck.update({ status: "expired" });

      return res.status(400).json({
        message: "Kode undangan sudah kedaluwarsa",
        msg: "Kode undangan sudah kedaluwarsa",
      });
    }

    const validationError = validateAdminRegistrationFields({
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,
      inviteCode: inviteCodeClean,
      nomor_identitas: nomorIdentitasClean,
      agreeData,
      agreeAccess,
      agreeTerms,
      agreePrivacy,
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

    const captchaCheck = await verifyRecaptcha(captchaToken);
    if (!captchaCheck.ok) {
      return res.status(400).json({
        message: captchaCheck.message,
        msg: captchaCheck.message,
      });
    }

    const existing = await User.findOne({
      where: { email: emailClean },
    });
    if (existing && String(existing.status || "").toLowerCase() !== "pending") {
      return res.status(400).json({
        message: "Email sudah terdaftar",
        msg: "Email sudah terdaftar",
      });
    }

    const otpCode = generateOtp();

    req.session.pendingAdminRegister = {
      nama: namaClean,
      no_hp: noHpClean,
      email: emailClean,
      password: passwordClean,
      inviteCode: inviteCodeClean,
      nomor_identitas: nomorIdentitasClean,
      adminMasterId: adminMaster.id,
      level_akses: adminMaster.level_akses,
      inviteId: inviteCheck.id,
      existingUserId: existing?.id || null,
      otp: otpCode,
      otpExpiresAt: Date.now() + 10 * 60 * 1000,
      otpAttempts: 0,
    };
    await waitSessionSave(req);
    await sendAdminOtpEmail(emailClean, otpCode);

    return res.status(201).json({
      message: "OTP telah dikirim ke email admin. Silakan verifikasi OTP.",
      msg: "OTP telah dikirim ke email admin. Silakan verifikasi OTP.",
      otpRequired: true,
      email: emailClean,
    });
  } catch (err) {
    console.error("REGISTER ADMIN ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      msg: "Server error",
      error: err.message,
    });
  }
};
// NEW: verifikasi OTP admin lalu buat akun
exports.verifyAdminOtp = async (req, res) => {
  try {
    const emailClean = String(req.body.email || "").trim().toLowerCase();
    const otpCode = String(req.body.otpCode || "").trim();

    const pending = req.session.pendingAdminRegister;

    if (!pending) {
      return res.status(400).json({
        message: "Data registrasi admin belum ditemukan",
        msg: "Data registrasi admin belum ditemukan",
      });
    }

    if (pending.email !== emailClean) {
      return res.status(400).json({
        message: "Email tidak sesuai dengan sesi registrasi",
        msg: "Email tidak sesuai dengan sesi registrasi",
      });
    }

    if (!pending.otp || !pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP belum dibuat",
        msg: "OTP belum dibuat",
      });
    }

    if (Date.now() > pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP sudah kedaluwarsa",
        msg: "OTP sudah kedaluwarsa",
      });
    }

    if (otpCode !== pending.otp) {
      req.session.pendingAdminRegister.otpAttempts =
        (req.session.pendingAdminRegister.otpAttempts || 0) + 1;

      if (req.session.pendingAdminRegister.otpAttempts >= 5) {
        req.session.pendingAdminRegister = null;
      }

      await waitSessionSave(req);

      return res.status(400).json({
        message: "OTP salah",
        msg: "OTP salah",
      });
    }

    const existing = await User.findOne({
      where: { email: pending.email },
    });
const hashed = await bcrypt.hash(pending.password, 12);

let user;

if (existing) {
  user = await existing.update({
    nama: pending.nama,
    no_hp: pending.no_hp,
    password: hashed,
    role: "admin",
    status: "pending",
    level_akses: pending.level_akses,
    jabatan_divisi: null,
    nomor_identitas: pending.nomor_identitas,
  });
} else {
  user = await User.create({
    nama: pending.nama,
    no_hp: pending.no_hp,
    email: pending.email,
    password: hashed,
    role: "admin",
    status: "pending",
    level_akses: pending.level_akses,
    jabatan_divisi: null,
    nomor_identitas: pending.nomor_identitas,
  });
}

    await AdminInvite.update(
  {
    status: "used",
    used_by: user.id,
    used_at: new Date(),
  },
  {
    where: { id: pending.inviteId },
  }
    );

    // ambil adminMaster dari session pending
    const adminMaster = await AdminMaster.findByPk(pending.adminMasterId);

    if (adminMaster) {
      await getOrCreateActiveAdminInvite(adminMaster.id);
    }

    req.session.pendingAdminRegister = null;
    await waitSessionSave(req);

    return res.json({
      message: "OTP berhasil diverifikasi. Akun admin menunggu approval super admin.",
      msg: "OTP berhasil diverifikasi. Akun admin menunggu approval super admin.",
      user: toUserPayload(user),
    });
  } catch (err) {
    console.error("VERIFY ADMIN OTP ERROR:", err);
    return res.status(500).json({
      message: "Gagal verifikasi OTP admin",
      msg: "Gagal verifikasi OTP admin",
      error: err.message,
    });
  }
};

exports.requestAdminLoginOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
        msg: "Email dan password wajib diisi",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        message: "Email atau password salah",
        msg: "Email atau password salah",
      });
    }

    const statusError = getAccountStatusError(user);
    if (statusError) {
      return res.status(403).json({
        message: statusError,
        msg: statusError,
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        message: "Email atau password salah",
        msg: "Email atau password salah",
      });
    }

    const otpCode = generateOtp();

    req.session.pendingAdminLogin = {
      userId: user.id,
      email: user.email,
      otp: otpCode,
      otpExpiresAt: Date.now() + 10 * 60 * 1000,
      otpAttempts: 0,
    };

    await waitSessionSave(req);
    await sendAdminOtpEmail(user.email, otpCode);

    return res.json({
      message: "OTP login telah dikirim ke email admin",
      msg: "OTP login telah dikirim ke email admin",
      otpRequired: true,
      email: user.email,
    });
  } catch (err) {
    console.error("REQUEST ADMIN LOGIN OTP ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengirim OTP login",
      msg: "Gagal mengirim OTP login",
      error: err.message,
    });
  }
};

exports.verifyAdminLoginOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otpCode = String(req.body.otpCode || "").trim();
    const pending = req.session.pendingAdminLogin;

    if (!pending) {
      return res.status(400).json({
        message: "Sesi login admin tidak ditemukan",
        msg: "Sesi login admin tidak ditemukan",
      });
    }

    if (pending.email !== email) {
      return res.status(400).json({
        message: "Email tidak sesuai dengan sesi login",
        msg: "Email tidak sesuai dengan sesi login",
      });
    }

    if (!pending.otp || !pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP belum dibuat",
        msg: "OTP belum dibuat",
      });
    }

    if (Date.now() > pending.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP sudah kedaluwarsa",
        msg: "OTP sudah kedaluwarsa",
      });
    }

    if (otpCode !== pending.otp) {
      req.session.pendingAdminLogin.otpAttempts =
        (req.session.pendingAdminLogin.otpAttempts || 0) + 1;

      if (req.session.pendingAdminLogin.otpAttempts >= 5) {
        req.session.pendingAdminLogin = null;
      }

      await waitSessionSave(req);

      return res.status(400).json({
        message: "OTP salah",
        msg: "OTP salah",
      });
    }

    const user = await User.findByPk(pending.userId);
    if (!user || user.role !== "admin") {
      req.session.pendingAdminLogin = null;
      await waitSessionSave(req);

      return res.status(404).json({
        message: "User tidak ditemukan",
        msg: "User tidak ditemukan",
      });
    }

    const statusError = getAccountStatusError(user);
    if (statusError) {
      req.session.pendingAdminLogin = null;
      await waitSessionSave(req);

      return res.status(403).json({
        message: statusError,
        msg: statusError,
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    req.session.pendingAdminLogin = null;
    await waitSessionSave(req);

    return res.json({
      message: "Login admin berhasil",
      msg: "Login admin berhasil",
      token: accessToken,
      accessToken,
      user: toUserPayload(user),
    });
  } catch (err) {
    console.error("VERIFY ADMIN LOGIN OTP ERROR:", err);
    return res.status(500).json({
      message: "Gagal verifikasi OTP login admin",
      msg: "Gagal verifikasi OTP login admin",
      error: err.message,
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      blacklistedRefreshTokens.add(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.json({
      message: "Logout berhasil",
      msg: "Logout berhasil",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal logout",
      msg: "Gagal logout",
      error: err.message,
    });
  }
};










