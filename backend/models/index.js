const User = require("./User");
const Lapangan = require("./Lapangan");
const Booking = require("./Booking");
const Review = require("./Review");

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

module.exports = { User, Lapangan, Booking, Review };