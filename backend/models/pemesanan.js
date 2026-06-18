// models/pemesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pemesanan = sequelize.define(
  "Pemesanan",
  {
    va_number: {
  type: DataTypes.STRING(30),
  allowNull: true,
},

    // ✅ NEW: kode pembayaran untuk minimarket / e-wallet
    payment_reference: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // ✅ NEW: jenis kanal pembayaran
    payment_channel: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    payment_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    kode_pemesanan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    lapangan_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    metode_pembayaran_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    nama_pemesan: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    no_whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    subtotal_sewa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    subtotal_layanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    biaya_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    total_bayar: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    total_durasi_menit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // ===== NEW CODE TAHAP 7A =====
    status_pemesanan: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "menunggu_pembayaran",
    },
    // ===== END NEW CODE =====

    // ✅ NEW: status final untuk halaman riwayat
      riwayat_status: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      status_kedatangan: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    confirmed_arrival_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    

    dibatalkan_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tampilkan_sampai: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    alasan_batal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "pemesanan",
    timestamps: false,
  }
);
module.exports = Pemesanan;