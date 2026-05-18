// routes/pemesanan.js
const router = require("express").Router();
const ctrl = require("../controllers/pemesananController");

router.get("/", ctrl.getAllPemesanan);
router.get("/user/:userId", ctrl.getPemesananByUser);
router.get("/:id", ctrl.getPemesananById);
router.post("/", ctrl.createPemesanan);
router.put("/:id", ctrl.updatePemesanan);
router.patch("/:id/status", ctrl.updateStatusPemesanan);
router.delete("/:id", ctrl.deletePemesanan);

module.exports = router;