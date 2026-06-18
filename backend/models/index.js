// models/index.js
const User = require("./user");
const Lapangan = require("./lapangan");
const Booking = require("./booking");
const Review = require("./review");
const ReviewVote = require("./reviewVote");
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

Review.belongsTo(Pemesanan, {
  foreignKey: "pemesananId",
  as: "pemesanan",
});

Pemesanan.hasOne(Review, {
  foreignKey: "pemesananId",
  as: "review",
});

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
Review.hasMany(ReviewVote, {
  foreignKey: "reviewid",
  as: "votes",
});

ReviewVote.belongsTo(Review, {
  foreignKey: "reviewid",
  as: "review",
});

User.hasMany(ReviewVote, {
  foreignKey: "userid",
  as: "reviewVotes",
});

ReviewVote.belongsTo(User, {
  foreignKey: "userid",
  as: "user",
});

module.exports = {
  User,
  Lapangan,
  Booking,
  Review,
  ReviewVote,
  Pemesanan,
  DetailPemesanan,
};