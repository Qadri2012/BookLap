// routes/Lapangan.js

const router  = require("express").Router();
const ctrl    = require("../controllers/lapanganController");
const auth    = require("../middleware/authMiddleware");

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ msg: "Akses admin saja" });
  next();
};

// PUBLIC
router.get("/",    ctrl.getAll);
router.get("/:id", ctrl.getById);

// ADMIN ONLY
router.post("/",      auth, isAdmin, ctrl.create);
router.put("/:id",    auth, isAdmin, ctrl.update);
router.delete("/:id", auth, isAdmin, ctrl.remove);

module.exports = router;