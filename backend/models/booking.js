// models/Booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define(
  "Booking",
  {
    // ✅ NEW: id booking tetap UUID
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // ✅ NEW: userId tetap UUID kalau tabel users kamu memang UUID
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // ✅ NEW: harus sama dengan tipe lapangan.id di database
    lapanganId: {
      type: DataTypes.INTEGER, // <-- ini yang diperbaiki
      allowNull: false,
      references: {
        model: "lapangan",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    jam_selesai: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    nama_lapangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "aktif", "selesai", "dibatalkan"),
      allowNull: false,
      defaultValue: "pending",
    },

    total_harga: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "booking",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Booking;