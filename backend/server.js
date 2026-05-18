require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const sequelize = require("./config/database");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const session = require("express-session");

const layananTambahanRoutes = require("./routes/layananTambahan");
const metodePembayaranRoutes = require("./routes/metodePembayaran");
const metodeTransferRoutes = require("./routes/metodeTransfer");
const pemesananRoutes = require("./routes/pemesanan");
const authRoutes = require("./routes/auth");
const jadwalRoutes = require("./routes/jadwal");
const upload = require("./middleware/upload");

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/layanan-tambahan", layananTambahanRoutes);
app.use("/api/metode-pembayaran", metodePembayaranRoutes);
app.use("/api/metode-transfer", metodeTransferRoutes);
app.use("/api/pemesanan", pemesananRoutes);

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
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
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
      // =====================================================
      // GALAXY FUTSAL
      // =====================================================
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

      // =====================================================
      // GRAND SULAWESI
      // =====================================================
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

      // =====================================================
      // SANSIRO
      // =====================================================
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

      // =====================================================
      // TITIK KUMPUL
      // =====================================================
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

      // =====================================================
      // R57
      // =====================================================
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

// GOOGLE LOGIN
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/lapangan`);
  }
);

// UPLOAD IMAGE
app.post("/api/upload", (req, res) => {
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

// GET ALL
app.get("/api/lapangan", async (req, res) => {
  try {
    const data = await Lapangan.findAll();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error ambil data" });
  }
});

// GET BY ID
app.get("/api/lapangan/:id", async (req, res) => {
  try {
    const data = await Lapangan.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Tidak ditemukan" });
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error detail" });
  }
});

// POST (TAMBAH)
app.post("/api/lapangan", async (req, res) => {
  try {
    const data = await Lapangan.create(req.body);
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: "Gagal tambah data" });
  }
});

// UPDATE
app.post("/api/lapangan/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Lapangan.update(req.body, {
      where: { id },
    });

    if (updated === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const dataBaru = await Lapangan.findByPk(id);

    res.json({
      message: "Berhasil update",
      data: dataBaru,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update" });
  }
});

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { nama, no_hp, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nama,
      no_hp,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Register berhasil",
      user,
    });
  } catch {
    res.status(500).json({ message: "Gagal register" });
  }
});

// START SERVER
app.listen(PORT, async () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  await sequelize.sync();
  await seedLapangan();
});