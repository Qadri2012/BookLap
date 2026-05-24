// routes/v1/layananTambahan.js
const router = require("express").Router();
const ctrl = require("../../controllers/layananTambahanController");
const auth = require("../../middleware/authmiddleware");
const authorizeRole = require("../../middleware/roleMiddleware");

// public
router.get("/", ctrl.getAllLayananTambahan);

// detail route taruh bawah
router.get("/:id", ctrl.getLayananTambahanById);

// admin
router.post("/", auth, authorizeRole("admin"), ctrl.createLayananTambahan);
router.put("/:id", auth, authorizeRole("admin"), ctrl.updateLayananTambahan);
router.delete("/:id", auth, authorizeRole("admin"), ctrl.deleteLayananTambahan);

module.exports = router;