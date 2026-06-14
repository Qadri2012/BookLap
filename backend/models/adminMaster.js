// NEW: models/adminMaster.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminMaster = sequelize.define(
  "AdminMaster",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    nomor_identitas: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: true,
    },

    no_hp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    level_akses: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "admin",
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },

    photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_master",
    timestamps: false,
  }

  
);

module.exports = AdminMaster;