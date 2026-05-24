// routes/v1/metodePembayaran.js
const router = require("express").Router();
const ctrl = require("../../controllers/metodePembayaranController");
const auth = require("../../middleware/authmiddleware");
const authorizeRole = require("../../middleware/roleMiddleware");

// public
router.get("/", ctrl.getAllMetodePembayaran);

// admin route harus di atas "/:id"
router.get("/admin/all", auth, authorizeRole("admin"), ctrl.getAllMetodePembayaranAdmin);
router.post("/", auth, authorizeRole("admin"), ctrl.createMetodePembayaran);
router.put("/:id", auth, authorizeRole("admin"), ctrl.updateMetodePembayaran);
router.delete("/:id", auth, authorizeRole("admin"), ctrl.deleteMetodePembayaran);

// public detail route taruh paling bawah
router.get("/:id", ctrl.getMetodePembayaranById);

module.exports = router;