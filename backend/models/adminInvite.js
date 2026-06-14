// NEW: models/adminInvite.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminInvite = sequelize.define(
  "AdminInvite",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },

    role_target: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "admin",
      validate: {
        isIn: [["admin"]],
      },
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },

    used_by: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    admin_master_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "used", "revoked", "expired"),
      allowNull: false,
      defaultValue: "active",
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_invites",
    timestamps: false,
  }
);

module.exports = AdminInvite;