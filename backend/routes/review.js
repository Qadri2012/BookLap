const router = require("express").Router();
const ctrl = require("../controllers/reviewController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, ctrl.create);
router.get("/:id", ctrl.getByLapangan);

module.exports = router;