// Jadwal.js

const router = require("express").Router();
const ctrl = require("../controllers/jadwalController");
const auth = require("../middleware/authMiddleware");

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Akses admin saja" });
  }
  next();
};

// public
router.get("/", ctrl.getJadwal);

// admin
router.post("/", auth, isAdmin, ctrl.createJadwal);

module.exports = router;