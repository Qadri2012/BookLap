// routes/metodePembayaran.js
const router = require("express").Router();
const ctrl = require("../controllers/metodePembayaranController");

router.get("/", ctrl.getAllMetodePembayaran);
router.get("/admin/all", ctrl.getAllMetodePembayaranAdmin);
router.get("/:id", ctrl.getMetodePembayaranById);
router.post("/", ctrl.createMetodePembayaran);
router.put("/:id", ctrl.updateMetodePembayaran);
router.delete("/:id", ctrl.deleteMetodePembayaran);

module.exports = router;