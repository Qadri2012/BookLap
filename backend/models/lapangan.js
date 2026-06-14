// models/Lapangan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lapangan = sequelize.define(
  "Lapangan",
  {
    // ✅ NEW: ID tetap UUID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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

    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 4.5,
    },

    kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    ukuran: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    permukaan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    fasilitas: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    foto: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    hari_operasional: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    jam_buka: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    jam_tutup: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ✅ NEW: tambahan lokasi
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // NEW
    courts: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    
  },
  {
  tableName: "lapangan",
  freezeTableName: true,
  timestamps: false,
}
);

module.exports = Lapangan;