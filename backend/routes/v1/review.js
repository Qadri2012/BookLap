// routes/v1/review.js
const router = require("express").Router();
const ctrl = require("../../controllers/reviewController");
const auth = require("../../middleware/authmiddleware");

// ✅ NEW: create review wajib login
router.post("/", auth, ctrl.create);
router.get("/:id", ctrl.getByLapangan);

module.exports = router;