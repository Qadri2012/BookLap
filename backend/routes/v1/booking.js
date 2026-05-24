// routes/v1/booking.js
const router = require("express").Router();
const ctrl = require("../../controllers/bookingController");
const auth = require("../../middleware/authmiddleware");

// ✅ NEW: semua route booking wajib login
router.get("/", auth, ctrl.getMyBookings);
router.post("/", auth, ctrl.create);
router.patch("/:id/cancel", auth, ctrl.cancel);

module.exports = router;