// routes/v1/jadwal.js
const router = require("express").Router();
const ctrl = require("../../controllers/jadwalController");
const auth = require("../../middleware/authmiddleware");
const authorizeRole = require("../../middleware/roleMiddleware");

// public
router.get("/", ctrl.getJadwal);

// admin
router.post("/", auth, authorizeRole("admin"), ctrl.createJadwal);

module.exports = router;