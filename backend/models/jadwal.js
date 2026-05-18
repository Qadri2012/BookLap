// Jadwal.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Jadwal = sequelize.define(
  "Jadwal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    lapangan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    court_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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

    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "tersedia",
    },
  },
  {
    tableName: "jadwal_lapangan",
    timestamps: false,
  }
);

module.exports = Jadwal;