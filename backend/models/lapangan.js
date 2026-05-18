// models/Lapangan.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lapangan = sequelize.define("Lapangan", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  tipe: {
    type: DataTypes.ENUM("futsal", "minisoccer"),
    allowNull: false,
  },

  alamat: DataTypes.TEXT,

  harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5,
  },

  kapasitas: DataTypes.INTEGER,
  ukuran: DataTypes.STRING,
  permukaan: DataTypes.STRING,

  deskripsi: DataTypes.TEXT,

  fasilitas: DataTypes.JSON,
  foto: DataTypes.JSON,

  hari_operasional: DataTypes.JSON,

  jam_buka: DataTypes.STRING,
  jam_tutup: DataTypes.STRING,

  // 🔥 TAMBAHAN PENTING
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,

  map_embed: DataTypes.TEXT,

}, {
  timestamps: true,
});

module.exports = Lapangan;