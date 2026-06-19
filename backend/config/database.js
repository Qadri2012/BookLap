const { Sequelize } = require("sequelize");
const path = require("path");

// Load env sesuai environment
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "../.env.production")
      : path.resolve(__dirname, "../.env"),
});

const isProduction =
  process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,

    // SSL hanya untuk Render
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},

    timezone: "+08:00",
  }
);

module.exports = sequelize;