// models/index.js
const User = require("./User");
const Lapangan = require("./Lapangan");
const Booking = require("./Booking");
const Review = require("./Review");

const Pemesanan = require("./pemesanan");
const DetailPemesanan = require("./detailPemesanan");

// ===== BOOKING =====
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

Lapangan.hasMany(Booking, { foreignKey: "lapanganId", as: "bookings" });
Booking.belongsTo(Lapangan, { foreignKey: "lapanganId", as: "lapangan" });

// ===== REVIEW =====
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

Lapangan.hasMany(Review, { foreignKey: "lapanganId", as: "lapanganReviews" }); // 🔥 rename
Review.belongsTo(Lapangan, { foreignKey: "lapanganId", as: "lapangan" });

// ===== PEMESANAN =====

Pemesanan.belongsTo(Lapangan, {
  foreignKey: "lapangan_id",
  as: "lapangan",
});

Lapangan.hasMany(Pemesanan, {
  foreignKey: "lapangan_id",
  as: "pemesanans",
});

Pemesanan.hasMany(DetailPemesanan, {
  foreignKey: "pemesanan_id",
  as: "detail_pemesanan",
});

DetailPemesanan.belongsTo(Pemesanan, {
  foreignKey: "pemesanan_id",
  as: "pemesanan",
});

module.exports = {
  User,
  Lapangan,
  Booking,
  Review,
  Pemesanan,
  DetailPemesanan,
};