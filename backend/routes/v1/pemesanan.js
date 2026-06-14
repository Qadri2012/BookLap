// routes/v1/pemesanan.js
const router = require("express").Router();
const ctrl = require("../../controllers/pemesananController");
const auth = require("../../middleware/authmiddleware");

// semua route pemesanan wajib login
router.get("/", auth, ctrl.getAllPemesanan);

// ✅ NEW: pesanan aktif user
router.get("/user/:userId", auth, ctrl.getPemesananByUser);

// ✅ NEW: riwayat final user
router.get("/riwayat/user/:userId", auth, ctrl.getRiwayatByUser);

router.get("/:id", auth, ctrl.getPemesananById);
router.post("/", auth, ctrl.createPemesanan);

// ✅ NEW: admin selesai
router.patch("/:id/selesai", auth, ctrl.selesaiPemesanan);

// NEW CODE TAHAP 10C KONFIRMASI PEMBAYARAN
router.patch("/:id/konfirmasi-pembayaran", auth, ctrl.konfirmasiPembayaran);

// =====================================================
// END NEW CODE
// =====================================================

// ===== NEW CODE TAHAP 7B =====
router.patch(
  "/:id/ajukan-pembatalan",
  auth,
  ctrl.ajukanPembatalan
);

// ✅ NEW: admin setujui pembatalan
router.patch(
  "/:id/pembatalan",
  auth,
  ctrl.setujuiPembatalan
);

router.put("/:id", auth, ctrl.updatePemesanan);
router.patch("/:id/status", auth, ctrl.updateStatusPemesanan);
router.delete("/:id", auth, ctrl.deletePemesanan);

module.exports = router;