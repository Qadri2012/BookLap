// routes/v1/lapangan.js
const router = require("express").Router();
const ctrl = require("../../controllers/lapanganController");
const auth = require("../../middleware/authmiddleware");
const authorizeRole = require("../../middleware/roleMiddleware");

// PUBLIC
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// ADMIN ONLY
router.post("/", auth, authorizeRole("admin"), ctrl.create);
router.put("/:id", auth, authorizeRole("admin"), ctrl.update);
router.delete("/:id", auth, authorizeRole("admin"), ctrl.remove);

module.exports = router;