// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    // ==================================================
    // PRIMARY KEY
    // ==================================================
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // ==================================================
    // DATA DASAR (SEMUA ROLE)
    // ==================================================
    nama: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    no_hp: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "",
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("user", "mitra", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "active",
        "rejected",
        "blocked"
      ),
      allowNull: false,
      defaultValue: "active",
    },

    rejected_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    // ==================================================
    // KHUSUS ADMIN
    // ==================================================
    level_akses: {
      type: DataTypes.ENUM(
        "superadmin",
        "admin",
        "operator"
      ),
      allowNull: true,
      defaultValue: null,
    },

    jabatan_divisi: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },

    nomor_identitas: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
    },

    // ==================================================
    // KHUSUS MITRA
    // ==================================================
    nama_usaha: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },

    jenis_lapangan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },

    alamat_lengkap: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    kota_kabupaten: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },

    jam_buka: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: null,
    },

    jam_tutup: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: null,
    },

    jumlah_lapangan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },

    foto_lapangan: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jumlah_no_show: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    akun_diblokir: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    blocked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    peringatan_no_show: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },

    ktp_pemilik: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;