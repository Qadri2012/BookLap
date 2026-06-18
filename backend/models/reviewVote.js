const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewVote = sequelize.define(
  "ReviewVote",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    reviewid: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userid: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    tipe: {
      type: DataTypes.ENUM(
        "helpful",
        "unhelpful"
      ),
      allowNull: false,
    },
  },
  {
    tableName: "review_vote",
    timestamps: true,

    createdAt: "createdat",
    updatedAt: "updatedat",
  }
);

module.exports = ReviewVote;