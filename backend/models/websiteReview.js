const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WebsiteReview = sequelize.define(
  "WebsiteReview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
  type: DataTypes.UUID,
  allowNull: false,
  unique: true,
},

    nama: {
      type: DataTypes.STRING,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ulasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
  },
  {
    tableName: "website_review",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = WebsiteReview;