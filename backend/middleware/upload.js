const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔥 CONFIG STORAGE KE CLOUDINARY
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "lapangan", // folder di cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 1000, crop: "limit" }], // optional resize
    };
  },
});

// 🔥 FILTER FILE (BIAR AMAN)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa gambar (jpg/png)"), false);
  }
};

// 🔥 INIT MULTER
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
  },
});

module.exports = upload;