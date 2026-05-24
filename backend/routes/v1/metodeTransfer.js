// routes/v1/metodeTransfer.js
const router = require("express").Router();
const ctrl = require("../../controllers/metodeTransferController");
const auth = require("../../middleware/authmiddleware");
const authorizeRole = require("../../middleware/roleMiddleware");

// public
router.get("/", ctrl.getAllMetodeTransfer);

// admin route harus di atas "/:id"
router.get("/admin/all", auth, authorizeRole("admin"), ctrl.getAllMetodeTransferAdmin);
router.post("/", auth, authorizeRole("admin"), ctrl.createMetodeTransfer);
router.put("/:id", auth, authorizeRole("admin"), ctrl.updateMetodeTransfer);
router.delete("/:id", auth, authorizeRole("admin"), ctrl.deleteMetodeTransfer);

// public detail route taruh paling bawah
router.get("/:id", ctrl.getMetodeTransferById);

module.exports = router;