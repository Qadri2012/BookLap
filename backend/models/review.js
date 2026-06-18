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
      allowNull: false,
    },

    lapanganId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // NEW
    pemesananId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    nama_user: DataTypes.STRING,
    total_membantu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    total_tidak_membantu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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