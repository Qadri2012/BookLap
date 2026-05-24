// models/review.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    lapanganId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    komentar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "review",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Review;