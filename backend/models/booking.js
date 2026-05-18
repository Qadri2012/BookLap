const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { // ✅ WAJIB
    type: DataTypes.UUID,
    allowNull: false,
  },
  lapanganId: { // ✅ WAJIB
    type: DataTypes.UUID,
    allowNull: false,
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
  },
  status: {
    type: DataTypes.ENUM("pending", "aktif", "selesai", "dibatalkan"),
    defaultValue: "pending",
  },
  total_harga: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true
});

module.exports = Booking;