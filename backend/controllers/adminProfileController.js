const AdminMaster = require("../models/adminMaster");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

// ======================================
// GET PROFILE
// ======================================

exports.getProfile = async (req, res) => {
  try {
    console.log("GET PROFILE USER:", req.user);

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const admin = await AdminMaster.findOne({
      where: {
        email: user.email,
      },
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan",
      });
    }

    return res.json(admin);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

// ======================================
// UPLOAD FOTO PROFIL
// ======================================

exports.uploadProfilePhoto = async (req, res) => {
  try {
    console.log(
      "REQ USER FULL:",
      JSON.stringify(req.user, null, 2)
    );

    console.log("REQ FILE:", req.file);

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const admin = await AdminMaster.findOne({
      where: {
        email: user.email,
      },
    });

    console.log("ADMIN:", admin);

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File foto tidak ditemukan",
      });
    }

    console.log(
      "URL CLOUDINARY:",
      req.file.path
    );

    admin.photo_url = req.file.path;

    await admin.save();

    return res.json({
      message: "Foto profil berhasil diupload",
      photo_url: admin.photo_url,
    });
  } catch (err) {
    console.error(
      "UPLOAD PROFILE PHOTO ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

// ======================================
// HAPUS FOTO PROFIL
// ======================================

exports.deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const admin = await AdminMaster.findOne({
      where: {
        email: user.email,
      },
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan",
      });
    }

    if (!admin.photo_url) {
      return res.status(400).json({
        message:
          "Admin belum memiliki foto profil",
      });
    }

    const parts =
      admin.photo_url.split("/");

    const filename =
      parts[parts.length - 1];

    const publicId =
      "admin-profile/" +
      filename.split(".")[0];

    try {
      await cloudinary.uploader.destroy(
        publicId
      );
    } catch (err) {
      console.log(
        "Cloudinary delete skipped:",
        err.message
      );
    }

    admin.photo_url = null;

    await admin.save();

    return res.json({
      message:
        "Foto profil berhasil dihapus",
    });
  } catch (err) {
    console.error(
      "DELETE PROFILE PHOTO:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};