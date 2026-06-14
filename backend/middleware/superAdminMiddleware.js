// NEW: middleware/superAdminMiddleware.js
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
        msg: "Unauthorized",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        msg: "User tidak ditemukan",
      });
    }

    const accountStatus = String(user.status || "active").toLowerCase();
    if (accountStatus !== "active") {
      return res.status(403).json({
        message: "Akun tidak aktif",
        msg: "Akun tidak aktif",
      });
    }

    if (user.role !== "admin" || user.level_akses !== "superadmin") {
      return res.status(403).json({
        message: "Hanya super admin yang boleh mengakses",
        msg: "Hanya super admin yang boleh mengakses",
      });
    }

    req.superAdmin = user;
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Super admin middleware error",
      msg: "Super admin middleware error",
      error: err.message,
    });
  }
};