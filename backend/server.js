require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { DataTypes } = require("sequelize");
const sequelize = require("./config/database");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

// versioned routes v1
const authRoutes = require("./routes/v1/auth");
const bookingRoutes = require("./routes/v1/booking");
const jadwalRoutes = require("./routes/v1/jadwal");
const lapanganRoutes = require("./routes/v1/lapangan");
const layananTambahanRoutes = require("./routes/v1/layananTambahan");
const metodePembayaranRoutes = require("./routes/v1/metodePembayaran");
const metodeTransferRoutes = require("./routes/v1/metodeTransfer");
const pemesananRoutes = require("./routes/v1/pemesanan");
const reviewRoutes = require("./routes/v1/review");

const MetodePembayaran = require("./models/metodePembayaran");
const MetodeTransfer = require("./models/metodeTransfer");
const Pemesanan = require("./models/pemesanan");

// 🔥 UPLOAD CLOUDINARY
const upload = require("./middleware/upload");

// INIT APP
const app = express();

// ✅ NEW: trust proxy untuk cookie secure di production / reverse proxy
app.set("trust proxy", 1);

// ✅ NEW: CORS untuk cookie-based auth
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  })
);

// ✅ NEW: parse cookie sebelum middleware auth
app.use(cookieParser());

// ✅ NEW: body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ NEW: security layer dasar
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ✅ NEW: limiter khusus auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Terlalu banyak percobaan. Coba lagi nanti.",
    msg: "Terlalu banyak percobaan. Coba lagi nanti.",
  },
});

// ✅ NEW: session config aman untuk auth flow / OTP / Google login
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// DATABASE
sequelize
  .authenticate()
  .then(() => console.log(" Database connected"))
  .catch((err) => console.log(" DB error:", err));

// MODEL
const Lapangan = sequelize.define(
  "Lapangan",
  {
    nama: DataTypes.STRING,
    tipe: DataTypes.STRING,
    courts: DataTypes.JSON,
    alamat: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
    kapasitas: DataTypes.INTEGER,
    ukuran: DataTypes.STRING,
    permukaan: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    fasilitas: DataTypes.JSON,
    foto: DataTypes.JSON,
    hari_operasional: DataTypes.JSON,
    jam_buka: DataTypes.STRING,
    jam_tutup: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
  },
  {
    tableName: "lapangan",
    timestamps: false,
  }
);

const User = sequelize.define(
  "User",
  {
    nama: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

// GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: "ISI_CLIENT_ID_KAMU",
      clientSecret: "ISI_SECRET_KAMU",
      callbackURL: "http://localhost:5000/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ where: { email } });

        if (!user) {
          user = await User.create({
            nama: profile.displayName,
            email,
            password: "google_login",
            role: "user",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

// SEED
const seedLapangan = async () => {
  const count = await Lapangan.count();

  if (count === 0) {
    await Lapangan.bulkCreate([
      {
        nama: "Galaxy Futsal Centre",
        tipe: "futsal",
        courts: ["Lapangan 1", "Lapangan 2"],
        alamat: "Jl. Pelita No.Utara, Parepare",
        harga: 195000,
        rating: 4.7,
        kapasitas: 14,
        ukuran: "25 x 15 m",
        permukaan: "Rumput Sintetis",
        deskripsi: "Lapangan futsal premium",
        fasilitas: [{ icon: "parkir", label: "Parkir Mobil" }],
        foto: [],
        jam_buka: "15:00",
        jam_tutup: "22:30",
      },
      {
        nama: "Futsal Grand Sulawesi",
        tipe: "futsal",
        courts: ["Lapangan 1", "Lapangan 2"],
        alamat: "Jl. Moh Yusuf, Parepare",
        harga: 100000,
        rating: 4.6,
        kapasitas: 14,
        ukuran: "25 x 15 m",
        permukaan: "Sintetis",
        deskripsi: "Lapangan futsal nyaman",
        fasilitas: [{ icon: "wifi", label: "WiFi" }],
        foto: [],
        jam_buka: "08:00",
        jam_tutup: "00:00",
      },
      {
        nama: "Sansiro Futsal",
        tipe: "futsal",
        courts: ["Lapangan 1"],
        alamat: "Tiro Sompe, Parepare",
        harga: 100000,
        rating: 4.3,
        kapasitas: 12,
        ukuran: "24 x 14 m",
        permukaan: "Vinyl",
        deskripsi: "Lapangan futsal indoor",
        fasilitas: [{ icon: "kantin", label: "Kantin" }],
        foto: [],
        jam_buka: "12:00",
        jam_tutup: "22:00",
      },
      {
        nama: "Titik Kumpul Minisoccer",
        tipe: "minisoccer",
        courts: ["Lapangan 1"],
        alamat: "Jl. Petta Unga, Parepare",
        harga: 650000,
        rating: 4.8,
        kapasitas: 20,
        ukuran: "50 x 30 m",
        permukaan: "Rumput Sintetis",
        deskripsi: "Mini soccer premium",
        fasilitas: [{ icon: "parkir", label: "Parkir Luas" }],
        foto: [],
        jam_buka: "07:00",
        jam_tutup: "00:30",
      },
      {
        nama: "R57 Mini Soccer",
        tipe: "minisoccer",
        courts: ["Lapangan 1", "Lapangan 2"],
        alamat: "Watang Soreang, Parepare",
        harga: 350000,
        rating: 4.5,
        kapasitas: 18,
        ukuran: "45 x 25 m",
        permukaan: "Rumput Sintetis",
        deskripsi: "Mini soccer modern",
        fasilitas: [{ icon: "toilet", label: "Toilet" }],
        foto: [],
        jam_buka: "07:00",
        jam_tutup: "00:00",
      },
    ]);

    console.log("🔥 Seed berhasil");
  }
};

// ROUTES
app.get("/", (req, res) => {
  res.send("Server hidup ");
});

app.get(
  "/api/v1/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/v1/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/lapangan");
  }
);

// 🔥 UPLOAD IMAGE
app.post("/api/v1/upload", (req, res) => {
  upload.array("images", 10)(req, res, function (err) {
    if (err) {
      console.error("UPLOAD ERROR DETAIL:", err);

      return res.status(500).json({
        message: "Upload gagal",
        error: err.message || err,
      });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Tidak ada file",
        });
      }

      const urls = req.files.map((file) => file.path);

      return res.json({
        message: "Upload berhasil",
        urls,
      });
    } catch (error) {
      console.error("CATCH ERROR:", error);

      return res.status(500).json({
        message: "Error server",
        error: error.message,
      });
    }
  });
});

// API versioning v1
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/jadwal", jadwalRoutes);
app.use("/api/v1/lapangan", lapanganRoutes);
app.use("/api/v1/layanan-tambahan", layananTambahanRoutes);
app.use("/api/v1/metode-pembayaran", metodePembayaranRoutes);
app.use("/api/v1/metode-transfer", metodeTransferRoutes);
app.use("/api/v1/pemesanan", pemesananRoutes);
app.use("/api/v1/review", reviewRoutes);

// START SERVER
const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  await sequelize.sync();
  await seedLapangan();
});