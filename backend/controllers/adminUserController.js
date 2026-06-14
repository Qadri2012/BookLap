// NEW: src/backend/controllers/adminUserController.js
const User = require("../models/user");

function toPlain(user) {
  return user?.get ? user.get({ plain: true }) : user;
}

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: "user",
      },
      order: [["last_login", "DESC"]],
    });

    return res.json({
      message: "Data user berhasil diambil",
      msg: "Data user berhasil diambil",
      data: users.map(toPlain),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil data user",
      msg: "Gagal mengambil data user",
      error: err.message,
    });
  }
};

exports.listPendingAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        role: "admin",
        status: "pending",
      },
      order: [["last_login", "DESC"]],
    });

    return res.json({
      message: "Daftar admin pending berhasil diambil",
      msg: "Daftar admin pending berhasil diambil",
      data: admins.map(toPlain),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil admin pending",
      msg: "Gagal mengambil admin pending",
      error: err.message,
    });
  }
};

exports.approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan",
        msg: "Admin tidak ditemukan",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        message: "User ini bukan admin",
        msg: "User ini bukan admin",
      });
    }

    admin.status = "active";
    await admin.save();

    return res.json({
      message: "Admin berhasil disetujui",
      msg: "Admin berhasil disetujui",
      user: toPlain(admin),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal menyetujui admin",
      msg: "Gagal menyetujui admin",
      error: err.message,
    });
  }
};

exports.rejectAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan",
        msg: "Admin tidak ditemukan",
      });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({
        message: "User ini bukan admin",
        msg: "User ini bukan admin",
      });
    }

    admin.status = "rejected";
    await admin.save();

    return res.json({
      message: "Admin berhasil ditolak",
      msg: "Admin berhasil ditolak",
      user: toPlain(admin),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal menolak admin",
      msg: "Gagal menolak admin",
      error: err.message,
    });
  }
};