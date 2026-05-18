const router = require("express").Router();
const ctrl   = require("../controllers/bookingController");
const auth   = require("../middleware/authMiddleware");

// Semua route booking butuh login
router.get("/",             auth, ctrl.getMyBookings);
router.post("/",            auth, ctrl.create);
router.patch("/:id/cancel", auth, ctrl.cancel);

module.exports = router;