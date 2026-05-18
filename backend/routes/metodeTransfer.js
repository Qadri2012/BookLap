// routes/metodeTransfer.js
const router = require("express").Router();
const ctrl = require("../controllers/metodeTransferController");

router.get("/", ctrl.getAllMetodeTransfer);
router.get("/admin/all", ctrl.getAllMetodeTransferAdmin);
router.get("/:id", ctrl.getMetodeTransferById);
router.post("/", ctrl.createMetodeTransfer);
router.put("/:id", ctrl.updateMetodeTransfer);
router.delete("/:id", ctrl.deleteMetodeTransfer);

module.exports = router;